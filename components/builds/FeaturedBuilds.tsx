"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import BuildDetail from "@/components/builds/BuildDetail";
import BuildMedia from "@/components/builds/BuildMedia";
import LiveRegion from "@/components/ui/LiveRegion";
import MetaLabel from "@/components/ui/MetaLabel";
import PrevNextControls from "@/components/ui/PrevNextControls";
import { clampIndex, isDragGesture } from "@/lib/interaction";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { Build } from "@/lib/content/builds";

/**
 * Featured builds (TASK-009): a premium horizontal sequence of minimal closed
 * cards paired with a complete detail region.
 *
 * Master–detail model. Every card is permanently "closed" (media placeholder +
 * name + status); selecting one shows its full detail in an adjacent region —
 * beside the track on wide screens, stacked below on narrow — so there is no
 * hidden/overlay state to trap focus and the whole thing degrades to a plain
 * list + detail when motion or hydration is unavailable.
 *
 * Browsing (native scroll drag, prev/next, keyboard Tab) keeps focus on the
 * controls; explicit activation (click / Enter / Space on a card) moves focus
 * into the detail region. Escape from the detail returns focus to the active
 * card. The native scroll container provides stable touch/trackpad dragging;
 * a pointer-move guard stops a drag from being misread as a card selection.
 */
export default function FeaturedBuilds({
  builds,
}: {
  builds: readonly Build[];
}) {
  const reducedMotion = useReducedMotion();

  const trackRef = useRef<HTMLUListElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const draggedRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  // Skip the focus-into-detail effect for selection changes that come from
  // browsing (prev/next) rather than explicit activation.
  const focusOnSelectRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // The explorer remounts this component (key={filter}) whenever the active
  // filter changes, so the selection always re-initialises to the first
  // remaining build — no reconciliation effect needed.
  const [selectedId, setSelectedId] = useState<string | null>(
    builds[0]?.id ?? null,
  );

  const selectedIndex = Math.max(
    0,
    builds.findIndex((build) => build.id === selectedId),
  );
  const selected = builds[selectedIndex];

  const scrollCardIntoView = useCallback(
    (id: string) => {
      const card = cardRefs.current.get(id);
      card?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    [reducedMotion],
  );

  const select = useCallback(
    (index: number, focusDetail: boolean) => {
      const target = builds[clampIndex(index, builds.length)];
      if (!target) return;
      scrollCardIntoView(target.id);
      if (target.id === selectedId) {
        // Re-selecting the current card doesn't change state, so focus the
        // detail here rather than waiting on the (non-firing) effect.
        if (focusDetail) detailRef.current?.focus();
        return;
      }
      focusOnSelectRef.current = focusDetail;
      setSelectedId(target.id);
    },
    [builds, scrollCardIntoView, selectedId],
  );

  // Move focus into the detail region only on explicit activation.
  useEffect(() => {
    if (focusOnSelectRef.current) {
      focusOnSelectRef.current = false;
      detailRef.current?.focus();
    }
  }, [selectedId]);

  // Subtle media parallax tied to scroll position; disabled for reduced motion.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion) return;

    const update = () => {
      rafRef.current = null;
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      for (const card of cardRefs.current.values()) {
        const rect = card.getBoundingClientRect();
        const offset = (rect.left + rect.width / 2 - center) / trackRect.width;
        card.style.setProperty("--p", offset.toFixed(3));
      }
    };
    const onScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(update);
      }
    };
    update();
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, builds]);

  const onTrackPointerDown = (event: PointerEvent<HTMLUListElement>) => {
    draggedRef.current = false;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const onTrackPointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const start = pointerStartRef.current;
    if (!start) return;
    if (isDragGesture(event.clientX - start.x, event.clientY - start.y)) {
      draggedRef.current = true;
    }
  };

  const onCardClick = (index: number) => {
    // A drag across the track scrolls it; never treat that as a selection.
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    select(index, true);
  };

  const onCardKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        select(index + 1, false);
        cardRefs.current.get(builds[clampIndex(index + 1, builds.length)].id)?.focus();
        break;
      case "ArrowLeft":
        event.preventDefault();
        select(index - 1, false);
        cardRefs.current.get(builds[clampIndex(index - 1, builds.length)].id)?.focus();
        break;
      default:
        break;
    }
  };

  if (!selected) return null;

  const position = `${selectedIndex + 1} of ${builds.length}`;

  return (
    <div className="featured mt-8">
      <div className="featured__layout">
        <div className="featured__slider">
          <ul
            ref={trackRef}
            className="featured__track"
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
          >
            {builds.map((build, index) => {
              const isSelected = build.id === selectedId;
              return (
                <li key={build.id} className="featured__item">
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) cardRefs.current.set(build.id, node);
                      else cardRefs.current.delete(build.id);
                    }}
                    aria-current={isSelected || undefined}
                    onClick={() => onCardClick(index)}
                    onKeyDown={(event) => onCardKeyDown(event, index)}
                    className="featured-card"
                  >
                    <BuildMedia build={build} className="featured-card__media" />
                    <span className="featured-card__meta">
                      <span className="featured-card__name">{build.name}</span>
                      <MetaLabel as="span" tone="muted">
                        {build.sourceStatus}
                      </MetaLabel>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="featured__controls">
            <PrevNextControls
              label="Browse featured builds"
              previousLabel="Previous build"
              nextLabel="Next build"
              previousDisabled={selectedIndex <= 0}
              nextDisabled={selectedIndex >= builds.length - 1}
              onPrevious={() => select(selectedIndex - 1, false)}
              onNext={() => select(selectedIndex + 1, false)}
            />
            <p className="font-meta text-xs uppercase tracking-wider text-ink-muted" aria-hidden="true">
              {position}
            </p>
          </div>
        </div>

        <div
          ref={detailRef}
          tabIndex={-1}
          role="region"
          aria-label={`${selected.name} — project details`}
          className="featured__detail"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              cardRefs.current.get(selected.id)?.focus();
            }
          }}
        >
          <h3 className="text-2xl font-semibold tracking-tight">
            {selected.name}
          </h3>
          <div className="mt-5">
            <BuildDetail build={selected} />
          </div>
        </div>
      </div>

      <LiveRegion>
        {`${selected.name}, ${selected.sourceStatus}. ${position}.`}
      </LiveRegion>
    </div>
  );
}
