# BluePrint AI product and page specification

## Product purpose

Arizmi BluePrint AI turns a rough idea, workflow, or product opportunity into a Product Requirements Document (PRD)-style plan before development begins. It is a guided product-scoping experience powered by AI, not a chatbot.

The experience should feel premium, calm, clear, and product-led. Avoid gimmicky AI visual language and vague marketing phrases.

## End-to-end flow

1. Hero / intro
2. Qualifying questions
3. Guided idea intake
4. AI first diagnosis
5. Lead capture gate
6. BluePrint reveal
7. Full-output email/PDF action
8. Diagnosis-dependent booking CTA

Use a multi-step form with a named progress indicator, back/next controls, saved in-session answers, inline validation, loading, error, retry, and success states. Do not lose valid answers when a server request fails.

## Hero

Headline:

> Welcome to BluePrint AI.

Supporting copy:

> Arizmi BluePrint AI helps turn a rough idea, workflow or product opportunity into a Product Requirements Document (PRD)-style plan before development begins.

Primary CTA: `Start your BluePrint`

## Step 1: qualifying questions

### What are you trying to build?

- Website / platform
- Web app
- Mobile app
- AI system
- CRM / internal tool
- Not sure yet

### Where are you right now?

- Just an idea
- I have notes / a rough brief
- I have designs
- I have an existing product
- I need to fix a workflow

### Who is this for?

- Customers
- Internal team
- Members / community
- Clients
- Founders / operators
- Other

If `Other` is selected, request a concise accessible text value.

### What is the main goal?

- Launch something new
- Save time
- Automate work
- Improve user experience
- Replace spreadsheets / manual tools
- Scale an existing product

The source does not explicitly state whether any question supports multiple selections. Default to single selection for the MVP and document any approved exception.

## Step 2: guided idea intake

Ask these questions as structured inputs or text areas. One or two questions per screen is acceptable when the progress model remains clear.

1. Describe the idea in your own words.
2. What problem does it solve?
3. Who will use it?
4. What are they currently doing instead?
5. What should the product help them do?
6. What are the must-have features?
7. What would be nice to have later?
8. Are there any existing tools, systems or processes it needs to connect with?
9. What would make this project successful?
10. When do you want to launch or start building?

Provide clear limits, examples only where needed, and accessible error messages. Treat every answer as untrusted input when it later enters an AI prompt, email, PDF, database, or HTML response.

## Step 3: AI first diagnosis

Generate a short structured diagnosis in this shape:

> Your idea looks like:

- Build type
- Stage
- Main users
- Core need
- Likely complexity
- Recommended next step

Example only:

- Build type: Web application
- Stage: Early concept
- Main users: Fitness coaches and clients
- Core need: Client management, training plans and progress tracking
- Likely complexity: Medium
- Recommended next step: Define MVP scope before development

Then ask: `Does this look right?`

Actions:

- `Yes, continue` → lead gate
- `Edit my answers` → return to the intake with answers intact
- `Add more detail` → show an additional text area, then regenerate diagnosis

The UI must render a validated structured object, not parse arbitrary model-authored Markdown. Display a recoverable error when the AI response is invalid or unavailable.

## Step 4: lead capture gate

Message:

> Great, your BluePrint is now ready. Fill in the details below to access it.

Fields:

- Name — required
- Email address — required
- Phone number
- Company
- Role
- Budget range
- Timeline

Consent checkbox copy from the brief:

> Please tick this box to consent to Arizmi Labs Ltd reaching out to you. If you tick the box, we’ll also send occasional messages from Arizmi Labs. You can unsubscribe anytime. Read our Privacy Policy.

Button: `Reveal my BluePrint`

Requirements:

- Name and email are required.
- Marketing consent is optional and recorded as an explicit boolean with timestamp and copy/version; it cannot be bundled into access to the result.
- The Privacy Policy text links to an approved route/URL before production. See D-02.
- D-16 must define budget/timeline options.
- Validate on client for usability and again on server for trust.
- Apply bot/rate-limit controls suitable for a costly AI endpoint; do not rely only on the existing in-memory guard in a multi-instance production deployment.

## Step 5: BluePrint reveal

The full output is a PRD-style product plan with:

1. Product summary — clear plain-English summary of the product.
2. Problem statement — what problem it solves and why it matters.
3. Target users — primary and secondary users.
4. User goals — what users need to achieve inside the product.
5. Core features — main features needed for the first version.
6. MVP scope — what should be built first and what should wait.
7. User journeys — simple flows showing how people will use the product.
8. Technical considerations — integrations, data, accounts, permissions, payments, AI, dashboards, CMS, and APIs.
9. Risks and complexity — where the build could become messy, expensive, or unclear.
10. Open questions — what Arizmi must answer before quoting or building.
11. Recommended next step — one or more of: scoping call, UX/product mapping, wireframes, MVP build, or existing-system review.

### On-screen preview

Show a valuable but concise preview:

- Product summary
- Build type
- Problem statement
- MVP scope
- Likely complexity
- Recommended next step

Action: `Email me the full BluePrint`

The source says the full version should be a polished PDF or formatted email sent to the user. D-05 and D-17 must finalize the exact artifact and whether a direct download is also offered.

### Conversion logic

Use a validated diagnosis category, not keyword matching in generated prose.

If early-stage:

> Your idea needs more shape before build. Start with a BluePrint review call.

If build-ready:

> Your idea has enough structure to move into scoping and build planning.

If complex:

> This build has moving parts that need technical scoping before development.

CTA for each: `Book a call`

The booking destination is environment-backed until D-01 is resolved.

## Lead and internal handling

Every completed BluePrint creates an internal lead record containing:

- Name
- Email
- Phone
- Company
- Role
- Budget range
- Timeline
- Consent status and consent metadata
- Build type
- Stage
- Main users
- Main goal
- Qualifying answers
- Guided-intake answers
- Added detail, if provided
- AI diagnosis
- Full BluePrint output
- Recommended next step
- Submission date
- Prompt/schema version and generation status for supportability

Also send an internal notification email to Arizmi with the lead details and summary. Do not include unnecessary secrets or raw operational metadata. Escape all user content in HTML, and design retries/idempotency so refreshes do not generate duplicate leads or emails.

## AI behavior requirements

Use an AI API on the server to generate:

- first diagnosis
- full BluePrint output
- recommended next-step classification

Output should be practical, plain English, commercially useful, and explicit about uncertainty. It should help Arizmi understand whether the user needs:

- BluePrint review
- UX / product mapping
- wireframes
- MVP build
- technical scoping
- existing system review

Do not use phrases such as:

- cutting-edge solutions
- digital transformation
- unlock your potential
- revolutionise your business
- seamless innovation

Required implementation boundaries:

- Server-only prompt templates and API credentials.
- Versioned prompts and input/output schemas.
- Structured model output validated before display or persistence.
- User input clearly delimited from system instructions to reduce prompt-injection risk.
- Timeouts, bounded retries, abort behavior, request size limits, logging without sensitive content, and user-safe errors.
- A provider adapter so D-03 can be resolved without rewriting the UI.
- No claims that the generated plan is a binding quote, security review, legal opinion, or final technical architecture.

## UX and accessibility requirements

- Mobile responsive and usable at 320 px.
- Semantic fieldsets/legends for grouped choices.
- Accessible labels, descriptions, required indicators, and error summaries.
- Progress indicator announces the current step without exposing inaccessible future content.
- Back/next works without unexpected page navigation.
- Focus moves to the new step heading or error summary after transitions.
- Loading state remains informative and cancellable/recoverable where possible.
- Reduced-motion friendly.
- Draft answers survive normal back/forward interaction and transient failures; define whether browser refresh persistence is allowed given privacy requirements.
- Final preview has printable/readable hierarchy and does not become a wall of text.

## Technical shape

The brief requires:

- frontend multi-step form
- AI generation endpoint
- database or lead storage
- user email delivery
- internal notification email
- PDF generation or formatted email output
- environment variables for secrets/config
- placeholder booking and privacy links until approved
- editable AI prompts

Recommended separation of concerns:

- `app/blueprint-ai/page.tsx`: route shell and metadata
- `components/blueprint/*`: client flow and presentational components
- `lib/blueprint/schema.ts`: shared input/output schemas and types
- `lib/blueprint/content.ts`: question and option configuration
- `lib/server/blueprint/prompts.ts`: server-only versioned prompts
- `lib/server/blueprint/ai.ts`: provider adapter and structured generation
- `lib/server/blueprint/leads.ts`: persistence interface/adapter
- `lib/server/blueprint/email.ts`: user and internal delivery
- `lib/server/blueprint/document.ts`: full output/PDF formatting
- route handlers or server actions with explicit trust boundaries

Exact filenames may change to match the implementation, but do not collapse all responsibilities into one route component or server action.

## BluePrint acceptance criteria

- A user can complete the flow using only a keyboard and a screen reader.
- Answers persist while moving backward/forward within the flow.
- Invalid AI output cannot render as trusted content or be silently stored.
- Name/email requirements and optional marketing consent behave exactly as specified.
- One successful submission creates one lead record and one intended set of email jobs.
- The preview and full output contain the required sections and conversion classification.
- Credentials and prompts do not enter the client bundle or logs.
- Provider, storage, privacy, delivery, and booking decisions are resolved or visibly blocked before production.
- The user receives a useful recovery state for AI, storage, and email failures.

