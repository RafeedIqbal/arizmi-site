import "server-only";

/**
 * Abuse/rate limiting for the costly BluePrint endpoints (TASK-013). Server-only.
 *
 * When Upstash Redis is configured the limiter is shared across instances
 * (fixed one-minute windows via INCR + EXPIRE), which is what a multi-instance
 * Vercel deployment needs. Without Redis — or if Redis errors — it fails open
 * to the original in-memory per-instance limiter: a limiter-store outage must
 * not take the lead funnel down, and generation is already size-guarded,
 * timeout-capped, and cheap per call. Keyed by IP + bucket so the generation
 * and lead endpoints have independent budgets.
 */
import type { Redis } from "@upstash/redis";
import { getRedis } from "./redis";

type Bucket = "generate" | "lead";

const LIMITS: Record<Bucket, { max: number; windowMs: number }> = {
  // Diagnosis/regeneration is the costliest call now a real provider is wired.
  generate: { max: 8, windowMs: 60_000 },
  lead: { max: 4, windowMs: 60_000 },
};

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly retryAfterMs?: number;
}

export async function checkRateLimit(bucket: Bucket, ip: string | null): Promise<RateLimitResult> {
  const redis = getRedis();
  if (redis) {
    try {
      return await checkWithRedis(redis, bucket, ip);
    } catch (err) {
      console.warn("[blueprint] rate-limit store unavailable; in-memory fallback", {
        name: err instanceof Error ? err.name : "unknown",
      });
    }
  }
  return checkInMemory(bucket, ip);
}

async function checkWithRedis(
  redis: Redis,
  bucket: Bucket,
  ip: string | null,
): Promise<RateLimitResult> {
  const { max, windowMs } = LIMITS[bucket];
  const now = Date.now();
  const windowIndex = Math.floor(now / windowMs);
  // The window index is part of the key, so EXPIRE is only garbage collection.
  const key = `blueprint:rl:${bucket}:${ip ?? "unknown"}:${windowIndex}`;
  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, Math.ceil((windowMs * 2) / 1000));
  const [count] = await pipeline.exec<[number, number]>();
  if (count > max) {
    return { allowed: false, retryAfterMs: (windowIndex + 1) * windowMs - now };
  }
  return { allowed: true };
}

function checkInMemory(bucket: Bucket, ip: string | null): RateLimitResult {
  const { max, windowMs } = LIMITS[bucket];
  const key = `${bucket}:${ip ?? "unknown"}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    const oldest = recent[0];
    return { allowed: false, retryAfterMs: windowMs - (now - oldest) };
  }

  recent.push(now);
  hits.set(key, recent);
  return { allowed: true };
}
