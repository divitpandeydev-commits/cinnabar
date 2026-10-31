/**
 * Sliding window in-memory rate limiter
 */
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 60000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000);
}

/**
 * Checks whether an IP or client has exceeded the limit
 * @param identifier IP or client key
 * @param maxRequests Maximum requests allowed within the window
 * @param windowMs Time window in milliseconds (default 60 seconds)
 */
export function isRateLimited(identifier: string, maxRequests = 25, windowMs = 60000): { limited: boolean; remaining: number } {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Filter out timestamps outside the window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    return { limited: true, remaining: 0 };
  }

  record.timestamps.push(now);
  return { limited: false, remaining: maxRequests - record.timestamps.length };
}

