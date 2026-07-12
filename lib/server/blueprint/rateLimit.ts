import "server-only";

/**
 * Abuse/rate limiting for the costly BluePrint endpoints (TASK-013). Server-only.
 *
 * This is an in-memory, per-instance limiter — adequate for development and a
 * single instance, but NOT sufficient for a multi-instance production
 * deployment (the spec calls this out explicitly). Before enabling a real,
 * paid AI provider in production, back this with a shared store (e.g. Redis)
 * behind the same `checkRateLimit` signature. Keyed by IP + bucket so the
 * generation and lead endpoints have independent budgets.
 */
type Bucket = "generate" | "lead";

const LIMITS: Record<Bucket, { max: number; windowMs: number }> = {
  // Diagnosis/regeneration is the costliest call once a real provider is wired.
  generate: { max: 8, windowMs: 60_000 },
  lead: { max: 4, windowMs: 60_000 },
};

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly retryAfterMs?: number;
}

export function checkRateLimit(bucket: Bucket, ip: string | null): RateLimitResult {
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
