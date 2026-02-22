"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  {
    number: "01",
    project: "Icon Training",
    tag: "Fitness Tech",
    blurb:
      "Placeholder — copy coming soon. A complete fitness platform built for a first-time founder, from mobile app to trainer dashboard.",
    accentColor: "#59b0ff",
    gradient:
      "linear-gradient(160deg, rgba(89,176,255,0.1) 0%, rgba(89,176,255,0.03) 100%)",
  },
  {
    number: "02",
    project: "Basenote Solutions",
    tag: "B2B SaaS",
    blurb:
      "Placeholder — copy coming soon. An end-to-end B2B SaaS MVP: customer portal, analytics dashboard, and enterprise integrations.",
    accentColor: "#c084fc",
    gradient:
      "linear-gradient(160deg, rgba(192,132,252,0.1) 0%, rgba(192,132,252,0.03) 100%)",
  },
  {
    number: "03",
    project: "Freedom Airlines",
    tag: "Travel & Aviation",
    blurb:
      "Placeholder — copy coming soon. Reach out if you'd like to learn more about this exciting new venture.",
    accentColor: "#34d399",
    gradient:
      "linear-gradient(160deg, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0.03) 100%)",
  },
];

export default function ProofSection() {
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length < 2) return;

    const ctx = gsap.context(() => {
      // Cards after the first start off-screen below the viewport
      cards.forEach((card, i) => {
        if (i > 0) gsap.set(card, { y: "100vh" });
      });

      // Pinned timeline — each card transition gets 100vh of scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: `+=${(cards.length - 1) * 100}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Animate each subsequent card sliding up over the previous one
      for (let i = 1; i < cards.length; i++) {
        const pos = i - 1;

        // Move all previous cards up by 40px to create a stacked effect
        for (let j = 0; j < i; j++) {
          tl.to(cards[j], { y: (j - i) * 40, duration: 1, ease: "none" }, pos);
        }

        // Slide next card up from below viewport
        tl.to(cards[i], { y: 0, duration: 1, ease: "none" }, pos);
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="work"
      ref={rootRef}
      style={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header — positioned below navbar */}
      <div
        style={{
          textAlign: "center",
          paddingTop: "clamp(4.5rem, 8vw, 6rem)",
          paddingBottom: "clamp(1rem, 2vw, 1.5rem)",
          paddingLeft: "var(--section-px)",
          paddingRight: "var(--section-px)",
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

      {/* Card stack — centered on viewport */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(1024px, calc(100% - var(--section-px) * 2))",
        }}
      >
        {PROJECTS.map((project, i) => (
          <div
            key={project.number}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={{
              position: i === 0 ? "relative" : "absolute",
              top: i === 0 ? undefined : 0,
              left: i === 0 ? undefined : 0,
              right: i === 0 ? undefined : 0,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "clamp(16px, 2vw, 24px)",
              overflow: "hidden",
              boxShadow:
                "0 8px 48px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset",
              willChange: "transform",
              transformOrigin: "top center",
            }}
          >
            <div className="proof-card-grid">
              {/* Left: accent panel */}
              <div
                style={{
                  background: project.gradient,
                  borderRight: `1px solid ${project.accentColor}18`,
                  padding:
                    "clamp(2rem, 3vw, 3rem) clamp(1.5rem, 2.5vw, 2.5rem)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "clamp(260px, 35vw, 380px)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    color: project.accentColor,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  {project.number}
                </span>
                <div>
                  {/* Ghost number */}
                  <div
                    style={{
                      fontSize: "clamp(4rem, 8vw, 8rem)",
                      fontFamily: "var(--font-instrument-serif)",
                      fontWeight: 400,
                      color: project.accentColor,
                      opacity: 0.12,
                      lineHeight: 1,
                      userSelect: "none",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {project.number}
                  </div>
                  <div
                    style={{
                      width: "32px",
                      height: "2px",
                      background: project.accentColor,
                      opacity: 0.5,
                    }}
                  />
                </div>
              </div>

              {/* Right: content */}
              <div
                style={{
                  padding:
                    "clamp(2rem, 3vw, 3rem) clamp(1.5rem, 2.5vw, 2.5rem)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "1.25rem",
                }}
              >
                <span
                  style={{
                    background: `${project.accentColor}18`,
                    color: project.accentColor,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "0.35rem 0.9rem",
                    borderRadius: "9999px",
                    border: `1px solid ${project.accentColor}28`,
                    alignSelf: "flex-start",
                  }}
                >
                  {project.tag}
                </span>
                <h3
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                    fontFamily: "var(--font-instrument-serif)",
                    fontWeight: 400,
                    color: "var(--text)",
                    lineHeight: 1.15,
                    margin: 0,
                  }}
                >
                  {project.project}
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.7,
                    margin: 0,
                    maxWidth: "420px",
                  }}
                >
                  {project.blurb}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
