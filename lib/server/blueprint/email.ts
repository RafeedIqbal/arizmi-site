import "server-only";

/**
 * BluePrint delivery (TASK-014). Server-only.
 *
 * Two channels, each with durable idempotent status on the lead record:
 *   - the user artifact ("Email me the full BluePrint"), sent only on explicit
 *     user action;
 *   - the internal Arizmi lead notification.
 *
 * Delivery is idempotent: a channel already "sent" is never re-sent, so a
 * refresh/retry cannot duplicate email. A failed email records "failed" and
 * leaves the persisted lead + generated plan intact (plan success is
 * independent of email success). D-05 (sender details) is unresolved, so
 * production is blocked until sender identity is configured.
 */
import nodemailer from "nodemailer";
import {
  getMailConfigResult,
} from "@/lib/server/config";
import { renderBlueprintHtml, renderBlueprintText, escapeHtml } from "./document";
import type {
  DeliveryChannel,
  DeliveryChannelState,
  LeadRecord,
  LeadRepository,
} from "./leads";

/** Strip characters that enable email header injection from header values. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function nowIso(): string {
  return new Date().toISOString();
}

function getTransport() {
  const config = getMailConfigResult();
  if (!config.ok) return config;
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: config.user, pass: config.password },
  });
  return {
    ok: true as const,
    transport,
    from: config.user,
    internalRecipient: config.internalRecipient,
  };
}

async function deliver(
  repository: LeadRepository,
  recordId: string,
  channel: DeliveryChannel,
  build: (record: LeadRecord, from: string, internalRecipient: string) => {
    to: string;
    replyTo?: string;
    subject: string;
    text: string;
    html: string;
  },
): Promise<DeliveryChannelState> {
  const record = await repository.get(recordId);
  if (!record) return { status: "failed", attempts: 0, lastError: "Lead record not found." };

  const current = record.delivery[channel];
  // Idempotent: never re-send an already-delivered channel.
  if (current.status === "sent") return current;

  const mail = getTransport();
  if (!mail.ok) {
    const state: DeliveryChannelState = {
      status: "failed",
      attempts: current.attempts + 1,
      lastError: mail.reason,
      updatedAt: nowIso(),
    };
    await repository.updateDelivery(recordId, channel, state);
    return state;
  }

  const message = build(record, mail.from, mail.internalRecipient);
  try {
    await mail.transport.sendMail({
      from: mail.from,
      to: headerSafe(message.to),
      replyTo: message.replyTo ? headerSafe(message.replyTo) : undefined,
      subject: headerSafe(message.subject),
      text: message.text,
      html: message.html,
    });
    const state: DeliveryChannelState = { status: "sent", attempts: current.attempts + 1, updatedAt: nowIso() };
    await repository.updateDelivery(recordId, channel, state);
    return state;
  } catch (err) {
    console.error("[blueprint] delivery failed", { channel, recordId, name: err instanceof Error ? err.name : "unknown" });
    const state: DeliveryChannelState = {
      status: "failed",
      attempts: current.attempts + 1,
      lastError: "Email send failed.",
      updatedAt: nowIso(),
    };
    await repository.updateDelivery(recordId, channel, state);
    return state;
  }
}

/** Send the full 11-section artifact to the user. */
export function deliverUserBlueprint(
  repository: LeadRepository,
  recordId: string,
): Promise<DeliveryChannelState> {
  return deliver(repository, recordId, "userEmail", (record, from) => ({
    to: record.contact.email,
    replyTo: from,
    subject: "Your Arizmi BluePrint",
    text: renderBlueprintText(record.plan, record.diagnosis, { recipientName: record.contact.name }),
    html: renderBlueprintHtml(record.plan, record.diagnosis, { recipientName: record.contact.name }),
  }));
}

/** Send the internal Arizmi lead notification with the approved summary. */
export function deliverInternalNotification(
  repository: LeadRepository,
  recordId: string,
): Promise<DeliveryChannelState> {
  return deliver(repository, recordId, "internalNotification", (record, _from, internalRecipient) => ({
    to: internalRecipient,
    replyTo: record.contact.email,
    subject: `[Arizmi BluePrint] New lead: ${record.contact.name}`,
    text: internalSummaryText(record),
    html: internalSummaryHtml(record),
  }));
}

/* ------------------------------- internal summary ------------------------- */

function row(label: string, value: string): string {
  return `<p style="margin:4px 0;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || "—")}</p>`;
}

function internalSummaryHtml(record: LeadRecord): string {
  const c = record.contact;
  const d = record.diagnosis;
  return `<div style="font-family: sans-serif; max-width: 560px; color:#101313;">
    <h2 style="margin-bottom:4px;">New BluePrint lead</h2>
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:12px 0;" />
    ${row("Name", c.name)}
    ${row("Email", c.email)}
    ${row("Phone", c.phone)}
    ${row("Company", c.company)}
    ${row("Role", c.role)}
    ${row("Budget range", c.budgetRange)}
    ${row("Timeline", c.timeline)}
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:12px 0;" />
    ${row("Marketing consent", record.consent.marketingConsent ? `Yes (${record.consent.consentTimestamp})` : "No")}
    ${row("Consent copy version", record.consent.consentCopyVersion)}
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:12px 0;" />
    ${row("Build type", d.buildType)}
    ${row("Stage", d.stage)}
    ${row("Main users", d.mainUsers)}
    ${row("Core need", d.coreNeed)}
    ${row("Likely complexity", d.likelyComplexity)}
    ${row("Conversion category", d.conversionCategory)}
    ${row("Recommended next step", d.recommendedNextStep)}
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:12px 0;" />
    ${row("Submitted", record.submittedAt)}
    ${row("Generation", `${record.generation.mode} / ${record.generation.providerId} / ${record.generation.status}`)}
    ${row("Prompt / schema", `${record.generation.promptVersion} / ${record.generation.schemaVersion}`)}
  </div>`;
}

function internalSummaryText(record: LeadRecord): string {
  const c = record.contact;
  const d = record.diagnosis;
  return [
    "New BluePrint lead",
    `Name: ${c.name}`,
    `Email: ${c.email}`,
    `Phone: ${c.phone || "—"}`,
    `Company: ${c.company || "—"}`,
    `Role: ${c.role || "—"}`,
    `Budget range: ${c.budgetRange || "—"}`,
    `Timeline: ${c.timeline || "—"}`,
    `Marketing consent: ${record.consent.marketingConsent ? `Yes (${record.consent.consentTimestamp})` : "No"}`,
    `Consent copy version: ${record.consent.consentCopyVersion}`,
    `Build type: ${d.buildType}`,
    `Stage: ${d.stage}`,
    `Main users: ${d.mainUsers}`,
    `Core need: ${d.coreNeed}`,
    `Likely complexity: ${d.likelyComplexity}`,
    `Conversion category: ${d.conversionCategory}`,
    `Recommended next step: ${d.recommendedNextStep}`,
    `Submitted: ${record.submittedAt}`,
    `Generation: ${record.generation.mode} / ${record.generation.providerId} / ${record.generation.status}`,
    `Prompt / schema: ${record.generation.promptVersion} / ${record.generation.schemaVersion}`,
  ].join("\n");
}
