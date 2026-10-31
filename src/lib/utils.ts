import crypto from "crypto";

/**
 * Checks if a hostname belongs to private, loopback, or cloud metadata IP ranges (SSRF prevention).
 */
export function isRestrictedOrPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  // If local development testing explicitly permits local loopback
  if (process.env.ALLOW_LOCAL_URLS === "true" && (host === "localhost" || host === "127.0.0.1")) {
    return false;
  }

  // Common loopback and cloud metadata hostnames
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "[::1]" ||
    host === "metadata.google.internal" ||
    host.endsWith(".internal") ||
    host.endsWith(".local")
  ) {
    return true;
  }

  // IPv4 Private Range Check:
  // 10.0.0.0 - 10.255.255.255
  // 172.16.0.0 - 172.31.255.255
  // 192.168.0.0 - 192.168.255.255
  // 169.254.0.0 - 169.254.255.255 (Link-local / Cloud metadata)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipv4Regex);
  if (match) {
    const [, b1, b2] = match.map(Number);
    if (b1 === 10) return true;
    if (b1 === 172 && b2 >= 16 && b2 <= 31) return true;
    if (b1 === 192 && b2 === 168) return true;
    if (b1 === 169 && b2 === 254) return true;
    if (b1 === 127) return true;
    if (b1 === 0) return true;
  }

  return false;
}

/**
 * Validates and normalizes an input URL.
 * Checks for valid protocol, valid domain structure, SSRF protection, and prevents recursive redirects.
 */
export function validateAndNormalizeUrl(
  input: string,
  baseUrl?: string
): { valid: boolean; normalizedUrl?: string; error?: string } {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "Please enter a valid destination URL." };
  }

  let trimmed = input.trim();

  // If no protocol is provided, default to https://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);

    // Only allow http: and https: protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Only http:// and https:// URLs are allowed." };
    }

    // Must have a valid hostname with at least one dot (e.g. domain.com)
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      if (parsed.hostname !== "localhost" || process.env.ALLOW_LOCAL_URLS !== "true") {
        return { valid: false, error: "Please enter a valid domain name with a standard extension." };
      }
    }

    // SSRF & Private host protection
    if (isRestrictedOrPrivateHost(parsed.hostname)) {
      return {
        valid: false,
        error: "Restricted address: Shortening private, internal, or loopback network addresses is prohibited.",
      };
    }

    // Prevent recursive redirecting to the shortener's own domain
    if (baseUrl) {
      try {
        const currentDomain = new URL(baseUrl).host;
        if (parsed.host === currentDomain) {
          return { valid: false, error: "Cannot create a short link pointing to this shortener." };
        }
      } catch {
        // ignore
      }
    }

    return { valid: true, normalizedUrl: parsed.toString() };
  } catch {
    return { valid: false, error: "The provided URL is improperly formatted." };
  }
}

/**
 * Validates and sanitizes a custom alias / slug.
 * Allows alphanumeric characters, hyphens, and underscores between 3 and 40 characters.
 */
export function validateCustomSlug(slug: string): { valid: boolean; sanitizedSlug?: string; error?: string } {
  const trimmed = slug.trim().toLowerCase();

  if (trimmed.length < 3) {
    return { valid: false, error: "Custom alias must be at least 3 characters long." };
  }

  if (trimmed.length > 40) {
    return { valid: false, error: "Custom alias cannot exceed 40 characters." };
  }

  // Reserved keywords to prevent conflicts with system routes & static files
  const reservedWords = [
    "api",
    "admin",
    "static",
    "favicon",
    "favicon.ico",
    "robots",
    "robots.txt",
    "sitemap",
    "sitemap.xml",
    "auth",
    "login",
    "signup",
    "terms",
    "privacy",
    "analytics",
    "settings",
    "links",
    "shorten",
    "stats",
    "link-not-found",
    "link-expired",
    "_next",
    "public",
    "health",
    "dashboard",
  ];

  if (reservedWords.includes(trimmed)) {
    return { valid: false, error: `The alias "${trimmed}" is reserved by the system.` };
  }

  if (!/^[a-z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: "Alias can only contain lowercase letters, numbers, hyphens, and underscores." };
  }

  return { valid: true, sanitizedSlug: trimmed };
}

/**
 * Generates a secure cryptographic management key for link deletion authorization.
 */
export function generateManageKey(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Parses user agent to identify device type
 */
export function parseDeviceType(userAgent?: string): string {
  if (!userAgent) return "Desktop";
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/i.test(ua)) return "Mobile";
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

/**
 * Formats a relative date (e.g., '2 minutes ago', 'in 3 days')
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((date.getTime() - now.getTime()) / 1000);

  // If in the future
  if (diffSec > 0) {
    if (diffSec < 60) return "in a few seconds";
    if (diffSec < 3600) return `in ${Math.floor(diffSec / 60)}m`;
    if (diffSec < 86400) return `in ${Math.floor(diffSec / 3600)}h`;
    return `in ${Math.floor(diffSec / 86400)}d`;
  }

  // If in the past
  const pastSec = Math.abs(diffSec);
  if (pastSec < 60) return "just now";
  if (pastSec < 3600) return `${Math.floor(pastSec / 60)}m ago`;
  if (pastSec < 86400) return `${Math.floor(pastSec / 3600)}h ago`;
  if (pastSec < 2592000) return `${Math.floor(pastSec / 86400)}d ago`;
  return date.toLocaleDateString();
}
