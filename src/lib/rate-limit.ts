import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const enabled = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = enabled ? Redis.fromEnv() : null;
const limiters = new Map<string, Ratelimit>();

export function getRateLimiter(name: string, requests = 20, window = '1 m') {
  if (!redis) return null;
  if (!limiters.has(name)) limiters.set(name, new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window as `${number} ${'s' | 'm' | 'h' | 'd'}`), analytics: true, prefix: `maison:${name}` }));
  return limiters.get(name)!;
}

export async function enforceRateLimit(name: string, identifier: string, requests = 20, window = '1 m') {
  const limiter = getRateLimiter(name, requests, window);
  if (!limiter) {
    // Never silently bypass a critical control in production. Local development stays usable without Redis.
    if (process.env.NODE_ENV === 'production') return { success: false, remaining: 0 };
    return { success: true, remaining: requests };
  }
  try { return await limiter.limit(identifier); } catch { return { success: process.env.NODE_ENV !== 'production', remaining: 0 }; }
}
