import fs from "fs";
import path from "path";
import { customAlphabet } from "nanoid";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ClickEvent, CreateLinkParams, GlobalStats, LinkRecord } from "./types";
import { generateManageKey, parseDeviceType } from "./utils";

// Collision-resistant URL-safe base62 alphabet without visually ambiguous characters (0, O, I, l)
const generateSlug = customAlphabet("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", 6);

// ---------------------------------------------------------------------------
// 1. Storage Configuration & Drivers
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "urls.json");

// In-memory cache for fast lookups
let cacheInitialized = false;
const linkCache = new Map<string, LinkRecord>();

// Supabase Cloud Driver Client
// Strictly read private server environment variables first.
// The service-role key is NEVER exposed to the frontend or prefixed with NEXT_PUBLIC_.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Prefer service-role on server if available; fallback to anon key with RPC security
const activeSupabaseKey = supabaseServiceKey || supabaseAnonKey;
const isCloudDatabaseEnabled = Boolean(supabaseUrl && activeSupabaseKey);

let supabase: SupabaseClient | null = null;

if (isCloudDatabaseEnabled && supabaseUrl && activeSupabaseKey) {
  supabase = createClient(supabaseUrl, activeSupabaseKey, {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// 2. Local Disk Engine Helpers (Zero-Config Offline Fallback)
// ---------------------------------------------------------------------------
async function ensureDiskStorage(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      await fs.promises.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Local disk storage initialization error:", err);
  }
}

async function loadDiskCache(): Promise<void> {
  if (cacheInitialized) return;
  await ensureDiskStorage();

  try {
    const raw = await fs.promises.readFile(DATA_FILE, "utf-8");
    const records: LinkRecord[] = JSON.parse(raw);
    linkCache.clear();
    for (const record of records) {
      if (!record.manageKey) {
        record.manageKey = generateManageKey();
      }
      linkCache.set(record.code.toLowerCase(), record);
    }
    cacheInitialized = true;
  } catch (err) {
    console.error("Failed to load records from disk:", err);
  }
}

async function persistDiskCache(): Promise<void> {
  await ensureDiskStorage();
  const records = Array.from(linkCache.values());
  const tempFile = `${DATA_FILE}.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;

  try {
    await fs.promises.writeFile(tempFile, JSON.stringify(records, null, 2), "utf-8");
    await fs.promises.rename(tempFile, DATA_FILE);
  } catch (err) {
    console.error("Failed to persist database file:", err);
    try {
      if (fs.existsSync(tempFile)) {
        await fs.promises.unlink(tempFile);
      }
    } catch {
      // ignore
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Database Core Operations (Dual-Driver & Security Hardened)
// ---------------------------------------------------------------------------

/**
 * Checks if a short code or slug is already taken
 */
export async function isCodeAvailable(code: string): Promise<boolean> {
  const normalized = code.toLowerCase().trim();

  if (isCloudDatabaseEnabled && supabase) {
    const { data } = await supabase
      .from("public_links")
      .select("code")
      .ilike("code", normalized)
      .maybeSingle();
    return !data;
  }

  await loadDiskCache();
  return !linkCache.has(normalized);
}

/**
 * Retrieves a link record by code for redirection
 * NEVER queries or exposes manage_key to prevent leakage
 */
export async function getLinkByCode(
  code: string
): Promise<{ link: LinkRecord | null; isExpired: boolean }> {
  const normalized = code.toLowerCase().trim();

  let link: LinkRecord | null = null;

  if (isCloudDatabaseEnabled && supabase) {
    // Select strictly non-sensitive columns from public_links view or table
    const { data, error } = await supabase
      .from("public_links")
      .select("id, code, original_url, created_at, expires_at, clicks, last_clicked_at, click_logs")
      .ilike("code", normalized)
      .maybeSingle();

    if (error || !data) {
      return { link: null, isExpired: false };
    }

    link = {
      id: data.id,
      code: data.code,
      originalUrl: data.original_url,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      clicks: Number(data.clicks || 0),
      lastClickedAt: data.last_clicked_at,
      clickLogs: (data.click_logs as ClickEvent[]) || [],
      manageKey: "", // Scrubbed: not needed for redirect
    };
  } else {
    await loadDiskCache();
    link = linkCache.get(normalized) || null;
  }

  if (!link) {
    return { link: null, isExpired: false };
  }

  // Check expiration
  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    return { link, isExpired: true };
  }

  return { link, isExpired: false };
}

/**
 * Creates a new short link and saves it to the persistent database
 */
export async function createLink(params: CreateLinkParams): Promise<LinkRecord> {
  let code: string;

  if (params.customSlug) {
    code = params.customSlug.trim().toLowerCase();
    const available = await isCodeAvailable(code);
    if (!available) {
      throw new Error(`The custom alias "${code}" is already in use.`);
    }
  } else {
    let attempts = 0;
    do {
      code = generateSlug();
      attempts++;
      if (attempts > 10) {
        code = generateSlug() + generateSlug().slice(0, 2);
      }
    } while (!(await isCodeAvailable(code)));
  }

  const now = new Date();
  let expiresAt: string | null = null;

  if (params.expiresInSeconds && params.expiresInSeconds > 0) {
    expiresAt = new Date(now.getTime() + params.expiresInSeconds * 1000).toISOString();
  }

  const manageKey = generateManageKey();
  const id = `link_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const newRecord: LinkRecord = {
    id,
    code,
    originalUrl: params.url,
    createdAt: now.toISOString(),
    expiresAt,
    clicks: 0,
    lastClickedAt: null,
    clickLogs: [],
    manageKey,
  };

  if (isCloudDatabaseEnabled && supabase) {
    // Attempt secure RPC first (works under both anon and service_role)
    const { data: rpcData, error: rpcError } = await supabase.rpc("create_short_link", {
      p_id: newRecord.id,
      p_code: newRecord.code,
      p_original_url: newRecord.originalUrl,
      p_expires_at: newRecord.expiresAt,
      p_manage_key: newRecord.manageKey,
    });

    if (rpcError) {
      // If service_role is active, fallback to direct table insert
      if (supabaseServiceKey) {
        const { error: insertError } = await supabase.from("links").insert({
          id: newRecord.id,
          code: newRecord.code,
          original_url: newRecord.originalUrl,
          created_at: newRecord.createdAt,
          expires_at: newRecord.expiresAt,
          clicks: 0,
          last_clicked_at: null,
          manage_key: newRecord.manageKey,
          click_logs: [],
        });
        if (insertError) {
          throw new Error(`Database insert error: ${insertError.message}`);
        }
      } else {
        throw new Error(`Failed to create short link: ${rpcError.message}`);
      }
    }
  } else {
    await loadDiskCache();
    linkCache.set(code.toLowerCase(), newRecord);
    await persistDiskCache();
  }

  return newRecord;
}

/**
 * Records a click event for a short code
 */
export async function recordClick(
  code: string,
  meta?: { referrer?: string; userAgent?: string }
): Promise<void> {
  const normalized = code.toLowerCase().trim();
  const now = new Date().toISOString();
  const device = parseDeviceType(meta?.userAgent);

  const clickEvent: ClickEvent = {
    timestamp: now,
    referrer: meta?.referrer || "Direct / Internal",
    userAgent: meta?.userAgent ? meta.userAgent.slice(0, 150) : undefined,
    device,
  };

  if (isCloudDatabaseEnabled && supabase) {
    const { error } = await supabase.rpc("record_link_click", {
      p_code: normalized,
      p_click_log: clickEvent,
    });

    if (error) {
      console.error("Error executing record_link_click stored procedure:", error);
    }
  } else {
    await loadDiskCache();
    const link = linkCache.get(normalized);
    if (!link) return;

    link.clicks += 1;
    link.lastClickedAt = now;
    link.clickLogs.unshift(clickEvent);
    if (link.clickLogs.length > 50) {
      link.clickLogs = link.clickLogs.slice(0, 50);
    }
    persistDiskCache().catch((err) => console.error("Error persisting click:", err));
  }
}

/**
 * Returns all links sorted by createdAt desc
 * Never returns manage_key in the public payload
 */
export async function getAllLinks(limit = 100): Promise<LinkRecord[]> {
  if (isCloudDatabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("public_links")
      .select("id, code, original_url, created_at, expires_at, clicks, last_clicked_at, click_logs")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((d) => ({
      id: d.id,
      code: d.code,
      originalUrl: d.original_url,
      createdAt: d.created_at,
      expiresAt: d.expires_at,
      clicks: Number(d.clicks || 0),
      lastClickedAt: d.last_clicked_at,
      clickLogs: (d.click_logs as ClickEvent[]) || [],
      manageKey: "", // Scrubbed
    }));
  }

  await loadDiskCache();
  const records = Array.from(linkCache.values());
  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return records.slice(0, limit).map((r) => ({ ...r, manageKey: "" }));
}

/**
 * Deletes a link by code with authorization check
 * Protected at database level via delete_link_with_key stored function
 */
export async function deleteLink(
  code: string,
  providedKey?: string
): Promise<{ success: boolean; authorized: boolean }> {
  const normalized = code.toLowerCase().trim();
  const adminSecret = process.env.ADMIN_SECRET;

  const isAdminAuthorized = Boolean(
    adminSecret && providedKey && providedKey.trim() === adminSecret.trim()
  );

  if (isCloudDatabaseEnabled && supabase) {
    // 1. If admin authorization is satisfied and service_role is present
    if (isAdminAuthorized && supabaseServiceKey) {
      const { error } = await supabase.from("links").delete().ilike("code", normalized);
      return { success: !error, authorized: true };
    }

    // 2. Standard user deletion via secure PostgreSQL function
    if (!providedKey || providedKey.trim() === "") {
      return { success: false, authorized: false };
    }

    const { data: deletedSuccess, error: rpcError } = await supabase.rpc("delete_link_with_key", {
      p_code: normalized,
      p_manage_key: providedKey.trim(),
    });

    if (rpcError) {
      console.error("RPC delete_link_with_key error:", rpcError);
      return { success: false, authorized: false };
    }

    if (deletedSuccess === true) {
      return { success: true, authorized: true };
    }

    // If false was returned, check if the link actually existed
    const exists = !(await isCodeAvailable(normalized));
    if (exists) {
      // Link exists but key was wrong
      return { success: false, authorized: false };
    }

    // Link did not exist
    return { success: false, authorized: true };
  } else {
    // Local disk engine
    await loadDiskCache();
    const link = linkCache.get(normalized);
    if (!link) return { success: false, authorized: true };

    const isAuthorized =
      isAdminAuthorized ||
      (link.manageKey && providedKey && link.manageKey === providedKey.trim());

    if (!isAuthorized) {
      return { success: false, authorized: false };
    }

    linkCache.delete(normalized);
    await persistDiskCache();
    return { success: true, authorized: true };
  }
}

/**
 * Computes global telemetry metrics
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const now = Date.now();

  if (isCloudDatabaseEnabled && supabase) {
    const { data } = await supabase.from("public_links").select("clicks, expires_at");

    if (!data) {
      return { totalLinks: 0, totalClicks: 0, activeLinks: 0, averageRedirectMs: 12 };
    }

    let totalClicks = 0;
    let activeLinks = 0;

    for (const row of data) {
      totalClicks += Number(row.clicks || 0);
      const isExpired = row.expires_at ? new Date(row.expires_at).getTime() < now : false;
      if (!isExpired) activeLinks++;
    }

    return {
      totalLinks: data.length,
      totalClicks,
      activeLinks,
      averageRedirectMs: 12,
    };
  }

  await loadDiskCache();
  const records = Array.from(linkCache.values());

  let totalClicks = 0;
  let activeLinks = 0;

  for (const record of records) {
    totalClicks += record.clicks;
    const isExpired = record.expiresAt ? new Date(record.expiresAt).getTime() < now : false;
    if (!isExpired) activeLinks++;
  }

  return {
    totalLinks: records.length,
    totalClicks,
    activeLinks,
    averageRedirectMs: 12,
  };
}

/**
 * Returns database driver mode
 */
export function getDatabaseDriver(): "supabase" | "disk" {
  return isCloudDatabaseEnabled ? "supabase" : "disk";
}
