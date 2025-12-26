// Simple in-memory rate limiting utility
// For scaling, we should consider using Redis-based solutions like @upstash/ratelimit

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired records periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

export interface RateLimitConfig {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number;  // Max requests per window
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // If no record exists or window has expired, create new record
    if (!record || now > record.resetTime) {
        const newRecord: RateLimitRecord = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        rateLimitStore.set(identifier, newRecord);
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetTime: newRecord.resetTime,
        };
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetTime: record.resetTime,
        };
    }

    return {
        success: true,
        remaining: config.maxRequests - record.count,
        resetTime: record.resetTime,
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }
    return 'unknown';
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
    // Strict limit for auth endpoints (5 attempts per 15 minutes)
    auth: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
    },
    // Standard API limit (100 requests per minute)
    api: {
        windowMs: 60 * 1000,
        maxRequests: 100,
    },
    // Password recovery (3 attempts per hour)
    passwordRecovery: {
        windowMs: 60 * 60 * 1000,
        maxRequests: 3,
    },
} as const;
