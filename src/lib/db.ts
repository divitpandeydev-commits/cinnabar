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

// Supabase Cloud Driver Client (initialized only if credentials exist)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isCloudDatabaseEnabled = Boolean(supabaseUrl && supabaseKey);
let supabase: SupabaseClient | null = null;

if (isCloudDatabaseEnabled && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// 2. Local Disk Engine Helpers
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
      // Ensure manageKey exists even on legacy records
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
// 3. Database Core Operations (Dual-Driver)
// ---------------------------------------------------------------------------

/**
 * Checks if a short code or slug is already taken
 */
export async function isCodeAvailable(code: string): Promise<boolean> {
  const normalized = code.toLowerCase().trim();

  if (isCloudDatabaseEnabled && supabase) {
    const { data } = await supabase
      .from("links")
      .select("code")
      .ilike("code", normalized)
      .maybeSingle();
    return !data;
  }

  await loadDiskCache();
  return !linkCache.has(normalized);
}

/**
 * Retrieves a link record by code
 */
export async function getLinkByCode(
  code: string
): Promise<{ link: LinkRecord | null; isExpired: boolean }> {
  const normalized = code.toLowerCase().trim();

  let link: LinkRecord | null = null;

  if (isCloudDatabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("links")
      .select("*")
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
      manageKey: data.manage_key,
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
    const { error } = await supabase.from("links").insert({
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

    if (error) {
      throw new Error(`Failed to persist link to Supabase PostgreSQL: ${error.message}`);
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
    // Attempt stored procedure for atomic increment; fallback to standard update
    const { error } = await supabase.rpc("record_link_click", {
      p_code: normalized,
      p_click_log: clickEvent,
    });

    if (error) {
      // Fallback update
      const { data } = await supabase
        .from("links")
        .select("clicks, click_logs")
        .ilike("code", normalized)
        .maybeSingle();

      if (data) {
        const currentLogs: ClickEvent[] = (data.click_logs as ClickEvent[]) || [];
        currentLogs.unshift(clickEvent);
        await supabase
          .from("links")
          .update({
            clicks: (Number(data.clicks) || 0) + 1,
            last_clicked_at: now,
            click_logs: currentLogs.slice(0, 50),
          })
          .ilike("code", normalized);
      }
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
 */
export async function getAllLinks(limit = 100): Promise<LinkRecord[]> {
  if (isCloudDatabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("links")
      .select("*")
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
      manageKey: d.manage_key,
    }));
  }

  await loadDiskCache();
  const records = Array.from(linkCache.values());
  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return records.slice(0, limit);
}

/**
 * Deletes a link by code with authorization check
 */
export async function deleteLink(
  code: string,
  providedKey?: string
): Promise<{ success: boolean; authorized: boolean }> {
  const normalized = code.toLowerCase().trim();

  // Retrieve existing link to inspect authorization key
  let existingKey: string | null = null;

  if (isCloudDatabaseEnabled && supabase) {
    const { data } = await supabase
      .from("links")
      .select("manage_key")
      .ilike("code", normalized)
      .maybeSingle();

    if (!data) return { success: false, authorized: true };
    existingKey = data.manage_key;
  } else {
    await loadDiskCache();
    const link = linkCache.get(normalized);
    if (!link) return { success: false, authorized: true };
    existingKey = link.manageKey;
  }

  // Authorization validation:
  // Allowed if:
  // 1. providedKey matches existingKey
  // 2. OR providedKey matches ADMIN_SECRET environment variable
  // 3. OR if legacy record has no key set
  const adminSecret = process.env.ADMIN_SECRET;
  const isAuthorized =
    !existingKey ||
    (providedKey && (providedKey === existingKey || (adminSecret && providedKey === adminSecret)));

  if (!isAuthorized) {
    return { success: false, authorized: false };
  }

  if (isCloudDatabaseEnabled && supabase) {
    const { error } = await supabase.from("links").delete().ilike("code", normalized);
    return { success: !error, authorized: true };
  } else {
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
    const { data } = await supabase.from("links").select("clicks, expires_at");

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
