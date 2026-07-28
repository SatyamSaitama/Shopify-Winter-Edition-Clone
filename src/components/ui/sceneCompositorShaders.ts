import * as THREE from "three";

/**
 * Full-screen vertex stage used to adapt the captured postprocessing
 * `mainImage` effects to a plain Three.js ShaderMaterial.
 *
 * `position` and `uv` are deliberately not declared here: ShaderMaterial (as
 * opposed to RawShaderMaterial) already prepends them, so redeclaring makes
 * the GLSL3 program fail to compile with a `redefinition` error.
 */
export const fullscreenVertexShader = `
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

/**
 * Captured verbatim from Background-63vTryKN.js. Only the small GLSL entry
 * point at the bottom is added so the postprocessing effect can run in a
 * standalone full-screen material.
 */
export const crossfadeFragmentShader = `
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform sampler2D tMudNormal;
uniform sampler2D tNoise;
uniform float uProgress;
uniform float uAspect;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uIsHero;
uniform float uIsFallback;
uniform mat4 uProjectionView;
uniform vec3 uFadeCenterPoint;
uniform float uDarken;

in vec2 vUv;
out vec4 fragColor;

// Sample pre-computed noise texture (normalized to [-1, 1])
float sampleNoise(vec2 uv) {
  return texture(tNoise, uv).r * 2.0 - 1.0;
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  bool isHero = uIsHero > 0.5;
  bool isFallback = uIsFallback > 0.5;

  // Progress smoothing differs between modes
  float progress = isHero ? smoothstep(0.0, 1.5, uProgress) : uProgress;

  // Project 3D fade center point to screen space (fallback uses fixed center)
  vec2 sceneCenter;
  if (isFallback) {
    sceneCenter = vec2(0.5, 0.65);
  } else {
    vec4 clipPos = uProjectionView * vec4(uFadeCenterPoint, 1.0);
    sceneCenter = (clipPos.xy / clipPos.w) * 0.5 + 0.5;
  }

  // UV transformation (fancy mode has zoom effect centered on 3D scene origin)
  vec2 currentUV = uv;
  vec2 nextUV = uv;
  if (isHero) {
    currentUV = (uv - sceneCenter) * (1.0 - smoothstep(0.2, 1.0, uProgress) * 0.1) + sceneCenter;
    nextUV = (uv - sceneCenter) * (1.0 + smoothstep(0.8, 0.0, uProgress) * 0.1) + sceneCenter;
  } else {
    if (isFallback) {
      currentUV.y -= easeInOutCubic(uProgress) * 0.1;
      nextUV.y += easeInOutCubic(1.0-uProgress) * 0.1;
    }
  }

  vec4 current = texture(tCurrent, currentUV);
  vec4 next = texture(tNext, nextUV);

  // Edge detection using hardware derivatives (fwidth) - only compute during transitions
  vec3 currentEdges = vec3(0.0);
  vec3 nextEdges = vec3(0.0);
  if (uProgress > 0.01 && uProgress < 0.99 || uDarken > 0.001) {
    float currentLuma = dot(current.rgb, vec3(0.299, 0.587, 0.114));
    currentEdges = vec3(fwidth(currentLuma) * mix(5.0, 10.0, progress));
    float nextLuma = dot(next.rgb, vec3(0.299, 0.587, 0.114));
    nextEdges = vec3(fwidth(nextLuma) * mix(5.0, 10.0, 1.0 - progress));
  }

  // Mud normal offset
  vec3 mudNormal = texture(tMudNormal, uv * 2.0).rgb;
  float mudStrength = isHero ? mix(0.2, 0.4, 0.5 + 0.5 * sin(uTime - uv.x * 10.0))
                              : mix(0.3, 0.6, 0.5 + 0.5 * sin(uTime - uv.x * 10.0));
  float mudOffset = (mudNormal.r - 0.5) * mudStrength;

  // Noise (sampled from pre-computed texture)
  vec2 aspectUv = vec2(uv.x * uAspect, uv.y) + vec2(0.0, uTime * 0.02);
  float noiseSpeed = isHero ? 0.07 : 0.05;
  float currentNoise = sampleNoise(aspectUv * 0.25 - uTime * noiseSpeed * 0.125);

  // Mask center (hero uses 3D scene center with mouse influence)
  vec2 maskCenter = isHero ? mix(sceneCenter, uMouse, 0.1) : vec2(0.5);

  // Threshold calculation
  float threshold;
  if (isHero) {
    // Aspect-correct the distance for circular (not oval) reveal
    float dist = length((uv - maskCenter) * vec2(uAspect, 1.0)) * 0.8;
    threshold = mix(dist, uv.x, smoothstep(0.6, -0.4, abs(uv.x-sceneCenter.x)) * mix(0.0, 0.4, smoothstep(0.05, 0.5, progress)));
    threshold = mix(threshold, 0.0, smoothstep(0.9, 1.0, uProgress));
  } else {
    float ease = mix(progress * progress * (3.0 - 2.0 * progress), progress, 0.25);
    threshold = mix(uv.y, uv.x, smoothstep(0.6, -0.4, abs(uv.x-0.5)) * 0.5);
    progress = ease; // Use eased progress for simple mode
  }
  threshold = threshold * 2.0 - 1.0;
  threshold = threshold / 1.2 + currentNoise * 0.2 + mudOffset;
  threshold = threshold * 0.5 + 0.5;

  float edge = progress - threshold;
  float aa = fwidth(edge) * 10.0;
  float blendFactor = smoothstep(-aa, aa, edge);

  // Edge mixing
  current = mix(current, vec4(currentEdges, 1.0), smoothstep(0.0, 0.5, progress));
  next = mix(next, vec4(nextEdges, 1.0), smoothstep(0.2, 0.8, 1.0 - progress));

  if (uDarken > 0.001) {
    current = mix(current, vec4(0.02 * uDarken + currentEdges * 0.1, 1.0), uDarken);
  }

  outputColor = mix(current, next, blendFactor);

  // Glow effect
  float glowStrength = isHero ? mix(40.0, 8.0, smoothstep(0.05, 0.25, progress)) : mix(2.0, 10.0, 0.5);
  float glowThreshold = isHero ? glowStrength * 0.001 : 0.003;
  float glowFactor = smoothstep(0.0, glowThreshold, abs(edge));
  float glowMult = isHero ? mix(glowStrength * 0.5, glowStrength, 0.5 + 0.5 * currentNoise * sin(uTime + uv.x * 10.0))
                          : mix(2.0, 10.0, 0.5 + 0.5 * currentNoise * sin(uTime + uv.x * 10.0));
  outputColor = mix(outputColor, outputColor * glowMult, 1.0 - glowFactor);
}

void main() {
  mainImage(vec4(0.0), vUv, fragColor);
}
`;

/**
 * Captured overlay effect. It follows the crossfade and receives the
 * crossfade output as tInput.
 */
export const overlayFragmentShader = `
precision highp float;

uniform sampler2D tInput;
uniform sampler2D tMudNormal;
uniform sampler2D tNoise;
uniform float uPosition; // -1 = fully out, 0 = fully covering, 1 = fully out (other side)
uniform float uTime;
uniform vec3 uColor;
uniform vec2 uResolution;

in vec2 vUv;
out vec4 fragColor;

// Sample pre-computed noise texture (normalized to [-1, 1])
float sampleNoise(vec2 uv) {
  return texture(tNoise, uv).r * 2.0 - 1.0;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Early out if overlay is fully off-screen (|position| >= 1)
  if (abs(uPosition) >= 1.0) {
    outputColor = inputColor;
    return;
  }

  // Mud texture for organic variation
  vec3 mudNormal = texture(tMudNormal, uv * 2.0).rgb;
  float mudOffset = (mudNormal.r - 0.5) * mix(0.3, 0.6, 0.5 + 0.5 * sin(uTime - uv.x * 10.0)) * 0.1;

  // Noise (sampled from pre-computed texture)
  float aspect = uResolution.x / uResolution.y;
  vec2 aspectUv = vec2(uv.x * aspect, uv.y) + vec2(0.0, uTime * 0.02);
  float noiseValue = sampleNoise(aspectUv * 0.375 - uTime * 0.00625);

  // Diagonal/curved wipe pattern
  float threshold = mix(uv.y, uv.x, smoothstep(0.6, -0.4, abs(uv.x - 0.4)) * 0.5);
  threshold = threshold * 2.0 - 1.0;
  threshold = threshold / 1.2 + noiseValue * 0.2 + mudOffset;
  threshold = threshold * 0.5 + 0.5;

  // Map position from -1 to 1 range:
  // -1 to 0: wipe in, 0 to 1: wipe out with reversed threshold
  float progress;
  float thresholdFinal = threshold;
  if (uPosition <= 0.0) {
    progress = uPosition + 1.0;
  } else {
    progress = 1.0 - uPosition;
    thresholdFinal = 1.0 - threshold;
  }

  // Sharp edge transition
  float edge = progress - thresholdFinal;
  float aa = fwidth(edge) * 10.0;
  float alpha = smoothstep(-aa, aa, edge);

  // Glow at edge
  float glowFactor = smoothstep(0.0, 0.005, abs(edge));
  vec3 color = pow(uColor, vec3(2.2));
  color = mix(color, color * mix(2.0, 4.0, 0.5 + 0.5 * sin(uTime + uv.x * 10.0)), 1.0 - glowFactor);

  outputColor = vec4(mix(inputColor.rgb, color, alpha), 1.0);
}

void main() {
  mainImage(texture(tInput, vUv), vUv, fragColor);
}
`;

const NOISE_SIZE = 256;
const NOISE_PERIOD = 8;
const GRADIENTS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const fade = (value: number) =>
  value * value * value * (value * (value * 6 - 15) + 10);
const lerp = (from: number, to: number, amount: number) =>
  from + amount * (to - from);

/**
 * Port of the captured `oI`/`lI` generator: shuffled 256-entry permutation,
 * tileable Perlin noise, four octaves, a 256px RGBA data texture, repeat wrap,
 * and linear filtering.
 */
export function createCapturedNoiseTexture() {
  const permutation = new Uint8Array(512);
  for (let index = 0; index < 256; index += 1) permutation[index] = index;
  for (let index = 255; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [permutation[index], permutation[swapIndex]] = [
      permutation[swapIndex],
      permutation[index],
    ];
  }
  for (let index = 0; index < 256; index += 1) {
    permutation[256 + index] = permutation[index];
  }

  const gradient = (hash: number, x: number, y: number) => {
    const vector = GRADIENTS[hash & 7];
    return vector[0] * x + vector[1] * y;
  };
  const perlin = (x: number, y: number, period: number) => {
    const floorX = Math.floor(x) & 255;
    const floorY = Math.floor(y) & 255;
    const localX = x - Math.floor(x);
    const localY = y - Math.floor(y);
    const nextX = (floorX + 1) % period;
    const nextY = (floorY + 1) % period;
    const wrappedX = floorX % period;
    const wrappedY = floorY % period;
    const fadeX = fade(localX);
    const fadeY = fade(localY);
    const bottomLeft = permutation[permutation[wrappedX] + wrappedY];
    const topLeft = permutation[permutation[wrappedX] + nextY];
    const bottomRight = permutation[permutation[nextX] + wrappedY];
    const topRight = permutation[permutation[nextX] + nextY];
    const bottom = lerp(
      gradient(bottomLeft, localX, localY),
      gradient(bottomRight, localX - 1, localY),
      fadeX
    );
    const top = lerp(
      gradient(topLeft, localX, localY - 1),
      gradient(topRight, localX - 1, localY - 1),
      fadeX
    );
    return lerp(bottom, top, fadeY);
  };
  const octaveNoise = (x: number, y: number, period: number) => {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    let octavePeriod = period;
    for (let octave = 0; octave < 4; octave += 1) {
      value +=
        amplitude * perlin(x * frequency, y * frequency, octavePeriod);
      amplitude *= 0.5;
      frequency *= 2;
      octavePeriod *= 2;
    }
    return value;
  };

  const data = new Uint8Array(NOISE_SIZE * NOISE_SIZE * 4);
  for (let row = 0; row < NOISE_SIZE; row += 1) {
    for (let column = 0; column < NOISE_SIZE; column += 1) {
      const x = (column / NOISE_SIZE) * NOISE_PERIOD;
      const y = (row / NOISE_SIZE) * NOISE_PERIOD;
      const normalized = (octaveNoise(x, y, NOISE_PERIOD) + 1) * 0.5;
      const byte = Math.floor(Math.max(0, Math.min(255, normalized * 255)));
      const offset = (row * NOISE_SIZE + column) * 4;
      data[offset] = byte;
      data[offset + 1] = byte;
      data[offset + 2] = byte;
      data[offset + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(
    data,
    NOISE_SIZE,
    NOISE_SIZE,
    THREE.RGBAFormat
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
