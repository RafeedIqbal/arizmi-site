"use client";

import { useState, useEffect, useRef } from "react";

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

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Only apply scroll reveal on mobile/small screens
    const checkMobile = () => window.matchMedia("(max-width: 768px)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!checkMobile()) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (!isNaN(index)) {
              setRevealed((prev) => {
                if (prev[index]) return prev;
                const next = [...prev];
                next[index] = true;
                return next;
              });
            }
          }
        });
      },
      { threshold: 0.6 } // reveal when 60% visible
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleReveal = (i: number) => {
    setRevealed((prev) => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      return next;
    });
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
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: "1.25rem",
          }}
        >
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              data-index={i}
              onMouseEnter={() => handleReveal(i)}
              onTouchStart={() => handleReveal(i)}
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
                transition: "border-color 0.6s ease, background-image 0.6s ease",
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
              }}
            >
              <h3
                style={{
                  color: revealed[i] ? "var(--text)" : "var(--text-muted)",
                  fontSize: "1.0625rem",
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.3,
                  filter: revealed[i] ? "blur(0px)" : "blur(6px)",
                  opacity: revealed[i] ? 1 : 0.4,
                  transition: "color 0.6s ease, filter 0.6s ease, opacity 0.6s ease",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  margin: 0,
                  filter: revealed[i] ? "blur(0px)" : "blur(8px)",
                  opacity: revealed[i] ? 1 : 0.2,
                  transition: "filter 0.6s ease, opacity 0.6s ease",
                }}
              >
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
