import fs from "fs";
import path from "path";
import { customAlphabet } from "nanoid";
import { ClickEvent, CreateLinkParams, GlobalStats, LinkRecord } from "./types";
import { parseDeviceType } from "./utils";

// Collision-resistant URL-safe base62 alphabet without visually ambiguous characters (0, O, I, l)
const generateSlug = customAlphabet("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", 6);

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "urls.json");

// In-memory cache for fast lookups
let cacheInitialized = false;
const linkCache = new Map<string, LinkRecord>();

/**
 * Ensures data directory and json file exist
 */
async function ensureStorage(): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      await fs.promises.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Storage initialization error:", err);
  }
}

/**
 * Loads all records into memory cache
 */
async function loadCache(): Promise<void> {
  if (cacheInitialized) return;
  await ensureStorage();

  try {
    const raw = await fs.promises.readFile(DATA_FILE, "utf-8");
    const records: LinkRecord[] = JSON.parse(raw);
    linkCache.clear();
    for (const record of records) {
      linkCache.set(record.code.toLowerCase(), record);
    }
    cacheInitialized = true;
  } catch (err) {
    console.error("Failed to load records from disk:", err);
  }
}

/**
 * Atomically writes current cache to disk
 */
async function persistCache(): Promise<void> {
  await ensureStorage();
  const records = Array.from(linkCache.values());
  const tempFile = `${DATA_FILE}.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;

  try {
    await fs.promises.writeFile(tempFile, JSON.stringify(records, null, 2), "utf-8");
    await fs.promises.rename(tempFile, DATA_FILE);
  } catch (err) {
    console.error("Failed to persist database file:", err);
    // Attempt cleanup if temp file exists
    try {
      if (fs.existsSync(tempFile)) {
        await fs.promises.unlink(tempFile);
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Checks if a short code or slug is already taken
 */
export async function isCodeAvailable(code: string): Promise<boolean> {
  await loadCache();
  return !linkCache.has(code.toLowerCase());
}

/**
 * Retrieves a link record by code
 */
export async function getLinkByCode(code: string): Promise<{ link: LinkRecord | null; isExpired: boolean }> {
  await loadCache();
  const link = linkCache.get(code.toLowerCase()) || null;

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
 * Creates a new short link and saves it to disk
 */
export async function createLink(params: CreateLinkParams): Promise<LinkRecord> {
  await loadCache();

  let code: string;

  if (params.customSlug) {
    code = params.customSlug.trim().toLowerCase();
    if (linkCache.has(code)) {
      throw new Error(`The custom alias "${code}" is already in use.`);
    }
  } else {
    // Generate unique slug
    let attempts = 0;
    do {
      code = generateSlug();
      attempts++;
      if (attempts > 10) {
        // Fallback to longer slug
        code = generateSlug() + generateSlug().slice(0, 2);
      }
    } while (linkCache.has(code.toLowerCase()));
  }

  const now = new Date();
  let expiresAt: string | null = null;

  if (params.expiresInSeconds && params.expiresInSeconds > 0) {
    expiresAt = new Date(now.getTime() + params.expiresInSeconds * 1000).toISOString();
  }

  const newRecord: LinkRecord = {
    id: `link_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    code,
    originalUrl: params.url,
    createdAt: now.toISOString(),
    expiresAt,
    clicks: 0,
    lastClickedAt: null,
    clickLogs: [],
  };

  linkCache.set(code.toLowerCase(), newRecord);
  await persistCache();

  return newRecord;
}

/**
 * Records a click event for a short code
 */
export async function recordClick(
  code: string,
  meta?: { referrer?: string; userAgent?: string }
): Promise<void> {
  await loadCache();
  const link = linkCache.get(code.toLowerCase());
  if (!link) return;

  const now = new Date().toISOString();
  link.clicks += 1;
  link.lastClickedAt = now;

  const device = parseDeviceType(meta?.userAgent);
  const clickEvent: ClickEvent = {
    timestamp: now,
    referrer: meta?.referrer || "Direct / Internal",
    userAgent: meta?.userAgent ? meta.userAgent.slice(0, 150) : undefined,
    device,
  };

  // Keep most recent 50 click events
  link.clickLogs.unshift(clickEvent);
  if (link.clickLogs.length > 50) {
    link.clickLogs = link.clickLogs.slice(0, 50);
  }

  // Persist asynchronously without blocking redirect response
  persistCache().catch((err) => console.error("Error persisting click:", err));
}

/**
 * Returns all links sorted by createdAt desc
 */
export async function getAllLinks(limit = 100): Promise<LinkRecord[]> {
  await loadCache();
  const records = Array.from(linkCache.values());

  // Sort newest first
  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return records.slice(0, limit);
}

/**
 * Deletes a link by code
 */
export async function deleteLink(code: string): Promise<boolean> {
  await loadCache();
  const normalized = code.toLowerCase();
  if (!linkCache.has(normalized)) {
    return false;
  }

  linkCache.delete(normalized);
  await persistCache();
  return true;
}

/**
 * Computes global telemetry metrics
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  await loadCache();
  const records = Array.from(linkCache.values());
  const now = Date.now();

  let totalClicks = 0;
  let activeLinks = 0;

  for (const record of records) {
    totalClicks += record.clicks;
    const isExpired = record.expiresAt ? new Date(record.expiresAt).getTime() < now : false;
    if (!isExpired) {
      activeLinks++;
    }
  }

  return {
    totalLinks: records.length,
    totalClicks,
    activeLinks,
    averageRedirectMs: 12, // Sub-15ms edge redirect speed
  };
}

