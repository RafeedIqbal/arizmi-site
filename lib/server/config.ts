import "server-only";

/**
 * Server-resolved runtime configuration. The "server-only" import makes any
 * client-component import of this module a build error, so environment
 * values cannot leak into the browser bundle.
 *
 * D-15: contact recipient/config centralizes here in TASK-017.
 */

export type BookingDestination =
  | { readonly status: "configured"; readonly url: string }
  | { readonly status: "unconfigured" };

/**
 * D-01: the production booking URL is not yet decided. Until it is, the
 * destination is backed by the BOOKING_URL environment variable and booking
 * CTAs must render meaningful disabled semantics when it is absent — never
 * a "#" link.
 */
export function getBookingDestination(): BookingDestination {
  const url = process.env.BOOKING_URL?.trim() || process.env.NEXT_PUBLIC_CALENDLY_LINK?.trim();
  if (!url) {
    return { status: "unconfigured" };
  }
  return { status: "configured", url };
}

export type PrivacyPolicy =
  | { readonly status: "configured"; readonly url: string }
  | { readonly status: "placeholder" };

/**
 * D-02: the Privacy Policy URL and approved consent language are unresolved.
 * PRIVACY_POLICY_URL backs the consent link. Development renders a local
 * placeholder; production lead capture must be blocked while it is a
 * placeholder (see isBlueprintLeadCaptureProductionReady).
 */
export function getPrivacyPolicy(): PrivacyPolicy {
  const url = process.env.PRIVACY_POLICY_URL?.trim();
  if (!url) return { status: "placeholder" };
  return { status: "configured", url };
}

/**
 * Guards production lead capture: a real Privacy Policy must be configured
 * (D-02) before any lead can be stored in production. In non-production the
 * placeholder is allowed so the flow is testable end to end.
 */
export function isBlueprintLeadCaptureProductionReady(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return getPrivacyPolicy().status === "configured";
}

/**
 * D-15: default internal recipient until an owner confirms the production
 * address. The contact form and the BluePrint lead notification both fall back
 * to this and can each be overridden independently by environment.
 */
const DEFAULT_INTERNAL_RECIPIENT = "mish@icontraining.app";

type SmtpCredentials =
  | { readonly ok: true; readonly user: string; readonly password: string }
  | { readonly ok: false; readonly reason: string };

/**
 * Single source for the Gmail transport identity used by every outbound email
 * (contact form and BluePrint delivery). No route reads GMAIL_* directly.
 */
function getSmtpCredentials(): SmtpCredentials {
  const user = process.env.GMAIL_USER?.trim();
  const password = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !password) {
    return {
      ok: false,
      reason: "Email transport is not configured (GMAIL_USER / GMAIL_APP_PASSWORD).",
    };
  }
  return { ok: true, user, password };
}

export type MailConfigResult =
  | {
      readonly ok: true;
      readonly user: string;
      readonly password: string;
      readonly internalRecipient: string;
    }
  | { readonly ok: false; readonly reason: string };

/**
 * SMTP identity for BluePrint delivery. D-05: the production sender/recipient
 * are not finalized, so in production the send is blocked when credentials are
 * absent; development can send with the existing dev mailbox.
 */
export function getMailConfigResult(): MailConfigResult {
  const smtp = getSmtpCredentials();
  if (!smtp.ok) return { ok: false, reason: `${smtp.reason} See D-05.` };
  const internalRecipient =
    process.env.BLUEPRINT_LEAD_RECIPIENT?.trim() || DEFAULT_INTERNAL_RECIPIENT;
  return { ok: true, user: smtp.user, password: smtp.password, internalRecipient };
}

export type ContactMailConfig =
  | {
      readonly ok: true;
      readonly user: string;
      readonly password: string;
      readonly recipient: string;
    }
  | { readonly ok: false; readonly reason: string };

/**
 * D-15: the contact form's recipient and sender centralize here so the server
 * action never reads SMTP env vars directly. CONTACT_RECIPIENT overrides the
 * default internal recipient; the sender reuses the shared Gmail identity. When
 * the transport is unconfigured, callers must surface a clear error rather than
 * attempting a doomed send.
 */
export function getContactMailConfig(): ContactMailConfig {
  const smtp = getSmtpCredentials();
  if (!smtp.ok) return { ok: false, reason: smtp.reason };
  const recipient =
    process.env.CONTACT_RECIPIENT?.trim() || DEFAULT_INTERNAL_RECIPIENT;
  return { ok: true, user: smtp.user, password: smtp.password, recipient };
}
