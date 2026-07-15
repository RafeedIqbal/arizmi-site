"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import BuildDetail from "@/components/builds/BuildDetail";
import BuildMedia from "@/components/builds/BuildMedia";
import LiveRegion from "@/components/ui/LiveRegion";
import MetaLabel from "@/components/ui/MetaLabel";
import type { Build } from "@/lib/content/builds";
import { wrapIndex } from "@/lib/interaction";
import { Draggable, gsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SLIDE_DURATION_SECONDS = 0.65;
const AUTO_SCROLL_SLIDES_PER_SECOND = 1 / 14;
const DETAIL_TRANSITION_MS = 620;
const MANUAL_AUTOSCROLL_HOLD_MS = 3_500;
const WHEEL_STEP_PX = 48;
const WHEEL_COOLDOWN_MS = 420;
const WHEEL_BURST_QUIET_MS = 150;

interface MoveOptions {
  readonly animate?: boolean;
  readonly announce?: boolean;
  readonly focus?: boolean;
}

interface ReelController {
  goTo(index: number, options?: MoveOptions): void;
  setAutoscroll(enabled: boolean): void;
  step(delta: number, options?: MoveOptions): void;
}

type DetailPhase = "closed" | "opening" | "entering" | "open" | "closing";

function circularDistance(index: number, position: number, length: number) {
  if (length <= 1) return 0;
  const raw = index - position;
  return (((raw + length / 2) % length) + length) % length - length / 2;
}

/**
 * Infinite featured-build reel. One DOM instance is rendered per build; GSAP
 * drives a continuous logical position and each card is placed at its nearest
 * wrapped slot. This avoids cloned focus targets and duplicate future media.
 *
 * Carousel browsing and detail state are deliberately separate. Dragging,
 * wheel input, and arrow keys only change the active card. Activating a card
 * opens the URL-backed detail panel beneath the reel.
 */
export default function FeaturedBuilds({
  builds,
  openId,
  onOpen,
  onClose,
}: {
  builds: readonly Build[];
  openId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const detailId = useId();
  const instructionsId = useId();
  const buildKey = builds.map((build) => build.id).join("|");
  const initialIndex = Math.max(
    0,
    builds.findIndex((build) => build.id === openId),
  );
  const openBuild = builds.find((build) => build.id === openId) ?? null;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [announcement, setAnnouncement] = useState("");
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [manualAutoscrollPaused, setManualAutoscrollPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [renderedBuild, setRenderedBuild] = useState<Build | null>(openBuild);
  const [detailPhase, setDetailPhase] = useState<DetailPhase>(
    openBuild ? "open" : "closed",
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLUListElement>(null);
  const proxyRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const controllerRef = useRef<ReelController | null>(null);
  const activeIndexRef = useRef(initialIndex);
  const buildsRef = useRef(builds);
  const openIdRef = useRef(openId);
  const onCloseRef = useRef(onClose);
  const beginBrowseRef = useRef<() => void>(() => undefined);
  const suppressClickRef = useRef(false);
  const focusDetailOnOpenRef = useRef(false);
  const returnFocusIdRef = useRef<string | null>(null);
  const locallyOpenedIdRef = useRef<string | null>(null);
  const closeAfterBrowseRef = useRef(false);
  const browseCloseFocusIdRef = useRef<string | null>(null);
  const renderedBuildRef = useRef<Build | null>(openBuild);
  const detailPresenceInitializedRef = useRef(false);
  const detailFrameRef = useRef<number | null>(null);
  const detailTimerRef = useRef<number | null>(null);

  const activeBuild = builds[activeIndex] ?? builds[0];
  const canRotate = builds.length > 1;

  const beginBrowse = useCallback(() => {
    if (openIdRef.current) closeAfterBrowseRef.current = true;
  }, []);

  useLayoutEffect(() => {
    buildsRef.current = builds;
    openIdRef.current = openId;
    onCloseRef.current = onClose;
    beginBrowseRef.current = beginBrowse;
  }, [beginBrowse, builds, onClose, openId]);

  useLayoutEffect(() => {
    const animateOpen = detailPresenceInitializedRef.current;
    detailPresenceInitializedRef.current = true;

    if (detailFrameRef.current !== null) {
      cancelAnimationFrame(detailFrameRef.current);
      detailFrameRef.current = null;
    }
    if (detailTimerRef.current !== null) {
      window.clearTimeout(detailTimerRef.current);
      detailTimerRef.current = null;
    }

    detailFrameRef.current = requestAnimationFrame(() => {
      detailFrameRef.current = null;

      if (openBuild) {
        renderedBuildRef.current = openBuild;
        setRenderedBuild(openBuild);

        if (reducedMotion || !animateOpen) {
          setDetailPhase("open");
        } else {
          setDetailPhase("opening");
          detailFrameRef.current = requestAnimationFrame(() => {
            detailFrameRef.current = null;
            setDetailPhase("entering");
            detailTimerRef.current = window.setTimeout(() => {
              detailTimerRef.current = null;
              if (openIdRef.current !== openBuild.id) return;
              setDetailPhase("open");
            }, DETAIL_TRANSITION_MS);
          });
        }
        return;
      }

      const current = renderedBuildRef.current;
      if (
        current &&
        detailRef.current &&
        detailRef.current.contains(document.activeElement)
      ) {
        const focusId = browseCloseFocusIdRef.current ?? current.id;
        cardRefs.current.get(focusId)?.focus();
      }
      browseCloseFocusIdRef.current = null;
      if (!current) {
        setDetailPhase("closed");
      } else if (reducedMotion) {
        renderedBuildRef.current = null;
        setRenderedBuild(null);
        setDetailPhase("closed");
      } else {
        setDetailPhase("closing");
        detailTimerRef.current = window.setTimeout(() => {
          detailTimerRef.current = null;
          if (openIdRef.current) return;
          renderedBuildRef.current = null;
          setRenderedBuild(null);
          setDetailPhase("closed");
        }, DETAIL_TRANSITION_MS);
      }
    });

    return () => {
      if (detailFrameRef.current !== null) {
        cancelAnimationFrame(detailFrameRef.current);
        detailFrameRef.current = null;
      }
      if (detailTimerRef.current !== null) {
        window.clearTimeout(detailTimerRef.current);
        detailTimerRef.current = null;
      }
    };
  }, [openBuild, reducedMotion]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const reel = reelRef.current;
    const proxy = proxyRef.current;
    const effectBuilds = buildsRef.current;
    const length = effectBuilds.length;
    if (!root || !viewport || !reel || !proxy || length === 0) return;

    const items = Array.from(
      reel.querySelectorAll<HTMLElement>("[data-reel-item]"),
    );
    if (items.length !== length) return;

    const position = { value: activeIndexRef.current };
    const metrics = { cardWidth: 1, step: 1, viewportWidth: 1 };
    let pendingIndex = activeIndexRef.current;
    let positionTween: gsap.core.Tween | null = null;
    let draggable: Draggable | null = null;
    let resizeFrame: number | null = null;
    let clickResetTimer: number | null = null;
    let autoscrollHoldUntil = 0;

    const holdAutoscroll = (duration = MANUAL_AUTOSCROLL_HOLD_MS) => {
      autoscrollHoldUntil = Math.max(
        autoscrollHoldUntil,
        performance.now() + duration,
      );
    };

    const render = () => {
      const visibleEdge = metrics.viewportWidth / 2 + metrics.cardWidth / 2;
      items.forEach((item, index) => {
        const distance = circularDistance(index, position.value, length);
        const depthDistance = reducedMotion
          ? 0
          : Math.max(-1.5, Math.min(1.5, distance));
        const depthMagnitude = Math.min(1.5, Math.abs(depthDistance));
        const x =
          metrics.viewportWidth / 2 -
          metrics.cardWidth / 2 +
          distance * metrics.step;
        const visible = Math.abs(distance) * metrics.step <= visibleEdge;
        const opacity = visible ? 1 : 0;
        item.style.transform = `translate3d(${x.toFixed(2)}px, -50%, 0)`;
        item.style.opacity = opacity.toFixed(3);
        item.style.pointerEvents = opacity > 0.15 ? "auto" : "none";
        if (opacity > 0.05 || item.contains(document.activeElement)) {
          item.removeAttribute("aria-hidden");
        } else {
          item.setAttribute("aria-hidden", "true");
        }
        item.style.zIndex = String(100 - Math.round(Math.abs(distance) * 10));
        item.style.setProperty("--featured-distance", distance.toFixed(4));
        item.style.setProperty(
          "--featured-card-x",
          `${(depthDistance * -8).toFixed(2)}px`,
        );
        item.style.setProperty(
          "--featured-card-z",
          `${(depthMagnitude * -64).toFixed(2)}px`,
        );
        item.style.setProperty(
          "--featured-card-tilt",
          `${Math.max(-18, Math.min(18, depthDistance * -14)).toFixed(2)}deg`,
        );
        item.style.setProperty(
          "--featured-card-scale",
          (1 - depthMagnitude * 0.015).toFixed(4),
        );
        item.style.setProperty(
          "--featured-parallax-far",
          `${(depthDistance * 18).toFixed(2)}px`,
        );
        item.style.setProperty(
          "--featured-parallax-near",
          `${(depthDistance * -32).toFixed(2)}px`,
        );
        item.style.setProperty(
          "--featured-parallax-shine",
          `${(depthDistance * -40).toFixed(2)}px`,
        );
      });
    };

    const measure = () => {
      const first = items[0];
      const reelStyles = getComputedStyle(reel);
      const gap =
        Number.parseFloat(reelStyles.getPropertyValue("--featured-gap")) || 24;
      metrics.cardWidth = first.getBoundingClientRect().width || 220;
      metrics.viewportWidth = viewport.getBoundingClientRect().width || 1;
      const naturalStep = metrics.cardWidth + gap;
      const loopSafeStep =
        length > 1
          ? (metrics.viewportWidth + metrics.cardWidth + gap * 2) / length
          : naturalStep;
      // With one DOM copy per build, the wrapped item must change sides while
      // fully outside the viewport. Sparse filtered sets therefore spread out
      // just enough to keep their circular boundary invisible.
      metrics.step = Math.max(naturalStep, loopSafeStep);
      gsap.set(proxy, { x: -position.value * metrics.step });
      render();
    };

    const settle = (index: number, options: MoveOptions = {}) => {
      const realIndex = wrapIndex(index, length);
      pendingIndex = realIndex;
      position.value = realIndex;
      gsap.set(proxy, { x: -realIndex * metrics.step });
      render();
      activeIndexRef.current = realIndex;
      setActiveIndex(realIndex);
      if (options.announce) holdAutoscroll();

      if (options.announce) {
        const build = effectBuilds[realIndex];
        setAnnouncement(
          `${build.name}, ${build.sourceStatus}. ${realIndex + 1} of ${length}.`,
        );
      }
      if (options.focus) {
        requestAnimationFrame(() => {
          cardRefs.current.get(effectBuilds[realIndex].id)?.focus();
        });
      }
      if (closeAfterBrowseRef.current) {
        closeAfterBrowseRef.current = false;
        focusDetailOnOpenRef.current = false;
        browseCloseFocusIdRef.current = effectBuilds[realIndex].id;
        openIdRef.current = null;
        onCloseRef.current();
      }
    };

    const killMotion = () => {
      positionTween?.kill();
      positionTween = null;
      if (draggable?.isThrowing) draggable.tween?.kill();
    };

    const goTo = (index: number, options: MoveOptions = {}) => {
      const realIndex = wrapIndex(index, length);
      const base = Math.round(position.value);
      const baseReal = wrapIndex(base, length);
      let delta = realIndex - baseReal;
      if (delta > length / 2) delta -= length;
      if (delta < -length / 2) delta += length;
      const target = base + delta;
      pendingIndex = realIndex;
      killMotion();

      if (options.animate === false || reducedMotion) {
        position.value = target;
        settle(realIndex, options);
        return;
      }

      positionTween = gsap.to(position, {
        value: target,
        duration: SLIDE_DURATION_SECONDS,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: render,
        onComplete: () => {
          positionTween = null;
          settle(realIndex, options);
        },
      });
    };

    const drift = (delta: number) => {
      if (
        delta === 0 ||
        performance.now() < autoscrollHoldUntil ||
        positionTween ||
        draggable?.isPressed ||
        draggable?.isDragging ||
        draggable?.isThrowing
      ) {
        return;
      }

      position.value += delta;
      if (Math.abs(position.value) > length * 4) {
        position.value -= Math.trunc(position.value / length) * length;
      }

      const realIndex = wrapIndex(Math.round(position.value), length);
      pendingIndex = realIndex;
      gsap.set(proxy, { x: -position.value * metrics.step });
      render();

      if (realIndex !== activeIndexRef.current) {
        activeIndexRef.current = realIndex;
        setActiveIndex(realIndex);
      }
    };

    let autoscrollEnabled = false;
    const autoscrollTick = (_time: number, deltaTime: number) => {
      drift(
        (Math.min(deltaTime, 50) / 1_000) *
          AUTO_SCROLL_SLIDES_PER_SECOND,
      );
    };

    const controller: ReelController = {
      goTo,
      setAutoscroll(enabled) {
        if (enabled === autoscrollEnabled) return;
        autoscrollEnabled = enabled;
        if (enabled) gsap.ticker.add(autoscrollTick);
        else gsap.ticker.remove(autoscrollTick);
      },
      step(delta, options = {}) {
        goTo(wrapIndex(pendingIndex + delta, length), options);
      },
    };
    controllerRef.current = controller;

    const snapToNearest = (animate: boolean) => {
      const continuousTarget = Math.round(position.value);
      const realIndex = wrapIndex(continuousTarget, length);
      pendingIndex = realIndex;
      positionTween?.kill();

      if (!animate || reducedMotion) {
        position.value = continuousTarget;
        settle(realIndex, { announce: true });
        return;
      }

      positionTween = gsap.to(position, {
        value: continuousTarget,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
        onUpdate: render,
        onComplete: () => {
          positionTween = null;
          settle(realIndex, { announce: true });
        },
      });
    };

    const context = gsap.context(() => {
      measure();

      if (length > 1) {
        draggable = Draggable.create(proxy, {
          trigger: viewport,
          type: "x",
          inertia: reducedMotion
            ? false
            : {
                resistance: 320,
                duration: { min: 0.18, max: 0.7, overshoot: 0 },
              },
          snap: reducedMotion
            ? undefined
            : {
                x: (value: number) =>
                  Math.round(value / metrics.step) * metrics.step,
              },
          allowNativeTouchScrolling: true,
          dragClickables: true,
          minimumMovement: 6,
          cursor: "grab",
          activeCursor: "grabbing",
          onPressInit: () => {
            if (!draggable) return;
            holdAutoscroll();
            pendingIndex = wrapIndex(Math.round(position.value), length);
            gsap.set(draggable.target, { x: -position.value * metrics.step });
          },
          onDragStart: () => {
            const pointerEvent = draggable?.pointerEvent;
            if (
              pointerEvent &&
              ("touches" in pointerEvent ||
                ("pointerType" in pointerEvent &&
                  pointerEvent.pointerType !== "mouse"))
            ) {
              setManualAutoscrollPaused(true);
            }
            beginBrowseRef.current();
            killMotion();
            suppressClickRef.current = true;
            root.dataset.dragging = "true";
          },
          onDrag: () => {
            if (!draggable) return;
            position.value = -draggable.x / metrics.step;
            render();
          },
          onThrowUpdate: () => {
            if (!draggable) return;
            position.value = -draggable.x / metrics.step;
            render();
          },
          onThrowComplete: () => {
            if (!draggable) return;
            position.value = -draggable.x / metrics.step;
            root.removeAttribute("data-dragging");
            settle(Math.round(position.value), { announce: true });
          },
          onDragEnd: () => {
            holdAutoscroll();
            suppressClickRef.current = true;
            if (clickResetTimer !== null) window.clearTimeout(clickResetTimer);
            clickResetTimer = window.setTimeout(() => {
              suppressClickRef.current = false;
              clickResetTimer = null;
            }, 180);
            root.removeAttribute("data-dragging");
            const current = draggable;
            requestAnimationFrame(() => {
              if (current && !current.isThrowing) {
                snapToNearest(!reducedMotion);
              }
            });
          },
        })[0];
      }
    }, root);

    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        killMotion();
        measure();
        const realIndex = wrapIndex(Math.round(position.value), length);
        pendingIndex = realIndex;
        if (realIndex !== activeIndexRef.current) {
          activeIndexRef.current = realIndex;
          setActiveIndex(realIndex);
        }
      });
    });
    resizeObserver.observe(viewport);

    return () => {
      controller.setAutoscroll(false);
      if (controllerRef.current === controller) controllerRef.current = null;
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      if (clickResetTimer !== null) window.clearTimeout(clickResetTimer);
      resizeObserver.disconnect();
      killMotion();
      draggable?.kill();
      context.revert();
    };
  }, [buildKey, reducedMotion]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.15);
      },
      { threshold: [0, 0.15] },
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => {
      setDocumentVisible(document.visibilityState === "visible");
    };
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const controller = controllerRef.current;
    const enabled =
      canRotate &&
      !reducedMotion &&
      !hovered &&
      !focusWithin &&
      !manualAutoscrollPaused &&
      inView &&
      documentVisible &&
      !openId &&
      !renderedBuild &&
      detailPhase === "closed";
    controller?.setAutoscroll(enabled);

    return () => {
      controller?.setAutoscroll(false);
    };
  }, [
    buildKey,
    canRotate,
    detailPhase,
    documentVisible,
    focusWithin,
    hovered,
    inView,
    manualAutoscrollPaused,
    openId,
    reducedMotion,
    renderedBuild,
  ]);

  useEffect(() => {
    if (!openId) return;
    if (locallyOpenedIdRef.current === openId) {
      locallyOpenedIdRef.current = null;
      return;
    }
    const index = builds.findIndex((build) => build.id === openId);
    if (index < 0) return;
    controllerRef.current?.goTo(index, { animate: false });
  }, [buildKey, builds, openId]);

  useEffect(() => {
    if (
      !openId ||
      !focusDetailOnOpenRef.current ||
      renderedBuild?.id !== openId ||
      detailPhase !== "open"
    ) {
      return;
    }

    let frame: number | null = null;
    let attempts = 0;
    const focusDetail = () => {
      if (detailRef.current) {
        detailRef.current.focus({ preventScroll: true });
        if (document.activeElement === detailRef.current) {
          focusDetailOnOpenRef.current = false;
          return;
        }
      }
      attempts += 1;
      if (attempts < 4) frame = requestAnimationFrame(focusDetail);
    };
    frame = requestAnimationFrame(focusDetail);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [detailPhase, openId, renderedBuild]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !canRotate) return;
    const wheel = { accumulated: 0, lastAt: 0, cooldownUntil: 0 };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const horizontalIntent =
        event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!horizontalIntent) return;

      const unit =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? viewport.clientWidth
            : 1;
      const rawDelta = event.shiftKey ? event.deltaY : event.deltaX;
      const delta = rawDelta * unit;
      if (delta === 0) return;

      event.preventDefault();
      beginBrowse();
      const now = performance.now();
      if (now - wheel.lastAt > WHEEL_BURST_QUIET_MS) wheel.accumulated = 0;
      wheel.lastAt = now;
      wheel.accumulated = Math.max(
        -WHEEL_STEP_PX * 2,
        Math.min(WHEEL_STEP_PX * 2, wheel.accumulated + delta),
      );
      if (
        Math.abs(wheel.accumulated) >= WHEEL_STEP_PX &&
        now >= wheel.cooldownUntil
      ) {
        controllerRef.current?.step(wheel.accumulated > 0 ? 1 : -1, {
          animate: !reducedMotion,
          announce: true,
        });
        wheel.accumulated = 0;
        wheel.cooldownUntil = now + WHEEL_COOLDOWN_MS;
      }
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [beginBrowse, canRotate, reducedMotion]);

  const browseBy = useCallback(
    (delta: number, focus = false) => {
      beginBrowse();
      controllerRef.current?.step(delta, {
        animate: !reducedMotion,
        announce: true,
        focus,
      });
    },
    [beginBrowse, reducedMotion],
  );

  const browseTo = useCallback(
    (index: number, focus = false) => {
      beginBrowse();
      controllerRef.current?.goTo(index, {
        animate: !reducedMotion,
        announce: true,
        focus,
      });
    },
    [beginBrowse, reducedMotion],
  );

  const openDetails = (build: Build, index: number) => {
    if (suppressClickRef.current) return;
    closeAfterBrowseRef.current = false;
    controllerRef.current?.goTo(index, {
      animate: !reducedMotion,
      announce: true,
    });
    returnFocusIdRef.current = build.id;
    focusDetailOnOpenRef.current = true;
    if (
      openIdRef.current === build.id &&
      renderedBuildRef.current?.id === build.id &&
      detailPhase === "open"
    ) {
      focusDetailOnOpenRef.current = false;
      detailRef.current?.focus();
      return;
    }
    locallyOpenedIdRef.current = build.id;
    openIdRef.current = build.id;
    onOpen(build.id);
  };

  const closeDetails = () => {
    const focusId = returnFocusIdRef.current ?? openId;
    closeAfterBrowseRef.current = false;
    browseCloseFocusIdRef.current = null;
    focusDetailOnOpenRef.current = false;
    locallyOpenedIdRef.current = null;
    openIdRef.current = null;
    onClose();
    if (focusId) {
      requestAnimationFrame(() => cardRefs.current.get(focusId)?.focus());
    }
  };

  const onCardKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        browseBy(1, true);
        break;
      case "ArrowLeft":
        event.preventDefault();
        browseBy(-1, true);
        break;
      case "Home":
        event.preventDefault();
        browseTo(0, true);
        break;
      case "End":
        event.preventDefault();
        browseTo(builds.length - 1, true);
        break;
      default:
        break;
    }
  };

  if (!activeBuild) return null;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby="featured-heading"
      aria-describedby={instructionsId}
      className="featured mt-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithin(false);
        }
      }}
    >
      <p id={instructionsId} className="sr-only">
        {reducedMotion
          ? "Automatic scrolling is disabled by your reduced-motion preference. "
          : "Featured builds scroll automatically and pause while hovered, while focus is inside the gallery, or after touch dragging. "}
        Drag, swipe, or scroll horizontally to browse. Use Left and Right Arrow,
        Home, or End while a card is focused. Press Enter or Space to open its
        details.
      </p>
      <div className="featured__layout">
        <div className="featured__gallery">
          <div ref={viewportRef} className="featured__viewport">
            <ul ref={reelRef} aria-live="off" className="featured__track">
              {builds.map((build, index) => {
                const isActive = index === activeIndex;
                const isOpen = build.id === openId;
                return (
                  <li
                    key={build.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${build.name}, ${index + 1} of ${builds.length}`}
                    data-reel-item
                    className="featured__item"
                  >
                    <button
                      type="button"
                      ref={(node) => {
                        if (node) cardRefs.current.set(build.id, node);
                        else cardRefs.current.delete(build.id);
                      }}
                      tabIndex={isActive ? 0 : -1}
                      aria-current={isActive || undefined}
                      aria-expanded={isOpen}
                      aria-controls={isOpen ? detailId : undefined}
                      onClick={() => openDetails(build, index)}
                      onKeyDown={onCardKeyDown}
                      className="featured-card"
                    >
                      <span className="featured-card__plane">
                        <BuildMedia
                          build={build}
                          variant="featured"
                          className="featured-card__media"
                        />
                        <span className="featured-card__meta">
                          <span className="featured-card__name">
                            {build.name}
                          </span>
                          <MetaLabel as="span" tone="inherit">
                            {build.sourceStatus}
                          </MetaLabel>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div ref={proxyRef} aria-hidden="true" className="featured__proxy" />
          </div>
        </div>

        {renderedBuild ? (
          <div
            data-phase={detailPhase}
            aria-hidden={detailPhase === "closing" || undefined}
            inert={detailPhase === "closing"}
            className="featured__detail-presence"
          >
            <div className="featured__detail-clip">
              <div className="featured__detail-frame">
                <div
                  id={detailId}
                  ref={detailRef}
                  tabIndex={-1}
                  role="region"
                  aria-label={`${renderedBuild.name} — project details`}
                  className="featured__detail"
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeDetails();
                    }
                  }}
                >
                  <header className="featured__detail-header">
                    <h4 className="text-2xl font-semibold tracking-tight">
                      {renderedBuild.name}
                    </h4>
                    <button
                      type="button"
                      aria-label="Close project details"
                      onClick={closeDetails}
                      className="featured__detail-close"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M1.5 1.5l13 13M14.5 1.5l-13 13"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </header>
                  <div className="mt-5">
                    <BuildDetail build={renderedBuild} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <LiveRegion>{announcement}</LiveRegion>
    </div>
  );
}
