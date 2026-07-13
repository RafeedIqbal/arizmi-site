"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { PROCESS_STEPS, PROCESS_TITLE } from "@/lib/content/process";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * "How ideas become systems" (TASK-006).
 *
 * The baseline is a fully legible ordered timeline. On wide, tall viewports
 * with motion allowed, GSAP pins the inner stage and continuously synchronises
 * a decorative counter, progress rail, and active step as the reader scrolls.
 * The ordered list remains the semantic source of truth in every mode.
 */
export default function ProcessSection() {
  const rootRef = useRef<HTMLElement>(null);
  const totalLabel = String(PROCESS_STEPS.length).padStart(2, "0");

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // Pin/scrub only when there is genuine vertical room and motion is
      // allowed; every other case keeps the plain readable flow.
      mm.add(
        "(min-width: 900px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)",
        () => {
          const steps = gsap.utils.toArray<HTMLElement>(".process__step", root);
          const counters = gsap.utils.toArray<HTMLElement>(
            ".process__counter-number",
            root,
          );
          const rail = root.querySelector<HTMLElement>(".process__rail");
          const track = root.querySelector<HTMLElement>(".process__track");
          const counterCurrent = root.querySelector<HTMLElement>(
            ".process__counter-current",
          );
          const pinTarget = root.querySelector<HTMLElement>(".process__inner");
          if (steps.length === 0 || !track || !pinTarget) return;

          root.dataset.enhanced = "true";

          const paint = (rawProgress: number) => {
            const progress = gsap.utils.clamp(0, 1, rawProgress);
            const stepPosition = progress * (steps.length - 1);
            const activeIndex = Math.round(stepPosition);
            const stepPitch = gsap.utils.clamp(112, 136, window.innerHeight * 0.18);

            track.style.setProperty(
              "--track-y",
              `${(-stepPosition * stepPitch).toFixed(2)}px`,
            );
            track.style.setProperty(
              "--track-length",
              `${((steps.length - 1) * stepPitch).toFixed(2)}px`,
            );

            steps.forEach((el, idx) => {
              const distance = idx - stepPosition;
              const absoluteDistance = Math.abs(distance);
              const activity = Math.max(0, 1 - absoluteDistance);
              const opacity = Math.max(0.04, 1 - absoluteDistance * 0.72);
              el.dataset.state =
                idx < activeIndex ? "past" : idx === activeIndex ? "active" : "upcoming";
              el.style.setProperty("--step-top", `${(idx * stepPitch).toFixed(2)}px`);
              el.style.setProperty("--step-opacity", opacity.toFixed(3));
              el.style.setProperty("--step-offset", `${(activity * 6).toFixed(2)}px`);
              el.style.setProperty(
                "--step-scale",
                (1 - Math.min(absoluteDistance, 1.5) * 0.025).toFixed(4),
              );
              el.style.setProperty(
                "--node-scale",
                (0.88 + activity * 0.12).toFixed(4),
              );
            });

            counters.forEach((el, idx) => {
              const activity = Math.max(0, 1 - Math.abs(idx - stepPosition));
              el.style.setProperty("--counter-opacity", activity.toFixed(3));
              el.style.setProperty(
                "--counter-scale",
                (0.96 + activity * 0.04).toFixed(4),
              );
            });

            if (counterCurrent) {
              counterCurrent.textContent = PROCESS_STEPS[activeIndex]?.index ?? "";
            }
            if (rail) {
              rail.style.setProperty("--progress", `${(progress * 100).toFixed(2)}%`);
            }
          };
          paint(0);

          const trigger = ScrollTrigger.create({
            trigger: root,
            start: "top top",
            end: () => {
              const stepDistance = Math.max(360, window.innerHeight * 0.55);
              return `+=${(steps.length - 1) * stepDistance}`;
            },
            // Keep the section itself in normal document flow. Pinning the
            // inner stage avoids a visible handoff when the hero gives way to
            // this full-viewport section.
            pin: pinTarget,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => paint(self.progress),
          });

          return () => {
            trigger.kill();
            delete root.dataset.enhanced;
            steps.forEach((el) => {
              delete el.dataset.state;
              el.style.removeProperty("--step-top");
              el.style.removeProperty("--step-opacity");
              el.style.removeProperty("--step-offset");
              el.style.removeProperty("--step-scale");
              el.style.removeProperty("--node-scale");
            });
            track.style.removeProperty("--track-y");
            track.style.removeProperty("--track-length");
            counters.forEach((el) => {
              el.style.removeProperty("--counter-opacity");
              el.style.removeProperty("--counter-scale");
            });
            if (counterCurrent) counterCurrent.textContent = PROCESS_STEPS[0]?.index ?? "";
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
      data-surface="card"
    >
      <div className="process__inner mx-auto w-full max-w-[var(--page-content)] px-[var(--section-px)]">
        <div className="process__head">
          <h2 id="process-heading" className="process__heading">
            {PROCESS_TITLE}
          </h2>
        </div>
        <div className="process__body">
          <div className="process__visual" aria-hidden="true">
            <div className="process__counter-panel">
              <div className="process__counter-stack">
                {PROCESS_STEPS.map((step) => (
                  <span key={step.index} className="process__counter-number">
                    {step.index}
                  </span>
                ))}
              </div>
              <div className="process__counter-badge font-meta">
                <span className="process__counter-current">
                  {PROCESS_STEPS[0]?.index}
                </span>
                <span aria-hidden="true"> / </span>
                <span>{totalLabel}</span>
              </div>
            </div>
          </div>
          <div className="process__timeline">
            <div className="process__track">
              <div className="process__rail" aria-hidden="true">
                <span className="process__rail-fill" />
              </div>
              <ol className="process__steps">
                {PROCESS_STEPS.map((step) => (
                  <li key={step.index} className="process__step">
                    <span className="process__node" aria-hidden="true" />
                    <div className="process__content">
                      <p className="process__index font-meta">STEP {step.index}</p>
                      <h3 className="process__title">{step.title}</h3>
                      <div className="process__desc-reveal">
                        <div className="process__desc-clip">
                          <p className="process__desc">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
