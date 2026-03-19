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
  uniform float uLeakTurbulence;
  uniform float uCursorBrightness;
  uniform float uSphereRadius;
  uniform float uPlumeArcHeight;
  uniform float uPlumePathSpread;
  uniform float uPlumeArrivalShrink;
  uniform float uMagneticStrength;

  attribute float aRandom;
  attribute float aPhase;
  attribute float aLeakFactor; // 0 = shell particle, >0 = leak particle (lifecycle speed)
  attribute vec2 aConeOffset; // per-particle random offset within emission cone

  varying vec3 vColor;
  varying float vAlpha;
  varying float vKind;

  void main() {
    vec3 pos = position;
    float isLeak = step(0.001, aLeakFactor);

    // Apply drag rotation to the base position and leak origin
    vec3 rotatedPos = (uDragRotation * vec4(pos, 1.0)).xyz;
    vec3 rotatedLeakOrigin = (uDragRotation * vec4(uLeakOrigin, 1.0)).xyz;
    vec3 sphereUp = normalize((uDragRotation * vec4(0.0, 1.0, 0.0, 0.0)).xyz);

    vec3 finalPos;
    float alpha = 1.0;
    vec3 color;

    if (isLeak > 0.5) {
      // --- Magnetic arc: particles fly from emission origin to cursor ---
      float lifecycle = fract((uTime * uLeakSpeed + aPhase) / aLeakFactor);

      // P0: emission point on sphere surface
      vec3 P0 = rotatedLeakOrigin * (uSphereRadius + 0.015);

      // P2: cursor target projected onto sphere surface
      vec3 cursorTarget = normalize(uPointer) * uSphereRadius;

      // Control point P1: lifted midpoint with per-particle spread
      vec3 midpoint = (P0 + cursorTarget) * 0.5;
      float chordLen = max(length(cursorTarget - P0), 0.001);
      vec3 liftDir = normalize(midpoint);

      // Tangent frame at midpoint for lateral path variation
      vec3 chord = normalize(cursorTarget - P0 + vec3(0.0001));
      vec3 lateralA = normalize(cross(chord, liftDir));
      vec3 lateralB = normalize(cross(chord, lateralA));

      // Per-particle path variation from aConeOffset
      float spreadAngle = (aConeOffset.x - 0.5) * 6.28318;
      float spreadMag = aConeOffset.y * uPlumePathSpread * chordLen;
      vec3 lateralOffset = (lateralA * sin(spreadAngle) + lateralB * cos(spreadAngle)) * spreadMag;

      float arcHeight = uPlumeArcHeight * chordLen;
      vec3 P1 = midpoint + liftDir * arcHeight + lateralOffset;

      // Quadratic Bezier: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
      float t = lifecycle;
      float omt = 1.0 - t;
      vec3 bezierPos = omt * omt * P0 + 2.0 * omt * t * P1 + t * t * cursorTarget;

      // Turbulence perpendicular to path, decaying near arrival
      vec3 tangent = normalize(-2.0 * omt * P0 + 2.0 * (1.0 - 2.0 * t) * P1 + 2.0 * t * cursorTarget);
      vec3 upRef = abs(tangent.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
      vec3 driftBasisA = normalize(cross(tangent, upRef));
      vec3 driftBasisB = normalize(cross(tangent, driftBasisA));

      float turbulenceFade = 1.0 - smoothstep(0.5, 0.95, lifecycle);
      float driftScale = turbulenceFade * (0.2 + lifecycle * 0.5);

      float drift1 = sin(uTime * 0.7 + aPhase * 6.28 + lifecycle * 4.5)
                    * uLeakTurbulence * driftScale;
      float drift2 = cos(uTime * 1.0 + aRandom * 6.28 + lifecycle * 3.5)
                    * uLeakTurbulence * driftScale * 0.8;
      float drift3 = sin(uTime * 1.15 + aConeOffset.y * 6.28 + lifecycle * 5.0)
                    * uLeakTurbulence * driftScale * 0.4;

      finalPos = bezierPos
               + driftBasisA * drift1
               + driftBasisB * drift2
               + liftDir * drift3;

      // Alpha: fade in at birth, fade out on arrival
      float fadeIn = smoothstep(0.0, 0.08, lifecycle);
      float fadeOut = 1.0 - smoothstep(0.75, 1.0, lifecycle);
      float coreGlow = 1.0 - smoothstep(0.05, 0.3, lifecycle);
      alpha = fadeIn * fadeOut * (0.35 + coreGlow * 0.15);

      // Point size: shrink near arrival for absorption effect
      float arrivalShrink = 1.0 - smoothstep(uPlumeArrivalShrink, 1.0, lifecycle);
      float sizeFade = mix(1.08, 0.6, lifecycle) * arrivalShrink;
      gl_PointSize = uLeakPointSize * uPixelRatio * sizeFade * (0.92 + aRandom * 0.12);

      // Color: blue gradient with convergence glow
      vec3 blueStart = vec3(0.62, 0.88, 1.0);
      vec3 blueMid   = vec3(0.39, 0.69, 0.96);
      vec3 blueEnd   = vec3(0.12, 0.23, 0.34);
      color = mix(blueStart, blueMid, smoothstep(0.08, 0.42, lifecycle));
      color = mix(color, blueEnd, smoothstep(0.42, 1.0, lifecycle));
      color += coreGlow * vec3(0.12, 0.17, 0.2);

      float convergenceGlow = smoothstep(0.5, 0.9, lifecycle) * (1.0 - smoothstep(0.9, 1.0, lifecycle));
      color += convergenceGlow * vec3(0.08, 0.12, 0.18);
    } else {
      float breathe = sin(uTime * 0.45 + aPhase * 6.28) * uBreathingAmplitude;
      finalPos = rotatedPos * (uSphereRadius + breathe * (0.7 + aRandom * 0.3));

      float lowerBias = smoothstep(-0.85, 0.2, -rotatedPos.y);
      float frontBias = smoothstep(-0.2, 0.85, rotatedPos.z);
      float shellBias = lowerBias * 0.65 + frontBias * 0.35;

      vec3 pointerDir = normalize(uPointer);
      vec3 particleNormal = normalize(rotatedPos);
      float facing = max(dot(particleNormal, pointerDir), 0.0);
      float magneticPull = facing * facing * facing * uMagneticStrength;
      finalPos += pointerDir * magneticPull * 0.08;

      float boost = facing * facing * uCursorBrightness;

      alpha = 0.34 + aRandom * 0.2 + shellBias * 0.2 + boost * 0.55;
      color = vec3(0.93, 0.95, 0.99);
      color += shellBias * vec3(0.03, 0.05, 0.09);
      color += boost * vec3(0.05, 0.09, 0.14);

      gl_PointSize = uShellPointSize * uPixelRatio * (0.72 + aRandom * 0.22 + shellBias * 0.08);
    }

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuate size by distance
    gl_PointSize *= (1.0 / -mvPosition.z);
    gl_PointSize = max(gl_PointSize, mix(2.2, 1.7, isLeak));

    vColor = color;
    vAlpha = alpha;
    vKind = isLeak;
  }
`;

export const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vKind;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;

    float shellFalloff = pow(1.0 - smoothstep(0.12, 0.5, dist), 1.9);
    float plumeGlow = pow(1.0 - smoothstep(0.04, 0.5, dist), 1.2);
    float plumeCore = 1.0 - smoothstep(0.0, 0.19, dist);
    float plumeFalloff = max(plumeGlow * 0.96, plumeCore * 0.42);
    float pointAlpha = mix(shellFalloff, plumeFalloff, vKind);

    gl_FragColor = vec4(vColor, vAlpha * pointAlpha);
  }
`;
