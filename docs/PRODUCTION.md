# Production go-live checklist (Vercel)

The site deploys and renders statically today. The BluePrint AI flow is
fail-closed: in production it refuses to run until the environment below is
configured. This doc lists everything left to do for a fully live production
deployment. Env var reference: `example.env`.

## 1. Environment variables in Vercel

Set in **Project → Settings → Environment Variables**:

| Variable | Production | Preview | Notes |
|---|---|---|---|
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | required | optional | All outbound email (contact form + BluePrint). |
| `CONTACT_RECIPIENT` / `BLUEPRINT_LEAD_RECIPIENT` | recommended | — | Default to `mish@icontraining.app` — confirm this is right for production (D-15). |
| `BOOKING_URL` (or `NEXT_PUBLIC_CALENDLY_LINK`) | required | optional | Without it, every booking CTA renders disabled (D-01). |
| `PRIVACY_POLICY_URL` | optional | — | Only to override the built-in `/privacy` page. |
| `BLUEPRINT_AI_PROVIDER=gemini` + `GEMINI_API_KEY` | required | optional | Without them, BluePrint generation is blocked with a friendly message. |
| `BLUEPRINT_AI_MODEL` | optional | — | Defaults to `gemini-2.5-flash`. |
| `LEAD_STORAGE=upstash` + Upstash vars | required | optional | Without them, lead capture is blocked (never silently stored in memory). |
| `GOOGLE_SHEETS_*` (3 vars) | optional | — | Best-effort lead mirror; failures never block a lead. |

Preview tip: leave `BLUEPRINT_AI_PROVIDER` / `LEAD_STORAGE` unset on Preview
only if you want the flow blocked there; Vercel previews build with
`NODE_ENV=production`, so the dev mock/memory fallbacks do **not** apply. To
test the full flow on previews, set the same vars but point `LEAD_STORAGE` at
a **separate** Upstash database so test leads never pollute production.

## 2. Upstash Redis (leads + rate limiting)

1. Vercel → Marketplace → **Upstash Redis** → install into the project
   (auto-injects the REST URL/token; both the `UPSTASH_*` and legacy `KV_*`
   names are accepted), or create a database at console.upstash.com and copy
   the REST URL + token manually.
2. No schema needed. Keys used: `blueprint:lead:<id>`,
   `blueprint:lead:idem:<key>`, `blueprint:leads:index`, `blueprint:rl:*`
   (rate-limit counters, self-expiring).

## 3. Google Sheet lead mirror (optional)

1. Google Cloud Console → create/select a project → enable the
   **Google Sheets API**.
2. Create a **service account** → create a JSON key → copy `client_email` and
   `private_key` into the env vars.
3. Create the spreadsheet and **share it with the service-account email as
   Editor** — the most common setup mistake.
4. Add a header row matching the column order in
   `lib/server/blueprint/sheets.ts`: Submitted at, Lead ID, Name, Email,
   Phone, Company, Role, Budget range, Timeline, Marketing consent,
   Build type, Stage, Audience, Main goal, the 10 intake questions (in form
   order), Added detail, Likely complexity, Conversion category,
   Recommended next step, Provider, Mode.

## 4. Gemini API key

Google AI Studio → https://aistudio.google.com/apikey. Free tier is fine for
launch volumes; a paid key removes the tighter rate limits. Generation is
size-guarded (20k chars), 30s-capped, and rate-limited (8 diagnoses +
4 lead submissions per IP per minute), so cost exposure per visitor is small.

## 5. Content and copy sign-off

- **Privacy policy (`/privacy`)** — the page ships with clearly-marked DRAFT
  copy (`lib/content/privacy.ts`) including bracketed placeholders (company
  number, retention period, contact email). Review/approve the copy — ideally
  with counsel — fill the placeholders, then remove the draft banner in
  `app/privacy/page.tsx`.
- **Budget/timeline options (D-16)** — the lead form's budget-range and
  timeline dropdowns are draft options flagged "pending confirmation" in the
  UI (`lib/blueprint/content.ts`). Confirm the option sets, then remove
  `LEAD_DRAFT_NOTICE` from the content file and its usage in
  `components/blueprint/LeadStep.tsx`.
- **Build media (D-07)** — Builds cards show a permanent "Preview coming soon"
  placeholder until project imagery is approved.
- **Team photos (D-11)** and **About stats (D-10)** — placeholders remain;
  the stats block is dev-only and already hidden in production.

## 6. Known accepted trade-offs

- **`SITE_URL` is hardcoded** to `https://www.arizmilabs.com` in
  `lib/site.ts`, so preview deployments emit production canonical/OG/sitemap
  URLs. Fine as long as previews aren't meant to be indexed; make it
  env-driven in that one file if this ever matters.
- **Gmail SMTP** — requires an app password, caps at roughly 500 sends/day,
  and sends "from" the Gmail address. Sufficient for launch; move to a
  transactional provider (and set up SPF/DKIM on the domain) if volume grows
  or deliverability suffers. Check the spam folder during smoke testing.
- **Sheets mirror is best-effort** — quota/auth failures are logged and
  swallowed; Redis and the internal notification email are the source of
  truth for leads.

## 7. Release smoke test

After the env is set and deployed (see also the README release checklist:
`npm run ci`, Lighthouse thresholds, mobile + desktop pass, security headers):

1. Run the full BluePrint flow on production: qualifying → intake → diagnosis
   (no "development preview" banner should appear) → lead gate → reveal.
2. Confirm the internal lead email arrives (all answers + full plan), the
   Sheets row appends, and "Email me the full BluePrint" delivers to the
   lead's address.
3. Submit the contact form and confirm receipt.
4. Click a booking CTA and confirm the live booking link.
5. Visit `/privacy` and confirm the approved copy (no draft banner).
