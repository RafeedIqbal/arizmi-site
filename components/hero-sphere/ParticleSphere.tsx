"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";
import {
  SHELL_COUNT,
  LEAK_COUNT,
  TOTAL_COUNT,
  SPHERE_RADIUS,
  LEAK_ORIGIN,
  LEAK_ORIGIN_SPREAD,
  AUTO_ROTATE_SPEED,
  BREATHING_AMPLITUDE,
  LEAK_SPEED,
  LEAK_TURBULENCE,
  PLUME_ARC_HEIGHT,
  PLUME_PATH_SPREAD,
  PLUME_ARRIVAL_SHRINK,
  CURSOR_BRIGHTNESS_BOOST,
  CURSOR_MAGNETIC_STRENGTH,
  DRAG_SENSITIVITY,
  MOMENTUM_DECAY,
  SHELL_POINT_SIZE,
  LEAK_POINT_SIZE,
} from "./constants";

// Deterministic hash: maps an integer to a stable float in [0, 1)
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

// Fibonacci sphere distribution
function fibonacciSphere(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);

    positions[i * 3] = Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = Math.cos(phi);
  }
  return positions;
}

export default function ParticleSphere({ reducedMotion }: { reducedMotion: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, gl, camera } = useThree();
  const isMobile = size.width < 768;
  const groupScale = isMobile ? 0.75 : 1;

  // Drag state
  const dragState = useRef({
    isDragging: false,
    prevPointer: new THREE.Vector2(),
    rotation: new THREE.Quaternion(),
    velocity: new THREE.Vector2(),
    autoAngle: 0,
  });

  // Pointer position in NDC
  const pointerNDC = useRef(new THREE.Vector3(0, 0, 1));

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // Shell positions: Fibonacci on unit sphere
    const shellPos = fibonacciSphere(SHELL_COUNT);

    // Leak positions: tightly clustered near the upper emission origin
    const leakOriginNorm = new THREE.Vector3(...LEAK_ORIGIN).normalize();
    const leakPos = new Float32Array(LEAK_COUNT * 3);

    for (let i = 0; i < LEAK_COUNT; i++) {
      const h1 = hash(i * 3 + 70001);
      const h2 = hash(i * 3 + 70002);
      const h3 = hash(i * 3 + 70003);
      const x = leakOriginNorm.x + (h1 - 0.5) * LEAK_ORIGIN_SPREAD;
      const y = leakOriginNorm.y + (h2 - 0.5) * LEAK_ORIGIN_SPREAD;
      const z = leakOriginNorm.z + (h3 - 0.5) * LEAK_ORIGIN_SPREAD;
      const len = Math.sqrt(x * x + y * y + z * z);
      leakPos[i * 3] = x / len;
      leakPos[i * 3 + 1] = y / len;
      leakPos[i * 3 + 2] = z / len;
    }

    // Combine positions
    const positions = new Float32Array(TOTAL_COUNT * 3);
    positions.set(shellPos, 0);
    positions.set(leakPos, SHELL_COUNT * 3);

    // Attributes — all derived from deterministic hash of index
    const aRandom = new Float32Array(TOTAL_COUNT);
    const aPhase = new Float32Array(TOTAL_COUNT);
    const aLeakFactor = new Float32Array(TOTAL_COUNT);
    const aConeOffset = new Float32Array(TOTAL_COUNT * 2);

    for (let i = 0; i < TOTAL_COUNT; i++) {
      aRandom[i] = hash(i);
      aPhase[i] = hash(i + 10000);
      aLeakFactor[i] = i >= SHELL_COUNT ? 1.05 + hash(i + 20000) * 0.55 : 0;
      aConeOffset[i * 2] = hash(i + 30000);
      aConeOffset[i * 2 + 1] = hash(i + 40000);
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aRandom", new THREE.BufferAttribute(aRandom, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(aPhase, 1));
    geo.setAttribute("aLeakFactor", new THREE.BufferAttribute(aLeakFactor, 1));
    geo.setAttribute("aConeOffset", new THREE.BufferAttribute(aConeOffset, 2));

    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector3(0, 0, 1) },
      uDragRotation: { value: new THREE.Matrix4() },
      uLeakOrigin: { value: new THREE.Vector3(...LEAK_ORIGIN).normalize() },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uShellPointSize: { value: SHELL_POINT_SIZE },
      uLeakPointSize: { value: LEAK_POINT_SIZE },
      uBreathingAmplitude: { value: BREATHING_AMPLITUDE },
      uLeakSpeed: { value: LEAK_SPEED },
      uLeakTurbulence: { value: LEAK_TURBULENCE },
      uCursorBrightness: { value: CURSOR_BRIGHTNESS_BOOST },
      uSphereRadius: { value: SPHERE_RADIUS },
      uPlumeArcHeight: { value: PLUME_ARC_HEIGHT },
      uPlumePathSpread: { value: PLUME_PATH_SPREAD },
      uPlumeArrivalShrink: { value: PLUME_ARRIVAL_SHRINK },
      uMagneticStrength: { value: CURSOR_MAGNETIC_STRENGTH },
    }),
    [gl]
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    const mat = materialRef.current;
    const ds = dragState.current;
    mat.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 2);

    // Update time (freeze at 0 for reduced motion)
    if (!reducedMotion) {
      mat.uniforms.uTime.value += delta;
    }

    // Auto-rotation when not dragging
    if (!ds.isDragging && !reducedMotion) {
      ds.autoAngle += AUTO_ROTATE_SPEED * delta;

      // Apply momentum decay
      if (Math.abs(ds.velocity.x) > 0.0001 || Math.abs(ds.velocity.y) > 0.0001) {
        const momentumQuat = new THREE.Quaternion();
        const axisX = new THREE.Vector3(0, 1, 0);
        const axisY = new THREE.Vector3(1, 0, 0);
        momentumQuat.setFromAxisAngle(axisX, ds.velocity.x * 0.5);
        const qy = new THREE.Quaternion().setFromAxisAngle(axisY, ds.velocity.y * 0.5);
        momentumQuat.multiply(qy);
        ds.rotation.premultiply(momentumQuat);
        ds.velocity.multiplyScalar(MOMENTUM_DECAY);
      }
    }

    // Compose final rotation: auto-rotation * drag rotation
    const autoQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      ds.autoAngle
    );
    const finalQuat = autoQuat.clone().multiply(ds.rotation);
    const rotMatrix = new THREE.Matrix4().makeRotationFromQuaternion(finalQuat);
    mat.uniforms.uDragRotation.value.copy(rotMatrix);

    // Update pointer
    mat.uniforms.uPointer.value.copy(pointerNDC.current);
  });

  // Track cursor globally so particles follow pointer across the entire page
  useEffect(() => {
    const canvas = gl.domElement;
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerNDC.current.set(nx, ny, 1).normalize();
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [gl]);

  // Pointer handlers (desktop via R3F events)
  const onPointerDown = useCallback((e: THREE.Event) => {
    const event = e as unknown as { pointerId: number; point: THREE.Vector3; nativeEvent: PointerEvent };
    const ds = dragState.current;
    ds.isDragging = true;
    ds.prevPointer.set(event.nativeEvent.clientX, event.nativeEvent.clientY);
    ds.velocity.set(0, 0);

    // Capture pointer on the canvas element
    const target = event.nativeEvent.target as HTMLElement;
    if (target && target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }
  }, []);

  const onPointerUp = useCallback(() => {
    dragState.current.isDragging = false;
  }, []);

  const onPointerMove = useCallback(
    (e: THREE.Event) => {
      const event = e as unknown as { nativeEvent: PointerEvent };
      const ds = dragState.current;

      if (ds.isDragging) {
        const clientX = event.nativeEvent.clientX;
        const clientY = event.nativeEvent.clientY;
        const dx = (clientX - ds.prevPointer.x) * DRAG_SENSITIVITY;
        const dy = (clientY - ds.prevPointer.y) * DRAG_SENSITIVITY;

        const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx);
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy);
        const combined = qx.multiply(qy);

        ds.rotation.premultiply(combined);
        ds.velocity.set(dx, dy);
        ds.prevPointer.set(clientX, clientY);
      }
    },
    []
  );

  // Touch handlers: raycast to only capture drags that start on the sphere
  useEffect(() => {
    const canvas = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const touchNDC = new THREE.Vector2();

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !meshRef.current) return;
      const touch = e.touches[0];

      // Raycast to check if the finger landed on the sphere hitbox
      const rect = canvas.getBoundingClientRect();
      touchNDC.set(
        ((touch.clientX - rect.left) / rect.width) * 2 - 1,
        -((touch.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(touchNDC, camera);
      if (raycaster.intersectObject(meshRef.current).length === 0) return;

      // Touch hit the sphere — claim this gesture
      e.preventDefault();
      const ds = dragState.current;
      ds.isDragging = true;
      ds.prevPointer.set(touch.clientX, touch.clientY);
      ds.velocity.set(0, 0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const ds = dragState.current;
      if (!ds.isDragging || e.touches.length !== 1) return;

      e.preventDefault(); // prevent scroll while dragging sphere
      const touch = e.touches[0];
      const dx = (touch.clientX - ds.prevPointer.x) * DRAG_SENSITIVITY;
      const dy = (touch.clientY - ds.prevPointer.y) * DRAG_SENSITIVITY;

      const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx);
      const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy);
      const combined = qx.multiply(qy);

      ds.rotation.premultiply(combined);
      ds.velocity.set(dx, dy);
      ds.prevPointer.set(touch.clientX, touch.clientY);

      // Update pointer position for plume targeting
      const rect = canvas.getBoundingClientRect();
      const nx = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      pointerNDC.current.set(nx, ny, 1).normalize();
    };

    const handleTouchEnd = () => {
      dragState.current.isDragging = false;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [gl, camera]);

  return (
    <group scale={groupScale}>
      {/* Invisible mesh for pointer events */}
      <mesh
        ref={meshRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerUp}
      >
        <sphereGeometry args={[SPHERE_RADIUS * 1.2, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Particle system */}
      <points geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
