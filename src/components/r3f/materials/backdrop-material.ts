import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// Five (top, bottom) color keyframes at progress 0.0 / 0.2 / 0.45 / 0.7 / 1.0.
// The fragment shader picks the two neighbouring keyframes and mixes them by
// smoothstep across their band, then blends top->bottom by vUv.y. A subtle
// time-based shimmer keeps the sky feeling alive.

const TOP_COLORS = [
  new THREE.Color("#0a3a3a"),
  new THREE.Color("#083545"),
  new THREE.Color("#1c1a55"),
  new THREE.Color("#2a1560"),
  // Raw sRGB conversion of CSS --background (oklch(0.145 0.012 260)) = #0e1119.
  // This has NOT been empirically verified against tone-mapped canvas output —
  // gl.toneMapping = THREE.ACESFilmicToneMapping (scene.tsx:36) is expected to
  // shift the rendered value darker/desaturated relative to this raw hex, so a
  // hairline may still be visible at the seam. A human must sample the live
  // canvas and nudge this value before merge; do not assume it is already
  // correct just because the hex math agrees with --background.
  new THREE.Color("#0e1119"),
];
const BOT_COLORS = [
  new THREE.Color("#04081a"),
  new THREE.Color("#1a0940"),
  new THREE.Color("#4a1f3d"),
  new THREE.Color("#5a2a5c"),
  // See TOP_COLORS final entry: same unverified raw conversion, same caveat.
  new THREE.Color("#0e1119"),
];
const STOPS = [0.0, 0.2, 0.45, 0.7, 1.0];

export const BackdropMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uTopA: TOP_COLORS[0].clone(),
    uTopB: TOP_COLORS[1].clone(),
    uBotA: BOT_COLORS[0].clone(),
    uBotB: BOT_COLORS[1].clone(),
    uBlend: 0,
  },
  // Vertex shader
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  /* glsl */ `
    uniform vec3 uTopA;
    uniform vec3 uTopB;
    uniform vec3 uBotA;
    uniform vec3 uBotB;
    uniform float uBlend;
    uniform float uTime;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec3 top = mix(uTopA, uTopB, uBlend);
      vec3 bot = mix(uBotA, uBotB, uBlend);
      float y = smoothstep(0.0, 1.0, vUv.y);
      vec3 color = mix(bot, top, y);
      // Subtle film noise, ~1% amplitude, slowly evolving.
      float n = hash(vUv * 800.0 + uTime * 0.05);
      color += (n - 0.5) * 0.012;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
);

/**
 * Given a global scroll progress (0..1), returns which keyframe pair to blend
 * between and the smoothstep t across their band.
 */
export function pickBackdropKeyframes(progress: number): {
  topA: THREE.Color;
  topB: THREE.Color;
  botA: THREE.Color;
  botB: THREE.Color;
  blend: number;
} {
  const p = Math.max(0, Math.min(1, progress));
  // Find the interval [STOPS[i], STOPS[i+1]] that contains p.
  let i = 0;
  for (let k = 0; k < STOPS.length - 1; k++) {
    if (p >= STOPS[k] && p <= STOPS[k + 1]) {
      i = k;
      break;
    }
  }
  const t = (p - STOPS[i]) / (STOPS[i + 1] - STOPS[i]);
  // Smoothstep for a gentler transition than raw linear.
  const s = t * t * (3 - 2 * t);
  return {
    topA: TOP_COLORS[i],
    topB: TOP_COLORS[i + 1],
    botA: BOT_COLORS[i],
    botB: BOT_COLORS[i + 1],
    blend: s,
  };
}
