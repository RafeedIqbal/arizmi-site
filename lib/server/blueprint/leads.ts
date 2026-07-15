import "server-only";

/**
 * BluePrint lead persistence (TASK-013). Server-only.
 *
 * D-04 resolved: Upstash Redis is the durable production backend
 * (LEAD_STORAGE=upstash). The in-memory adapter remains the development
 * default, and the factory still refuses to hand it back in production, so a
 * production deploy cannot silently store leads in volatile memory.
 *
 * The record is the single internal source of truth for the flow after the
 * lead gate: the full plan lives here and is referenced by opaque id, so the
 * untrusted client never carries the full plan back for emailing.
 */
import type { Redis } from "@upstash/redis";
import type {
  BluePrintPlan,
  DeliveryStatus,
  Diagnosis,
  GenerationMode,
  IntakeAnswers,
  NextStepId,
  QualifyingAnswers,
} from "@/lib/blueprint/schema";
import type { LeadContact } from "@/lib/blueprint/validate";
import { getRedis } from "./redis";

export interface ConsentRecord {
  /** Explicit opt-in only; never inferred from form completion. */
  readonly marketingConsent: boolean;
  readonly consentTimestamp: string;
  readonly consentCopyVersion: string;
  readonly consentCopy: string;
}

export interface DeliveryChannelState {
  readonly status: DeliveryStatus;
  readonly attempts: number;
  readonly lastError?: string;
  readonly updatedAt?: string;
}

export interface DeliveryState {
  /** The user-facing "Email me the full BluePrint" artifact. */
  readonly userEmail: DeliveryChannelState;
  /** The internal Arizmi lead notification. */
  readonly internalNotification: DeliveryChannelState;
}

export interface GenerationRecord {
  readonly mode: GenerationMode;
  readonly providerId: string;
  readonly promptVersion: string;
  readonly schemaVersion: string;
  readonly status: string;
}

export interface LeadRecord {
  readonly id: string;
  readonly idempotencyKey: string;
  readonly submittedAt: string;
  readonly contact: LeadContact;
  readonly consent: ConsentRecord;
  readonly qualifying: QualifyingAnswers;
  readonly intake: IntakeAnswers;
  readonly addedDetail?: string;
  readonly diagnosis: Diagnosis;
  readonly plan: BluePrintPlan;
  readonly recommendedNextStep: NextStepId;
  readonly generation: GenerationRecord;
  readonly delivery: DeliveryState;
}

export type DeliveryChannel = keyof DeliveryState;

export interface LeadRepository {
  readonly id: string;
  findByIdempotencyKey(key: string): Promise<LeadRecord | null>;
  get(id: string): Promise<LeadRecord | null>;
  /** Creates a record. Idempotent: an existing key returns the stored record. */
  create(record: LeadRecord): Promise<LeadRecord>;
  updateDelivery(
    id: string,
    channel: DeliveryChannel,
    state: DeliveryChannelState,
  ): Promise<LeadRecord | null>;
}

/* ------------------------------------------------------------------ *
 * In-memory development adapter (D-04). Not durable across restarts;
 * acceptable for development only.
 * ------------------------------------------------------------------ */

class MemoryLeadRepository implements LeadRepository {
  readonly id = "memory";
  // Module-scoped so it survives across requests within one dev instance.
  private static byId = new Map<string, LeadRecord>();
  private static idByKey = new Map<string, string>();

  async findByIdempotencyKey(key: string): Promise<LeadRecord | null> {
    const id = MemoryLeadRepository.idByKey.get(key);
    return id ? (MemoryLeadRepository.byId.get(id) ?? null) : null;
  }

  async get(id: string): Promise<LeadRecord | null> {
    return MemoryLeadRepository.byId.get(id) ?? null;
  }

  async create(record: LeadRecord): Promise<LeadRecord> {
    const existingId = MemoryLeadRepository.idByKey.get(record.idempotencyKey);
    if (existingId) {
      // One idempotency key maps to exactly one lead record.
      return MemoryLeadRepository.byId.get(existingId)!;
    }
    MemoryLeadRepository.byId.set(record.id, record);
    MemoryLeadRepository.idByKey.set(record.idempotencyKey, record.id);
    return record;
  }

  async updateDelivery(
    id: string,
    channel: DeliveryChannel,
    state: DeliveryChannelState,
  ): Promise<LeadRecord | null> {
    const record = MemoryLeadRepository.byId.get(id);
    if (!record) return null;
    const updated: LeadRecord = {
      ...record,
      delivery: { ...record.delivery, [channel]: state },
    };
    MemoryLeadRepository.byId.set(id, updated);
    return updated;
  }
}

const memoryRepository = new MemoryLeadRepository();

/* ------------------------------------------------------------------ *
 * Upstash Redis adapter (resolves D-04). Key layout:
 *   blueprint:lead:<id>        — full LeadRecord as JSON
 *   blueprint:lead:idem:<key>  — idempotency key → lead id (SET NX claim)
 *   blueprint:leads:index      — zset of lead ids scored by submittedAt
 * No TTLs: leads are durable business records.
 * ------------------------------------------------------------------ */

const LEAD_KEY_PREFIX = "blueprint:lead:";
const IDEM_KEY_PREFIX = "blueprint:lead:idem:";
const INDEX_KEY = "blueprint:leads:index";

const leadKey = (id: string) => `${LEAD_KEY_PREFIX}${id}`;
const idemKey = (key: string) => `${IDEM_KEY_PREFIX}${key}`;

class UpstashLeadRepository implements LeadRepository {
  readonly id = "upstash";

  constructor(private readonly redis: Redis) {}

  async findByIdempotencyKey(key: string): Promise<LeadRecord | null> {
    const id = await this.redis.get<string>(idemKey(key));
    return id ? this.get(id) : null;
  }

  async get(id: string): Promise<LeadRecord | null> {
    return (await this.redis.get<LeadRecord>(leadKey(id))) ?? null;
  }

  async create(record: LeadRecord): Promise<LeadRecord> {
    const claimed = await this.redis.set(idemKey(record.idempotencyKey), record.id, {
      nx: true,
    });
    if (claimed !== "OK") {
      // Lost the race or a replay: one idempotency key maps to one lead.
      const existingId = await this.redis.get<string>(idemKey(record.idempotencyKey));
      const existing = existingId ? await this.get(existingId) : null;
      if (existing) return existing;
      // Claim exists but the body is missing (crash between claim and write):
      // heal by writing this record under the claimed id.
      const healed: LeadRecord = { ...record, id: existingId ?? record.id };
      await this.write(healed);
      return healed;
    }
    await this.write(record);
    return record;
  }

  private async write(record: LeadRecord): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.set(leadKey(record.id), record);
    pipeline.zadd(INDEX_KEY, {
      score: Date.parse(record.submittedAt),
      member: record.id,
    });
    await pipeline.exec();
  }

  // Read-modify-write without optimistic locking (the REST client has no
  // WATCH); acceptable because the two channels are only updated sequentially
  // within a single action invocation.
  async updateDelivery(
    id: string,
    channel: DeliveryChannel,
    state: DeliveryChannelState,
  ): Promise<LeadRecord | null> {
    const record = await this.get(id);
    if (!record) return null;
    const updated: LeadRecord = {
      ...record,
      delivery: { ...record.delivery, [channel]: state },
    };
    await this.redis.set(leadKey(id), updated);
    return updated;
  }
}

let upstashRepository: UpstashLeadRepository | null = null;

export type RepositoryResult =
  | { readonly ok: true; readonly repository: LeadRepository }
  | { readonly ok: false; readonly reason: string };

/**
 * Resolve the active lead repository. Explicit env config only; the dev
 * adapter is never returned in production.
 */
export function getLeadRepository(): RepositoryResult {
  const configured = process.env.LEAD_STORAGE?.trim().toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  if (!configured || configured === "memory") {
    if (isProduction) {
      return {
        ok: false,
        reason:
          "Lead storage is not configured for production. Set LEAD_STORAGE=upstash; refusing to use in-memory storage.",
      };
    }
    return { ok: true, repository: memoryRepository };
  }

  if (configured === "upstash") {
    const redis = getRedis();
    if (!redis) {
      return {
        ok: false,
        reason:
          "LEAD_STORAGE=upstash but Upstash Redis is not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).",
      };
    }
    upstashRepository ??= new UpstashLeadRepository(redis);
    return { ok: true, repository: upstashRepository };
  }

  // An unknown backend was named; fail closed rather than storing nowhere.
  return {
    ok: false,
    reason: `Lead storage "${configured}" is not wired. Supported: "upstash" (or "memory" in development).`,
  };
}

export function initialDeliveryState(): DeliveryState {
  return {
    userEmail: { status: "pending", attempts: 0 },
    internalNotification: { status: "pending", attempts: 0 },
  };
}
