/**
 * Simple in-memory rate limiter using a sliding window counter.
 * Suitable for single-instance deployments. For multi-instance, use Redis.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
 *   // In your API route:
 *   const ip = request.headers.get("x-forwarded-for") || "unknown";
 *   if (!limiter.check(ip)) {
 *     return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 *   }
 */

type RateLimiterOptions = {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests per window */
  maxRequests: number;
};

type RateLimiterEntry = {
  count: number;
  resetAt: number;
};

export function createRateLimiter(options: RateLimiterOptions) {
  const store = new Map<string, RateLimiterEntry>();

  // Periodically clean up expired entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, options.windowMs * 2);

  // Allow GC to clean up if the module is no longer used
  if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }

  return {
    /**
     * Check if the key (e.g. IP address) is within rate limits.
     * Returns `true` if the request is allowed, `false` if rate-limited.
     */
    check(key: string): boolean {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + options.windowMs });
        return true;
      }

      if (entry.count >= options.maxRequests) {
        return false;
      }

      entry.count++;
      return true;
    },

    /** Get remaining requests for a key. */
    remaining(key: string): number {
      const entry = store.get(key);
      if (!entry || entry.resetAt <= Date.now()) return options.maxRequests;
      return Math.max(0, options.maxRequests - entry.count);
    },
  };
}

// Pre-configured limiters for different API routes
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,           // 10 login attempts per 15min
});

export const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  maxRequests: 15,           // 15 AI requests per minute
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  maxRequests: 5,            // 5 uploads per minute
});

/** Extract client IP from request headers. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
