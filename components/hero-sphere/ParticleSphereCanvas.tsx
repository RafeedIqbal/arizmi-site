"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { Canvas, type RootState } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import ParticleSphere from "./ParticleSphere";
import { CAMERA_POSITION, CAMERA_FOV } from "./constants";

function Fallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--bg)",
      }}
    />
  );
}

export default function ParticleSphereCanvas() {
  const [hasError, setHasError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const onCreated = useCallback((state: RootState) => {
    const canvas = state.gl.domElement;
    canvas.addEventListener("webglcontextlost", () => setHasError(true));
  }, []);

  if (hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/hero_image.png"
        alt="Arizmi Labs hero artwork"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <Suspense fallback={<Fallback />}>
      <Canvas
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        camera={{
          position: [...CAMERA_POSITION],
          fov: CAMERA_FOV,
          near: 0.1,
          far: 100,
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
        onCreated={onCreated}
        onError={() => setHasError(true)}
      >
        <AdaptiveDpr pixelated />
        <ParticleSphere reducedMotion={reducedMotion} />
      </Canvas>
    </Suspense>
  );
}
