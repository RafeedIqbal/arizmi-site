"use server";

/** Must match the hidden field names in FormGuardFields (lib/formGuard.tsx) */
const HONEYPOT_FIELDS = ["_guard_x7q", "_guard_r3k"];

/**
 * Simple in-memory rate limiter.
 * Maps IP → array of timestamps (ms). Entries are cleaned up lazily.
 */
const rateLimitMap = new Map<string, number[]>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;   // per window

/**
 * Validates that a public form submission is not from a bot:
 *  1. Checks honeypot fields are empty
 *  2. Applies per-IP rate limiting
 *
 * Returns null on success, or an error string.
 */
export async function guardPublicSubmission(
  formData: FormData,
  ip: string | null
): Promise<string | null> {
  // 1. Honeypot check
  for (const field of HONEYPOT_FIELDS) {
    if (formData.get(field)) {
      // Bot filled in the hidden field — silently reject
      return "spam";
    }
  }

  // 2. Rate limit
  const key = ip ?? "unknown";
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) ?? [];

  // Prune old entries
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    return "Too many requests. Please wait a minute and try again.";
  }

  recent.push(now);
  rateLimitMap.set(key, recent);

  return null; // all clear
}
