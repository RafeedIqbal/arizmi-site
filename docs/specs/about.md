# About page specification

## Metadata and hero

SEO title: `About Arizmi Labs`

Headline:

> For people building something that does not exist yet.

Copy:

> Arizmi Labs is a product and software studio helping founders, operators and teams turn early ideas into working digital products, platforms and AI-enabled systems.

> We bring together product thinking, technical build and commercial judgement, so the thing in your head can become something people can use.

## Statistics section

The brief asks for an image-first section followed by four stats, using [Makora Studio's About page](https://makorastudio.com/about-us) as inspiration.

![Image-first statistics layout reference](../reference-images/about-stats-layout-reference.png)

The mockup's visible values are layout placeholders, not verified Arizmi facts. Do not ship them. Resolve D-10 with four approved label/value pairs and supporting evidence. The section image is also not a licensed production asset unless separately approved.

## Why Arizmi?

Layout: two columns on wide screens, copy left and an approved image or brand-system visual right; stack in logical reading order on smaller screens.

Title: `Why Arizmi?`

Copy:

> The name Arizmi is drawn from al-Khwarizmi, one of history’s great system thinkers. His work helped give the world algebra, algorithms and a new way to break complexity down into something solvable.

> This is the idea behind the studio: take something complex, find the logic inside it and turn it into something useful.

This historical statement should receive a final factual/editorial review before launch. Do not embellish it.

## The way we think

Title: `The way we think`

Intro: `We work with three core principles in mind:`

1. **Move fast, with structure** — Speed matters, but so do the decisions behind the build.
2. **Build around the user** — The product has to make sense for the people using it, not just the team commissioning it.
3. **Leave room for the next version** — A strong first version should be able to launch, learn and improve.

## The team in the lab

Title: `The team in the lab`

Intro:

> Arizmi brings together product, software, AI, strategy and operations thinking, so ideas can be shaped, built and improved from more than one angle.

Interaction references:

- [Team Carousel V1](https://www.framer.com/community/marketplace/components/team-carousel-v1/)
- [Tilt Profile Card](https://www.framer.com/community/marketplace/components/tilt-profile-card/)

The source expects compact cards with `Read more`, opening an accessible dialog or adjacent detail view for the full bio. Team cards are said to be in the asset folder but are absent from `docs/brand-source`; see D-11. Do not use unrelated stock portraits.

### Kaynat Choudhury

Card lead: `Kaynat brings the strategic, commercial and customer intelligence behind Arizmi.`

Full bio:

> With 15+ years across product, marketing, UX, positioning, fintech, financial services and media, she has built a career around complex things that do not easily explain themselves. Her strength is turning that complexity into products, propositions and journeys people can understand, trust and act on.

> At Arizmi, Kaynat shapes the thinking behind each build: what the product needs to become, who it needs to serve, what will make users hesitate and what needs to happen for the idea to move into the market with confidence. She brings the behavioural insight, positioning and commercial judgement that make Arizmi’s work more than a technical build.

> Recognised as one of the Top 30 Most Influential Fintech Marketers, Kaynat brings the senior strategic edge that helps clients build products people actually want to use, buy into and believe in.

Focus: product strategy, positioning, customer experience, behavioural insight, UX, conversion, go-to-market, commercial direction.

The recognition claim requires evidence/editorial approval before launch.

### Mish Choudhury

Card lead: `Mish brings the conviction and founder energy behind Arizmi.`

Full bio:

> With over a decade across technology, government, digital strategy, fitness and wellbeing, he has built his career around one thing: helping people move. Move better, think better, train better, work better and adopt better systems.

> As a qualified fitness professional, author and product founder, Mish understands both the human side and the systems side of building something people believe in. At Arizmi, he helps turn ambition into product direction, challenging ideas until they are sharper, more useful and ready to become something real.

Focus: product direction, founder vision, user behaviour, innovation, fitness technology, wellbeing, product adoption.

### Taseen Choudhury

Card lead: `Taseen brings tech-first commercial thinking into Arizmi.`

Full bio:

> He is wired for efficiency, execution and high product value, helping clients move from loose ideas to systems that are commercially useful, operationally clear and built with the right level of ambition. His work across product-led ventures and premium client projects has given him a sharp instinct for what people want, what a build needs to deliver and how to turn a brief into something people are proud to put their name on.

> At Arizmi, Taseen helps clients think bigger while staying grounded in what can be built, sold and scaled. He brings the relationship-building, operational discipline and delivery mindset that help turn ambitious ideas into products with real-world momentum.

Focus: commercial execution, operational efficiency, product value, client relationships, partnerships, sales, delivery.

### Rafeed Iqbal

Card lead: `Rafeed brings the engineering logic behind Arizmi.`

Full bio:

> With a software engineering background and experience taking a product from zero to one, he helps turn ambitious ideas into technical decisions that make sense. His strength is in breaking down complexity, understanding what a product needs to do and shaping the build so the first version can move from concept to working software.

> At Arizmi, Rafeed supports the technical route behind each product: how it should function, what needs to be built first, where the complexity sits and how to create systems that are usable, scalable and ready to improve. He brings the problem-solving, engineering discipline and product thinking needed to make ideas real.

Focus: software engineering, product management, technical scoping, product architecture, web applications, problem-solving, product build.

## Ticker

Reference: [Hover Preview Ticker](https://www.framer.com/community/marketplace/components/hoverpreviewticker/).

Ticker copy:

> For people building something that does not exist yet.

The ticker may repeat visually, but assistive technology should encounter the phrase once. Pause continuous movement on hover/focus and disable it for reduced motion.

## Closing CTA

Title: `Ready to build?`

Copy:

> Early idea, messy workflow, ambitious product or system nobody has built for you properly yet, this is where Arizmi is useful.

> We help find the shape, build the system and move it towards something people can use.

CTA: `Book a build call`

## About acceptance criteria

- No unapproved statistic, portrait, award claim, or external image is presented as verified.
- Full bios remain accessible on mobile, by keyboard, and with reduced motion.
- Team data is typed and separated from presentation.
- The ticker does not create duplicate screen-reader output or unavoidable motion.
- The page preserves the source copy and route metadata.
