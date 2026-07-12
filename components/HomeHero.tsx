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
 * position. Constants are tuned conservatively so the visible window stays
 * on-screen at any viewport (the arc is measured from the live container
 * size, not hard-coded pixels).
 */
const CARD_RATIO = 652 / 428; // production card-back aspect (height / width)
const ARC_STEP_DEG = 10; // angular gap between adjacent cards
const ARC_STEP_RAD = (ARC_STEP_DEG * Math.PI) / 180;
const RADIUS_FACTOR = 1.15; // wheel radius relative to archive height
const DRAG_STEP_PX = 96; // pointer travel that advances one card
const WHEEL_STEP = 42; // wheel delta that advances one card

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type Size = { w: number; h: number };

function cardWidthFor(size: Size) {
  return clamp(size.w * 0.44, 152, 288);
}

/** Position/scale/opacity for a card `pos` steps from the active index. */
function slotStyle(pos: number, size: Size, cardW: number): CSSProperties {
  const cardH = cardW * CARD_RATIO;
  const radius = size.h * RADIUS_FACTOR;
  const centerY = size.h / 2;
  // Active card (pos 0) sits just inside the right edge; the wheel centre is
  // `radius` further right, i.e. far off-screen.
  const activeCenterX = size.w - cardW * 0.6;
  const centerX = activeCenterX + radius;
  const angle = pos * ARC_STEP_RAD;
  const cx = centerX - radius * Math.cos(angle);
  const cy = centerY + radius * Math.sin(angle);
  const a = Math.abs(pos);
  const scale = clamp(1.06 - a * 0.045, 0.8, 1.06);
  const opacity = a <= 2.2 ? 1 : clamp(1 - (a - 2.2) / 1.4, 0, 1);
  return {
    width: `${cardW}px`,
    height: `${cardH}px`,
    transform: `translate3d(${(cx - cardW / 2).toFixed(2)}px, ${(cy - cardH / 2).toFixed(2)}px, 0) rotate(${(pos * ARC_STEP_DEG).toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    opacity,
    zIndex: Math.round(1000 - a * 12),
    pointerEvents: opacity < 0.15 ? "none" : "auto",
  };
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

function CardDetail({
  card,
  flat,
  detailRef,
  onClose,
}: {
  card: HeroCard;
  flat: boolean;
  detailRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const { build } = card;
  return (
    <div
      ref={detailRef}
      tabIndex={-1}
      role="group"
      aria-label={`${build.name} — project details`}
      className={`home-hero__detail${flat ? " is-flat" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="home-hero__detail-head">
        <MetaLabel tone="accent">
          {card.stateLabel} · {build.sourceStatus}
        </MetaLabel>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="home-hero__detail-close"
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
      <p className="home-hero__detail-name">{build.name}</p>
      <p className="home-hero__detail-summary">{build.summary}</p>
      <div>
        <MetaLabel>What Arizmi shaped</MetaLabel>
        <p className="home-hero__detail-contrib">{build.contribution}</p>
      </div>
      <ul className="home-hero__detail-caps">
        {build.capabilities.map((capability) => (
          <li key={capability}>{capability}</li>
        ))}
      </ul>
      <div className="home-hero__detail-cta">
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
 * previous/next controls. Selecting a card opens a detail panel (the card
 * "front") and softens the archive behind it. Reduced motion keeps every
 * control but removes the arc travel and flip.
 */
export default function HomeHero({ bookingUrl }: { bookingUrl: string | null }) {
  const reducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(HERO_INITIAL_INDEX);
  const [dragFraction, setDragFraction] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [size, setSize] = useState<Size | null>(null);

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

  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    openRef.current = openIndex !== null;
  }, [openIndex]);

  const step = useCallback((delta: number) => {
    setActive((current) => clampIndex(current + delta, HERO_CARDS.length));
  }, []);

  const openCard = useCallback((index: number) => {
    setActive(index);
    setOpenIndex(index);
  }, []);

  const closeCard = useCallback(() => {
    setOpenIndex(null);
  }, []);

  // Measure the archive so arc geometry adapts to any viewport.
  useIsomorphicLayoutEffect(() => {
    const el = archiveRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Move focus into the detail panel on open; restore it to the archive on
  // close so a keyboard user never loses their place.
  const prevOpenRef = useRef<number | null>(null);
  useEffect(() => {
    if (openIndex !== null) {
      detailRef.current?.focus();
    } else if (prevOpenRef.current !== null) {
      archiveRef.current?.focus();
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
    if (openRef.current) return; // panel handles its own keys
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

  const isOpen = openIndex !== null;
  const cardWidth = size ? cardWidthFor(size) : 0;
  const effectiveActive = active + dragFraction;
  const openCardData = openIndex !== null ? HERO_CARDS[openIndex] : null;
  // Derived during render so the live region announces on every active change
  // without a state-syncing effect.
  const activeCard = HERO_CARDS[active];
  const liveMessage = isOpen
    ? ""
    : `${activeCard.build.name}, ${activeCard.stateLabel}. ${active + 1} of ${HERO_CARDS.length}.`;

  const primaryCta = bookingUrl ? (
    <a href={bookingUrl} className={buttonClassName("solid")}>
      {CTA_LABELS.bookBuildCall}
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
          tabIndex={0}
          inert={isOpen || undefined}
          data-dragging={dragging || undefined}
          data-dimmed={isOpen || undefined}
          data-flat={reducedMotion || undefined}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        >
          <div className="home-hero__stage">
            {size
              ? HERO_CARDS.map((card, index) => (
                  <div
                    key={card.build.id}
                    className="arc__slot"
                    data-card-index={index}
                    data-active={index === active || undefined}
                    style={slotStyle(index - effectiveActive, size, cardWidth)}
                    aria-hidden="true"
                  >
                    <div className="arc__card">
                      <Image
                        src={card.cardBackSrc}
                        alt=""
                        width={428}
                        height={652}
                        draggable={false}
                        priority={index === HERO_INITIAL_INDEX}
                        sizes="(max-width: 900px) 45vw, 300px"
                        style={{ width: "100%", height: "auto", display: "block" }}
                        className="arc__img"
                      />
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>

      <p id="home-hero-archive-help" className="sr-only">
        Use the left and right arrow keys to browse the product archive, Enter
        to open a card, and Escape to close it.
      </p>
      <LiveRegion>{liveMessage}</LiveRegion>

      {openCardData ? (
        <CardDetail
          card={openCardData}
          flat={reducedMotion}
          detailRef={detailRef}
          onClose={closeCard}
        />
      ) : null}
    </section>
  );
}
