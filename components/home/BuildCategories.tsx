"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Section from "@/components/ui/Section";
import LiveRegion from "@/components/ui/LiveRegion";
import { ButtonLink } from "@/components/ui/Button";
import { CTA_LABELS, CTA_ROUTES } from "@/lib/content/cta";
import { SERVICES } from "@/lib/content/services";
import { useReducedMotion } from "@/lib/useReducedMotion";

const INTRO =
  "Arizmi Labs designs and develops the digital products, platforms and systems businesses need to launch, operate and grow. From customer-facing apps to internal tools, each build is shaped around the users, workflows and commercial goals behind it.";

const SERVICE_PLACEHOLDER_STATES = [
  "live",
  "blueprint",
  "concept",
  "live",
  "blueprint",
  "concept",
] as const;

const LAYOUT_DURATION = 520;
const LAYOUT_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * "What Arizmi builds" (TASK-007). The six approved service summaries form a
 * dense bento grid. Selecting a tile expands it across two columns and rows;
 * the remaining tiles repack around it and the existing "Best for" detail is
 * revealed. The whole tile is a keyboard/touch button, summaries remain
 * visible in every state, and FLIP layout motion is skipped for reduced motion.
 */
export default function BuildCategories() {
  const reducedMotion = useReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const tileRefs = useRef(new Map<string, HTMLLIElement>());
  const previousRectsRef = useRef(new Map<string, DOMRect>());
  const previousGridHeightRef = useRef<number | null>(null);
  const animationsRef = useRef<Animation[]>([]);

  const toggleTile = useCallback(
    (id: string) => {
      animationsRef.current.forEach((animation) => animation.cancel());
      animationsRef.current = [];

      if (!reducedMotion) {
        previousRectsRef.current = new Map(
          Array.from(tileRefs.current, ([tileId, tile]) => [
            tileId,
            tile.getBoundingClientRect(),
          ]),
        );
        previousGridHeightRef.current =
          gridRef.current?.getBoundingClientRect().height ?? null;
      }

      setExpandedId((current) => (current === id ? null : id));
    },
    [reducedMotion],
  );

  useLayoutEffect(() => {
    const previousRects = previousRectsRef.current;
    if (reducedMotion) {
      previousRectsRef.current = new Map();
      previousGridHeightRef.current = null;
      return;
    }
    if (previousRects.size === 0) return;

    const animations: Animation[] = [];

    for (const [id, tile] of tileRefs.current) {
      const previous = previousRects.get(id);
      if (!previous) continue;

      const next = tile.getBoundingClientRect();
      const deltaX = previous.left - next.left;
      const deltaY = previous.top - next.top;
      const scaleX = previous.width / next.width;
      const scaleY = previous.height / next.height;

      animations.push(
        tile.animate(
          [
            {
              transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
              transformOrigin: "top left",
            },
            { transform: "none", transformOrigin: "top left" },
          ],
          {
            duration: LAYOUT_DURATION,
            easing: LAYOUT_EASING,
          },
        ),
      );
    }

    const grid = gridRef.current;
    const previousGridHeight = previousGridHeightRef.current;
    if (grid && previousGridHeight !== null) {
      const nextGridHeight = grid.getBoundingClientRect().height;
      if (previousGridHeight !== nextGridHeight) {
        animations.push(
          grid.animate(
            [
              { height: `${previousGridHeight}px` },
              { height: `${nextGridHeight}px` },
            ],
            {
              duration: LAYOUT_DURATION,
              easing: LAYOUT_EASING,
            },
          ),
        );
      }
    }

    animationsRef.current = animations;
    previousRectsRef.current = new Map();
    previousGridHeightRef.current = null;

    return () => {
      animations.forEach((animation) => animation.cancel());
    };
  }, [expandedId, reducedMotion]);

  const expandedService = SERVICES.find(
    (service) => service.id === expandedId,
  );

  return (
    <Section aria-labelledby="build-categories-heading">
      <div className="build-categories__intro">
        <h2
          id="build-categories-heading"
          className="max-w-[16ch] text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          What Arizmi builds
        </h2>
        <p className="max-w-[68ch] text-lg text-ink-muted">{INTRO}</p>
      </div>

      <LiveRegion>
        {expandedService
          ? `${expandedService.title} expanded.`
          : expandedId === null
            ? "All build categories collapsed."
            : null}
      </LiveRegion>

      <ul ref={gridRef} className="build-categories__grid">
        {SERVICES.map((service, index) => {
          const isExpanded = service.id === expandedId;
          const placeholderState =
            SERVICE_PLACEHOLDER_STATES[index] ?? "live";
          const titleId = `build-category-title-${service.id}`;
          const summaryId = `build-category-summary-${service.id}`;
          const detailsId = `build-category-details-${service.id}`;

          return (
            <li
              key={service.id}
              ref={(node) => {
                if (node) tileRefs.current.set(service.id, node);
                else tileRefs.current.delete(service.id);
              }}
              data-expanded={isExpanded || undefined}
              className="build-categories__item"
            >
              <article
                className="build-category"
                aria-labelledby={titleId}
                data-placeholder-state={placeholderState}
              >
                <span
                  className="build-category__placeholder"
                  aria-hidden="true"
                >
                  <span className="build-category__placeholder-grid" />
                </span>
                <span className="build-category__wash" aria-hidden="true" />

                <button
                  type="button"
                  className="build-category__button"
                  aria-expanded={isExpanded}
                  aria-controls={detailsId}
                  aria-labelledby={titleId}
                  aria-describedby={
                    isExpanded ? `${summaryId} ${detailsId}` : summaryId
                  }
                  onClick={() => toggleTile(service.id)}
                />

                <div className="build-category__content">
                  <p className="build-category__eyebrow font-meta">
                    {String(index + 1).padStart(2, "0")} / Service
                  </p>
                  <div className="build-category__copy">
                    <h3 id={titleId} className="build-category__title">
                      {service.title}
                    </h3>
                    <p id={summaryId} className="build-category__summary">
                      {service.homepageSummary}
                    </p>
                  </div>

                  <div
                    id={detailsId}
                    aria-hidden={!isExpanded}
                    className="build-category__details"
                  >
                    <p className="font-meta text-[0.6875rem] uppercase tracking-[0.14em] text-ink-on-card-muted">
                      Best for
                    </p>
                    <ul className="build-category__tags">
                      {service.bestFor.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="mt-10">
        <ButtonLink href={CTA_ROUTES.blueprint} variant="solid">
          {CTA_LABELS.startBlueprint}
        </ButtonLink>
      </div>
    </Section>
  );
}
