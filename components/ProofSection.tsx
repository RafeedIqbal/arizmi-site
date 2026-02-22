"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    number: "01",
    project: "Icon Training",
    blurb:
      "A full-stack fitness platform built from scratch for a first-time founder — mobile app, trainer dashboard, and payment integration.",
    tag: "Fitness Tech",
  },
  {
    number: "02",
    project: "Basenote Solutions",
    blurb:
      "B2B SaaS MVP shipped in 8 weeks. Customer portal, analytics dashboard, and integrations with existing enterprise tools.",
    tag: "B2B SaaS",
  },
  {
    number: "03",
    project: "Coming Soon",
    blurb:
      "Another exciting start-up project in the works. Reach out to learn more or get on the list.",
    tag: "TBD",
  },
];

export default function ProofSection() {
  const rootRef = useRef<HTMLElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(card2Ref.current, { y: 60 });
      gsap.set(card3Ref.current, { y: 120 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "+=1200",
          scrub: 1,
          pin: true,
        },
      });

      tl.to(card2Ref.current, { y: 20, duration: 1 }, 0);
      tl.to(card3Ref.current, { y: 40, duration: 1.5 }, 0);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const cardBase: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    background: "var(--surface-alt)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "2.5rem",
    boxShadow:
      "0px 4px 32px rgba(0,0,0,0.5), 0px 2px 8px rgba(0,0,0,0.3)",
    willChange: "transform",
  };

  return (
    <section
      id="work"
      ref={rootRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "6rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          width: "100%",
          textAlign: "center",
          marginBottom: "4rem",
        }}
      >
        <p
          style={{
            color: "var(--accent)",
            fontSize: "0.875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          Our Work
        </p>
        <h2
          style={{
            fontFamily: "var(--font-instrument-serif)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            lineHeight: 1.2,
          }}
        >
          Projects that ship and grow
        </h2>
      </div>

      <div
        style={{
          position: "relative",
          width: "min(680px, 90vw)",
          height: "300px",
        }}
      >
        {/* Card 3 — back */}
        <div ref={card3Ref} style={{ ...cardBase, zIndex: 1 }}>
          <CardContent card={CARDS[2]} />
        </div>

        {/* Card 2 — middle */}
        <div ref={card2Ref} style={{ ...cardBase, zIndex: 2 }}>
          <CardContent card={CARDS[1]} />
        </div>

        {/* Card 1 — front */}
        <div style={{ ...cardBase, zIndex: 3 }}>
          <CardContent card={CARDS[0]} />
        </div>
      </div>
    </section>
  );
}

function CardContent({ card }: { card: (typeof CARDS)[0] }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
          }}
        >
          {card.number}
        </span>
        <span
          style={{
            background: "var(--accent-dim)",
            color: "var(--accent)",
            fontSize: "0.75rem",
            fontWeight: 500,
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            border: "1px solid rgba(89, 176, 255, 0.2)",
          }}
        >
          {card.tag}
        </span>
      </div>

      <h3
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--text)",
        }}
      >
        {card.project}
      </h3>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.9375rem",
          lineHeight: 1.6,
        }}
      >
        {card.blurb}
      </p>
    </div>
  );
}
