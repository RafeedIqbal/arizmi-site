"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

const WORDS =
  "Your technical co-founder, combining both business strategy and software engineering to turn your idea into a successful business.".split(
    " "
  );

export default function ServicesSection() {
  const rootRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      // Show all words at full opacity when motion is reduced
      wordsRef.current.forEach((word) => {
        if (word) {
          word.style.opacity = "1";
          word.style.color = "var(--text)";
        }
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "+=2000",
          scrub: 1,
          pin: true,
        },
      });

      WORDS.forEach((_, i) => {
        const word = wordsRef.current[i];
        if (word) {
          tl.to(
            word,
            { opacity: 1, color: "var(--text)", duration: 0.5 },
            i * 0.3
          );
        }
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={rootRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 var(--section-px)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-instrument-serif)",
          fontSize: "clamp(1.75rem, 4vw, 3.25rem)",
          lineHeight: 1.55,
          maxWidth: "820px",
          textAlign: "center",
        }}
      >
        {WORDS.map((word, i) => (
          <span
            key={i}
            ref={(el) => {
              wordsRef.current[i] = el;
            }}
            style={{
              opacity: 0.15,
              color: "var(--text-muted)",
              marginRight: "0.25em",
              display: "inline-block",
              willChange: "opacity, color",
            }}
          >
            {word}
          </span>
        ))}
      </p>
    </section>
  );
}
