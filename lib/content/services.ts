/**
 * Single typed source for service content, shared by /services (full
 * disclosure content) and the homepage "What Arizmi builds" section
 * (homepageSummary). Copy is transcribed exactly from
 * docs/specs/services.md and docs/specs/homepage.md.
 */
export interface Service {
  readonly id: string;
  readonly title: string;
  /** One-line fit statement that must stay visible in any disclosure UI. */
  readonly fit: string;
  /** Shorter summary used by the homepage "What Arizmi builds" section. */
  readonly homepageSummary: string;
  readonly includes: readonly string[];
  readonly bestFor: readonly string[];
}

export const SERVICES: readonly Service[] = [
  {
    id: "websites-and-digital-platforms",
    title: "Websites and digital platforms",
    fit: "For businesses that need a site, platform or digital experience that does more than sit online.",
    homepageSummary:
      "Conversion-led websites, landing pages, content-managed platforms and digital experiences built to explain, sell and scale.",
    includes: [
      "marketing websites",
      "landing pages",
      "content-managed websites",
      "product-led websites",
      "investor or partner portals",
      "digital platform foundations",
    ],
    bestFor: [
      "new ventures",
      "service businesses",
      "product launches",
      "brand refreshes",
      "businesses outgrowing basic website builders",
    ],
  },
  {
    id: "web-applications",
    title: "Web applications",
    fit: "For teams that need custom software accessed through the browser.",
    homepageSummary:
      "SaaS products, portals, booking systems, quote tools, dashboards and custom browser-based software.",
    includes: [
      "SaaS platforms",
      "booking systems",
      "quote tools",
      "dashboards",
      "client portals",
      "admin systems",
      "marketplace-style platforms",
    ],
    bestFor: [
      "founders building MVPs",
      "businesses replacing spreadsheets",
      "teams with complex workflows",
      "products that need accounts, roles, data or logic",
    ],
  },
  {
    id: "mobile-applications",
    title: "Mobile applications",
    fit: "For products that need to live in users’ hands.",
    homepageSummary:
      "iOS, Android and cross-platform apps for customers, members, communities, teams and product-led businesses.",
    includes: [
      "iOS apps",
      "Android apps",
      "cross-platform apps",
      "member apps",
      "companion apps",
      "product MVPs",
    ],
    bestFor: [
      "retail establishments",
      "restaurants",
      "fitness, wellness and community products",
      "customer-facing platforms",
      "user habit and engagement products",
      "tools that need frequent interaction",
    ],
  },
  {
    id: "ai-enabled-systems",
    title: "AI-enabled systems",
    fit: "For teams that want AI built into useful workflows, not added as a gimmick.",
    homepageSummary:
      "AI assistants, recommendations, document generation, workflow tools and product features where AI adds practical value.",
    includes: [
      "AI assistants",
      "recommendation systems",
      "document generation",
      "AI workflow tools",
      "internal AI tools",
      "product scoping tools",
      "AI-powered dashboards",
    ],
    bestFor: [
      "teams with repetitive manual work",
      "products with content, data or decision logic",
      "businesses exploring AI features",
      "founders building AI-enabled products",
    ],
  },
  {
    id: "crm-and-operational-tools",
    title: "CRM and operational tools",
    fit: "For businesses that need systems built around the way they actually work.",
    homepageSummary:
      "Custom CRMs, admin systems, inventory tools, reporting workflows and internal platforms that reduce manual work.",
    includes: [
      "custom CRMs",
      "inventory tools",
      "internal workflows",
      "admin dashboards",
      "reporting systems",
      "team portals",
      "automation tools",
    ],
    bestFor: [
      "businesses outgrowing spreadsheets",
      "teams stuck between tools",
      "operations-heavy businesses",
      "companies with messy manual processes",
    ],
  },
  {
    id: "long-term-product-support",
    title: "Long-term product support",
    fit: "For businesses that need a product partner beyond launch.",
    homepageSummary:
      "Iteration, maintenance, analytics, feature development and roadmap support after the first version goes live.",
    includes: [
      "iteration",
      "maintenance",
      "feature development",
      "analytics support",
      "roadmap planning",
      "performance improvements",
      "technical support",
    ],
    bestFor: [
      "launched products",
      "MVPs moving into version two",
      "teams without internal product resource",
      "businesses that need ongoing technical improvement",
    ],
  },
] as const;
