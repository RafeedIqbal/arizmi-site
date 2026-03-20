"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const DISPLAY_TEXT = "Arizmi Labs";
const LAYER_COUNT = 12;

type Bounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type GlowLayerStyle = React.CSSProperties & Record<`--${string}`, string>;

const TRAIL_LAYERS = Array.from({ length: LAYER_COUNT }, (_, index) => {
  const depth = index / (LAYER_COUNT - 1);
  return {
    id: `trail-${index}`,
    style: {
      "--trail-blur": `${(2 + depth * 22).toFixed(1)}px`,
      "--trail-opacity": `${(0.44 - depth * 0.24).toFixed(3)}`,
      "--trail-shift-x": `${(0.2 + depth * 1.55).toFixed(3)}em`,
      "--trail-shift-y": `${(0.12 + depth * 0.9).toFixed(3)}em`,
      "--trail-stretch": `${(0.08 + depth * 0.46).toFixed(3)}`,
      "--trail-scale": `${(1 - depth * 0.08).toFixed(3)}`,
    } as GlowLayerStyle,
  };
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function TextGlowHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<Bounds | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef({ x: 0, y: 0, strength: 0 });
  const reducedMotionRef = useRef(false);

  function writeGlow(x: number, y: number, strength: number) {
    const el = containerRef.current;
    if (!el) return;

    el.style.setProperty("--text-glow-x", x.toFixed(4));
    el.style.setProperty("--text-glow-y", y.toFixed(4));
    el.style.setProperty("--text-glow-strength", strength.toFixed(4));
  }

  function scheduleGlow(x: number, y: number, strength: number) {
    pendingRef.current = { x, y, strength };

    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const next = pendingRef.current;
      writeGlow(next.x, next.y, next.strength);
    });
  }

  function updateBounds() {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    boundsRef.current = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    reducedMotionRef.current = prefersReducedMotion();
    writeGlow(0, 0, 0);
    updateBounds();

    if (reducedMotionRef.current) {
      return;
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateBounds());
      resizeObserver.observe(el);
    }

    window.addEventListener("resize", updateBounds);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", updateBounds);
      resizeObserver?.disconnect();
    };
  }, []);

  function handlePointerEnter(event: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotionRef.current || event.pointerType === "touch") return;
    updateBounds();
    handlePointerMove(event);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotionRef.current || event.pointerType === "touch") return;

    if (!boundsRef.current) updateBounds();
    const bounds = boundsRef.current;
    if (!bounds) return;

    const x = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2, -1, 1);
    const y = clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * 2, -1, 1);
    const strength = clamp(0.38 + Math.hypot(x, y) * 0.5, 0.38, 1);

    scheduleGlow(x, y, strength);
  }

  function resetGlow() {
    if (reducedMotionRef.current) return;
    scheduleGlow(0, 0, 0);
  }

  const textStyle: React.CSSProperties = {
    fontFamily: "var(--font-inter)",
    fontWeight: 900,
    fontSize: "clamp(3rem, 12vw, 10rem)",
    lineHeight: 0.94,
    letterSpacing: "-0.03em",
    whiteSpace: "nowrap",
  };

  return (
    <div
      ref={containerRef}
      className="text-glow-hero"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetGlow}
      onPointerCancel={resetGlow}
      style={{ touchAction: "pan-y" }}
    >
      <div className="text-glow-hero__track" style={textStyle}>
        <div className="text-glow-hero__stage" aria-hidden="true">
          {TRAIL_LAYERS.map((layer) => (
            <span
              key={layer.id}
              className="text-glow-hero__trail"
              style={layer.style}
            >
              {DISPLAY_TEXT}
            </span>
          ))}
        </div>

        <span className="text-glow-hero__core">{DISPLAY_TEXT}</span>
      </div>
    </div>
  );
}
