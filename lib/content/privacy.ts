/**
 * DRAFT (D-02): this privacy policy copy has NOT been owner-approved and must
 * be reviewed (and ideally checked with counsel) before the draft banner is
 * removed from app/privacy/page.tsx. Bracketed [placeholders] mark details
 * only the owner can confirm. The processor list reflects the actual build:
 * Gmail, Google Gemini, Upstash Redis, Google Sheets, Vercel.
 */

export const PRIVACY_DRAFT_NOTICE =
  "Draft for review — this policy has not yet been approved by Arizmi Labs.";

export const PRIVACY_LAST_UPDATED = "15 July 2026";

export interface PrivacySection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
}

export const PRIVACY_SECTIONS: readonly PrivacySection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "Arizmi Labs Ltd (“Arizmi Labs”, “we”) is a product and software studio. [Registered address and company number to confirm.] This policy explains what personal information we collect through this website and how we use it.",
    ],
  },
  {
    heading: "What we collect",
    paragraphs: [
      "We only collect information you choose to give us through two forms on this site:",
    ],
    bullets: [
      "Contact form — your name, email address, and message.",
      "BluePrint AI — your answers about the idea you want to build, and the details you enter to access your BluePrint: name, email address, and optionally phone number, company, role, budget range, and timeline, plus whether you ticked the marketing consent box.",
    ],
  },
  {
    heading: "How we use it",
    paragraphs: [
      "We use your contact details to respond to your enquiry and to follow up on your BluePrint, on the basis of our legitimate interest in responding to people who get in touch. We use your BluePrint answers to generate your PRD-style plan and, if you request it, to email you the full version.",
      "We only send marketing messages if you ticked the consent box, and you can unsubscribe at any time by replying to any message or contacting us.",
    ],
  },
  {
    heading: "Where it is processed",
    paragraphs: [
      "This site is hosted on Vercel. To provide the services above, your information passes through a small set of processors:",
    ],
    bullets: [
      "Google Gemini — your BluePrint answers are sent to Google's Gemini API to generate the diagnosis and plan.",
      "Gmail (Google Workspace) — used to send and receive the emails described above.",
      "Upstash Redis and Google Sheets — used to store completed BluePrint lead records so we can follow up.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep enquiry and BluePrint records for as long as needed to follow up on your enquiry and for our business records. [Retention period to confirm — e.g. 24 months from last contact.]",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "Under UK data protection law you can ask us for a copy of your information, ask us to correct or delete it, object to our use of it, and withdraw marketing consent at any time. You can also complain to the Information Commissioner's Office (ico.org.uk).",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "To exercise any of these rights or ask about this policy, use the contact form on this site or email us at [contact email to confirm].",
    ],
  },
];
