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
  uniform float uPlumeLift;
  uniform float uPlumeCursorPull;
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
      // Compact plume that hugs the upper hemisphere.
      float lifecycle = fract((uTime * uLeakSpeed + aPhase) / aLeakFactor);
      vec3 pointerDir = normalize(uPointer);
      vec3 leakDir = normalize(rotatedLeakOrigin);
      vec3 plumeDir = normalize(mix(leakDir, sphereUp, uPlumeLift));

      vec3 guideAxis = abs(plumeDir.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
      vec3 perp1 = normalize(cross(plumeDir, guideAxis));
      vec3 perp2 = normalize(cross(plumeDir, perp1));

      float coneR = uLeakConeAngle * mix(0.18, 1.0, sqrt(aConeOffset.y));
      float coneAngle = aConeOffset.x * 6.28318;
      vec3 coneDir = normalize(
        plumeDir + perp1 * (sin(coneAngle) * coneR) + perp2 * (cos(coneAngle) * coneR)
      );
      float cursorPull = smoothstep(0.08, 0.95, lifecycle) * uPlumeCursorPull;
      vec3 guidedDir = normalize(mix(coneDir, pointerDir, cursorPull));

      float driftScale = 0.16 + lifecycle * 0.68;
      float drift1 = sin(uTime * 0.7 + aPhase * 6.28 + lifecycle * 4.5) * uLeakTurbulence * driftScale;
      float drift2 = cos(uTime * 1.0 + aRandom * 6.28 + lifecycle * 3.5) * uLeakTurbulence * driftScale * 0.8;
      float liftJitter = sin(uTime * 1.15 + aConeOffset.y * 6.28 + lifecycle * 5.0) * uLeakTurbulence * lifecycle * 0.4;
      float driftFade = 1.0 - cursorPull * 0.7;

      float dist = lifecycle * uLeakTravelDistance;
      finalPos = rotatedLeakOrigin * (uSphereRadius + 0.015)
        + guidedDir * dist
        + perp1 * drift1 * driftFade
        + perp2 * drift2 * driftFade
        + sphereUp * liftJitter * (1.0 - cursorPull * 0.35);

      float fadeIn = smoothstep(0.0, 0.1, lifecycle);
      float fadeOut = 1.0 - smoothstep(0.78, 1.0, lifecycle);
      float coreGlow = 1.0 - smoothstep(0.1, 0.4, lifecycle);
      alpha = fadeIn * fadeOut * (0.3 + coreGlow * 0.14);

      float sizeFade = mix(1.08, 0.94, lifecycle);
      gl_PointSize = uLeakPointSize * uPixelRatio * sizeFade * (0.92 + aRandom * 0.12);

      vec3 blueStart = vec3(0.62, 0.88, 1.0);
      vec3 blueMid = vec3(0.39, 0.69, 0.96);
      vec3 blueEnd = vec3(0.12, 0.23, 0.34);
      color = mix(blueStart, blueMid, smoothstep(0.08, 0.42, lifecycle));
      color = mix(color, blueEnd, smoothstep(0.42, 1.0, lifecycle));
      color += coreGlow * vec3(0.12, 0.17, 0.2);
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
