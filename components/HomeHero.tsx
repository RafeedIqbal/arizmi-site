"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  type TransitionEvent,
} from "react";
import PrevNextControls from "@/components/ui/PrevNextControls";
import LiveRegion from "@/components/ui/LiveRegion";
import MetaLabel from "@/components/ui/MetaLabel";
import { ButtonLink, buttonClassName, disabledCtaClassName } from "@/components/ui/Button";
import { CTA_LABELS } from "@/lib/content/cta";
import { HERO_CARDS, HERO_INITIAL_INDEX, type HeroCard } from "@/lib/content/heroArchive";
import { clampIndex, isDragGesture } from "@/lib/interaction";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ROUTES } from "@/lib/site";
import type { Build } from "@/lib/content/builds";

const SUPPORTING_COPY =
  "For founders and teams building beyond the obvious. We shape ideas, build systems and ship digital products that need more than a dev shop.";

const LAST = HERO_CARDS.length - 1;

/*
 * Arc geometry. Cards sit on one large invisible wheel whose centre is far
 * off the right of the archive; a single active index drives every card's
 * position. Cards are oriented radially — long axis pointing at the wheel
 * hub — so the active card lands landscape mid-arc and cards trend toward
 * portrait at the top of the sweep, matching the hero layout reference.
 * The arc is measured from the live container size, not hard-coded pixels.
 */
const CARD_RATIO = 652 / 428; // production card-back aspect (height / width)
const BASE_ROTATION_DEG = 90; // radial orientation: active card is landscape
const ARC_STEP_DEG = 24; // angular gap between adjacent cards
const ARC_STEP_RAD = (ARC_STEP_DEG * Math.PI) / 180;
const RADIUS_FACTOR = 0.58; // wheel radius relative to archive height
const ACTIVE_NUDGE_PX = 20; // active card peeks toward the main canvas
const DRAG_STEP_PX = 96; // pointer travel that advances one card
const WHEEL_STEP = 42; // wheel delta that advances one card
const CLOSE_FALLBACK_MS = 700; // clears the closing phase if transitionend is lost

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Measured layout frame. `w`/`h` are the archive box driving arc geometry;
 * the section values place the opened card in the main canvas, and
 * `visibleCy` is the vertical centre of the on-screen part of the section
 * (in section coordinates) so the opened card stays fully visible even when
 * the hero is partly scrolled away.
 */
type Frame = {
  w: number;
  h: number;
  offsetX: number;
  offsetY: number;
  sectionW: number;
  sectionH: number;
  visibleCy: number;
};

function cardWidthFor(frame: Frame) {
  return clamp(frame.w * 0.3, 168, 272);
}

/** Position/scale/opacity for a card `pos` steps from the active index. */
function slotStyle(pos: number, frame: Frame, cardW: number): CSSProperties {
  const cardH = cardW * CARD_RATIO;
  const radius = frame.h * RADIUS_FACTOR;
  const centerY = frame.h / 2;
  // The active card (pos 0) sits landscape inside the right column; the
  // wheel centre is `radius` further right, i.e. far off-screen.
  const centerX = frame.w * 0.6 + radius;
  const angle = pos * ARC_STEP_RAD;
  const a = Math.abs(pos);
  const cx = centerX - radius * Math.cos(angle) - ACTIVE_NUDGE_PX * clamp(1 - a, 0, 1);
  const cy = centerY + radius * Math.sin(angle);
  const scale = clamp(1.12 - a * 0.05, 0.84, 1.12);
  const opacity = a <= 3 ? 1 : clamp(1 - (a - 3), 0, 1);
  return {
    width: `${cardW}px`,
    height: `${cardH}px`,
    transform: `translate3d(${(cx - cardW / 2).toFixed(2)}px, ${(cy - cardH / 2).toFixed(2)}px, 0) rotate(${(BASE_ROTATION_DEG + pos * ARC_STEP_DEG).toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    opacity,
    zIndex: Math.round(1000 - a * 12),
    pointerEvents: opacity < 0.15 ? "none" : "auto",
  };
}

/**
 * Target for the selected card: detached from the arc, upright in the main
 * canvas (over the copy column on desktop, centred on mobile), at the
 * largest size that keeps the full 428:652 card on screen.
 */
function openSlotStyle(frame: Frame): CSSProperties {
  const maxW = Math.min(frame.sectionW * 0.86, 430);
  const h = Math.min(frame.sectionH * 0.82, maxW * CARD_RATIO);
  const w = h / CARD_RATIO;
  const desktop = frame.offsetX > 40; // archive rendered as a right column
  const cx = desktop ? Math.max(frame.sectionW * 0.26, w / 2 + 24) : frame.sectionW / 2;
  const cy = clamp(frame.visibleCy, h / 2 + 12, frame.sectionH - h / 2 - 12);
  return {
    width: `${w.toFixed(2)}px`,
    height: `${h.toFixed(2)}px`,
    transform: `translate3d(${(cx - frame.offsetX - w / 2).toFixed(2)}px, ${(cy - frame.offsetY - h / 2).toFixed(2)}px, 0) rotate(0deg) scale(1)`,
    opacity: 1,
    zIndex: 1200,
    pointerEvents: "auto",
  };
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function CtaArrow({ onDark = false }: { onDark?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={onDark ? "home-hero__cta-arrow is-on-dark" : "home-hero__cta-arrow"}
    >
      <path
        d="M2.75 9.25l6.5-6.5M4.25 2.75h5v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DetailCta({ build }: { build: Build }) {
  const { cta } = build;
  if (cta.kind === "internal") {
    return (
      <ButtonLink href={cta.href} variant="solid">
        {cta.label}
      </ButtonLink>
    );
  }
  if (cta.kind === "external") {
    // D-06: no verified external URL yet — a visibly disabled control, never a
    // fake or "#" link.
    return cta.url ? (
      <a href={cta.url} className={buttonClassName("solid")}>
        {cta.label}
      </a>
    ) : (
      <span aria-disabled="true" className={disabledCtaClassName()}>
        {cta.label}
        <span className="font-meta text-xs uppercase tracking-wider">
          Link coming soon
        </span>
      </span>
    );
  }
  return <MetaLabel tone="muted">{cta.label}</MetaLabel>;
}

/**
 * The card front: same card-black design system as the production backs,
 * framed in the state colour, revealed by the 3D flip once the selected
 * card has glided into the canvas.
 */
function CardFront({
  card,
  frontRef,
  onClose,
}: {
  card: HeroCard;
  frontRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const { build } = card;
  return (
    <div
      ref={frontRef}
      tabIndex={-1}
      role="group"
      aria-label={`${build.name} — project details`}
      data-surface="card"
      data-state={card.state}
      className="arc__face arc__face--front"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="arc__front-head">
        <MetaLabel tone="inherit" className="arc__front-code">
          {`// ${card.stateCode}`}
        </MetaLabel>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="arc__front-close"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M1.5 1.5l13 13M14.5 1.5l-13 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="arc__front-body">
        <p className="arc__front-name">{build.name}</p>
        <MetaLabel as="p" className="arc__front-status">
          {card.stateLabel} · {build.sourceStatus}
        </MetaLabel>
        <p className="arc__front-summary">{build.summary}</p>
        <div>
          <MetaLabel>What Arizmi shaped</MetaLabel>
          <p className="arc__front-contrib">{build.contribution}</p>
        </div>
        <ul className="arc__front-caps">
          {build.capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      </div>
      <div className="arc__front-cta">
        <DetailCta build={build} />
      </div>
    </div>
  );
}

/**
 * Full-viewport homepage hero and rotary product archive (TASK-005).
 *
 * A single `active` index drives the arc; `dragFraction` adds fractional
 * offset while a pointer drag is in flight. Browsing works with wheel/trackpad
 * over the archive, pointer/touch drag, arrow keys, and the explicit
 * previous/next controls. Selecting a card detaches it from the arc: the slot
 * glides into the main canvas while the card flips from its back to a dark
 * project front, and the rest of the archive softens behind it. Closing
 * reverses the glide (one `closing` phase keeps the front mounted and the
 * archive stacked above the copy until the card is home). Reduced motion
 * keeps every control and state but removes the arc travel and flip.
 */
export default function HomeHero({ bookingUrl }: { bookingUrl: string | null }) {
  const reducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(HERO_INITIAL_INDEX);
  const [dragFraction, setDragFraction] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState<number | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);

  // Refs mirror state for the imperative wheel/pointer handlers.
  const activeRef = useRef(active);
  const openRef = useRef(false);
  const inViewRef = useRef(true);
  const wheelAccRef = useRef(0);
  const dragInfoRef = useRef<{
    id: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const pendingFractionRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    openRef.current = openIndex !== null;
  }, [openIndex]);

  const step = useCallback((delta: number) => {
    setActive((current) => clampIndex(current + delta, HERO_CARDS.length));
  }, []);

  const measure = useCallback(() => {
    const archiveEl = archiveRef.current;
    const sectionEl = rootRef.current;
    if (!archiveEl || !sectionEl) return;
    const rect = archiveEl.getBoundingClientRect();
    const srect = sectionEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const viewportH = window.innerHeight;
    const visTop = Math.max(srect.top, 0);
    const visBottom = Math.min(srect.bottom, viewportH);
    const visibleCy =
      (visBottom > visTop ? (visTop + visBottom) / 2 : srect.top + srect.height / 2) -
      srect.top;
    setFrame({
      w: rect.width,
      h: rect.height,
      offsetX: rect.left - srect.left,
      offsetY: rect.top - srect.top,
      sectionW: srect.width,
      sectionH: srect.height,
      visibleCy,
    });
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openCard = useCallback(
    (index: number) => {
      // Refresh the frame so the canvas target reflects the current scroll
      // position before the glide starts.
      measure();
      clearCloseTimer();
      setClosing(null);
      setActive(index);
      setOpenIndex(index);
    },
    [measure, clearCloseTimer],
  );

  const closeCard = useCallback(() => {
    if (openIndex === null) return;
    if (!reducedMotion) {
      // Hold the front face and stacking through the return glide; the
      // slot's transitionend (or the fallback timer) clears the phase.
      setClosing(openIndex);
      clearCloseTimer();
      closeTimerRef.current = window.setTimeout(() => {
        setClosing(null);
        closeTimerRef.current = null;
      }, CLOSE_FALLBACK_MS);
    }
    setOpenIndex(null);
  }, [openIndex, reducedMotion, clearCloseTimer]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  // Measure the archive and section so arc geometry and the opened-card
  // target adapt to any viewport.
  useIsomorphicLayoutEffect(() => {
    const archiveEl = archiveRef.current;
    const sectionEl = rootRef.current;
    if (!archiveEl || !sectionEl) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(archiveEl);
    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [measure]);

  // Track visibility so wheel input is only intercepted while the hero is
  // on-screen (also guarantees nothing runs when the hero is scrolled away).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Move focus into the card front on open; restore it to the archive on
  // close so a keyboard user never loses their place.
  const prevOpenRef = useRef<number | null>(null);
  useEffect(() => {
    // preventScroll: the card may still be gliding from its arc position
    // (partly off-screen right) when focus lands — never let focus yank the
    // page; the glide itself brings the card fully into view.
    if (openIndex !== null) {
      frontRef.current?.focus({ preventScroll: true });
    } else if (prevOpenRef.current !== null) {
      archiveRef.current?.focus({ preventScroll: true });
    }
    prevOpenRef.current = openIndex;
  }, [openIndex]);

  // Wheel/trackpad: step the archive, but release at the bounds so the page
  // can still scroll (never trap the page).
  useEffect(() => {
    const el = archiveRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (openRef.current || !inViewRef.current) return;
      const delta = event.deltaY;
      if (delta === 0) return;
      const atStart = activeRef.current <= 0;
      const atEnd = activeRef.current >= LAST;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) {
        wheelAccRef.current = 0;
        return; // at a bound → let the page scroll
      }
      event.preventDefault();
      wheelAccRef.current += delta;
      if (Math.abs(wheelAccRef.current) >= WHEEL_STEP) {
        step(wheelAccRef.current > 0 ? 1 : -1);
        wheelAccRef.current = 0;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [step]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const flushFraction = useCallback(() => {
    rafRef.current = null;
    setDragFraction(pendingFractionRef.current);
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (openRef.current) return;
    if (event.button > 0) return; // primary button / touch / pen only
    dragInfoRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
    pendingFractionRef.current = 0;
    setDragging(true);
    try {
      archiveRef.current?.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const info = dragInfoRef.current;
    if (!info || info.id !== event.pointerId) return;
    const dx = event.clientX - info.x;
    const dy = event.clientY - info.y;
    if (!info.moved && isDragGesture(dx, dy)) info.moved = true;
    pendingFractionRef.current = -dx / DRAG_STEP_PX;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flushFraction);
    }
  };

  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    const info = dragInfoRef.current;
    if (!info || info.id !== event.pointerId) return;
    dragInfoRef.current = null;
    setDragging(false);
    try {
      archiveRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const fraction = pendingFractionRef.current;
    pendingFractionRef.current = 0;
    setDragFraction(0);
    if (info.moved) {
      // Snap to the nearest card. A drag never counts as a selection.
      setActive((current) =>
        clampIndex(Math.round(current + fraction), HERO_CARDS.length),
      );
      return;
    }
    // A cancel (e.g. the browser took over a vertical touch scroll) is never a
    // tap — only a genuine pointerup below the drag threshold opens a card.
    if (event.type === "pointercancel") return;
    const under = document.elementFromPoint(
      event.clientX,
      event.clientY,
    ) as HTMLElement | null;
    const slot = under?.closest<HTMLElement>("[data-card-index]");
    if (slot?.dataset.cardIndex) {
      const index = Number(slot.dataset.cardIndex);
      if (Number.isInteger(index)) openCard(index);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (openRef.current) return; // the card front handles its own keys
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
        event.preventDefault();
        step(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        event.preventDefault();
        step(-1);
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(LAST);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        openCard(activeRef.current);
        break;
      default:
        break;
    }
  };

  // Ends the closing phase once the returning slot's glide settles; the
  // filter/opacity transitions on siblings are ignored by design.
  const onSlotTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (closing === null) return;
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "transform") return;
    if (Number(event.currentTarget.dataset.cardIndex) !== closing) return;
    clearCloseTimer();
    setClosing(null);
  };

  const isOpen = openIndex !== null;
  const cardWidth = frame ? cardWidthFor(frame) : 0;
  const effectiveActive = active + dragFraction;
  // Derived during render so the live region announces on every active change
  // without a state-syncing effect.
  const activeCard = HERO_CARDS[active];
  const liveMessage = isOpen
    ? ""
    : `${activeCard.build.name}, ${activeCard.stateLabel}. ${active + 1} of ${HERO_CARDS.length}.`;

  const primaryCta = bookingUrl ? (
    <a href={bookingUrl} rel="noreferrer" className={buttonClassName("solid")}>
      {CTA_LABELS.bookBuildCall}
      <CtaArrow onDark />
    </a>
  ) : (
    <span aria-disabled="true" className={disabledCtaClassName()}>
      {CTA_LABELS.bookBuildCall}
      <span className="font-meta text-xs uppercase tracking-wider">
        Booking opens soon
      </span>
    </span>
  );

  return (
    <section
      ref={rootRef}
      id="home-hero"
      aria-labelledby="home-hero-heading"
      className="home-hero"
    >
      <div className="home-hero__rings" aria-hidden="true" />
      <div className="home-hero__marks" aria-hidden="true" />

      <div className="home-hero__inner">
        <div className="home-hero__copy" inert={isOpen || undefined}>
          <h1 id="home-hero-heading" className="home-hero__headline">
            Welcome to Arizmi Labs
            <span className="home-hero__stop">.</span>
          </h1>
          <p className="home-hero__lede">{SUPPORTING_COPY}</p>
          <div className="home-hero__ctas">
            {primaryCta}
            <ButtonLink href={ROUTES.blueprintAi} variant="outline">
              {CTA_LABELS.discoverBlueprint}
              <CtaArrow />
            </ButtonLink>
          </div>
          <div className="home-hero__browse">
            <PrevNextControls
              label="Browse the product archive"
              previousLabel="Previous card"
              nextLabel="Next card"
              previousDisabled={active <= 0}
              nextDisabled={active >= LAST}
              onPrevious={() => step(-1)}
              onNext={() => step(1)}
            />
            <p className="home-hero__counter font-meta" aria-hidden="true">
              {String(active + 1).padStart(2, "0")} / {String(HERO_CARDS.length).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div
          ref={archiveRef}
          className="home-hero__archive"
          role="group"
          aria-roledescription="carousel"
          aria-label="Arizmi Labs product archive"
          aria-describedby="home-hero-archive-help"
          tabIndex={isOpen ? -1 : 0}
          data-dragging={dragging || undefined}
          data-open={isOpen || undefined}
          data-closing={closing !== null || undefined}
          data-flat={reducedMotion || undefined}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        >
          <div className="home-hero__stage">
            {frame
              ? HERO_CARDS.map((card, index) => {
                  const open = openIndex === index;
                  const leaving = closing === index;
                  return (
                    <div
                      key={card.build.id}
                      className="arc__slot"
                      data-card-index={index}
                      data-active={index === active || undefined}
                      data-open={open || undefined}
                      data-closing={leaving || undefined}
                      inert={isOpen && !open ? true : undefined}
                      aria-hidden={open ? undefined : true}
                      style={
                        open
                          ? openSlotStyle(frame)
                          : slotStyle(index - effectiveActive, frame, cardWidth)
                      }
                      onTransitionEnd={onSlotTransitionEnd}
                    >
                      <div className="arc__card">
                        <div className="arc__face arc__face--back">
                          <Image
                            src={card.cardBackSrc}
                            alt=""
                            width={428}
                            height={652}
                            draggable={false}
                            priority={Math.abs(index - HERO_INITIAL_INDEX) <= 1}
                            // Every card back is above the fold in the hero.
                            loading={
                              Math.abs(index - HERO_INITIAL_INDEX) <= 1 ? undefined : "eager"
                            }
                            sizes="(max-width: 900px) 50vw, 320px"
                            style={{ width: "100%", height: "100%", display: "block" }}
                            className="arc__img"
                          />
                        </div>
                        {open || leaving ? (
                          <CardFront card={card} frontRef={frontRef} onClose={closeCard} />
                        ) : null}
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </div>
      </div>

      <p id="home-hero-archive-help" className="sr-only">
        Use the left and right arrow keys to browse the product archive, Enter
        to open a card, and Escape to close it.
      </p>
      <LiveRegion>{liveMessage}</LiveRegion>
    </section>
  );
}
