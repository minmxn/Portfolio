# Book Camera Dive v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scroll-driven cover-open animation to the 3D book and replace the v1 camera dive with a 4-phase sun-position → drift → steep dive → entry path that takes the viewer through the open book.

**Architecture:** Three files are modified in isolation. `book.tsx` gains a pivot group that wraps the top cover and glyphs and animates rotation via `chapterLocalProgress(0)`. `camera-rig.tsx` replaces the 3-phase intro sub-path with 4 phases using new sun-position coordinates. `book-intro-overlay.tsx` updates four numeric thresholds in the existing RAF loop to match the new scroll timing. No new files, no new dependencies.

**Tech Stack:** React Three Fiber v9, Three.js v0.185, `chapterLocalProgress` / `scrollState` from `@/components/scroll/scroll-state`.

## Global Constraints

- No new files — modify only the three listed files
- No new npm dependencies
- `book.tsx`: bottom cover, page block, spine, halo geometry are untouched
- `book.tsx`: book group position `[-0.9, -0.6, 0.4]` and rotation `[0, 0.3, 0]` are untouched
- `camera-rig.tsx`: `KEYFRAMES[1]` through `KEYFRAMES[5]` and the crossing-frame hard-snap logic are untouched
- `book-intro-overlay.tsx`: Framer Motion `initial`/`whileInView`/`animate`/`viewport`/`transition` props are untouched; RAF loop structure is untouched
- TypeScript must compile cleanly (`npx tsc --noEmit`) after each task

---

## File Map

| File | What changes |
|---|---|
| `src/components/r3f/book.tsx` | Add `smoothstep` helper; add `coverPivot` ref; restructure top cover + glyphs inside pivot group; animate pivot rotation in `useFrame` |
| `src/components/r3f/camera-rig.tsx` | Replace 3 intro sub-phases with 4; update 8 position/look-at tuples; update `desiredPos` init; update parallax fade range |
| `src/components/story/book-intro-overlay.tsx` | Update 4 numeric thresholds in the existing RAF `tick()` function |

---

## Task 1: Cover Pivot Animation — `book.tsx`

**Files:**
- Modify: `src/components/r3f/book.tsx`

**Interfaces:**
- Consumes: `chapterLocalProgress(0)` — returns number 0..1 for the intro chapter's local scroll progress
- Produces: visual only — no exported API change

- [ ] **Step 1: Read the current file**

```
c:/Users/min.y.seet/Desktop/portfolio/src/components/r3f/book.tsx
```

Confirm the file matches the expected structure: one `BookIntro` component, `group` ref at position `[-0.9, -0.6, 0.4]`, top cover mesh at `[0, 0.12, 0]`, glyphs at `[0, 0.16, 0]`.

- [ ] **Step 2: Add `smoothstep` helper and `coverPivot` ref; restructure the JSX and `useFrame`**

Replace the entire file with:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function BookIntro() {
  const group = useRef<THREE.Group>(null);
  const coverPivot = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const glyphA = useRef<THREE.Mesh>(null);
  const glyphB = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(0);
    if (!group.current) return;

    // Presence fade — unchanged from v1
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

    // Cover open: pivot rotates 0 → Math.PI across t 0.45 → 0.75
    if (coverPivot.current) {
      const targetRotation = smoothstep(0.45, 0.75, p) * Math.PI;
      coverPivot.current.rotation.z = THREE.MathUtils.damp(
        coverPivot.current.rotation.z,
        targetRotation,
        5,
        delta,
      );
    }
  });

  const leather = "#3a2318";
  const pages = "#e8d9b3";
  const glyphMat = (
    <meshStandardMaterial
      color="#ffffff"
      emissive="#ffeecc"
      emissiveIntensity={1.2}
      roughness={0.3}
      metalness={0.2}
    />
  );

  return (
    <group ref={group} position={[-0.9, -0.6, 0.4]} rotation={[0, 0.3, 0]}>
      {/* Bottom cover — untouched */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Page block — untouched */}
      <mesh position={[0.01, 0.06, 0]}>
        <boxGeometry args={[0.66, 0.05, 0.46]} />
        <meshStandardMaterial color={pages} roughness={0.9} metalness={0} />
      </mesh>
      {/* Spine — untouched */}
      <mesh position={[-0.34, 0.06, 0]}>
        <boxGeometry args={[0.03, 0.16, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Halo — untouched */}
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
      {/*
        Cover pivot group.
        Origin at [-0.35, 0.12, 0] = left spine edge at cover height.
        Rotation around local Z swings the cover open.
        Top cover offset [0.35, 0, 0] keeps its left edge on the pivot origin.
        Glyphs offset [0.35, 0.04, 0] = original [0,0.16,0] minus pivot [−0.35,0.12,0].
      */}
      <group ref={coverPivot} position={[-0.35, 0.12, 0]}>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.7, 0.06, 0.5]} />
          <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
        </mesh>
        <mesh ref={glyphA} position={[0.35, 0.04, 0]}>
          <boxGeometry args={[0.02, 0.005, 0.12]} />
          {glyphMat}
        </mesh>
        <mesh ref={glyphB} position={[0.35, 0.04, 0]}>
          <boxGeometry args={[0.12, 0.005, 0.02]} />
          {glyphMat}
        </mesh>
      </group>
    </group>
  );
}
```

**Geometry note:** The pivot group sits at `[-0.35, 0.12, 0]` in the book's local space (left spine edge, at cover Y). Inside the pivot, the top cover is at `[0.35, 0, 0]` so its left edge aligns with the pivot origin. When `coverPivot.rotation.z` goes from `0 → Math.PI`, the cover's right edge arcs upward through the Y direction then falls to the other side — from the steep overhead camera this reads as a classic book opening. If the direction looks visually wrong (cover swings the wrong way), change `Math.PI` to `-Math.PI`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd c:/Users/min.y.seet/Desktop/portfolio
npx tsc --noEmit
```

Expected: no output, exit 0.

- [ ] **Step 4: Manual browser check**

Run `npm run dev`. Open the portfolio. Confirm:
1. At rest (no scroll): book is visible with cover closed, viewed from above
2. Scrolling through 45–75% of the intro section: cover visibly swings open, revealing page block underneath
3. At 75%+: cover is fully open (lying flat, rotated ~180°)
4. If the cover swings in the wrong direction (toward viewer instead of away, or clips weirdly), flip `Math.PI` to `-Math.PI` in the `targetRotation` line

- [ ] **Step 5: Commit**

```bash
git add src/components/r3f/book.tsx
git commit -m "feat: add scroll-driven cover-open animation to BookIntro"
```

---

## Task 2: 4-Phase Sun Camera Path — `camera-rig.tsx`

**Files:**
- Modify: `src/components/r3f/camera-rig.tsx`

**Interfaces:**
- Consumes: `scrollState.progress` (plain mutable number 0–1), `CHAPTER_COUNT` (= 6)
- Produces: camera position and lookAt updated each frame — no exported API change

- [ ] **Step 1: Read the current file**

```
c:/Users/min.y.seet/Desktop/portfolio/src/components/r3f/camera-rig.tsx
```

Confirm it contains: `INTRO_END = 1/6`, `smoothstep`, `wasInIntro` ref, `isCrossingFrame` hard-snap in the `else` branch, and 3 sub-phases in the `if (inIntro)` block (hold at t≤0.50, dive 0.50–0.85, entry 0.85–1.00).

- [ ] **Step 2: Update `desiredPos` initialisation**

Change line:
```ts
const desiredPos = useRef(new THREE.Vector3(0.3, 1.8, 5.5));
```
To:
```ts
const desiredPos = useRef(new THREE.Vector3(-0.5, 4.5, 3.5));
```

This prevents the camera from jumping on the first frame — it starts at the new sun-position hold.

- [ ] **Step 3: Replace the 3-phase intro block with 4 phases**

Inside the `if (inIntro)` block, replace everything from the sub-phase positions down to (and including) the parallax + damp calls with:

```ts
      const t = progress / INTRO_END;

      const sunPos:    [number, number, number] = [-0.5,  4.5,  3.5];
      const sunLook:   [number, number, number] = [-0.9, -0.6,  0.4];
      const driftPos:  [number, number, number] = [-0.7,  2.0,  2.0];
      const driftLook: [number, number, number] = [-0.9, -0.2,  0.4];
      const divePos:   [number, number, number] = [-0.9,  0.2,  0.5];
      const diveLook:  [number, number, number] = [-0.9, -1.5,  0.4];
      const entryPos:  [number, number, number] = [-0.9, -0.3,  0.5];
      const entryLook: [number, number, number] = [-0.9, -1.5,  0.4];

      if (t <= 0.45) {
        // Hold: steep overhead sun position, camera stationary
        desiredPos.current.set(...sunPos);
        desiredLook.current.set(...sunLook);
      } else if (t <= 0.75) {
        // Drift: camera eases down as cover opens
        const f = smoothstep(0.45, 0.75, t);
        desiredPos.current.set(
          THREE.MathUtils.lerp(sunPos[0], driftPos[0], f),
          THREE.MathUtils.lerp(sunPos[1], driftPos[1], f),
          THREE.MathUtils.lerp(sunPos[2], driftPos[2], f),
        );
        desiredLook.current.set(
          THREE.MathUtils.lerp(sunLook[0], driftLook[0], f),
          THREE.MathUtils.lerp(sunLook[1], driftLook[1], f),
          THREE.MathUtils.lerp(sunLook[2], driftLook[2], f),
        );
      } else if (t <= 0.92) {
        // Dive: steep fall into the open book interior
        const f = smoothstep(0.75, 0.92, t);
        desiredPos.current.set(
          THREE.MathUtils.lerp(driftPos[0], divePos[0], f),
          THREE.MathUtils.lerp(driftPos[1], divePos[1], f),
          THREE.MathUtils.lerp(driftPos[2], divePos[2], f),
        );
        desiredLook.current.set(
          THREE.MathUtils.lerp(driftLook[0], diveLook[0], f),
          THREE.MathUtils.lerp(driftLook[1], diveLook[1], f),
          THREE.MathUtils.lerp(driftLook[2], diveLook[2], f),
        );
      } else {
        // Entry: last push before black overlay
        const f = smoothstep(0.92, 1.00, t);
        desiredPos.current.set(
          THREE.MathUtils.lerp(divePos[0], entryPos[0], f),
          THREE.MathUtils.lerp(divePos[1], entryPos[1], f),
          THREE.MathUtils.lerp(divePos[2], entryPos[2], f),
        );
        desiredLook.current.set(
          THREE.MathUtils.lerp(diveLook[0], entryLook[0], f),
          THREE.MathUtils.lerp(diveLook[1], entryLook[1], f),
          THREE.MathUtils.lerp(diveLook[2], entryLook[2], f),
        );
      }

      // Parallax fades out t 0.45→0.75 (during drift/cover-open) so it doesn't fight the dive.
      const parallaxScale = t <= 0.45
        ? 1.0
        : THREE.MathUtils.clamp(1.0 - (t - 0.45) / 0.30, 0, 1);
      const parallaxX = pointer.x * 0.25 * parallaxScale;
      const parallaxY = pointer.y * 0.15 * parallaxScale;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.current.x + parallaxX, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.current.y + parallaxY, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.current.z, 4, delta);
```

Everything after the `if (inIntro)` block — the `else` branch with `isCrossingFrame` hard-snap, and the final `currentLook` damp — is **untouched**.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd c:/Users/min.y.seet/Desktop/portfolio
npx tsc --noEmit
```

Expected: no output, exit 0.

- [ ] **Step 5: Manual browser check**

With `npm run dev` running:
1. At page load, the camera should be high and steep — the book looks small and clearly below the viewer, like an aerial shot
2. Scrolling 0–45% of intro: camera is stationary, book is in full view
3. Scrolling 45–75%: camera drifts down and forward while the cover opens (from Task 1)
4. Scrolling 75–92%: camera falls steeply — the look-at drops to y=−1.5 so the viewer's gaze is directed deep below
5. Scrolling past the intro: chapter 1 scene snaps in cleanly under the black overlay
6. Chapters 1–5: no regression in camera behaviour

- [ ] **Step 6: Commit**

```bash
git add src/components/r3f/camera-rig.tsx
git commit -m "feat: replace 3-phase camera dive with 4-phase sun-position path"
```

---

## Task 3: Updated Scroll Thresholds — `book-intro-overlay.tsx`

**Files:**
- Modify: `src/components/story/book-intro-overlay.tsx`

**Interfaces:**
- Consumes: `scrollState.progress` (plain mutable number 0–1) via existing RAF loop
- Produces: visual only — no exported API change

- [ ] **Step 1: Read the current file**

```
c:/Users/min.y.seet/Desktop/portfolio/src/components/story/book-intro-overlay.tsx
```

Find the `tick()` function inside `useEffect`. It contains four numeric literals that need updating.

- [ ] **Step 2: Update the four thresholds**

Make exactly these four changes inside `tick()`:

**SCROLL indicator exit** — change:
```ts
scrollWrapRef.current.style.opacity = String(1 - lerp01(0.083, 0.095, p));
```
To:
```ts
scrollWrapRef.current.style.opacity = String(1 - lerp01(0.075, 0.085, p));
```

**Poem text exit** — change:
```ts
poemWrapRef.current.style.opacity = String(1 - lerp01(0.095, 0.120, p));
```
To:
```ts
poemWrapRef.current.style.opacity = String(1 - lerp01(0.100, 0.125, p));
```

**Black overlay fade-in guard** — change:
```ts
if (p >= 0.142 && p < 0.167) {
  opacity = lerp01(0.142, 0.167, p);
```
To:
```ts
if (p >= 0.153 && p < 0.167) {
  opacity = lerp01(0.153, 0.167, p);
```

The fade-out guard (`p >= 0.167 && p < 0.200`) and `lerp01(0.167, 0.200, p)` are **unchanged**.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd c:/Users/min.y.seet/Desktop/portfolio
npx tsc --noEmit
```

Expected: no output, exit 0.

- [ ] **Step 4: Manual browser check — full flow**

With `npm run dev`:
1. SCROLL indicator fades out right as the cover begins to open (~45% of intro scroll)
2. Poem text fades out midway through the cover opening (~60% of intro scroll), while the camera is drifting down
3. Black overlay appears as the camera reaches the page level (~92% of intro)
4. Chapter 1 fades in cleanly after the black clears

- [ ] **Step 5: Commit**

```bash
git add src/components/story/book-intro-overlay.tsx
git commit -m "feat: update overlay thresholds for v2 cover-open scroll timing"
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Cover pivot at `[-0.35, 0.12, 0]`, Z rotation, damp factor 5 | Task 1 Step 2 |
| Top cover offset `[0.35, 0, 0]` inside pivot | Task 1 Step 2 |
| Glyph offset `[0.35, 0.04, 0]` inside pivot | Task 1 Step 2 |
| Rotation `0 → Math.PI` via smoothstep(0.45, 0.75, t) | Task 1 Step 2 |
| Bottom cover, page block, spine, halo untouched | Task 1 Step 2 (placed outside pivot group) |
| `desiredPos` init `[-0.5, 4.5, 3.5]` | Task 2 Step 2 |
| Hold phase: t≤0.45, sun position | Task 2 Step 3 |
| Drift phase: t 0.45–0.75, smoothstep | Task 2 Step 3 |
| Dive phase: t 0.75–0.92, smoothstep, look-at y=−1.5 | Task 2 Step 3 |
| Entry phase: t 0.92–1.00, smoothstep | Task 2 Step 3 |
| Parallax fades t 0.45→0.75, zero after | Task 2 Step 3 |
| Chapters 1–5 keyframes + crossing-frame hard-snap untouched | Task 2 Step 3 (explicitly stated to leave else-branch untouched) |
| SCROLL exit 0.075→0.085 | Task 3 Step 2 |
| Poem exit 0.100→0.125 | Task 3 Step 2 |
| Black in 0.153→0.167 | Task 3 Step 2 |
| Black out 0.167→0.200 unchanged | Task 3 Step 2 |
| FM entrance animations untouched | Task 3 Step 2 (only `tick()` values change) |

**Placeholder scan:** No TBDs, no TODOs, all code blocks are complete.

**Type consistency:**
- `smoothstep` defined in Task 1 (`book.tsx`) and already present in `camera-rig.tsx` — two independent module-local copies, no cross-file dependency ✓
- All tuples are `[number, number, number]` with matching spread calls ✓
- `coverPivot` ref is `useRef<THREE.Group>(null)`, accessed as `.rotation.z` ✓
- `lerp01` is already defined in `book-intro-overlay.tsx`; Task 3 only changes the arguments ✓
