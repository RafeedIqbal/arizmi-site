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
import LiveRegion from "@/components/ui/LiveRegion";
import MetaLabel from "@/components/ui/MetaLabel";
import { ButtonLink, UnavailableCta, buttonClassName } from "@/components/ui/Button";
import { CTA_LABELS } from "@/lib/content/cta";
import {
  HERO_CARDS,
  HERO_CARD_BACK_SIZE,
  HERO_INITIAL_INDEX,
  type HeroCard,
} from "@/lib/content/heroArchive";
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
const CARD_RATIO = HERO_CARD_BACK_SIZE.height / HERO_CARD_BACK_SIZE.width;
const BASE_ROTATION_DEG = 90; // radial orientation: active card is landscape
const ARC_STEP_DEG = 22; // broad angular gap between adjacent cards
const ARC_STEP_RAD = (ARC_STEP_DEG * Math.PI) / 180;
const DRAG_STEP_PX = 96; // pointer travel that advances one card
const WHEEL_STEP_PX = 48;
const WHEEL_STEP_COOLDOWN_MS = 230;
const WHEEL_BURST_QUIET_MS = 140;
const TRANSITION_FALLBACK_MS = 650;

type ArchivePhase =
  | "browsing"
  | "dragging"
  | "opening"
  | "open"
  | "closing";

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
  visibleH: number;
};

function cardWidthFor(frame: Frame) {
  return Math.round(
    frame.sectionW >= 900
      ? clamp(frame.w * 0.292, 168, 264)
      : clamp(frame.w * 0.45, 148, 204),
  );
}

/** Position/scale/opacity for a card `pos` steps from the active index. */
function slotStyle(pos: number, frame: Frame, cardW: number): CSSProperties {
  const cardH = Math.round(cardW * CARD_RATIO);
  const desktop = frame.sectionW >= 900;
  const radius = desktop
    ? frame.h * 0.62
    : Math.max(frame.h * 0.6, frame.w * 0.68);
  const centerY = frame.h / 2;
  // The active card (pos 0) sits landscape inside the right column; the
  // wheel centre is `radius` further right, i.e. far off-screen.
  const activeX = frame.w * (desktop ? 0.6 : 0.68);
  const centerX = activeX + radius;
  const activeNudge = desktop ? 16 : 10;
  const angle = pos * ARC_STEP_RAD;
  const a = Math.abs(pos);
  const cx =
    centerX -
    radius * Math.cos(angle) -
    activeNudge * clamp(1 - a, 0, 1);
  const cy = centerY + radius * Math.sin(angle);
  // Keep the active raster at native scale for clean linework; inactive cards
  // shrink relative to it rather than enlarging the active card in a GPU layer.
  const scale = clamp(1 - a * 0.04, 0.84, 1);
  const opacity = a <= 3 ? 1 : clamp(1 - (a - 3), 0, 1);
  const x = Math.round(cx - cardW / 2);
  const y = Math.round(cy - cardH / 2);
  return {
    width: `${cardW}px`,
    height: `${cardH}px`,
    transform: `translate(${x}px, ${y}px) rotate(${(BASE_ROTATION_DEG - pos * ARC_STEP_DEG).toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    opacity,
    zIndex: Math.round(1000 - a * 12),
    pointerEvents: opacity < 0.15 ? "none" : "auto",
  };
}

/**
 * Target for the selected card: detached from the arc, upright at the centre
 * of the visible hero canvas, at the
 * largest size that keeps the full normalized 428:674 card on screen.
 */
function openSlotStyle(frame: Frame): CSSProperties {
  const maxW = Math.min(frame.sectionW - 48, 384);
  const maxH = Math.max(240, frame.visibleH - 32);
  const w = Math.round(Math.max(152, Math.min(maxW, maxH / CARD_RATIO)));
  const h = Math.round(w * CARD_RATIO);
  const cx = frame.sectionW / 2;
  const cy = clamp(frame.visibleCy, h / 2 + 12, frame.sectionH - h / 2 - 12);
  const x = Math.round(cx - frame.offsetX - w / 2);
  const y = Math.round(cy - frame.offsetY - h / 2);
  return {
    width: `${w}px`,
    height: `${h}px`,
    transform: `translate(${x}px, ${y}px) rotate(0deg) scale(1)`,
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
    ) : <UnavailableCta label={cta.label} reason="Link coming soon" />;
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
          {card.stateLabel}
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
 * over the archive, pointer/touch drag, and keyboard controls. Selecting a
 * card detaches it from the arc: the slot
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
  const [phase, setPhase] = useState<ArchivePhase>("browsing");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);

  // Refs mirror state for the imperative wheel/pointer handlers.
  const activeRef = useRef(active);
  const phaseRef = useRef<ArchivePhase>(phase);
  const openRef = useRef(false);
  const inViewRef = useRef(true);
  const wheelAccRef = useRef(0);
  const wheelBurstRef = useRef({
    lastAt: 0,
    direction: 0,
    owned: false,
    cooldownUntil: 0,
  });
  const dragInfoRef = useRef<{
    id: number;
    x: number;
    y: number;
    startActive: number;
    downIndex: number | null;
    intent: "pending" | "horizontal" | "vertical";
  } | null>(null);
  const pendingFractionRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const measureRafRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    openRef.current = selectedIndex !== null;
  }, [selectedIndex]);

  const updatePhase = useCallback((next: ArchivePhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const step = useCallback((delta: number) => {
    const next = clampIndex(activeRef.current + delta, HERO_CARDS.length);
    activeRef.current = next;
    setActive(next);
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
      visibleH: Math.max(0, visBottom - visTop),
    });
  }, []);

  const clearPhaseTimer = useCallback(() => {
    if (phaseTimerRef.current !== null) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  const openCard = useCallback(
    (index: number) => {
      if (phaseRef.current !== "browsing") return;
      // Refresh the frame so the canvas target reflects the current scroll
      // position before the glide starts.
      measure();
      clearPhaseTimer();
      setActive(index);
      activeRef.current = index;
      setSelectedIndex(index);
      openRef.current = true;
      if (reducedMotion) {
        updatePhase("open");
        return;
      }
      updatePhase("opening");
      phaseTimerRef.current = window.setTimeout(() => {
        if (phaseRef.current === "opening") updatePhase("open");
        phaseTimerRef.current = null;
      }, TRANSITION_FALLBACK_MS);
    },
    [measure, clearPhaseTimer, reducedMotion, updatePhase],
  );

  const closeCard = useCallback(() => {
    if (selectedIndex === null || phaseRef.current === "closing") return;
    clearPhaseTimer();
    if (reducedMotion) {
      setSelectedIndex(null);
      openRef.current = false;
      updatePhase("browsing");
      return;
    }
    updatePhase("closing");
    phaseTimerRef.current = window.setTimeout(() => {
      setSelectedIndex(null);
      openRef.current = false;
      updatePhase("browsing");
      phaseTimerRef.current = null;
    }, TRANSITION_FALLBACK_MS);
  }, [selectedIndex, reducedMotion, clearPhaseTimer, updatePhase]);

  useEffect(() => clearPhaseTimer, [clearPhaseTimer]);

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

  // While a detail card is detached, keep its target at the centre of the
  // visible part of the hero through scroll, resize, and orientation changes.
  useEffect(() => {
    if (selectedIndex === null) return;
    const scheduleMeasure = () => {
      if (measureRafRef.current !== null) return;
      measureRafRef.current = requestAnimationFrame(() => {
        measureRafRef.current = null;
        measure();
      });
    };
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure);
    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      if (measureRafRef.current !== null) {
        cancelAnimationFrame(measureRafRef.current);
        measureRafRef.current = null;
      }
    };
  }, [selectedIndex, measure]);

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
    if (selectedIndex !== null) {
      frontRef.current?.focus({ preventScroll: true });
    } else if (prevOpenRef.current !== null) {
      archiveRef.current?.focus({ preventScroll: true });
    }
    prevOpenRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeCard();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedIndex, closeCard]);

  // Wheel/trackpad: an owned burst advances the archive without moving the
  // page. Once a bound is reached, that burst remains owned; a new outward
  // gesture after the quiet window is released to normal page scrolling.
  useEffect(() => {
    const el = archiveRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (
        openRef.current ||
        phaseRef.current !== "browsing" ||
        dragInfoRef.current !== null ||
        !inViewRef.current ||
        event.ctrlKey
      ) {
        return;
      }
      const unit =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      const rawDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      const delta = rawDelta * unit;
      if (delta === 0) return;
      const now = performance.now();
      const direction = delta > 0 ? 1 : -1;
      const burst = wheelBurstRef.current;
      const atStart = activeRef.current <= 0;
      const atEnd = activeRef.current >= LAST;
      const outward = (direction < 0 && atStart) || (direction > 0 && atEnd);
      const newBurst =
        burst.direction === 0 || now - burst.lastAt > WHEEL_BURST_QUIET_MS;

      if (newBurst) {
        wheelAccRef.current = 0;
        burst.direction = direction;
        burst.owned = !outward;
        burst.cooldownUntil = 0;
      } else if (burst.direction !== direction) {
        // Direction jitter is still part of the current inertial burst. Reset
        // its travel accumulator, but never change ownership until quiet.
        wheelAccRef.current = 0;
        burst.direction = direction;
      }
      burst.lastAt = now;
      if (!burst.owned) return;

      event.preventDefault();
      wheelAccRef.current = clamp(
        wheelAccRef.current + delta,
        -WHEEL_STEP_PX * 2,
        WHEEL_STEP_PX * 2,
      );
      if (
        Math.abs(wheelAccRef.current) >= WHEEL_STEP_PX &&
        now >= burst.cooldownUntil
      ) {
        step(direction);
        wheelAccRef.current = 0;
        burst.cooldownUntil = now + WHEEL_STEP_COOLDOWN_MS;
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
    if (
      openRef.current ||
      phaseRef.current !== "browsing" ||
      dragInfoRef.current !== null
    ) {
      return;
    }
    if (event.button > 0) return; // primary button / touch / pen only
    const target = event.target as HTMLElement;
    const slot = target.closest<HTMLElement>("[data-card-index]");
    const downIndex = slot ? Number(slot.dataset.cardIndex) : Number.NaN;
    dragInfoRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startActive: activeRef.current,
      downIndex: Number.isInteger(downIndex) ? downIndex : null,
      intent: "pending",
    };
    // Capture immediately so a fast mouse/pen movement outside the archive
    // still delivers pointerup/cancel. Touch panning remains governed by
    // `touch-action: pan-y` and is handed back through pointercancel.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
    pendingFractionRef.current = 0;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const info = dragInfoRef.current;
    if (!info || info.id !== event.pointerId) return;
    const dx = event.clientX - info.x;
    const dy = event.clientY - info.y;
    if (info.intent === "pending" && isDragGesture(dx, dy)) {
      if (Math.abs(dy) > Math.abs(dx)) {
        info.intent = "vertical";
        return;
      }
      info.intent = "horizontal";
      updatePhase("dragging");
    }
    if (info.intent !== "horizontal") return;
    const rawFraction = -dx / DRAG_STEP_PX;
    const targetIndex = clamp(
      info.startActive + rawFraction,
      0,
      LAST,
    );
    pendingFractionRef.current = targetIndex - info.startActive;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flushFraction);
    }
  };

  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    const info = dragInfoRef.current;
    if (!info || info.id !== event.pointerId) return;
    dragInfoRef.current = null;
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
    updatePhase("browsing");
    if (info.intent === "horizontal") {
      // Snap to the nearest card. A drag never counts as a selection.
      const next = clampIndex(
        Math.round(info.startActive + fraction),
        HERO_CARDS.length,
      );
      activeRef.current = next;
      setActive(next);
      return;
    }
    // A cancel or a gesture that crossed the drag threshold is never a tap —
    // only a genuine pointerup with pending intent can open a card.
    if (event.type === "pointercancel" || info.intent !== "pending") return;
    const under = document.elementFromPoint(
      event.clientX,
      event.clientY,
    ) as HTMLElement | null;
    const slot = under?.closest<HTMLElement>("[data-card-index]");
    const index = slot ? Number(slot.dataset.cardIndex) : Number.NaN;
    if (Number.isInteger(index) && index === info.downIndex) openCard(index);
  };

  const onLostPointerCapture = (event: PointerEvent<HTMLDivElement>) => {
    const info = dragInfoRef.current;
    if (!info || info.id !== event.pointerId) return;
    dragInfoRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const next = clampIndex(
      Math.round(info.startActive + pendingFractionRef.current),
      HERO_CARDS.length,
    );
    pendingFractionRef.current = 0;
    setDragFraction(0);
    if (info.intent === "horizontal") {
      activeRef.current = next;
      setActive(next);
    }
    updatePhase("browsing");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      openRef.current ||
      phaseRef.current !== "browsing" ||
      dragInfoRef.current !== null
    ) {
      return;
    }
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
        activeRef.current = 0;
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        activeRef.current = LAST;
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
    if (selectedIndex === null) return;
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "transform") return;
    if (Number(event.currentTarget.dataset.cardIndex) !== selectedIndex) return;
    clearPhaseTimer();
    if (phaseRef.current === "opening") {
      updatePhase("open");
      return;
    }
    if (phaseRef.current === "closing") {
      setSelectedIndex(null);
      openRef.current = false;
      updatePhase("browsing");
    }
  };

  const isDetached = phase === "opening" || phase === "open";
  const isClosing = phase === "closing";
  const isEngaged = selectedIndex !== null;
  const cardWidth = frame ? cardWidthFor(frame) : 0;
  const effectiveActive = active + dragFraction;
  // Derived during render so the live region announces on every active change
  // without a state-syncing effect.
  const activeCard = HERO_CARDS[active];
  const liveMessage = isEngaged
    ? ""
    : `${activeCard.build.name}, ${activeCard.stateLabel}. ${active + 1} of ${HERO_CARDS.length}.`;

  const primaryCta = bookingUrl ? (
    <a href={bookingUrl} rel="noreferrer" className={buttonClassName("solid")}>
      {CTA_LABELS.bookBuildCall}
      <CtaArrow onDark />
    </a>
  ) : (
    <UnavailableCta
      label={CTA_LABELS.bookBuildCall}
      reason="Booking opens soon"
    />
  );

  return (
    <section
      ref={rootRef}
      id="home-hero"
      aria-labelledby="home-hero-heading"
      className="home-hero"
      data-surface="canvas"
    >
      <div className="home-hero__rings" aria-hidden="true" />
      <div className="home-hero__marks" aria-hidden="true" />

      <div className="home-hero__inner">
        <div
          className="home-hero__copy"
          inert={isEngaged || undefined}
          data-muted={isEngaged || undefined}
        >
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
        </div>

        <div
          ref={archiveRef}
          className="home-hero__archive"
          role="group"
          aria-roledescription="carousel"
          aria-label="Arizmi Labs product archive"
          aria-describedby="home-hero-archive-help"
          tabIndex={isEngaged ? -1 : 0}
          data-phase={phase}
          data-dragging={phase === "dragging" || undefined}
          data-open={isDetached || undefined}
          data-closing={isClosing || undefined}
          data-flat={reducedMotion || undefined}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onLostPointerCapture={onLostPointerCapture}
        >
          <div className="home-hero__stage">
            {frame
              ? HERO_CARDS.map((card, index) => {
                  const selected = selectedIndex === index;
                  const open = selected && isDetached;
                  const leaving = selected && isClosing;
                  const engagedCard = open || leaving;
                  return (
                    <div
                      key={card.build.id}
                      className="arc__slot"
                      data-card-index={index}
                      data-active={index === active || undefined}
                      data-open={open || undefined}
                      data-closing={leaving || undefined}
                      inert={isEngaged && !engagedCard ? true : undefined}
                      aria-hidden={engagedCard ? undefined : true}
                      style={
                        open
                          ? openSlotStyle(frame)
                          : slotStyle(index - effectiveActive, frame, cardWidth)
                      }
                      onTransitionEnd={onSlotTransitionEnd}
                    >
                      <div className="arc__card">
                        <div
                          className="arc__face arc__face--back"
                          data-surface="card"
                        >
                          <Image
                            src={card.cardBackSrc}
                            alt=""
                            width={HERO_CARD_BACK_SIZE.width}
                            height={HERO_CARD_BACK_SIZE.height}
                            draggable={false}
                            priority={Math.abs(index - HERO_INITIAL_INDEX) <= 1}
                            // Every card back is above the fold in the hero.
                            loading={
                              Math.abs(index - HERO_INITIAL_INDEX) <= 1 ? undefined : "eager"
                            }
                            // These brand masters are already lossless runtime
                            // derivatives. Bypass the default q=75 optimizer,
                            // which removed the fine texture and linework.
                            unoptimized
                            style={{ width: "100%", height: "100%", display: "block" }}
                            className="arc__img"
                          />
                        </div>
                        {engagedCard ? (
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
        Use the arrow keys, Page Up and Page Down, Home and End to browse the
        product archive. Press Enter or Space to open a card, and Escape to
        close it.
      </p>
      <LiveRegion>{liveMessage}</LiveRegion>
    </section>
  );
}
