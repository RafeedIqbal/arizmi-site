import "server-only";

/**
 * Full BluePrint artifact rendering (TASK-014). Server-only.
 *
 * D-05 (final PDF/email visual design) is unresolved, so this produces a
 * branded, email- and print-safe HTML skeleton plus a plain-text fallback.
 * D-17 safe default: fulfil the explicit email promise; a downloadable file is
 * not produced here. All user/model content is HTML-escaped; the data is the
 * validated structured plan, never raw model Markdown.
 */
import {
  PLAN_DISCLAIMER,
  nextStepLabel,
} from "@/lib/blueprint/content";
import type { BluePrintPlan, Diagnosis } from "@/lib/blueprint/schema";

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const wrapStyle =
  "font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #101313; line-height: 1.55;";
const h2Style = "font-size: 18px; margin: 28px 0 6px; color: #017076;";
const numStyle = "font-family: monospace; font-size: 12px; color: #4e5657; letter-spacing: 0.08em;";
const pStyle = "margin: 6px 0; white-space: pre-wrap;";
const ulStyle = "margin: 6px 0 6px 20px; padding: 0;";

function list(items: readonly string[]): string {
  if (!items.length) return `<p style="${pStyle}color:#4e5657;">None specified.</p>`;
  return `<ul style="${ulStyle}">${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function section(index: number, title: string, body: string): string {
  return `<section><p style="${numStyle}">SECTION ${index}</p><h2 style="${h2Style}">${escapeHtml(title)}</h2>${body}</section>`;
}

export interface ArtifactMeta {
  readonly recipientName: string;
}

/** Full 11-section HTML artifact for the user email. */
export function renderBlueprintHtml(
  plan: BluePrintPlan,
  diagnosis: Diagnosis,
  meta: ArtifactMeta,
): string {
  const p = (t: string) => `<p style="${pStyle}">${escapeHtml(t)}</p>`;
  const journeys = plan.userJourneys
    .map(
      (j) =>
        `<p style="${pStyle}"><strong>${escapeHtml(j.title)}</strong></p>${list(j.steps)}`,
    )
    .join("");
  const nextSteps = plan.recommendedNextStep.steps.map((s) => nextStepLabel(s));

  return `<div style="${wrapStyle}">
    <p style="${numStyle}">ARIZMI BLUEPRINT AI</p>
    <h1 style="font-size: 24px; margin: 4px 0 2px;">Your BluePrint</h1>
    <p style="${pStyle}color:#4e5657;">Prepared for ${escapeHtml(meta.recipientName)} · ${escapeHtml(diagnosis.buildType)} · ${escapeHtml(diagnosis.likelyComplexity)} complexity</p>
    ${section(1, "Product summary", p(plan.productSummary))}
    ${section(2, "Problem statement", p(plan.problemStatement))}
    ${section(3, "Target users", `${p(`Primary: ${plan.targetUsers.primary}`)}${p(`Secondary: ${plan.targetUsers.secondary}`)}`)}
    ${section(4, "User goals", list(plan.userGoals))}
    ${section(5, "Core features", list(plan.coreFeatures))}
    ${section(6, "MVP scope", `<p style="${pStyle}"><strong>Build first</strong></p>${list(plan.mvpScope.now)}<p style="${pStyle}"><strong>Build later</strong></p>${list(plan.mvpScope.later)}`)}
    ${section(7, "User journeys", journeys)}
    ${section(8, "Technical considerations", list(plan.technicalConsiderations))}
    ${section(9, "Risks and complexity", list(plan.risksAndComplexity))}
    ${section(10, "Open questions", list(plan.openQuestions))}
    ${section(11, "Recommended next step", `${list(nextSteps)}${p(plan.recommendedNextStep.rationale)}`)}
    <hr style="border:none;border-top:1px solid #ddd9ce;margin:28px 0;" />
    <p style="font-size:12px;color:#4e5657;">${escapeHtml(PLAN_DISCLAIMER)}</p>
  </div>`;
}

/** Plain-text fallback so the artifact stays readable without HTML. */
export function renderBlueprintText(
  plan: BluePrintPlan,
  diagnosis: Diagnosis,
  meta: ArtifactMeta,
): string {
  const bullets = (items: readonly string[]) =>
    items.length ? items.map((i) => `  - ${i}`).join("\n") : "  - None specified.";
  const nextSteps = plan.recommendedNextStep.steps.map((s) => nextStepLabel(s));

  return [
    "ARIZMI BLUEPRINT AI — YOUR BLUEPRINT",
    `Prepared for ${meta.recipientName} · ${diagnosis.buildType} · ${diagnosis.likelyComplexity} complexity`,
    "",
    `1. PRODUCT SUMMARY\n${plan.productSummary}`,
    `2. PROBLEM STATEMENT\n${plan.problemStatement}`,
    `3. TARGET USERS\n  Primary: ${plan.targetUsers.primary}\n  Secondary: ${plan.targetUsers.secondary}`,
    `4. USER GOALS\n${bullets(plan.userGoals)}`,
    `5. CORE FEATURES\n${bullets(plan.coreFeatures)}`,
    `6. MVP SCOPE\n Build first:\n${bullets(plan.mvpScope.now)}\n Build later:\n${bullets(plan.mvpScope.later)}`,
    `7. USER JOURNEYS\n${plan.userJourneys.map((j) => ` ${j.title}\n${bullets(j.steps)}`).join("\n")}`,
    `8. TECHNICAL CONSIDERATIONS\n${bullets(plan.technicalConsiderations)}`,
    `9. RISKS AND COMPLEXITY\n${bullets(plan.risksAndComplexity)}`,
    `10. OPEN QUESTIONS\n${bullets(plan.openQuestions)}`,
    `11. RECOMMENDED NEXT STEP\n${bullets(nextSteps)}\n${plan.recommendedNextStep.rationale}`,
    "",
    PLAN_DISCLAIMER,
  ].join("\n\n");
}
