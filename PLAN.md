# Hero 3D Particle Sphere Using React Three Fiber + Drei

## Summary
- Replace the static hero image in [`/Volumes/External Drive/Github/Arizmi-Site/components/HeroSection.tsx`](/Volumes/External%20Drive/Github/Arizmi-Site/components/HeroSection.tsx) with a client-only 3D canvas that renders a particle sphere with a visible leak plume.
- Build the scene with `three`, `@react-three/fiber`, and `@react-three/drei`, following the current documented R3F pattern: `Canvas` for the scene, `useFrame` for animation, and pointer events with pointer capture for drag interaction.
- Keep the existing hero copy, CTA, fixed logo, and GSAP scroll behavior intact; only the image layer changes.

## Implementation Changes
- Add a new hero scene component, likely [`/Volumes/External Drive/Github/Arizmi-Site/components/HeroParticleSphere.tsx`](/Volumes/External%20Drive/Github/Arizmi-Site/components/HeroParticleSphere.tsx), loaded with `next/dynamic` and `ssr: false` so WebGL only mounts in the browser.
- Inside the scene:
  - Use `Canvas` from `@react-three/fiber`.
  - Use `useFrame` to animate shell motion, leak emission, fade-out, and eased rotation.
  - Add `AdaptiveDpr` and `AdaptiveEvents` from `@react-three/drei` to keep the hero responsive under load.
- Render the orb as two `<points>` systems backed by `BufferGeometry`:
  - Shell particles distributed on a sphere surface.
  - Leak particles emitted from a single local breach point and recycled from a pool as they drift outward and fade.
- Use a custom particle shader via Drei’s `shaderMaterial` helper rather than a plain `PointMaterial`, because the effect needs per-particle alpha fade, hole masking, leak emphasis, and cursor-reactive brightness.
- Drive interaction through R3F pointer events:
  - Add an invisible interaction mesh around the sphere for `onPointerDown`, `onPointerMove`, and `onPointerUp`.
  - Use pointer capture during drag so the rotation remains stable while the cursor/finger moves.
  - Rotate the sphere in place; the leak anchor remains fixed in the sphere’s local coordinates, so dragging changes where the leak appears on the orb.
- Cursor behavior:
  - Track normalized pointer position in scene state.
  - Increase brightness/turbulence on the facing side of the sphere and subtly bias the idle rotation toward the cursor.
- Visual direction:
  - Black hero panel background.
  - Mostly white particle sphere.
  - Arizmi blue/cyan accents concentrated near the leak and cursor-reactive regions.
- Fallbacks:
  - Reduced motion: lower particle count, weaker auto-motion, no drag, softer pointer response.
  - WebGL failure: show a static styled orb panel so the hero still looks intentional.

## Public Interfaces / Dependencies
- Add runtime dependencies: `three`, `@react-three/fiber`, `@react-three/drei`.
- No route, metadata, SEO, or backend changes.
- Keep any new particle and interaction tuning values internal to the hero scene component; do not introduce a site-wide public config API.

## Test Plan
- Run `npm run ci`.
- Manual desktop checks:
  - Canvas mounts without hydration or console errors.
  - Sphere reacts to cursor hover/movement.
  - Drag rotates the sphere and clearly relocates the leak.
  - CTA, nav, and text overlays remain clickable and readable.
  - Existing GSAP scroll behavior still works.
- Manual mobile/touch checks:
  - Scene renders with lower density.
  - Drag rotates only after intentional movement.
  - Vertical page scroll still works naturally through the hero.
- Resilience checks:
  - Reduced-motion mode uses the toned-down interaction preset.
  - Performance helpers reduce quality under stress instead of stuttering badly.
  - Fallback art appears if WebGL cannot initialize.

## Assumptions And Defaults
- Package choice is locked to `three` + `@react-three/fiber` + `@react-three/drei`; no extra gesture package.
- Drag behavior is rotate-in-place only, not free translation inside the card.
- The hero keeps its current copy/layout structure; this is a media-layer replacement, not a full hero redesign.
- The implementation will follow Context7-backed patterns for `Canvas`, `useFrame`, pointer events, `AdaptiveDpr`, `AdaptiveEvents`, and `shaderMaterial`.
