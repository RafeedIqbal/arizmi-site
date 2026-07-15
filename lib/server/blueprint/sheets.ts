import "server-only";

/**
 * Best-effort Google Sheets lead mirror. Reads no environment (configuration
 * resolves in lib/server/config.ts) and NEVER throws: Redis is the source of
 * truth and every lead is also emailed internally, so a Sheets failure is
 * logged and swallowed rather than failing the submission.
 *
 * Column order — keep the sheet's header row in sync (documented in
 * docs/PRODUCTION.md):
 *   Submitted at, Lead ID, Name, Email, Phone, Company, Role, Budget range,
 *   Timeline, Marketing consent, Build type, Stage, Audience, Main goal,
 *   <the 10 intake answers in INTAKE_QUESTIONS order>, Added detail,
 *   Likely complexity, Conversion category, Recommended next step,
 *   Provider, Mode
 */
import { JWT } from "google-auth-library";
import { INTAKE_QUESTIONS, nextStepLabel } from "@/lib/blueprint/content";
import { getGoogleSheetsConfig } from "@/lib/server/config";
import type { LeadRecord } from "./leads";

// Memoized per instance; JWT.request() caches and refreshes the access token.
let jwtClient: { key: string; jwt: JWT } | null = null;

function leadRow(record: LeadRecord): string[] {
  const c = record.contact;
  const q = record.qualifying;
  const d = record.diagnosis;
  const audience =
    q.audience === "Other" && q.audienceOther ? `Other (${q.audienceOther})` : q.audience;
  return [
    record.submittedAt,
    record.id,
    c.name,
    c.email,
    c.phone,
    c.company,
    c.role,
    c.budgetRange,
    c.timeline,
    record.consent.marketingConsent ? "Yes" : "No",
    q.buildType,
    q.stage,
    audience,
    q.mainGoal,
    ...INTAKE_QUESTIONS.map((question) => record.intake[question.field]),
    record.addedDetail ?? "",
    d.likelyComplexity,
    d.conversionCategory,
    nextStepLabel(d.recommendedNextStep),
    record.generation.providerId,
    record.generation.mode,
  ];
}

export async function appendLeadToSheet(record: LeadRecord): Promise<void> {
  const config = getGoogleSheetsConfig();
  if (!config.ok) return; // mirror not configured — silent no-op

  try {
    if (jwtClient?.key !== config.clientEmail) {
      jwtClient = {
        key: config.clientEmail,
        jwt: new JWT({
          email: config.clientEmail,
          key: config.privateKey,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        }),
      };
    }
    // valueInputOption=RAW stores values un-parsed, which also neutralises
    // spreadsheet formula injection from user-authored answers.
    await jwtClient.jwt.request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        config.spreadsheetId,
      )}/values/A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      method: "POST",
      data: { values: [leadRow(record)] },
      timeout: 10_000,
    });
  } catch (err) {
    console.warn("[blueprint] sheets mirror failed", {
      leadId: record.id,
      name: err instanceof Error ? err.name : "unknown",
    });
  }
}
