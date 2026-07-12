/**
 * Typed team content for the About page ("The team in the lab"), transcribed
 * exactly from docs/specs/about.md.
 *
 * No image field yet: team card images are referenced by the brief but absent
 * from public/New_Assets (D-11). TASK-016 adds a clearly-marked placeholder
 * treatment; do not use unrelated stock portraits.
 */
export interface TeamMember {
  readonly id: string;
  readonly name: string;
  /** Short lead shown on the compact card. */
  readonly cardLead: string;
  /** Full bio paragraphs revealed via "Read more". */
  readonly bio: readonly string[];
  /** Focus areas, rendered as Space Mono metadata. */
  readonly focus: readonly string[];
}

export const TEAM: readonly TeamMember[] = [
  {
    id: "kaynat-choudhury",
    name: "Kaynat Choudhury",
    cardLead:
      "Kaynat brings the strategic, commercial and customer intelligence behind Arizmi.",
    bio: [
      "With 15+ years across product, marketing, UX, positioning, fintech, financial services and media, she has built a career around complex things that do not easily explain themselves. Her strength is turning that complexity into products, propositions and journeys people can understand, trust and act on.",
      "At Arizmi, Kaynat shapes the thinking behind each build: what the product needs to become, who it needs to serve, what will make users hesitate and what needs to happen for the idea to move into the market with confidence. She brings the behavioural insight, positioning and commercial judgement that make Arizmi’s work more than a technical build.",
      // The "Top 30 Most Influential Fintech Marketers" recognition claim
      // requires evidence/editorial approval before launch (about.md).
      "Recognised as one of the Top 30 Most Influential Fintech Marketers, Kaynat brings the senior strategic edge that helps clients build products people actually want to use, buy into and believe in.",
    ],
    focus: [
      "product strategy",
      "positioning",
      "customer experience",
      "behavioural insight",
      "UX",
      "conversion",
      "go-to-market",
      "commercial direction",
    ],
  },
  {
    id: "mish-choudhury",
    name: "Mish Choudhury",
    cardLead: "Mish brings the conviction and founder energy behind Arizmi.",
    bio: [
      "With over a decade across technology, government, digital strategy, fitness and wellbeing, he has built his career around one thing: helping people move. Move better, think better, train better, work better and adopt better systems.",
      "As a qualified fitness professional, author and product founder, Mish understands both the human side and the systems side of building something people believe in. At Arizmi, he helps turn ambition into product direction, challenging ideas until they are sharper, more useful and ready to become something real.",
    ],
    focus: [
      "product direction",
      "founder vision",
      "user behaviour",
      "innovation",
      "fitness technology",
      "wellbeing",
      "product adoption",
    ],
  },
  {
    id: "taseen-choudhury",
    name: "Taseen Choudhury",
    cardLead: "Taseen brings tech-first commercial thinking into Arizmi.",
    bio: [
      "He is wired for efficiency, execution and high product value, helping clients move from loose ideas to systems that are commercially useful, operationally clear and built with the right level of ambition. His work across product-led ventures and premium client projects has given him a sharp instinct for what people want, what a build needs to deliver and how to turn a brief into something people are proud to put their name on.",
      "At Arizmi, Taseen helps clients think bigger while staying grounded in what can be built, sold and scaled. He brings the relationship-building, operational discipline and delivery mindset that help turn ambitious ideas into products with real-world momentum.",
    ],
    focus: [
      "commercial execution",
      "operational efficiency",
      "product value",
      "client relationships",
      "partnerships",
      "sales",
      "delivery",
    ],
  },
  {
    id: "rafeed-iqbal",
    name: "Rafeed Iqbal",
    cardLead: "Rafeed brings the engineering logic behind Arizmi.",
    bio: [
      "With a software engineering background and experience taking a product from zero to one, he helps turn ambitious ideas into technical decisions that make sense. His strength is in breaking down complexity, understanding what a product needs to do and shaping the build so the first version can move from concept to working software.",
      "At Arizmi, Rafeed supports the technical route behind each product: how it should function, what needs to be built first, where the complexity sits and how to create systems that are usable, scalable and ready to improve. He brings the problem-solving, engineering discipline and product thinking needed to make ideas real.",
    ],
    focus: [
      "software engineering",
      "product management",
      "technical scoping",
      "product architecture",
      "web applications",
      "problem-solving",
      "product build",
    ],
  },
] as const;
