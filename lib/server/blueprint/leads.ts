import "server-only";

/**
 * BluePrint lead persistence (TASK-013). Server-only.
 *
 * D-04 is unresolved, so no production database is wired. This module ships a
 * repository interface (the seam) and an in-memory development adapter only.
 * The factory refuses to hand back the dev adapter in production, so a
 * production deploy cannot silently store leads in volatile memory.
 *
 * The record is the single internal source of truth for the flow after the
 * lead gate: the full plan lives here and is referenced by opaque id, so the
 * untrusted client never carries the full plan back for emailing.
 */
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
        reason: "Lead storage is not configured for production (D-04). Refusing to use in-memory storage.",
      };
    }
    return { ok: true, repository: memoryRepository };
  }

  // A real storage backend was named but none is wired yet (D-04 pending).
  return {
    ok: false,
    reason: `Lead storage "${configured}" is not wired. Resolve D-04 and add its adapter.`,
  };
}

export function initialDeliveryState(): DeliveryState {
  return {
    userEmail: { status: "pending", attempts: 0 },
    internalNotification: { status: "pending", attempts: 0 },
  };
}
