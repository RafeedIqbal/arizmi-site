"use client";

import { useState } from "react";

const FEATURES = [
  {
    title: "Technical co-founder mindset",
    body: "We care about outcomes, not tickets.",
  },
  {
    title: "Strategy + development",
    body: "We help shape the business, not just build features.",
  },
  {
    title: "Founder-friendly approach",
    body: "Clear communication, no technical jargon.",
  },
  {
    title: "Lean and fast",
    body: "Ship early, learn quickly.",
  },
  {
    title: "Long-term partner",
    body: "We stay involved after launch.",
  },
  {
    title: "Built for non-technical founders",
    body: "We translate ideas into real products.",
  },
];

export default function WhyChooseUsSection() {
  const [revealed, setRevealed] = useState<boolean[]>(
    new Array(FEATURES.length).fill(false)
  );

  const toggle = (i: number) => {
    setRevealed((prev) => prev.map((v, j) => (j === i ? !v : v)));
  };

  return (
    <section
      id="why"
      style={{
        padding: "var(--section-py) var(--section-px)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 4vw, 4rem)" }}>
          <p
            style={{
              color: "var(--accent)",
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Why Us
          </p>
          <h2
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            Why choose us
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1rem",
              marginTop: "1rem",
            }}
          >
            Tap each card to reveal
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: "1.25rem",
          }}
        >
          {FEATURES.map((feature, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              aria-expanded={revealed[i]}
              style={{
                background: "var(--surface)",
                backgroundImage: revealed[i]
                  ? "radial-gradient(circle at top right, var(--accent-dim), transparent 60%)"
                  : "none",
                border: revealed[i]
                  ? "1px solid rgba(89, 176, 255, 0.2)"
                  : "1px solid var(--border)",
                borderRadius: "12px",
                padding: "2rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "opacity 0.4s ease, border-color 0.4s ease, background-image 0.4s ease, transform 0.2s ease",
                willChange: "opacity",
                transform: revealed[i] ? "none" : "none",
              }}
            >
              <h3
                style={{
                  color: revealed[i] ? "var(--text)" : "var(--text-muted)",
                  fontSize: "1.0625rem",
                  fontWeight: 600,
                  marginBottom: "0.625rem",
                  lineHeight: 1.3,
                  transition: "color 0.4s ease",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  opacity: revealed[i] ? 1 : 0,
                  maxHeight: revealed[i] ? "200px" : "0px",
                  overflow: "hidden",
                  transition: "opacity 0.4s ease, max-height 0.4s ease",
                }}
              >
                {feature.body}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
