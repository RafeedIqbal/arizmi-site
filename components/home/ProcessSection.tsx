"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { PROCESS_STEPS, PROCESS_TITLE } from "@/lib/content/process";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * "How ideas become systems" (TASK-006).
 *
 * The four steps are always present in the DOM in reading order as an ordered
 * list, fully legible without JavaScript, on short viewports, and under
 * reduced motion — that is the baseline experience. On wide, tall viewports
 * with motion allowed, GSAP pins the section and progressively emphasises each
 * step as the reader scrolls (Scroll Steps behaviour). The active-step styling
 * is purely supplementary: inactive steps stay at contrast-safe muted text, so
 * no essential content is ever hidden, blurred, or removed from the a11y tree.
 */
export default function ProcessSection() {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // Pin/scrub only when there is genuine vertical room and motion is
      // allowed; every other case keeps the plain readable flow.
      mm.add(
        "(min-width: 900px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)",
        () => {
          const steps = gsap.utils.toArray<HTMLElement>(".process__step", root);
          const rail = root.querySelector<HTMLElement>(".process__rail");
          if (steps.length === 0) return;

          const paint = (activeIndex: number) => {
            steps.forEach((el, idx) => {
              el.dataset.state =
                idx < activeIndex ? "past" : idx === activeIndex ? "active" : "upcoming";
            });
          };
          paint(0);

          const trigger = ScrollTrigger.create({
            trigger: root,
            start: "top top",
            end: () => `+=${steps.length * 60}%`,
            pin: true,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const activeIndex = Math.min(
                steps.length - 1,
                Math.floor(self.progress * steps.length),
              );
              paint(activeIndex);
              if (rail) rail.style.setProperty("--progress", self.progress.toFixed(3));
            },
          });

          return () => {
            trigger.kill();
            steps.forEach((el) => {
              delete el.dataset.state;
            });
            if (rail) rail.style.removeProperty("--progress");
          };
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="process-heading"
      className="process"
    >
      <div className="process__inner mx-auto w-full max-w-[var(--page-content)] px-[var(--section-px)]">
        <div className="process__head">
          <h2
            id="process-heading"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {PROCESS_TITLE}
          </h2>
        </div>
        <div className="process__body">
          <div className="process__rail" aria-hidden="true">
            <span className="process__rail-fill" />
          </div>
          <ol className="process__steps">
            {PROCESS_STEPS.map((step) => (
              <li key={step.index} className="process__step">
                <p className="process__index font-meta">{step.index}</p>
                <h3 className="process__title">{step.title}</h3>
                <p className="process__desc">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
