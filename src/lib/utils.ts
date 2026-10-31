/**
 * Validates and normalizes an input URL.
 * Checks for valid protocol, valid domain structure, and prevents recursive redirects.
 */
export function validateAndNormalizeUrl(input: string, baseUrl?: string): { valid: boolean; normalizedUrl?: string; error?: string } {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "Please enter a valid URL." };
  }

  let trimmed = input.trim();

  // If no protocol is provided, default to https://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);

    // Only allow http and https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Only http:// and https:// URLs are allowed." };
    }

    // Must have a valid hostname with at least one dot or localhost
    if (!parsed.hostname || (!parsed.hostname.includes(".") && parsed.hostname !== "localhost")) {
      return { valid: false, error: "Please enter a valid domain name." };
    }

    // Prevent redirecting to the shortener's own short links recursively
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

  // Reserved keywords to prevent conflicts with system routes
  const reservedWords = [
    "api",
    "admin",
    "static",
    "favicon",
    "robots",
    "sitemap",
    "auth",
    "login",
    "signup",
    "terms",
    "privacy",
    "analytics",
    "settings",
    "links",
  ];

  if (reservedWords.includes(trimmed)) {
    return { valid: false, error: `The alias "${trimmed}" is reserved by the system.` };
  }

  if (!/^[a-z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: "Alias can only contain letters, numbers, hyphens, and underscores." };
  }

  return { valid: true, sanitizedSlug: trimmed };
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

