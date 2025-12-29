/**
 * Simple in-memory rate limiter for Edge Functions
 * Uses a sliding window approach with per-user tracking
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store (resets on function cold start, but that's acceptable for Edge Functions)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

/**
 * Check if a request is allowed based on rate limiting rules
 * @param key - Unique identifier for rate limiting (e.g., user ID or IP)
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // Clean up old entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries(config.windowMs);
  }

  if (!entry || now - entry.windowStart >= config.windowMs) {
    // Start new window
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const resetAt = entry.windowStart + config.windowMs;
    const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSeconds,
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.windowStart + config.windowMs,
  };
}

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ 
      error: '請求過於頻繁，請稍後再試',
      retryAfterSeconds: result.retryAfterSeconds 
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfterSeconds || 60),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
      },
    }
  );
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult,
  maxRequests: number
): void {
  headers.set('X-RateLimit-Limit', String(maxRequests));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));
}

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart >= windowMs) {
      rateLimitStore.delete(key);
    }
  }
}

// Pre-defined rate limit configs for different function types
export const RATE_LIMITS = {
  // AI functions - expensive, stricter limits
  AI_FORTUNE_CONSULT: {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 10,          // 10 requests per minute
  },
  
  // API functions - moderate limits
  BAZI_API: {
    windowMs: 60 * 1000,     // 1 minute  
    maxRequests: 30,          // 30 requests per minute
  },
  
  // Entitlement check - more lenient
  CHECK_ENTITLEMENT: {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 60,          // 60 requests per minute
  },
};
