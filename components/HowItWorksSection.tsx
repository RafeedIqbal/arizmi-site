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

/* ── Shared visual container style ── */
const VIS: React.CSSProperties = {
  background: "rgba(89,176,255,0.03)",
  borderRadius: "12px",
  padding: "1rem 1.25rem",
  marginBottom: "1.25rem",
  border: "1px solid rgba(89,176,255,0.06)",
  overflow: "hidden",
  position: "relative",
  minHeight: "130px",
};

/* ── Card 1: Understand — discovery / conversation UI ── */
function UnderstandVis() {
  return (
    <div style={VIS}>
      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          padding: "8px 12px",
          marginBottom: "12px",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <div
          style={{
            flex: 1,
            height: "4px",
            borderRadius: "2px",
            background: "rgba(89,176,255,0.2)",
            animation: "hiw-shimmer 3s ease infinite",
          }}
        />
        <div
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "var(--accent)",
            animation: "hiw-pulse 2s ease infinite",
          }}
        />
      </div>

      {/* Chat bubble — left */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "8px",
          animation: "hiw-float 4s ease infinite",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "rgba(89,176,255,0.15)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            background: "rgba(89,176,255,0.08)",
            borderRadius: "10px 10px 10px 2px",
            padding: "8px 12px",
            width: "75%",
          }}
        >
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(89,176,255,0.2)",
              width: "80%",
              marginBottom: "5px",
            }}
          />
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(89,176,255,0.12)",
              width: "55%",
            }}
          />
        </div>
      </div>

      {/* Chat bubble — right */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          animation: "hiw-float 4s ease infinite 0.6s",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "10px 10px 2px 10px",
            padding: "8px 12px",
            width: "60%",
          }}
        >
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.1)",
              width: "90%",
              marginBottom: "5px",
            }}
          />
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.06)",
              width: "60%",
            }}
          />
        </div>
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        />
      </div>

    </div>
  );
}

/* ── Card 2: Plan & Build — code editor / wireframe UI ── */
function PlanBuildVis() {
  return (
    <div style={VIS}>
      {/* Editor toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "rgba(255,95,86,0.5)",
          }}
        />
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "rgba(255,189,46,0.5)",
          }}
        />
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "rgba(39,201,63,0.5)",
          }}
        />
        <div
          style={{
            marginLeft: "8px",
            height: "3px",
            borderRadius: "2px",
            background: "rgba(255,255,255,0.08)",
            width: "50px",
          }}
        />
      </div>

      {/* Code lines */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginBottom: "14px",
          paddingLeft: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(89,176,255,0.25)",
              width: "35%",
              animation: "hiw-shimmer 3s ease infinite",
            }}
          />
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.08)",
              width: "25%",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "6px", paddingLeft: "12px" }}>
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(89,176,255,0.15)",
              width: "45%",
              animation: "hiw-shimmer 3s ease infinite 0.3s",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "6px", paddingLeft: "12px" }}>
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.06)",
              width: "55%",
              animation: "hiw-shimmer 3s ease infinite 0.6s",
            }}
          />
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(89,176,255,0.12)",
              width: "15%",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <div
            style={{
              height: "3px",
              borderRadius: "2px",
              background: "rgba(89,176,255,0.2)",
              width: "30%",
              animation: "hiw-shimmer 3s ease infinite 0.9s",
            }}
          />
        </div>
      </div>

      {/* Wireframe component blocks */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[0, 0.25, 0.5].map((delay, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "28px",
              borderRadius: "6px",
              background: "rgba(89,176,255,0.06)",
              border: "1px solid rgba(89,176,255,0.08)",
              animation: `hiw-float 4s ease infinite ${delay}s`,
            }}
          />
        ))}
      </div>

    </div>
  );
}

/* ── Card 3: Launch & Grow — analytics dashboard UI ── */
function LaunchGrowVis() {
  const bars = [35, 50, 45, 70, 60, 85, 75, 95];
  return (
    <div style={VIS}>
      {/* Metric header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="var(--accent)"
            style={{ opacity: 0.6 }}
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--accent)",
              opacity: 0.7,
              letterSpacing: "0.04em",
            }}
          >
            Growth
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "auto",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "rgba(39,201,63,0.5)",
              animation: "hiw-pulse 2s ease infinite",
            }}
          />
          <span
            style={{
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Live
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "6px",
          height: "55px",
          marginBottom: "12px",
          paddingBottom: "1px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: "3px 3px 0 0",
              background: `rgba(89,176,255,${0.15 + (h / 100) * 0.25})`,
              transformOrigin: "bottom",
              animation: `hiw-bar-bounce 3s ease infinite ${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ opacity: 0.5 }}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div
          style={{
            flex: 1,
            height: "4px",
            borderRadius: "2px",
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "75%",
              borderRadius: "2px",
              background:
                "linear-gradient(90deg, rgba(89,176,255,0.3), rgba(89,176,255,0.5))",
              animation: "hiw-shimmer 3s ease infinite",
            }}
          />
        </div>
      </div>

    </div>
  );
}

const VISUALS = [UnderstandVis, PlanBuildVis, LaunchGrowVis];

export default function HowItWorksSection() {
  const rootRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);

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
          { xPercent: 8, opacity: 0 },
          {
            xPercent: 0,
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

      badgeRefs.current.forEach((badge) => {
        if (!badge) return;
        gsap.set(badge, {
          borderColor: "rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.3)",
          background: "var(--bg)",
        });
        gsap.to(badge, {
          borderColor: "rgba(89,176,255,0.35)",
          color: "#59b0ff",
          background: "linear-gradient(rgba(89,176,255,0.15), rgba(89,176,255,0.15)), var(--bg)",
          duration: 0.3,
          ease: "power1.out",
          scrollTrigger: {
            trigger: badge,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });
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
                ref={(el) => {
                  badgeRefs.current[i] = el;
                }}
                style={{
                  position: "absolute",
                  top: `${i * 33.33 + 5}%`,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--bg)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.3)",
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
            {STEPS.map((step, i) => {
              const Visual = VISUALS[i];
              return (
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
                  <Visual />
                  <h3
                    style={{
                      fontSize: "clamp(1.1rem, 1.5vw, 1.25rem)",
                      fontWeight: 700,
                      marginBottom: "0.625rem",
                      color: "var(--text)",
                    }}
                  >
                    {step.title}
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
