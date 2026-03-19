export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uPointer;
  uniform mat4 uDragRotation;
  uniform vec3 uLeakOrigin;
  uniform float uPixelRatio;
  uniform float uShellPointSize;
  uniform float uLeakPointSize;
  uniform float uBreathingAmplitude;
  uniform float uLeakSpeed;
  uniform float uLeakTravelDistance;
  uniform float uLeakTurbulence;
  uniform float uCursorBrightness;
  uniform float uSphereRadius;
  uniform float uLeakConeAngle;
  uniform float uMagneticStrength;

  attribute float aRandom;
  attribute float aPhase;
  attribute float aLeakFactor; // 0 = shell particle, >0 = leak particle (lifecycle speed)
  attribute vec2 aConeOffset; // per-particle random offset within emission cone

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float isLeak = step(0.001, aLeakFactor);

    // Apply drag rotation to the base position and leak origin
    vec3 rotatedPos = (uDragRotation * vec4(pos, 1.0)).xyz;
    vec3 rotatedLeakOrigin = (uDragRotation * vec4(uLeakOrigin, 1.0)).xyz;

    vec3 finalPos;
    float alpha = 1.0;
    vec3 color;

    if (isLeak > 0.5) {
      // --- Leak particle (smoke cone) ---
      float lifecycle = fract((uTime * uLeakSpeed + aPhase) / aLeakFactor);

      // Base direction: outward from leak origin
      vec3 leakDir = normalize(rotatedLeakOrigin);

      // Build a local frame around leakDir for cone spread
      vec3 perp1 = normalize(cross(leakDir, vec3(0.0, 1.0, 0.001)));
      vec3 perp2 = cross(leakDir, perp1);

      // Cone spread: offset the direction within a cone
      float coneR = uLeakConeAngle * sqrt(aRandom); // sqrt for uniform disk distribution
      float coneAngle = aConeOffset.x * 6.28318;
      vec3 coneDir = normalize(
        leakDir + perp1 * (sin(coneAngle) * coneR) + perp2 * (cos(coneAngle) * coneR)
      );

      // Smoke turbulence: increases with distance
      float turbScale = lifecycle * lifecycle; // stronger further out
      float turb1 = sin(uTime * 1.3 + aPhase * 6.28 + lifecycle * 4.0) * uLeakTurbulence * turbScale;
      float turb2 = cos(uTime * 0.9 + aPhase * 6.28 + lifecycle * 3.0 + 2.0) * uLeakTurbulence * turbScale;
      float turb3 = sin(uTime * 1.7 + aRandom * 6.28 + lifecycle * 5.0) * uLeakTurbulence * turbScale * 0.5;

      // Position along the cone with deceleration (smoke slows down)
      float dist = lifecycle * uLeakTravelDistance * (1.0 - lifecycle * 0.4);
      finalPos = rotatedLeakOrigin * uSphereRadius
        + coneDir * dist
        + perp1 * turb1
        + perp2 * turb2
        + leakDir * turb3;

      // Smoke fade: quick rise, slow fade
      float fadeIn = smoothstep(0.0, 0.1, lifecycle);
      float fadeOut = 1.0 - smoothstep(0.3, 1.0, lifecycle);
      alpha = fadeIn * fadeOut * (0.4 + aRandom * 0.3);

      // Size: grows as smoke disperses, then fades
      float sizeMod = smoothstep(0.0, 0.3, lifecycle) * (1.0 - lifecycle * 0.3);
      gl_PointSize = uLeakPointSize * uPixelRatio * (0.4 + sizeMod * 1.2) * (0.6 + aRandom * 0.4);

      // Color: accent blue → darker blue as it fades
      vec3 blueStart = vec3(0.35, 0.69, 1.0);  // #59b0ff
      vec3 blueEnd = vec3(0.10, 0.23, 0.36);    // #1a3a5c
      color = mix(blueStart, blueEnd, lifecycle);
    } else {
      // --- Shell particle ---
      float breathe = sin(uTime * 1.2 + aPhase * 6.28) * uBreathingAmplitude;
      finalPos = rotatedPos * (uSphereRadius + breathe);

      // Magnetic pull: displace shell particles toward cursor
      vec3 particleNormal = normalize(rotatedPos);
      float facing = max(dot(particleNormal, normalize(uPointer)), 0.0);
      float magneticPull = facing * facing * facing * uMagneticStrength;
      finalPos += normalize(uPointer) * magneticPull * 0.15;

      // Cursor brightness boost
      float boost = facing * facing * uCursorBrightness;

      alpha = 0.5 + aRandom * 0.3 + boost;
      color = vec3(0.94, 0.94, 0.94) + vec3(boost * 0.3);

      gl_PointSize = uShellPointSize * uPixelRatio * (0.6 + aRandom * 0.4);
    }

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuate size by distance
    gl_PointSize *= (1.0 / -mvPosition.z);

    vColor = color;
    vAlpha = alpha;
  }
`;

export const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;

    // Softer falloff for smokier look
    float softEdge = 1.0 - smoothstep(0.15, 0.5, dist);
    softEdge *= softEdge; // extra soft

    gl_FragColor = vec4(vColor, vAlpha * softEdge);
  }
`;
