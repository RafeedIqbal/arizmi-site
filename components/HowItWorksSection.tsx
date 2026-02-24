"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

const STEPS = [
  {
    number: "1",
    title: "Understand",
    body: "We learn your idea, business model, and goals.",
  },
  {
    number: "2",
    title: "Plan & Build",
    body: "We shape the product strategy and build the right solution.",
  },
  {
    number: "3",
    title: "Launch & Grow",
    body: "We launch with you and support the next stage.",
  },
];

export default function HowItWorksSection() {
  const rootRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });

      gsap.to(lineRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 1,
        },
      });

      cardRefs.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { x: 40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              end: "top 55%",
              scrub: 1,
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="process"
      ref={rootRef}
      style={{
        padding: "var(--section-py) var(--section-px)",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 5vw, 5rem)" }}>
          <p
            style={{
              color: "var(--accent)",
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Process
          </p>
          <h2
            style={{
              fontFamily: "var(--font-instrument-serif)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            How it works
          </h2>
        </div>

        <div className="timeline-grid">
          {/* Timeline spine */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            {/* Track background */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "2px",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            {/* Animated progress line */}
            <div
              ref={lineRef}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "2px",
                background: "var(--accent)",
              }}
            />
            {/* Step badges */}
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                style={{
                  position: "absolute",
                  top: `${i * 33.33 + 5}%`,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(var(--accent-dim), var(--accent-dim)), var(--bg)",
                  border: "1px solid rgba(89, 176, 255, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  zIndex: 2,
                }}
              >
                {step.number}
              </div>
            ))}
          </div>

          {/* Cards column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2.5rem",
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                style={{
                  background: "var(--surface-alt)",
                  border: "1px solid var(--accent-dim)",
                  borderRadius: "16px",
                  padding: "clamp(1.5rem, 2vw, 2rem) clamp(1.25rem, 2.5vw, 2.5rem)",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(89,176,255,0.05)",
                  willChange: "transform, opacity",
                }}
              >
                <h3
                  style={{
                    fontSize: "clamp(1.1rem, 1.5vw, 1.25rem)",
                    fontWeight: 700,
                    marginBottom: "0.625rem",
                    color: "var(--text)",
                  }}
                >
                  {step.number} — {step.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.65,
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
