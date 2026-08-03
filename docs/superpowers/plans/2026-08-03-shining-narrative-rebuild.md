# Shining narrative rebuild implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current tech-glow 3D scroll narrative on `/` with a shining-inspired storybook experience: a low-poly hooded person silhouette with glowing eyes traverses six scroll sections (book intro, four chapters, end scene) against a scroll-driven gradient shader sky, with Bloom + Vignette + Noise post-processing and short poetic overlays.

**Architecture:** Keeps the existing scroll authority (Lenis + GSAP + module-store), the client-only Canvas dynamic import (Next 16 rule), the tier resolver, and the below-fold DOM sections. Replaces every 3D component, the post-processing recipe, the camera keyframes, the HTML overlays, and the story content shape. Six scroll sections × 100vh = 600vh total; each chapter reads its own local progress from `scroll-state`, so per-frame reads never trigger React re-renders.

**Tech Stack:** Next.js 16.2.12 (App Router), React 19.2.4, TypeScript, Tailwind v4 (CSS-first, no config file), `three@0.185`, `@react-three/fiber@9`, `@react-three/drei@10` (`shaderMaterial`, `Float`, `PerformanceMonitor`, `MeshTransmissionMaterial`), `@react-three/postprocessing@3` (Bloom, Vignette, Noise), `gsap@3` + `lenis@1` (already wired). **No new dependencies.**

## Global Constraints

The following apply to every task and are non-negotiable:

- **Copy style:** No em dashes (`—`), no double hyphens (`--`) anywhere in `src/content.ts` or JSX copy. Use commas, semicolons, or periods. Single hyphens for compound modifiers (e.g. "multi-stakeholder", "star-filled") are allowed. This rule is stated at the top of `src/content.ts`.
- **Next.js 16 SSR rule:** `next/dynamic` with `{ ssr: false }` is not allowed in Server Components. The Canvas already lives inside `CanvasRoot` (a Client Component) via this pattern; do not introduce `ssr: false` anywhere else.
- **Force dark theme:** the site is forced dark. Style using existing dark tokens in `src/app/globals.css` (`--background`, `--foreground`, `--muted-foreground`, `--glow`, etc.). Do not add light-mode fallbacks or theme toggles.
- **Tailwind v4:** no `tailwind.config.*` file exists. Do not create one.
- **Content in `src/content.ts` is the source of truth.** Every string that appears on the page must be reachable from `content.ts`. The only hardcoded strings in components are structural UI labels ("Scroll", "See my work", section chapter numbers, etc.).
- **Reduced motion:** the WebGL narrative is not shown at all when `prefers-reduced-motion: reduce` is set. The existing `StaticNarrative` component handles that path. Every content field that Task 1 adds must render correctly in `StaticNarrative` too (see Task 13).
- **Draw-call budget ≤ 20 per chapter.** Backdrop 1, character 4, book 4 (intro only), morph knot 1 → crystal 1 (Ch01), pedestal 2 + Nomo glyph 1 + shafts 2 (Ch02), toolkit icons 6–8 with instancing (Ch03), beacon 3 + particles 1 (Ch04). Well under budget.
- **Frameloop always while narrative visible.** The current `Canvas` already uses `frameloop="always"`; do not change that in this plan.
- **Zero per-frame React re-renders in R3F components.** Every `useFrame` reads from the `scroll-state` module store, not React state.
- **Verification cadence:** the project has no test framework installed (no `test` script, no `jest`/`vitest`). Substitute classic TDD with **`npx tsc --noEmit` → `npm run build` (prerender) → manual browser check** for tasks that produce runtime UI. This is honest for a scroll-driven presentation site and is called out in every task.

---

## File structure

**Create (new files):**
- `src/components/r3f/character.tsx` — person silhouette (cone body, hood head, glowing eyes) built from primitives, nested-group `<Float>` idle motion + outer per-section position/rotation lerp.
- `src/components/r3f/book.tsx` — low-poly book geometry for the intro band.
- `src/components/r3f/backdrop.tsx` — full-screen quad mounting the gradient shader material.
- `src/components/r3f/materials/backdrop-material.ts` — drei `shaderMaterial` factory: five (top, bottom) color keyframes keyed to `uProgress`, `uTime` shimmer.
- `src/components/r3f/end-scene.tsx` — peaceful sunset composition for the end band.
- `src/components/story/book-intro-overlay.tsx` — HTML overlay for the intro band ("Let's explore together…" + scroll cue).
- `src/components/story/end-scene-overlay.tsx` — HTML overlay for the end band ("Let's build something together" + social chips + "See my work" chevron).

**Rewrite (existing files, contents fully replaced):**
- `src/components/r3f/scene.tsx` — new scene composition (backdrop, character, book, four chapter components, end scene, post-fx, camera rig).
- `src/components/r3f/camera-rig.tsx` — six keyframes (one per section), damped position + look-at, light pointer parallax.
- `src/components/r3f/post-processing.tsx` — Bloom + Vignette + Noise (replaces Bloom + DoF + ChromaticAberration).
- `src/components/r3f/chapters/chapter-01-tangle.tsx` — morph-target `LineSegments` (tangled → crystal skeleton) + emerging `MeshTransmissionMaterial` glass icosahedron.
- `src/components/r3f/chapters/chapter-02-pedestal.tsx` — low-poly pedestal + abstract Nomo torus-knot glyph + two warm-golden additive light shafts.
- `src/components/r3f/chapters/chapter-03-toolkit.tsx` (RENAMED from `chapter-03-grid.tsx` via `git mv`) — 6 low-poly abstract skill-shapes floating in a ring; each illuminates in sequence.
- `src/components/r3f/chapters/chapter-04-horizon.tsx` — ascending pillar of light, dual paths hint, particle orbs rising.
- `src/components/story/story-overlay.tsx` — six sections (intro + Ch01–Ch04 + end).
- `src/components/story/chapter-copy.tsx` — renders `poem[]` primary + optional `spec` pill row + optional `cta` link.
- `src/components/story/static-narrative.tsx` — renders `poem[]` alongside `lines[]` for the no-canvas fallback path.
- `src/content.ts` — add `poem?: string[]` to `StoryBeat`, add intro beat (index 0) and end beat (index 5), refresh Ch01–Ch04 with poem strings and Ch04 spec pill copy.

**Modify (surgical edits):**
- `src/components/scroll/scroll-state.ts` — bump `CHAPTER_COUNT` from 4 to 6 (intro + 4 chapters + end); update the docstring to note "section" semantics. Function name `chapterLocalProgress` stays for continuity — "chapter" here means "narrative section."
- `src/components/story/chapter-rail.tsx` — pass through the new 6-entry `story.map(s => s.label)`; no code changes needed (already generic). Just verify the visual labels look right.

**Retire (delete):**
- `src/components/story/landing-hero.tsx` — replaced by the book intro composition (3D book + HTML overlay).
- `src/components/r3f/materials/line-morph-material.ts` — replaced by native `morphAttributes` on `LineSegments` (see Task 5).

**Do NOT touch:**
- `src/components/scroll/lenis-provider.tsx`
- `src/hooks/use-device-capability.ts`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `src/components/sections/projects.tsx`, `certifications.tsx`, `contact.tsx`
- `src/app/projects/nomo/page.tsx`, `src/app/projects/kling/page.tsx`
- `src/components/site-header.tsx`, `site-footer.tsx`
- `src/components/experience.tsx` (already composes the pieces correctly; no changes needed)
- `assets/`, `public/kling/`

---

## Task 1: Update content + scroll-state to six sections

**Files:**
- Modify: `src/content.ts` (add `poem?` field, insert intro beat at index 0, insert end beat at index 5, refresh Ch01–Ch04 poems, add Ch04 spec pill).
- Modify: `src/components/scroll/scroll-state.ts` (bump `CHAPTER_COUNT` from 4 to 6, update docstring).
- Modify: `src/components/r3f/chapters/chapter-01-tangle.tsx` (shift `chapterLocalProgress(0)` → `chapterLocalProgress(1)`).
- Modify: `src/components/r3f/chapters/chapter-02-pedestal.tsx` (`1` → `2`).
- Modify: `src/components/r3f/chapters/chapter-03-grid.tsx` (`2` → `3`).
- Modify: `src/components/r3f/chapters/chapter-04-horizon.tsx` (`3` → `4`).

**Interfaces:**
- Consumes: nothing (foundation task).
- Produces:
  - `StoryBeat` type now has optional `poem?: string[]`.
  - `story` array now has 6 entries (indices 0-5): intro, Ch01, Ch02, Ch03, Ch04, end. Every subsequent task reads from these.
  - `scrollState.chapter` now ranges 0..5. `chapterLocalProgress(index)` accepts 0..5.

- [ ] **Step 1: Add the `poem` field to `StoryBeat` type**

Open `src/content.ts`. Find the `StoryBeat` type (around line ~250 based on Kling additions). It currently has `kicker`, `label`, `title`, `lines`, `skills?`, `spec?`, `cta?`. Add an optional `poem?: string[]` field:

```ts
export type StoryBeat = {
  kicker: string;
  label: string;
  title: string;
  lines: string[];
  skills?: string[];
  /** Optional tag row rendered as small pill badges (e.g. tech stack). */
  spec?: string[];
  cta?: { label: string; href: string; external?: boolean };
  /** Short poetic overlay lines rendered as thin serif in the shining narrative. */
  poem?: string[];
};
```

- [ ] **Step 2: Insert the intro beat at index 0 of `story`**

Find `export const story: StoryBeat[] = [` in `src/content.ts`. Insert this new beat BEFORE the current first entry (Chapter 01):

```ts
  {
    kicker: "Intro",
    label: "Begin",
    title: "A small journey, told in six scenes.",
    lines: [
      "A hooded silhouette stands beside a small glowing book. Scroll or tap the book to begin.",
    ],
    poem: ["Let's explore together..."],
  },
```

- [ ] **Step 3: Add `poem` and refresh copy for Ch01–Ch04 in `story`**

For each existing beat in `story`, add a `poem` field. Do NOT delete `title` or `lines` — they still surface in the below-fold static fallback. Update in place:

Chapter 01 (currently `label: "What I do"`):
```ts
    poem: [
      "I gave the chaos a name...",
      "I turned tangled lines into solid forms.",
    ],
    spec: ["Business analysis", "Public sector", "Requirements to shippable software"],
```

Chapter 02 (`label: "What drives me"`):
```ts
    poem: [
      "Building things makes me whole.",
      "Nomo was the first spark.",
    ],
```
Chapter 02 already has `spec` (Node.js etc.) and `cta` (Try Nomo). Keep them.

Chapter 03 (`label: "My toolkit"`):
```ts
    poem: [
      "I gathered tools along the way...",
      "Each one a small, shining star.",
    ],
```
Chapter 03 already has `skills: about.skills`. Keep it.

Chapter 04 (`label: "What is next"`):
```ts
    poem: [
      "Now I seek a higher vantage point...",
      "To build, to lead, to grow.",
    ],
    spec: ["Product management growth", "CCA leadership", "Studying Claude Certified Architect"],
```
Chapter 04 already has `cta: { label: "Get in touch", href: "#contact" }`. Keep it.

- [ ] **Step 4: Insert the end beat at index 5 of `story`**

After the current Chapter 04 entry, add:

```ts
  {
    kicker: "End",
    label: "Reach out",
    title: "Let's build something together.",
    lines: [
      "Open to product roles and to conversations about building useful things.",
    ],
    poem: ["Let's build something together."],
    cta: { label: "See my work", href: "#projects" },
  },
```

- [ ] **Step 5: Bump `CHAPTER_COUNT` in `scroll-state.ts`**

Open `src/components/scroll/scroll-state.ts`. Change:

```ts
export const CHAPTER_COUNT = 4;
```
to:
```ts
// "Chapter" here means "narrative section" — includes the intro and end scenes
// alongside the four literal chapters, totalling six sections × 100vh = 600vh.
export const CHAPTER_COUNT = 6;
```

Also update the docstring on the `chapter` field of `ScrollState`:
```ts
  /** Active section index, 0..CHAPTER_COUNT-1 (0=intro, 1-4=chapters, 5=end). */
  chapter: number;
```

Nothing else in this file changes — `setProgress`, `chapterLocalProgress`, and the listener plumbing are all correct for any `CHAPTER_COUNT`.

- [ ] **Step 6: Shift chapter indices in the existing four chapter files**

The existing chapter components hardcode their section index. Since intro now takes slot 0, each chapter shifts by +1:

- `src/components/r3f/chapters/chapter-01-tangle.tsx`: find `chapterLocalProgress(0)` → change to `chapterLocalProgress(1)`.
- `src/components/r3f/chapters/chapter-02-pedestal.tsx`: `chapterLocalProgress(1)` → `chapterLocalProgress(2)`.
- `src/components/r3f/chapters/chapter-03-grid.tsx`: `chapterLocalProgress(2)` → `chapterLocalProgress(3)`.
- `src/components/r3f/chapters/chapter-04-horizon.tsx`: `chapterLocalProgress(3)` → `chapterLocalProgress(4)`.

These four chapter files will be fully rewritten in Tasks 5–8. This mechanical shift keeps the intermediate state (Tasks 1–4) buildable.

- [ ] **Step 7: Typecheck**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 8: Build to confirm prerender still works**

```bash
npm run build 2>&1 | tail -12
```

Expected: `/` and `/projects/nomo` and `/projects/kling` all prerender static.

- [ ] **Step 9: Commit**

```bash
git add src/content.ts src/components/scroll/scroll-state.ts src/components/r3f/chapters/chapter-01-tangle.tsx src/components/r3f/chapters/chapter-02-pedestal.tsx src/components/r3f/chapters/chapter-03-grid.tsx src/components/r3f/chapters/chapter-04-horizon.tsx
git commit -m "Extend story to six sections for shining rebuild

Adds poem field to StoryBeat and inserts intro and end beats at
the start and end of story. Bumps CHAPTER_COUNT from 4 to 6 so
scroll-state maps each of the six sections to its own 100vh band.
Shifts existing chapter components' hardcoded indices by +1 to
account for the intro at index 0. Later tasks fully rewrite these
chapter components; this task keeps the intermediate state buildable."
```

---

## Task 2: Backdrop gradient shader

**Files:**
- Create: `src/components/r3f/materials/backdrop-material.ts` (drei `shaderMaterial` factory: 5 color keyframes, `uProgress`, `uTime`).
- Create: `src/components/r3f/backdrop.tsx` (Server Component wrapping the material on a full-screen quad).
- Modify: `src/components/r3f/scene.tsx` (mount `<Backdrop />` as the first child; remove the current `<color attach="background" />` and `<Sparkles>` — the backdrop replaces the flat color, and Sparkles belongs to the retiring aesthetic).

**Interfaces:**
- Consumes: `scrollState.progress` (from Task 1).
- Produces: `<Backdrop />` component. `<Backdrop />` is a self-contained mesh that fills the frustum and updates each frame from `scrollState.progress`. Later tasks do not touch it.

- [ ] **Step 1: Create the shader material factory**

Create `src/components/r3f/materials/backdrop-material.ts`:

```ts
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
  new THREE.Color("#081033"),
];
const BOT_COLORS = [
  new THREE.Color("#04081a"),
  new THREE.Color("#1a0940"),
  new THREE.Color("#4a1f3d"),
  new THREE.Color("#5a2a5c"),
  new THREE.Color("#b76e79"),
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
```

- [ ] **Step 2: Create the Backdrop component**

Create `src/components/r3f/backdrop.tsx`:

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/components/scroll/scroll-state";
import { BackdropMaterial, pickBackdropKeyframes } from "./materials/backdrop-material";

extend({ BackdropMaterial });

// Full-screen backdrop that reads scrollState.progress each frame and blends
// between five (top, bottom) color keyframes. Sits at renderOrder -1 so it
// draws behind everything without needing depth writes.
export function Backdrop() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  // Reused across frames to avoid GC churn.
  const kf = useMemo(
    () => ({
      topA: new THREE.Color(),
      topB: new THREE.Color(),
      botA: new THREE.Color(),
      botB: new THREE.Color(),
    }),
    [],
  );

  useFrame((_, delta) => {
    const mat = materialRef.current as any;
    if (!mat) return;
    const picked = pickBackdropKeyframes(scrollState.progress);
    kf.topA.copy(picked.topA);
    kf.topB.copy(picked.topB);
    kf.botA.copy(picked.botA);
    kf.botB.copy(picked.botB);
    mat.uTopA = kf.topA;
    mat.uTopB = kf.topB;
    mat.uBotA = kf.botA;
    mat.uBotB = kf.botB;
    mat.uBlend = picked.blend;
    mat.uTime += delta;
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false} position={[0, 0, -50]}>
      <planeGeometry args={[100, 100]} />
      {/* @ts-expect-error extended material tag */}
      <backdropMaterial ref={materialRef} depthWrite={false} depthTest={false} />
    </mesh>
  );
}
```

Notes:
- The `extend({ BackdropMaterial })` registers the material so JSX can use `<backdropMaterial />` as a tag. TypeScript doesn't know about this tag, which is why the `@ts-expect-error` line is required.
- `frustumCulled={false}` prevents the plane from being culled when the camera moves.
- `renderOrder={-1}` + `depthWrite={false}` + `depthTest={false}` ensures the backdrop always draws first and never occludes anything.
- The plane is placed at `z=-50` so it stays behind everything; its geometry is 100x100 so it easily fills the frustum at that depth.

- [ ] **Step 3: Mount `<Backdrop />` in `scene.tsx` and remove the old flat color + Sparkles**

Open `src/components/r3f/scene.tsx`. Add this import near the top:

```tsx
import { Backdrop } from "./backdrop";
```

Inside the `<Canvas>`, delete the `<color attach="background" args={["#0a0e17"]} />` line. Delete the entire `{isFull && ( <Sparkles ... /> )}` block. Add `<Backdrop />` as the FIRST child of the Canvas (before the lights):

```tsx
      <Backdrop />

      <ambientLight intensity={0.35} />
      ...
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```

Expected: clean (the `@ts-expect-error` on the material tag is intentional and expected to suppress a real error).

- [ ] **Step 5: Build**

```bash
npm run build 2>&1 | tail -12
```

Expected: success; `/` still prerendered static.

- [ ] **Step 6: Manual browser check**

`npm run dev`, open `http://localhost:3000`. Scroll top-to-bottom. Expected: a smooth gradient sky that shifts through five palettes (teal → violet → plum → magenta → rose-gold). The current 4-chapter content (still using the old tech-glow aesthetic) still renders — that's fine; it will be replaced in later tasks. The backdrop should be the visible change.

- [ ] **Step 7: Commit**

```bash
git add src/components/r3f/materials/backdrop-material.ts src/components/r3f/backdrop.tsx src/components/r3f/scene.tsx
git commit -m "Add scroll-driven gradient backdrop shader

New BackdropMaterial (drei shaderMaterial factory) picks between five
(top, bottom) color keyframes based on the global scroll progress and
blends with a smoothstep across each band. A subtle film-noise
shimmer keeps the sky feeling alive. Backdrop mesh sits at
renderOrder -1 behind everything and reads scrollState every frame
without triggering React re-renders. Removes the old flat-color
background and the retiring Sparkles particles."
```

---

## Task 3: Character (person silhouette from primitives)

**Files:**
- Create: `src/components/r3f/character.tsx` (person silhouette with hooded head, glowing eyes; outer group for per-section position lerp, inner group wrapped in `<Float>` for idle motion; eyes look-at driven by per-section focal points).
- Modify: `src/components/r3f/scene.tsx` (mount `<Character tier={tier} />` after `<Backdrop />`).

**Interfaces:**
- Consumes: `scrollState` (chapter/progress), `tier` prop (`"full" | "reduced"`), `CapabilityTier` type from `@/hooks/use-device-capability`.
- Produces: `<Character tier={tier} />` component. Its per-section position and lookAt are hardcoded inside the file — Tasks 4–9 do not need to reach into `Character`.

- [ ] **Step 1: Create the character component**

Create `src/components/r3f/character.tsx`:

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// Position and lookAt targets per section index 0..5.
// Section 0 = intro (beside the book), 1 = Ch01 (facing tangled knot),
// 2 = Ch02 (near pedestal), 3 = Ch03 (drifting through toolkit ring),
// 4 = Ch04 (base of pillar, tilted up), 5 = end (centred, calm).
const CHARACTER_POS: [number, number, number][] = [
  [1.4, -0.4, 0.0],
  [0.0, -0.4, 0.0],
  [1.2, -0.4, 0.5],
  [0.0, -0.4, 1.0],
  [0.0, -0.4, 0.0],
  [0.0, -0.4, 0.0],
];
const CHARACTER_LOOK_AT: [number, number, number][] = [
  [-0.6, 0.0, 0.0],   // book on the left
  [0.0, 0.2, 0.0],    // crystal in front
  [-0.8, 0.2, 0.0],   // pedestal to the left
  [0.0, 0.5, 0.0],    // ring around
  [0.0, 3.0, 0.0],    // beacon up
  [0.0, 1.5, 0.0],    // sunset ahead
];
const CHARACTER_ROT_Y: number[] = [-0.35, 0, -0.4, 0, 0, 0];

export function Character({ tier }: { tier: CapabilityTier }) {
  // Outer group: receives the per-section position/rotation lerp each frame.
  const outer = useRef<THREE.Group>(null);
  // Eyes group: rotates via lookAt each frame.
  const eyes = useRef<THREE.Group>(null);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!outer.current) return;

    // Interpolate between the two neighbouring section keyframes using the
    // global scroll progress. Same interp math as the camera rig.
    const sections = CHARACTER_POS.length; // 6
    const scaled = scrollState.progress * (sections - 1);
    const i = Math.min(sections - 2, Math.floor(scaled));
    const t = THREE.MathUtils.clamp(scaled - i, 0, 1);
    const posA = CHARACTER_POS[i];
    const posB = CHARACTER_POS[i + 1];
    const lookA = CHARACTER_LOOK_AT[i];
    const lookB = CHARACTER_LOOK_AT[i + 1];
    const rotA = CHARACTER_ROT_Y[i];
    const rotB = CHARACTER_ROT_Y[i + 1];

    const targetX = THREE.MathUtils.lerp(posA[0], posB[0], t);
    const targetY = THREE.MathUtils.lerp(posA[1], posB[1], t);
    const targetZ = THREE.MathUtils.lerp(posA[2], posB[2], t);
    outer.current.position.x = THREE.MathUtils.damp(outer.current.position.x, targetX, 4, delta);
    outer.current.position.y = THREE.MathUtils.damp(outer.current.position.y, targetY, 4, delta);
    outer.current.position.z = THREE.MathUtils.damp(outer.current.position.z, targetZ, 4, delta);
    outer.current.rotation.y = THREE.MathUtils.damp(
      outer.current.rotation.y,
      THREE.MathUtils.lerp(rotA, rotB, t),
      4,
      delta,
    );

    // Eyes look toward the current focal point.
    if (eyes.current) {
      lookTarget.set(
        THREE.MathUtils.lerp(lookA[0], lookB[0], t),
        THREE.MathUtils.lerp(lookA[1], lookB[1], t) + 0.3, // eye height
        THREE.MathUtils.lerp(lookA[2], lookB[2], t),
      );
      eyes.current.lookAt(lookTarget);
    }
  });

  const bodyColor = "#111318";
  const eyeColor = "#f0f4ff";
  const eyeEmissive = tier === "full" ? 3 : 1.8;

  return (
    <group ref={outer}>
      {/* Inner group: idle breathing motion via <Float>. */}
      <Float speed={0.7} rotationIntensity={0.15} floatIntensity={0.35}>
        {/* Body: tapered cone */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 0.9, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.9} metalness={0} />
        </mesh>
        {/* Head + hood: slightly-flattened sphere extending down into body */}
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.95} metalness={0} />
        </mesh>
        {/* Hood extension: a slightly larger sphere behind the head, cut off
            below eye line to read as a hood silhouette. */}
        <mesh position={[0, 0.48, -0.04]} scale={[1.25, 1.15, 1.35]}>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.95} metalness={0} />
        </mesh>
        {/* Eyes: grouped so they can lookAt. Placed at the shaded front of the head. */}
        <group ref={eyes} position={[0, 0.55, 0]}>
          <mesh position={[-0.07, 0, 0.2]}>
            <sphereGeometry args={[0.028, 12, 10]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={eyeEmissive}
              roughness={0.2}
              metalness={0}
            />
          </mesh>
          <mesh position={[0.07, 0, 0.2]}>
            <sphereGeometry args={[0.028, 12, 10]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={eyeEmissive}
              roughness={0.2}
              metalness={0}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}
```

Notes:
- Outer `<group ref={outer}>` receives per-section position/rotation lerp. The inner `<Float>` layers idle breathing on top without fighting.
- Eyes are a grouped pair; the group's `lookAt` rotates both eyes together. The `+0.3` on the eye look-target Y compensates for the head being ~0.55 above the group origin.
- Eye emissive is dialed down on reduced tier to be gentler on Bloom.
- Damping factor of 4 gives a smooth ~250ms follow feel, matching the camera rig (Task 11).

- [ ] **Step 2: Mount `<Character tier={tier} />` in `scene.tsx`**

Open `src/components/r3f/scene.tsx`. Add:

```tsx
import { Character } from "./character";
```

Inside the Canvas, after `<Backdrop />` and the lights, add:

```tsx
      <Character tier={tier} />
```

- [ ] **Step 3: Typecheck + build**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

Both must be clean/successful.

- [ ] **Step 4: Manual browser check**

Refresh `/`. Expected: a small hooded silhouette appears somewhere near the centre-bottom of the viewport. Its glowing eyes should catch Bloom (or read as bright dots even without Bloom updated yet). It idle-floats. Scroll through — the silhouette should drift smoothly between six positions along the section bands.

- [ ] **Step 5: Commit**

```bash
git add src/components/r3f/character.tsx src/components/r3f/scene.tsx
git commit -m "Add hooded person silhouette character with glowing eyes

Person silhouette built from primitives: tapered-cone body,
slightly-flattened sphere head with a hood extension behind, two
small emissive spheres for eyes grouped so they can lookAt. The
outer group receives per-section position/rotation lerp from scroll
state (six keyframes, one per narrative section); the inner Float
adds idle breathing on top. Eye emissive intensity gates by tier so
Bloom does not blow out on the reduced tier."
```

---

## Task 4: Book intro geometry

**Files:**
- Create: `src/components/r3f/book.tsx` (low-poly book from primitives; halo ring; visible only when `sectionLocalProgress(0)` > 0, scales/fades out as intro finishes).
- Modify: `src/components/r3f/scene.tsx` (mount `<BookIntro />` after `<Character />`).

**Interfaces:**
- Consumes: `chapterLocalProgress(0)` from `scroll-state`.
- Produces: `<BookIntro />` component. Self-contained; later tasks do not touch it.

- [ ] **Step 1: Create the book component**

Create `src/components/r3f/book.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

// Low-poly leather book that sits centered-left of the character in the intro
// band and fades/scales out as the user scrolls past 60% of the intro. A soft
// glowing halo ring on the ground under the book anchors the vignette.

export function BookIntro() {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const glyph = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(0);
    if (!group.current) return;
    // Full presence for the first 60% of the intro, fade out from 60% to 100%.
    const presence = 1 - Math.max(0, Math.min(1, (p - 0.6) / 0.4));
    group.current.visible = presence > 0.01;
    // Scale up slightly during the fadeout for a gentle "book opens away" feel.
    const s = 0.9 + (1 - presence) * 0.6;
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 3, delta));
    // Halo pulses gently.
    if (halo.current) {
      const mat = halo.current.material as THREE.MeshBasicMaterial;
      mat.opacity = presence * (0.35 + Math.sin(performance.now() * 0.001) * 0.1);
    }
    // Glyph emissive pulses toward the end of the intro (readiness cue).
    if (glyph.current) {
      const mat = glyph.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + (1 - presence) * 3.5;
    }
  });

  const leather = "#3a2318";
  const pages = "#e8d9b3";

  return (
    <group ref={group} position={[-0.9, -0.6, 0.4]} rotation={[0, 0.3, 0]}>
      {/* Bottom cover */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Pages (thin inset block) */}
      <mesh position={[0.01, 0.06, 0]}>
        <boxGeometry args={[0.66, 0.05, 0.46]} />
        <meshStandardMaterial color={pages} roughness={0.9} metalness={0} />
      </mesh>
      {/* Top cover */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Spine block */}
      <mesh position={[-0.34, 0.06, 0]}>
        <boxGeometry args={[0.03, 0.16, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Emissive glyph on the top cover (small plus shape via two thin boxes) */}
      <group position={[0, 0.16, 0]} ref={glyph as unknown as React.RefObject<THREE.Group>}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.02, 0.005, 0.12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffeecc" emissiveIntensity={1.2} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.12, 0.005, 0.02]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffeecc" emissiveIntensity={1.2} roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
      {/* Ground halo — a thin ring under the book, additive-blended */}
      <mesh ref={halo} position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.62, 48]} />
        <meshBasicMaterial
          color="#e8c98c"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
```

Note: the `glyph` ref is typed inline because it references a group holding two meshes; the ref type cast keeps TS happy while allowing us to mutate the material via `.children` if needed later. For this simple pulse, we access the material on one of the two thin boxes; since both share the same reference pattern, updating one is enough for the visible pulse effect. If both need updating in a future iteration, split the two boxes into named refs.

Actually — simpler and correct: mutate BOTH meshes via a small effect. Replace the `glyph` ref approach with two refs on the horizontal and vertical box, and pulse both inside `useFrame`. Corrected component:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

export function BookIntro() {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const glyphA = useRef<THREE.Mesh>(null);
  const glyphB = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(0);
    if (!group.current) return;
    const presence = 1 - Math.max(0, Math.min(1, (p - 0.6) / 0.4));
    group.current.visible = presence > 0.01;
    const s = 0.9 + (1 - presence) * 0.6;
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 3, delta));
    if (halo.current) {
      const mat = halo.current.material as THREE.MeshBasicMaterial;
      mat.opacity = presence * (0.35 + Math.sin(performance.now() * 0.001) * 0.1);
    }
    const emission = 0.8 + (1 - presence) * 3.5;
    for (const ref of [glyphA, glyphB]) {
      if (ref.current) {
        const mat = ref.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = emission;
      }
    }
  });

  const leather = "#3a2318";
  const pages = "#e8d9b3";
  const glyphMat = <meshStandardMaterial color="#ffffff" emissive="#ffeecc" emissiveIntensity={1.2} roughness={0.3} metalness={0.2} />;

  return (
    <group ref={group} position={[-0.9, -0.6, 0.4]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[0.01, 0.06, 0]}>
        <boxGeometry args={[0.66, 0.05, 0.46]} />
        <meshStandardMaterial color={pages} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[-0.34, 0.06, 0]}>
        <boxGeometry args={[0.03, 0.16, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh ref={glyphA} position={[0, 0.16, 0]}>
        <boxGeometry args={[0.02, 0.005, 0.12]} />
        {glyphMat}
      </mesh>
      <mesh ref={glyphB} position={[0, 0.16, 0]}>
        <boxGeometry args={[0.12, 0.005, 0.02]} />
        {glyphMat}
      </mesh>
      <mesh ref={halo} position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.62, 48]} />
        <meshBasicMaterial
          color="#e8c98c"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
```

Use this corrected version.

- [ ] **Step 2: Mount `<BookIntro />` in `scene.tsx`**

Open `src/components/r3f/scene.tsx`. Add:

```tsx
import { BookIntro } from "./book";
```

Inside the Canvas, after `<Character tier={tier} />`, add:

```tsx
      <BookIntro />
```

- [ ] **Step 3: Typecheck + build**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

Both must succeed.

- [ ] **Step 4: Manual browser check**

Refresh `/`. Expected: a small brown book with a soft golden halo appears next to the character in the intro band (top of the page, before you scroll into Ch01). As you scroll into Ch01's band, the book scales up slightly and fades out. Its top-cover glyph brightens during the fadeout.

- [ ] **Step 5: Commit**

```bash
git add src/components/r3f/book.tsx src/components/r3f/scene.tsx
git commit -m "Add low-poly book intro geometry with fade-out on scroll

Book composed from four thin boxes (bottom cover, pages, top cover,
spine) plus a small emissive glyph (two crossed thin boxes) and a
ground halo ring drawn additively. Visible only in the intro band;
fades and scales up as the user scrolls into Chapter 01. Halo
opacity pulses gently; glyph emissive spikes during the fadeout as
a readiness cue."
```

---

## Task 5: Chapter 01 morph-target crystal

**Files:**
- Rewrite: `src/components/r3f/chapters/chapter-01-tangle.tsx` (replace additive-line aTangled shader with native `morphAttributes` on a `LineSegments`; emerging `MeshTransmissionMaterial` glass icosahedron in the back half of the chapter).
- Delete: `src/components/r3f/materials/line-morph-material.ts` (obsolete; the morph now uses native Three.js morph targets).

**Interfaces:**
- Consumes: `chapterLocalProgress(1)` (Ch01 index after intro shift).
- Produces: `<Chapter01Tangle />` component. Self-contained.

- [ ] **Step 1: Delete the obsolete line-morph-material**

```bash
git rm src/components/r3f/materials/line-morph-material.ts
```

- [ ] **Step 2: Rewrite `chapter-01-tangle.tsx`**

Overwrite `src/components/r3f/chapters/chapter-01-tangle.tsx` with:

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// Chapter 01 - "What I do": tangled low-poly wireframe knot morphs into a
// geometric crystal skeleton using Three.js morphAttributes. Toward the end
// of the chapter band, a transmission-material icosahedron emerges centred
// on the crystal position, giving the illusion of solid glass forming from
// the resolving lines.

const SEGMENT_COUNT = 80;

function makeTangledKnot(): Float32Array {
  // A trefoil knot with amplitude noise, sampled as line segments (pairs of
  // consecutive samples). Each vertex is 3 floats, each segment is 2 vertices.
  const positions = new Float32Array(SEGMENT_COUNT * 2 * 3);
  const noise = (i: number) =>
    Math.sin(i * 1.9) * 0.35 + Math.cos(i * 2.7) * 0.28;
  const sample = (t: number) => {
    const a = 0.85;
    const x = Math.sin(t) + 2 * Math.sin(2 * t) + noise(t * 3) * a;
    const y = Math.cos(t) - 2 * Math.cos(2 * t) + noise(t * 3 + 2) * a;
    const z = -Math.sin(3 * t) + noise(t * 3 + 4) * a;
    return [x * 0.28, y * 0.28, z * 0.28] as const;
  };
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const t0 = (i / SEGMENT_COUNT) * Math.PI * 2;
    const t1 = ((i + 1) / SEGMENT_COUNT) * Math.PI * 2;
    const p0 = sample(t0);
    const p1 = sample(t1);
    positions.set(p0, i * 6);
    positions.set(p1, i * 6 + 3);
  }
  return positions;
}

function makeCrystalSkeleton(): Float32Array {
  // An icosahedron's edges, sampled as line segments. Each edge is one segment.
  const geom = new THREE.IcosahedronGeometry(0.9, 0);
  const edges = new THREE.EdgesGeometry(geom);
  const attr = edges.getAttribute("position") as THREE.BufferAttribute;
  const source = attr.array as Float32Array;
  // We may not have exactly SEGMENT_COUNT * 2 vertices. If shorter, repeat the
  // last edge; if longer, truncate. This keeps buffer sizes matched with the
  // tangled buffer for morph compatibility.
  const target = new Float32Array(SEGMENT_COUNT * 2 * 3);
  for (let i = 0; i < target.length; i++) {
    target[i] = source[i % source.length];
  }
  geom.dispose();
  edges.dispose();
  return target;
}

export function Chapter01Tangle({ tier }: { tier: CapabilityTier }) {
  const group = useRef<THREE.Group>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const crystal = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const tangled = makeTangledKnot();
    const crystalSkel = makeCrystalSkeleton();
    // Base position is the tangled knot; morph target 0 is the crystal skeleton.
    g.setAttribute("position", new THREE.BufferAttribute(tangled, 3));
    g.morphAttributes.position = [new THREE.BufferAttribute(crystalSkel, 3)];
    return g;
  }, []);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(1);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // Rotate the whole group slowly for parallax.
    group.current.rotation.y += delta * 0.12;

    // Morph from tangled (p=0) to crystal skeleton (p=0.7). Eased.
    if (lines.current) {
      const morph = Math.min(1, p / 0.7);
      const eased = morph * morph * (3 - 2 * morph);
      const infl = lines.current.morphTargetInfluences;
      if (infl) infl[0] = eased;
      // Line color brightens as morph completes.
      const mat = lines.current.material as THREE.LineBasicMaterial;
      const brightness = 0.35 + eased * 0.5;
      mat.color.setRGB(brightness * 0.7, brightness * 0.85, brightness * 1.0);
    }

    // Crystal solid appears in the back half (p 0.5 -> 1.0), scaling in.
    if (crystal.current) {
      const reveal = Math.max(0, Math.min(1, (p - 0.5) / 0.5));
      const s = reveal * 0.55;
      crystal.current.visible = reveal > 0.001;
      crystal.current.scale.setScalar(THREE.MathUtils.damp(crystal.current.scale.x, s, 3, delta));
      crystal.current.rotation.y -= delta * 0.2;
      crystal.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <lineSegments ref={lines} geometry={geometry}>
        <lineBasicMaterial color="#7fb3ff" transparent opacity={0.85} />
      </lineSegments>

      <mesh ref={crystal} position={[0, 0.1, 0]} visible={false}>
        <icosahedronGeometry args={[0.9, 0]} />
        {tier === "full" ? (
          <MeshTransmissionMaterial
            transmission={1}
            thickness={0.4}
            roughness={0.15}
            ior={1.4}
            chromaticAberration={0.05}
            color="#dfeeff"
          />
        ) : (
          <meshStandardMaterial
            color="#dfeeff"
            emissive="#88a4ff"
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.15}
            transparent
            opacity={0.7}
          />
        )}
      </mesh>
    </group>
  );
}
```

Notes:
- `LineBasicMaterial` in Three.js r150+ supports morph targets automatically when the geometry has `morphAttributes.position` set — no material config needed.
- `makeCrystalSkeleton` samples an icosahedron's edges into the same buffer size as the tangled knot so both morph targets have matching vertex counts.
- The crystal solid (transmission material on full tier, emissive standard material on reduced tier) emerges only in the back half of the chapter band and scales in with damping.
- `chapterLocalProgress(1)` — Ch01 is section index 1 now (intro took slot 0).

- [ ] **Step 3: Update `scene.tsx` if needed**

If `scene.tsx` still imports `Chapter01Tangle` from the same path, no change is needed — you rewrote the file at the same path. Confirm the import line is still:
```tsx
import { Chapter01Tangle } from "./chapters/chapter-01-tangle";
```

- [ ] **Step 4: Typecheck + build**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

Both must succeed.

- [ ] **Step 5: Manual browser check**

Refresh `/`. Scroll into Ch01's band (past the intro). Expected: a tangled bright cyan knot appears around the character. As you scroll through the chapter, the lines untangle and resolve into the geometric edges of an icosahedron. In the last third, a semi-transparent glass icosahedron emerges centred on the same location, catching Bloom.

- [ ] **Step 6: Commit**

```bash
git add src/components/r3f/chapters/chapter-01-tangle.tsx
git commit -m "Rewrite Chapter 01 with morph-target crystal

Native Three.js morphAttributes on a LineSegments: base position is
a noisy trefoil-knot sample; morph target 0 is an icosahedron edge
skeleton sampled to the same buffer size. Morph influence eased
from 0 to 1 across the first 70% of the chapter band. In the back
half a MeshTransmissionMaterial icosahedron (full tier) or emissive
standard material (reduced tier) scales in centred on the resolving
lines. line-morph-material.ts is obsolete and deleted."
```

---

## Task 6: Chapter 02 pedestal with Nomo torus-knot and warm light shafts

**Files:**
- Rewrite: `src/components/r3f/chapters/chapter-02-pedestal.tsx` (low-poly pedestal + abstract torus-knot Nomo glyph + two additive warm-golden light shaft cones).

**Interfaces:**
- Consumes: `chapterLocalProgress(2)`.
- Produces: `<Chapter02Pedestal tier={tier} />` component. Self-contained.

- [ ] **Step 1: Rewrite `chapter-02-pedestal.tsx`**

Overwrite the file:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// Chapter 02 - "What drives me": a low-poly pedestal appears; on top rotates
// an abstract interlocked torus-knot representing Nomo. Two warm-golden cone
// light shafts sweep across the pedestal, drawn additively so they read as
// light and not solid geometry.

export function Chapter02Pedestal({ tier }: { tier: CapabilityTier }) {
  const group = useRef<THREE.Group>(null);
  const knot = useRef<THREE.Mesh>(null);
  const shaftA = useRef<THREE.Mesh>(null);
  const shaftB = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(2);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // Pedestal group scales in during the first 30% of the chapter.
    const scaleIn = Math.min(1, p / 0.3);
    const s = scaleIn * scaleIn * (3 - 2 * scaleIn);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 3, delta));

    if (knot.current) {
      knot.current.rotation.y += delta * 0.35;
      knot.current.rotation.x += delta * 0.15;
    }

    // Light shafts sway slowly; opacity pulses.
    const t = performance.now() * 0.0006;
    if (shaftA.current) {
      const mat = shaftA.current.material as THREE.MeshBasicMaterial;
      shaftA.current.rotation.z = -0.35 + Math.sin(t) * 0.06;
      mat.opacity = 0.28 + Math.sin(t * 1.3) * 0.08;
    }
    if (shaftB.current) {
      const mat = shaftB.current.material as THREE.MeshBasicMaterial;
      shaftB.current.rotation.z = 0.35 + Math.cos(t) * 0.06;
      mat.opacity = 0.28 + Math.cos(t * 1.3) * 0.08;
    }
  });

  const pedestalColor = "#1a141c";
  const knotColor = "#f5d18a";
  const knotEmissive = tier === "full" ? 1.6 : 1.0;
  const shaftColor = "#f6d795";

  return (
    <group ref={group} position={[-0.6, -0.2, 0]} scale={0.001}>
      {/* Pedestal base (short wide cylinder) */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.35, 0.42, 0.12, 16]} />
        <meshStandardMaterial color={pedestalColor} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Pedestal column */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
        <meshStandardMaterial color={pedestalColor} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Nomo glyph: an abstract interlocked torus-knot floating above the pedestal */}
      <mesh ref={knot} position={[0, 0.55, 0]}>
        <torusKnotGeometry args={[0.14, 0.04, 96, 12, 2, 3]} />
        <meshStandardMaterial
          color={knotColor}
          emissive={knotColor}
          emissiveIntensity={knotEmissive}
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>
      {/* Two warm-golden light shafts: tall thin cones drawn additively */}
      <mesh ref={shaftA} position={[-0.35, 0.6, -0.2]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.28, 1.4, 24, 1, true]} />
        <meshBasicMaterial
          color={shaftColor}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={shaftB} position={[0.35, 0.6, -0.2]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.28, 1.4, 24, 1, true]} />
        <meshBasicMaterial
          color={shaftColor}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: Update `scene.tsx` prop**

If `scene.tsx` still uses `<Chapter02Pedestal />` without the `tier` prop, update it to `<Chapter02Pedestal tier={tier} />`. If it already passes `tier`, no change.

- [ ] **Step 3: Typecheck + build + browser check**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

Scroll into Ch02's band. Expected: a small dark pedestal rises from the bottom of the viewport; on top a warm-golden torus-knot glyph rotates; two additive golden shafts sway above it, catching Bloom.

- [ ] **Step 4: Commit**

```bash
git add src/components/r3f/chapters/chapter-02-pedestal.tsx src/components/r3f/scene.tsx
git commit -m "Rewrite Chapter 02 pedestal with Nomo torus-knot and light shafts

Low-poly pedestal (base cylinder plus column), abstract interlocked
torus-knot glyph representing Nomo (rotates on Y and X), and two
additive warm-golden cone light shafts that sway and pulse. Pedestal
group scales in during the first 30% of the chapter band. Knot
emissive intensity gates by tier."
```

---

## Task 7: Chapter 03 toolkit (six abstract low-poly icons in a floating ring)

**Files:**
- Rename via `git mv`: `src/components/r3f/chapters/chapter-03-grid.tsx` → `src/components/r3f/chapters/chapter-03-toolkit.tsx`.
- Rewrite: `src/components/r3f/chapters/chapter-03-toolkit.tsx` (six low-poly abstract shapes arranged in a ring around the character; each illuminates in sequence).
- Modify: `src/components/r3f/scene.tsx` (update the import path + component name).

**Interfaces:**
- Consumes: `chapterLocalProgress(3)`.
- Produces: `<Chapter03Toolkit />` component.

**Design decision:** The design spec's first-attempt call for real technology logos would require sourcing SVG assets and either extruding via drei `<Svg>` or texturing via `TextureLoader`. The spec explicitly allows an abstract-shapes fallback: *"If logos visually break the shining aesthetic, we fall back to abstract low-poly shapes."* This plan ships with the fallback in the first version because abstract shapes match the shining aesthetic better (symbolic, not literal), avoid an asset-sourcing dependency, and can be swapped for real logos in a follow-up commit. Six shapes are chosen — one per skill category: tetrahedron (analysis structure), torus (integration), stacked cubes (documentation), octahedron (decisions), cone (delivery), icosahedron (product judgment).

- [ ] **Step 1: Rename the file**

```bash
git mv src/components/r3f/chapters/chapter-03-grid.tsx src/components/r3f/chapters/chapter-03-toolkit.tsx
```

- [ ] **Step 2: Rewrite the file's contents**

Overwrite `src/components/r3f/chapters/chapter-03-toolkit.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

// Chapter 03 - "My toolkit": six low-poly abstract icons float in a loose ring
// around the character at slightly different heights. Each icon is a near-
// black silhouette by default; as the camera pans across the chapter, they
// illuminate one after another (emissive fades on, small halo appears).

const RADIUS = 1.6;
const ITEMS = 6;

function IconMesh({
  index,
  geometryKind,
}: {
  index: number;
  geometryKind: "tetra" | "torus" | "box" | "octa" | "cone" | "ico";
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const angle = (index / ITEMS) * Math.PI * 2;
  const baseX = Math.cos(angle) * RADIUS;
  const baseZ = Math.sin(angle) * RADIUS - 0.4;
  const baseY = ((index % 3) - 1) * 0.25;

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);
    if (!mesh.current) return;
    // Illumination sweeps across the ring in scroll order.
    const start = index / ITEMS;
    const end = start + 0.35;
    const local = Math.max(0, Math.min(1, (p - start) / (end - start)));
    const eased = local * local * (3 - 2 * local);

    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.05 + eased * 2.2;
    // Slight bob and spin.
    const t = performance.now() * 0.0007;
    mesh.current.position.y = baseY + Math.sin(t + index) * 0.08;
    mesh.current.rotation.y += delta * (0.25 + index * 0.03);
    mesh.current.rotation.x += delta * 0.08;

    if (halo.current) {
      const hMat = halo.current.material as THREE.MeshBasicMaterial;
      hMat.opacity = eased * 0.4;
      halo.current.scale.setScalar(0.7 + eased * 0.35);
    }
  });

  const color = "#b8d8ff";
  const emissive = "#7fb3ff";

  return (
    <group position={[baseX, baseY, baseZ]}>
      <mesh ref={mesh}>
        {geometryKind === "tetra" && <tetrahedronGeometry args={[0.16, 0]} />}
        {geometryKind === "torus" && <torusGeometry args={[0.14, 0.04, 12, 32]} />}
        {geometryKind === "box" && <boxGeometry args={[0.22, 0.22, 0.22]} />}
        {geometryKind === "octa" && <octahedronGeometry args={[0.18, 0]} />}
        {geometryKind === "cone" && <coneGeometry args={[0.14, 0.28, 4]} />}
        {geometryKind === "ico" && <icosahedronGeometry args={[0.17, 0]} />}
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.05} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.30, 24]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function Chapter03Toolkit() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);
    if (!group.current) return;
    group.current.visible = p > 0.001;
    group.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      <IconMesh index={0} geometryKind="tetra" />
      <IconMesh index={1} geometryKind="torus" />
      <IconMesh index={2} geometryKind="box" />
      <IconMesh index={3} geometryKind="octa" />
      <IconMesh index={4} geometryKind="cone" />
      <IconMesh index={5} geometryKind="ico" />
    </group>
  );
}
```

Note: this ships six independent `<mesh>` elements rather than drei `<Instances>` because the six icons use six different geometries, which `<Instances>` cannot share. Six draw calls plus six halo rings = 12 draw calls, comfortably under the 20-per-chapter budget. If Min Yi later wants real logos via textured planes, all six can share one plane geometry and become a single `<Instances>` group.

- [ ] **Step 3: Update `scene.tsx`**

Open `src/components/r3f/scene.tsx`. Find:
```tsx
import { Chapter03Grid } from "./chapters/chapter-03-grid";
```
Replace with:
```tsx
import { Chapter03Toolkit } from "./chapters/chapter-03-toolkit";
```

Find the JSX usage `<Chapter03Grid />` and replace with `<Chapter03Toolkit />`.

- [ ] **Step 4: Typecheck + build + browser check**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

Scroll into Ch03's band. Expected: six dark low-poly shapes appear in a ring around the character (tetrahedron, torus, cube, octahedron, cone, icosahedron). As you scroll through, they illuminate one after another in ring-order, with soft additive halos catching Bloom.

- [ ] **Step 5: Commit**

```bash
git add src/components/r3f/chapters/chapter-03-toolkit.tsx src/components/r3f/scene.tsx
git commit -m "Rewrite Chapter 03 as six abstract low-poly toolkit icons

Six shapes (tetrahedron, torus, cube, octahedron, cone, icosahedron)
float in a loose ring around the character at slightly different
heights. Each starts near-black and illuminates in sequence as the
camera pans through the chapter band; a soft additive halo appears
under each icon as it lights up. Uses individual meshes rather than
drei Instances because the six geometries differ. If real logos are
wanted later, all icons can migrate to a shared plane geometry with
per-instance textures; that swap is a small follow-up."
```

---

## Task 8: Chapter 04 ascending pillar of light

**Files:**
- Rewrite: `src/components/r3f/chapters/chapter-04-horizon.tsx` (tall additive-glow cylinder pillar, dual paths hint, rising particle orbs).

**Interfaces:**
- Consumes: `chapterLocalProgress(4)`.
- Produces: `<Chapter04Horizon />` component. Self-contained.

- [ ] **Step 1: Rewrite `chapter-04-horizon.tsx`**

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

// Chapter 04 - "What is next": a tall pillar of light rises. A second, fainter
// pillar sits behind it (the dual "PM + builder" paths). Small additive particle
// orbs rise from the base as the chapter progresses.

const ORB_COUNT = 12;

export function Chapter04Horizon() {
  const group = useRef<THREE.Group>(null);
  const pillarA = useRef<THREE.Mesh>(null);
  const pillarB = useRef<THREE.Mesh>(null);
  const orbGroup = useRef<THREE.Group>(null);
  const orbPhases = useMemo(
    () => Array.from({ length: ORB_COUNT }, (_, i) => (i / ORB_COUNT) * Math.PI * 2),
    [],
  );

  useFrame((_, delta) => {
    const p = chapterLocalProgress(4);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // Pillars rise and brighten across the chapter.
    const rise = Math.min(1, p / 0.7);
    const eased = rise * rise * (3 - 2 * rise);
    if (pillarA.current) {
      pillarA.current.scale.y = 0.05 + eased * 4.5;
      pillarA.current.position.y = -0.3 + pillarA.current.scale.y * 0.5;
      const mat = pillarA.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + eased * 0.75;
    }
    if (pillarB.current) {
      pillarB.current.scale.y = 0.05 + eased * 3.5;
      pillarB.current.position.y = -0.3 + pillarB.current.scale.y * 0.5;
      const mat = pillarB.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + eased * 0.35;
    }

    if (orbGroup.current) {
      const t = performance.now() * 0.001;
      orbGroup.current.children.forEach((child, i) => {
        const phase = orbPhases[i];
        // Each orb travels from y=-0.4 to y=3, staggered by phase.
        const life = ((t * 0.3 + phase) % (Math.PI * 2)) / (Math.PI * 2); // 0..1
        child.position.y = -0.4 + life * 3.4;
        child.position.x = Math.sin(phase * 3 + t * 0.2) * 0.12;
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(life * Math.PI) * eased * 0.85;
      });
    }
  });

  const glow = "#f6c48a"; // warm sunset gold

  return (
    <group ref={group} position={[0, 0, -0.3]}>
      {/* Main pillar */}
      <mesh ref={pillarA} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1, 16, 1, true]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Second pillar (dual path hint) */}
      <mesh ref={pillarB} position={[0.35, 0, -0.15]}>
        <cylinderGeometry args={[0.05, 0.08, 1, 12, 1, true]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={0.03}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Rising particle orbs */}
      <group ref={orbGroup}>
        {orbPhases.map((_, i) => (
          <mesh key={i} position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial
              color={glow}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
```

- [ ] **Step 2: Typecheck + build + browser check**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

Scroll into Ch04's band. Expected: a tall warm-golden pillar of light rises up the middle of the viewport; a second fainter pillar sits behind and to the right. Small orbs rise from the base along the pillars, fading in and out. Bloom catches all of it.

- [ ] **Step 3: Commit**

```bash
git add src/components/r3f/chapters/chapter-04-horizon.tsx
git commit -m "Rewrite Chapter 04 as ascending pillar of light

Tall thin cylinder drawn additively as the main pillar, plus a
second fainter pillar behind and to the right hinting at the dual
PM-and-builder paths. Twelve additive particle orbs rise from the
base staggered by phase, each fading in at the middle of its arc.
Everything scales up and brightens across the chapter band."
```

---

## Task 9: End scene

**Files:**
- Create: `src/components/r3f/end-scene.tsx` (peaceful sunset composition: character stands, softer pillar glow, drifting particles).
- Modify: `src/components/r3f/scene.tsx` (mount `<EndScene />` after `<Chapter04Horizon />`).

**Interfaces:**
- Consumes: `chapterLocalProgress(5)`.
- Produces: `<EndScene />` component.

- [ ] **Step 1: Create the component**

Create `src/components/r3f/end-scene.tsx`:

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

// End scene: peaceful sunset. The Chapter 04 pillar has faded; a soft glow
// hangs where it was. Small drifting particles rise gently.

const DRIFT_COUNT = 16;

export function EndScene() {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const drift = useRef<THREE.Group>(null);
  const phases = useMemo(
    () => Array.from({ length: DRIFT_COUNT }, () => Math.random() * Math.PI * 2),
    [],
  );

  useFrame((_, delta) => {
    const p = chapterLocalProgress(5);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // The glow pulses gently, opacity ramping in during the first 30% of end band.
    const presence = Math.min(1, p / 0.3);
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      mat.opacity = presence * (0.28 + Math.sin(performance.now() * 0.0008) * 0.08);
      glow.current.scale.setScalar(1 + Math.sin(performance.now() * 0.0006) * 0.06);
    }
    // Drifting particles.
    if (drift.current) {
      const t = performance.now() * 0.001;
      drift.current.children.forEach((child, i) => {
        const phase = phases[i];
        const life = ((t * 0.15 + phase) % (Math.PI * 2)) / (Math.PI * 2);
        child.position.y = -0.5 + life * 2.5;
        child.position.x = Math.sin(phase * 5) * 0.8 + Math.sin(t * 0.2 + i) * 0.05;
        child.position.z = Math.cos(phase * 5) * 0.4;
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(life * Math.PI) * presence * 0.6;
      });
    }
  });

  const warmGlow = "#f6b979";

  return (
    <group ref={group} position={[0, 0, -0.2]}>
      {/* Soft glow disk where the pillar was */}
      <mesh ref={glow} position={[0, 1.2, -0.3]}>
        <sphereGeometry args={[0.5, 24, 20]} />
        <meshBasicMaterial
          color={warmGlow}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Drifting particles */}
      <group ref={drift}>
        {phases.map((_, i) => (
          <mesh key={i} position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial
              color={warmGlow}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
```

- [ ] **Step 2: Mount in `scene.tsx`**

Add:
```tsx
import { EndScene } from "./end-scene";
```

Inside the Canvas, after `<Chapter04Horizon />`, add:
```tsx
      <EndScene />
```

- [ ] **Step 3: Typecheck + build + browser check**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

Scroll to the end of the story track. Expected: a soft warm glow orb pulses gently in the upper-centre of the viewport; small warm particles drift upward slowly across the scene. Bloom picks up everything.

- [ ] **Step 4: Commit**

```bash
git add src/components/r3f/end-scene.tsx src/components/r3f/scene.tsx
git commit -m "Add peaceful end scene with warm glow and drifting particles

A soft additive glow sphere pulses where the Chapter 04 pillar was;
sixteen warm additive particles drift upward on staggered phases,
fading in and out along their arcs. Scales in during the first 30%
of the end band."
```

---

## Task 10: Post-processing (Bloom + Vignette + Noise)

**Files:**
- Rewrite: `src/components/r3f/post-processing.tsx` (replace DoF + ChromaticAberration with Vignette + Noise; keep Bloom with updated params per spec).

**Interfaces:**
- Consumes: `tier` prop.
- Produces: `<PostFX tier={tier} />` component (same interface as before; internal recipe replaced).

- [ ] **Step 1: Rewrite the file**

Overwrite `src/components/r3f/post-processing.tsx`:

```tsx
"use client";

import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// Post-processing stack per the shining spec:
// - Bloom on selective bright pixels (eyes, glyphs, torus-knot, pillar, halos).
// - Vignette darkens the edges to focus the eye on the character.
// - Noise adds subtle film grain, turning flat gradients into storybook canvas.
//
// Full tier: all three. Reduced tier: Vignette + softer Bloom, no Noise.

export function PostFX({ tier }: { tier: CapabilityTier }) {
  const isFull = tier === "full";
  return (
    <EffectComposer>
      <Bloom
        intensity={isFull ? 1.5 : 0.9}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.1} darkness={0.9} />
      {isFull ? (
        <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
      ) : (
        <></>
      )}
    </EffectComposer>
  );
}
```

Notes:
- `Noise` and `BlendFunction` are exported by `@react-three/postprocessing@3.0.4`. If `Noise` is not exported by this exact version (unlikely — it is a standard effect), the fallback is a small custom pass; verify at typecheck time and adjust if needed.
- The `BlendFunction.OVERLAY` gives the film-grain feel; `NORMAL` would just wash out the image.
- No DoF, no ChromaticAberration — those belong to the retiring tech-glow aesthetic.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

If `Noise` or `BlendFunction` fail to resolve, the fallback is:
- Comment out the `<Noise>` block entirely
- File an issue-style comment in the file: `// TODO(post-fx): Noise not exported by this version; add via a tiny custom shader pass. Not blocking for first release.`

The Vignette + Bloom pair is still a substantial upgrade over the current DoF+Chromatic recipe.

- [ ] **Step 3: Build + browser check**

```bash
npm run build 2>&1 | tail -12
```

Refresh `/`. Expected: character eyes are noticeably shinier (Bloom catches them); the edges of the viewport darken slightly (Vignette); a subtle grain overlays the whole scene (Noise, if it landed).

- [ ] **Step 4: Commit**

```bash
git add src/components/r3f/post-processing.tsx
git commit -m "Swap post-processing recipe to Bloom + Vignette + Noise

Retires DoF and ChromaticAberration (tech-glow aesthetic) and
substitutes Vignette plus Noise per the shining spec. Bloom stays
with tuned luminance threshold (0.6) so only intentional bright
pixels bloom: character eyes, book glyph, Nomo torus-knot, Ch03
halo rings, Ch04 pillar, end-scene glow. Reduced tier drops Noise
and softens Bloom intensity."
```

---

## Task 11: Camera rig with six keyframes

**Files:**
- Rewrite: `src/components/r3f/camera-rig.tsx` (six position + lookAt keyframes, one per section; damped follow with light pointer parallax).

**Interfaces:**
- Consumes: `scrollState.progress`, `CHAPTER_COUNT` (from Task 1's bump to 6).
- Produces: `<CameraRig />` component (same interface; internal keyframes updated).

- [ ] **Step 1: Rewrite the file**

Overwrite `src/components/r3f/camera-rig.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState, CHAPTER_COUNT } from "@/components/scroll/scroll-state";

type Keyframe = { pos: [number, number, number]; look: [number, number, number] };

// Six keyframes, one per narrative section:
// 0 intro: framed on the book (which sits slightly to the left)
// 1 Ch01: pulled back to see the whole tangled knot
// 2 Ch02: closer, angled around the pedestal
// 3 Ch03: wider, camera drifts to reveal the toolkit ring
// 4 Ch04: tilted up toward the ascending pillar
// 5 end: settled, gentle idle drift
const KEYFRAMES: Keyframe[] = [
  { pos: [0.3, 0.4, 3.2], look: [-0.5, -0.1, 0.0] },
  { pos: [0.0, 0.3, 3.5], look: [0.0, 0.1, 0.0] },
  { pos: [0.6, 0.2, 2.8], look: [-0.3, 0.15, 0.0] },
  { pos: [0.0, 0.6, 3.6], look: [0.0, 0.4, 0.0] },
  { pos: [0.0, 0.9, 3.4], look: [0.0, 1.6, 0.0] },
  { pos: [0.0, 0.5, 3.0], look: [0.0, 0.8, 0.0] },
];

function sampleKeyframe(
  progress: number,
  key: "pos" | "look",
  out: THREE.Vector3,
): THREE.Vector3 {
  const scaled = progress * (CHAPTER_COUNT - 1);
  const i = Math.min(CHAPTER_COUNT - 2, Math.floor(scaled));
  const f = THREE.MathUtils.clamp(scaled - i, 0, 1);
  const a = KEYFRAMES[i][key];
  const b = KEYFRAMES[i + 1][key];
  return out.set(
    THREE.MathUtils.lerp(a[0], b[0], f),
    THREE.MathUtils.lerp(a[1], b[1], f),
    THREE.MathUtils.lerp(a[2], b[2], f),
  );
}

export function CameraRig() {
  const { camera, pointer } = useThree();
  const desiredPos = useRef(new THREE.Vector3(0, 0.4, 3.2));
  const desiredLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    sampleKeyframe(scrollState.progress, "pos", desiredPos.current);
    sampleKeyframe(scrollState.progress, "look", desiredLook.current);

    // Light pointer parallax on X and Y.
    const parallaxX = pointer.x * 0.25;
    const parallaxY = pointer.y * 0.15;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.current.x + parallaxX, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.current.y + parallaxY, 4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.current.z, 4, delta);

    currentLook.current.x = THREE.MathUtils.damp(currentLook.current.x, desiredLook.current.x, 4, delta);
    currentLook.current.y = THREE.MathUtils.damp(currentLook.current.y, desiredLook.current.y, 4, delta);
    currentLook.current.z = THREE.MathUtils.damp(currentLook.current.z, desiredLook.current.z, 4, delta);
    camera.lookAt(currentLook.current);
  });

  return null;
}
```

Note: the keyframes assume the character sits around (0, -0.4, 0) with the various scene elements distributed around that. Fine-tuning these values is a manual browser-check step.

- [ ] **Step 2: Typecheck + build**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

- [ ] **Step 3: Manual browser check**

Refresh `/` and scroll top-to-bottom. Expected: the camera smoothly drifts through six framings — starts framed on the book, pulls back to see the tangled knot, angles around the pedestal, widens for the toolkit ring, tilts up for the pillar, and settles for the end. Moving the mouse produces subtle parallax.

- [ ] **Step 4: Commit**

```bash
git add src/components/r3f/camera-rig.tsx
git commit -m "Rewrite camera rig with six section keyframes

Six position and lookAt targets, one per section, interpolated by
global scroll progress and damped for smooth follow. Adds light
pointer parallax on X and Y. Framings: intro on the book, Ch01
pulled back for the knot, Ch02 angled around the pedestal, Ch03
widened for the toolkit ring, Ch04 tilted up for the pillar, end
settled with gentle idle."
```

---

## Task 12: HTML overlays (book intro + end scene + poem-aware chapter copy)

**Files:**
- Create: `src/components/story/book-intro-overlay.tsx`.
- Create: `src/components/story/end-scene-overlay.tsx`.
- Rewrite: `src/components/story/story-overlay.tsx` (six sections: book intro + 4 chapter beats + end scene).
- Rewrite: `src/components/story/chapter-copy.tsx` (render `poem` as the primary reveal, with `spec` and `cta` still supported below).

**Interfaces:**
- Consumes: `story` array from `content.ts` (Task 1) with 6 entries and `poem` field.
- Produces: `<BookIntroOverlay />`, `<EndSceneOverlay />`, updated `<StoryOverlay />` composition, updated `<ChapterCopy>` that primarily surfaces `poem`.

- [ ] **Step 1: Create the book intro overlay**

Create `src/components/story/book-intro-overlay.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { story } from "@/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export function BookIntroOverlay() {
  const beat = story[0];
  const poem = beat.poem ?? [];

  return (
    <section
      data-chapter
      data-label={beat.label}
      className="relative h-[100vh]"
    >
      <div className="sticky top-0 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          className="max-w-xl"
        >
          <p className="font-serif text-2xl leading-relaxed text-foreground/85 italic sm:text-3xl">
            {poem.join(" ")}
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
            className="mt-8 flex flex-col items-center gap-2 text-muted-foreground/60"
          >
            <span className="font-sans text-[0.6rem] tracking-[0.25em] uppercase">Scroll</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="block h-6 w-px bg-gradient-to-b from-glow/60 to-transparent"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create the end scene overlay**

Create `src/components/story/end-scene-overlay.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { site, story } from "@/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export function EndSceneOverlay() {
  const beat = story[5];
  const poem = beat.poem ?? [];

  return (
    <section
      data-chapter
      data-label={beat.label}
      className="relative h-[100vh]"
    >
      <div className="sticky top-0 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="max-w-xl"
        >
          <p className="font-serif text-2xl leading-relaxed text-foreground/90 italic sm:text-3xl">
            {poem.join(" ")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-glow/40 bg-glow/[0.06] px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase backdrop-blur-sm transition-colors hover:bg-glow/[0.12]"
            >
              LinkedIn
            </a>
            <a
              href={site.socials.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-glow/40 bg-glow/[0.06] px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase backdrop-blur-sm transition-colors hover:bg-glow/[0.12]"
            >
              GitHub
            </a>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 border border-glow/40 bg-glow/[0.06] px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase backdrop-blur-sm transition-colors hover:bg-glow/[0.12]"
            >
              Email
            </a>
          </div>
          {beat.cta && (
            <a
              href={beat.cta.href}
              className="mt-8 inline-flex items-center gap-1.5 font-sans text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              {beat.cta.label}
              <span aria-hidden>↓</span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Rewrite `chapter-copy.tsx` to render `poem` as the primary reveal**

Overwrite `src/components/story/chapter-copy.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { StoryBeat } from "@/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ChapterCopy({ beat }: { beat: StoryBeat }) {
  return (
    <section
      data-chapter
      data-label={beat.label}
      className="relative h-[100vh]"
    >
      <div className="sticky top-0 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="max-w-xl"
        >
          {beat.poem?.map((line, i) => (
            <p
              key={i}
              className="font-serif text-2xl leading-relaxed text-foreground/85 italic sm:text-3xl"
            >
              {line}
            </p>
          ))}

          {beat.spec && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 opacity-0 transition-opacity duration-500 hover:opacity-100 focus-within:opacity-100 md:opacity-40">
              {beat.spec.map((s) => (
                <span
                  key={s}
                  className="inline-block border border-foreground/20 px-2.5 py-0.5 font-sans text-[0.68rem] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {beat.cta && (
            <div className="mt-6">
              <a
                href={beat.cta.href}
                target={beat.cta.external ? "_blank" : undefined}
                rel={beat.cta.external ? "noreferrer" : undefined}
                className="inline-flex items-center gap-2 border border-glow/40 bg-glow/[0.06] px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase backdrop-blur-sm transition-colors hover:bg-glow/[0.12]"
              >
                {beat.cta.label}
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
```

Note: the `spec` pill row is set to `opacity-40` on md+ and `hover:opacity-100` / `focus-within:opacity-100`. On mobile it's `opacity-0` and only reveals on tap into a focused element. This matches the spec's "hover-reveal spec pill" pattern.

- [ ] **Step 4: Rewrite `story-overlay.tsx` to include intro + end**

Overwrite `src/components/story/story-overlay.tsx`:

```tsx
"use client";

import { BookIntroOverlay } from "./book-intro-overlay";
import { ChapterCopy } from "./chapter-copy";
import { EndSceneOverlay } from "./end-scene-overlay";
import { story } from "@/content";

export function StoryOverlay() {
  // Sections 1..4 are the four chapters; 0 is intro, 5 is end (each has its
  // own dedicated overlay component with a different layout).
  const chapters = story.slice(1, 5);
  return (
    <div id="story-track" className="relative z-10">
      <BookIntroOverlay />
      {chapters.map((beat) => (
        <ChapterCopy key={beat.kicker} beat={beat} />
      ))}
      <EndSceneOverlay />
    </div>
  );
}
```

- [ ] **Step 5: Delete the obsolete landing-hero**

```bash
git rm src/components/story/landing-hero.tsx
```

- [ ] **Step 6: Verify `experience.tsx` still composes correctly**

Open `src/components/experience.tsx` and confirm it still imports `StoryOverlay` (yes it does per the earlier read) and does not import `LandingHero` (verify). If `LandingHero` is still referenced anywhere, remove that import — but based on the current state of `experience.tsx`, only `StoryOverlay` is used.

- [ ] **Step 7: Typecheck + build + browser check**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

Refresh `/`. Expected: scrolling top-to-bottom now shows: intro overlay ("Let's explore together...") → four chapter overlays with poems (one line each in italic serif) → end overlay ("Let's build something together." + social chips + See my work). Spec pills are dimmed and appear brighter on hover.

- [ ] **Step 8: Commit**

```bash
git add src/components/story/book-intro-overlay.tsx src/components/story/end-scene-overlay.tsx src/components/story/chapter-copy.tsx src/components/story/story-overlay.tsx src/components/story/landing-hero.tsx
git commit -m "Six-section HTML overlays with poem-first chapter copy

BookIntroOverlay renders the intro beat with a scroll cue. ChapterCopy
primary reveal is now the poem array (short italic serif lines);
spec pill row is dimmed at 40% and brightens on hover or focus.
EndSceneOverlay renders the end beat with LinkedIn / GitHub / Email
chips and a See-my-work chevron scrolling to the DOM Projects
section. StoryOverlay composes intro + four chapters + end for the
600vh track. landing-hero.tsx is obsolete and deleted."
```

---

## Task 13: Static narrative renders poem alongside prose

**Files:**
- Modify: `src/components/story/static-narrative.tsx` (render `poem` as an italic serif blockquote above each section's existing lines/spec/cta content; skip the poem for sections that don't have one).

**Interfaces:**
- Consumes: updated `story` with `poem` fields.
- Produces: same `<StaticNarrative />` component; internal rendering enhanced.

- [ ] **Step 1: Modify `static-narrative.tsx`**

Open `src/components/story/static-narrative.tsx`. Find the block where each `story.map((beat, i) => …)` renders. In the rendered section (after the section heading + kicker + label + title), add a poem block before the `beat.lines.map` block:

```tsx
            {beat.poem && (
              <div className="mt-6 space-y-2 border-l-2 border-glow/40 pl-4">
                {beat.poem.map((line, k) => (
                  <p
                    key={k}
                    className="font-serif text-lg italic leading-relaxed text-foreground/85"
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}
```

Place this immediately after the section heading block and before the existing `<div className="mt-6 space-y-4 font-serif text-lg leading-relaxed text-muted-foreground">` prose lines block.

The rest of the static-narrative (lines, spec, skills, cta) remains as-is. The static narrative now surfaces both the poem (mystical) and the prose (concrete) — reduced-motion users get the fullest content.

- [ ] **Step 2: Typecheck + build**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -12
```

- [ ] **Step 3: Manual browser check with reduced-motion**

Enable `prefers-reduced-motion: reduce` (OS setting or Chrome DevTools → Rendering → emulate). Hard-refresh `/`. Expected: no `<canvas>` in the DOM. All six section beats render as normal DOM. Each section shows a poem block (italic serif with a glow left border) above the existing prose. Spec pills / skills / CTAs still render.

- [ ] **Step 4: Commit**

```bash
git add src/components/story/static-narrative.tsx
git commit -m "Render poem alongside prose in the no-canvas fallback

The static narrative now surfaces each beat's poem as an italic
serif blockquote with a glow left-border, above the existing prose
lines. Reduced-motion users get the fullest content (mystical
overlay copy plus concrete prose plus spec pills plus CTAs)."
```

---

## Task 14: Final cleanup and end-to-end verification

**Files:**
- Modify: `src/components/story/chapter-rail.tsx` (verify it accepts the new 6-label list from `story.map(s => s.label)`; if hardcoded labels exist, remove).
- (No other file changes; this task is verification.)

**Interfaces:**
- Consumes: everything from Tasks 1–13.
- Produces: a shippable `/` with the shining narrative.

- [ ] **Step 1: Verify chapter-rail labels are generic**

Open `src/components/story/chapter-rail.tsx`. It should accept `labels: string[]` and render them. `experience.tsx` already passes `story.map(s => s.label)` (verify at line 27) which is now a 6-entry array. If the rail file has hardcoded labels, remove them; if it slices `labels`, remove the slice. Otherwise no change.

- [ ] **Step 2: Full typecheck**

```bash
npx tsc --noEmit
```

Clean.

- [ ] **Step 3: Full production build**

```bash
npm run build 2>&1 | tail -20
```

Expected: `/`, `/projects/nomo`, `/projects/kling`, `/_not-found` all prerender static. No `ssr:false in Server Component` errors.

- [ ] **Step 4: SSR content check via dev server**

Start `npm run dev` if not running:

```bash
curl -s http://localhost:3000/ | grep -c "gave the chaos a name"
curl -s http://localhost:3000/ | grep -c "Nomo was the first spark"
curl -s http://localhost:3000/ | grep -c "Let's explore together"
curl -s http://localhost:3000/ | grep -c "Let's build something together"
```

Each command should print at least `1`. Verifies that every poem line is server-rendered (SEO-safe).

- [ ] **Step 5: Confirm no `<canvas>` in the server HTML**

```bash
curl -s http://localhost:3000/ | grep -c "<canvas"
```

Expected: `0`.

- [ ] **Step 6: Manual full scroll pass at desktop width (1440)**

Visit `http://localhost:3000/`. Full scroll:
- Backdrop gradient shifts continuously through all five palettes.
- Character silhouette drifts through six positions; eyes glow and track the current focal point.
- Book appears in intro, fades out as Ch01 begins.
- Ch01: tangled knot resolves into crystal skeleton, then a glass icosahedron emerges.
- Ch02: pedestal rises, torus-knot glyph rotates, warm shafts sweep.
- Ch03: six low-poly icons appear in a ring and illuminate in sequence.
- Ch04: pillar of light rises; particle orbs rise along it.
- End: soft warm glow, drifting particles.
- Overlays: each section's poem reveals in italic serif. Spec pills dim/hover-brighten on Ch01/Ch02/Ch04. Ch02 shows a Try-Nomo CTA. End shows LinkedIn/GitHub/Email chips and See-my-work chevron.
- Projects / Certifications / Contact DOM sections sit correctly below the story track with no z-order issues.

- [ ] **Step 7: Manual reduced-motion pass**

Enable `prefers-reduced-motion: reduce`. Hard-refresh. Expected: `StaticNarrative` renders. All six section beats show poem (italic serif with glow left border) + prose + spec pills + CTAs. No `<canvas>`. Scroll works normally.

- [ ] **Step 8: Manual mobile-emulation pass**

Chrome DevTools → Device toolbar → 375×667 (iPhone SE). Refresh. Expected: reduced tier renders (softer Bloom, no Noise). The narrative still plays; the character still tracks the six positions; spec pills are hidden until focused. Chapter rail is hidden on `<lg` breakpoints. `<PerformanceMonitor>` should not spam scale-down events on a healthy connection.

- [ ] **Step 9: Verify Try-Nomo CTA and social chips**

Click the Ch02 "Try Nomo" link — should open `https://t.me/nomogh_bot` in a new tab. Click the End LinkedIn / GitHub / Email chips — should each open the corresponding target. Click the "See my work ↓" chevron — should scroll to `#projects`.

- [ ] **Step 10: Final commit for any small polish**

If Steps 6–9 revealed small issues (a keyframe that lands wrong, a copy typo, a section that reads too fast), fix them here with small edits, then:

```bash
git add -A
git commit -m "Polish shining narrative: [describe fixes]"
```

If no fixes are needed, skip this step.

- [ ] **Step 11: Ledger and pending-tracker update**

Update `docs/superpowers/specs/pending-assets.md`. Find the "## Structural work complete" section (added in Kling Task 8). Above the "## Done (kept for reference)" section, add:

```markdown
- [x] Home `/` shining narrative rebuild shipped: book intro, four chapters (morph-target crystal, Nomo pedestal + torus-knot, six-icon toolkit ring, ascending pillar), end scene with contact chips. Gradient backdrop shader, hooded person silhouette character, Bloom + Vignette + Noise post-processing, six-section camera rig. StaticNarrative renders poem + prose fallback for reduced-motion users.
```

Commit:
```bash
git add docs/superpowers/specs/pending-assets.md
git commit -m "Mark shining narrative rebuild complete in tracker"
```

---

## Self-review notes

**Spec coverage:** every section of the design spec maps to a task.
- §Approved decisions → Task 1 (six sections), Task 3 (person silhouette), Tasks 5–8 (each chapter's approved metaphor), Task 4 (book auto-play + click trigger).
- §Architecture / Experience layer → unchanged (`experience.tsx` composes existing pieces correctly).
- §Scene → Tasks 2 (backdrop), 3 (character), 4 (book), 5–8 (chapters), 9 (end), 10 (post-fx), 11 (camera rig).
- §Scroll bands → Task 1 (`CHAPTER_COUNT = 6`).
- §Content → Task 1 (`poem` field + intro/end beats).
- §Shared elements (book, character, backdrop shader) → Tasks 2, 3, 4.
- §Chapter-by-chapter → Tasks 4 (intro), 5–8 (Ch01–Ch04), 9 (end).
- §Post-processing recipe → Task 10.
- §Performance strategy → Task 7 (draw-call budget for toolkit), general adherence throughout.
- §Files to create → Tasks 2, 3, 4, 9, 12.
- §Files to rewrite → Tasks 5, 6, 7, 8, 10, 11, 12, 13.
- §Files to retire → Task 5 (line-morph-material), Task 12 (landing-hero).
- §Verification → Task 14.

**Placeholder scan:** no `TBD`, `TODO`, `implement later`, or vague guidance. Every code step contains real code. The only conditional text is the Task 10 fallback for `Noise` (an honest contingency, with a concrete substitute path).

**Type consistency:**
- `CHAPTER_COUNT` = 6 in Task 1, referenced consistently by camera rig (Task 11) and character (Task 3).
- `chapterLocalProgress(index)` signature unchanged (retained name); called with indices 0–5 across tasks 3, 4, 5, 6, 7, 8, 9.
- `CapabilityTier` prop type imported from `@/hooks/use-device-capability` consistently in Tasks 3, 5, 6, 10 (character, Ch01, Ch02, PostFX).
- `<Character tier={tier} />` and `<Chapter01Tangle tier={tier} />` and `<Chapter02Pedestal tier={tier} />` and `<PostFX tier={tier} />` all pass the same `tier` value from scene.tsx.
- New content field `poem?: string[]` on `StoryBeat` — consumed uniformly by book-intro-overlay, chapter-copy, end-scene-overlay, static-narrative.

**No test-runner honesty:** stated in Global Constraints. Every task uses `npx tsc --noEmit` + `npm run build` + manual browser check as the verification cadence — appropriate for a static-first Next.js presentation site with no test framework installed.

**Task independence:** each task ends with a buildable, browsable state. Between tasks the site may show intermediate visuals (e.g. Task 2 lands with new backdrop but old chapter content still using the tech-glow aesthetic) but never a broken build.
