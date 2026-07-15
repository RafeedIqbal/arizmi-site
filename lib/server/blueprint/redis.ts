import "server-only";

/**
 * Shared Upstash Redis client (REST — safe on serverless). Reads no
 * environment: configuration resolves in lib/server/config.ts. Returns null
 * when unconfigured so callers can fall back (rate limiting) or fail closed
 * (lead storage) explicitly.
 */
import { Redis } from "@upstash/redis";
import { getUpstashRedisConfig } from "@/lib/server/config";

let client: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (client === undefined) {
    const config = getUpstashRedisConfig();
    client = config.ok ? new Redis({ url: config.url, token: config.token }) : null;
  }
  return client;
}
