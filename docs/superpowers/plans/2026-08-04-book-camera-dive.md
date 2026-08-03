# Book Camera Dive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static intro experience with a scroll-driven cinematic camera dive that pulls the viewer into the storybook, using a two-phase hold → dive → fade-to-black → chapter-1 transition.

**Architecture:** The intro scroll band (progress `0.0 → 0.167`) is intercepted in `CameraRig` before the normal keyframe sampler runs, replacing it with a three-sub-phase path (hold → dive → entry). A fixed black `<div>` in `BookIntroOverlay` fades in/out across the transition boundary, hiding the camera snap. All text exits are opacity-only, driven by the same `requestAnimationFrame` loop that drives the overlay.

**Tech Stack:** React Three Fiber v9, Three.js v0.185, Framer Motion, `scrollState` shared mutable object from `@/components/scroll/scroll-state`.

## Global Constraints

- No new files — modify only the two files listed below
- `book.tsx` is untouched — book geometry and Float animation unchanged
- Chapter 1–5 camera keyframes (`KEYFRAMES[1]` through `KEYFRAMES[5]`) are untouched
- Entrance animations in `book-intro-overlay.tsx` (Framer Motion `initial`/`whileInView`/`animate`) are untouched
- `scrollState.progress` is a plain mutable number (0–1) written by GSAP/Lenis; read it directly — no React state, no subscription

---

## File Map

| File | Role |
|---|---|
| `src/components/r3f/camera-rig.tsx` | Add sub-phase dive logic within intro band; add snap fix on transition out |
| `src/components/story/book-intro-overlay.tsx` | Add RAF-driven opacity exits for poem text and SCROLL indicator; add fixed black overlay div |

---

## Task 1: Camera Dive — `camera-rig.tsx`

**Files:**
- Modify: `src/components/r3f/camera-rig.tsx`

**Interfaces:**
- Consumes: `scrollState.progress` (number, 0–1), `CHAPTER_COUNT` (= 6) from `@/components/scroll/scroll-state`
- Produces: camera position and lookAt updated each frame — no exported API change

- [ ] **Step 1: Add the `smoothstep` helper and `INTRO_END` constant**

At the top of the file, after the imports, add:

```ts
const INTRO_END = 1 / 6; // progress value where intro band ends

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
```

`smoothstep` remaps `x` from `[edge0, edge1]` to `[0, 1]` with an ease-in-out curve. This is the standard GLSL smoothstep. Using it for the dive and entry sub-phases makes the camera accelerate into the cover rather than move at constant speed.

- [ ] **Step 2: Add `wasInIntro` ref inside `CameraRig`**

Inside the `CameraRig` function, alongside the existing refs, add:

```ts
const wasInIntro = useRef(true);
```

This ref tracks whether the previous frame was still inside the intro band. It is used to detect the single crossing-frame when `progress` first exceeds `INTRO_END`, so the damp factor can be temporarily boosted to force an instant snap.

- [ ] **Step 3: Replace the `useFrame` body with the sub-phase dive logic**

Replace the entire `useFrame` callback with the following. The structure is: if in intro band → compute dive camera; else → run existing keyframe sampler. The snap fix runs on the one frame where the band is crossed.

```ts
useFrame((_, delta) => {
  const progress = scrollState.progress;
  const inIntro = progress < INTRO_END;

  // Detect the single frame where we exit the intro band and boost damp to snap.
  const dampFactor = wasInIntro.current && !inIntro ? 60 : 4;
  if (wasInIntro.current && !inIntro) wasInIntro.current = false;

  if (inIntro) {
    // t = local sub-progress within the intro band, 0..1
    const t = progress / INTRO_END;

    // Sub-phase positions and look-ats (from spec)
    const holdPos:  [number, number, number] = [0.3, 1.8, 5.5];
    const holdLook: [number, number, number] = [-0.3, -0.4, 0.0];
    const divePos:  [number, number, number] = [0.1, 0.4, 1.2];
    const diveLook: [number, number, number] = [-0.2, 0.0, 0.0];
    const entryPos: [number, number, number] = [0.0, 0.0, 0.3];
    const entryLook:[number, number, number] = [0.0, 0.0, 0.0];

    if (t <= 0.50) {
      // Hold: camera stationary at elevated isometric view
      desiredPos.current.set(...holdPos);
      desiredLook.current.set(...holdLook);
    } else if (t <= 0.85) {
      // Dive: smoothstep from hold position toward mid-dive position
      const f = smoothstep(0.50, 0.85, t);
      desiredPos.current.set(
        THREE.MathUtils.lerp(holdPos[0], divePos[0], f),
        THREE.MathUtils.lerp(holdPos[1], divePos[1], f),
        THREE.MathUtils.lerp(holdPos[2], divePos[2], f),
      );
      desiredLook.current.set(
        THREE.MathUtils.lerp(holdLook[0], diveLook[0], f),
        THREE.MathUtils.lerp(holdLook[1], diveLook[1], f),
        THREE.MathUtils.lerp(holdLook[2], diveLook[2], f),
      );
    } else {
      // Entry: smoothstep from mid-dive to book cover surface
      const f = smoothstep(0.85, 1.00, t);
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

    // Parallax fades out during the dive so it doesn't fight the camera's forward momentum.
    // At t=0.50 scale is 1.0; at t=0.85 scale is 0.0; stays 0 for entry.
    const parallaxScale = t <= 0.50
      ? 1.0
      : THREE.MathUtils.clamp(1.0 - (t - 0.50) / 0.35, 0, 1);
    const parallaxX = pointer.x * 0.25 * parallaxScale;
    const parallaxY = pointer.y * 0.15 * parallaxScale;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.current.x + parallaxX, dampFactor, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.current.y + parallaxY, dampFactor, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.current.z, dampFactor, delta);
  } else {
    // Chapters 1–5: existing keyframe sampler, unchanged
    sampleKeyframe(progress, "pos", desiredPos.current);
    sampleKeyframe(progress, "look", desiredLook.current);

    const parallaxX = pointer.x * 0.25;
    const parallaxY = pointer.y * 0.15;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.current.x + parallaxX, dampFactor, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.current.y + parallaxY, dampFactor, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.current.z, dampFactor, delta);
  }

  currentLook.current.x = THREE.MathUtils.damp(currentLook.current.x, desiredLook.current.x, dampFactor, delta);
  currentLook.current.y = THREE.MathUtils.damp(currentLook.current.y, desiredLook.current.y, dampFactor, delta);
  currentLook.current.z = THREE.MathUtils.damp(currentLook.current.z, desiredLook.current.z, dampFactor, delta);
  camera.lookAt(currentLook.current);
});
```

- [ ] **Step 4: Update the `desiredPos` initialisation to match the new starting position**

The existing `useRef` initialises `desiredPos` to the old keyframe-0 position. Update it to the new isometric start so the camera doesn't jump on first frame:

Change:
```ts
const desiredPos = useRef(new THREE.Vector3(0, 0.4, 3.2));
```
To:
```ts
const desiredPos = useRef(new THREE.Vector3(0.3, 1.8, 5.5));
```

- [ ] **Step 5: Manual browser verification — camera path**

Run the dev server (`npm run dev`). Open the portfolio in the browser. Scroll through the intro band and verify:

1. On page load, the book appears small and elevated, viewed from ~30° above (isometric).
2. Scrolling through the first half of the intro section: camera holds still.
3. Scrolling through the second half: camera noticeably moves forward, accelerating toward the book.
4. Continues smoothly into the book cover (z approaches 0.3).
5. After scrolling past the intro into chapter 1, the camera is in the chapter-1 position without any visible slide or jump.
6. Scrolling through chapters 1–5: camera behaves identically to before (no regression).

- [ ] **Step 6: Commit**

```bash
git add src/components/r3f/camera-rig.tsx
git commit -m "feat: add scroll-driven camera dive into book on intro section"
```

---

## Task 2: Overlay & Text Exits — `book-intro-overlay.tsx`

**Files:**
- Modify: `src/components/story/book-intro-overlay.tsx`

**Interfaces:**
- Consumes: `scrollState` from `@/components/scroll/scroll-state`
- Produces: DOM mutations — no exported API change

- [ ] **Step 1: Import `useEffect` and `useRef`; import `scrollState`**

At the top of the file, update the imports:

```ts
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { story } from "@/content";
import { scrollState } from "@/components/scroll/scroll-state";
```

- [ ] **Step 2: Add refs and the RAF opacity loop inside `BookIntroOverlay`**

Add the following inside the function body, before the `return`:

```ts
const poemWrapRef = useRef<HTMLDivElement>(null);
const scrollWrapRef = useRef<HTMLDivElement>(null);
const blackRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Maps progress x from [from, to] → [0, 1], clamped.
  function lerp01(from: number, to: number, x: number): number {
    if (x <= from) return 0;
    if (x >= to) return 1;
    return (x - from) / (to - from);
  }

  let rafId: number;

  function tick() {
    const p = scrollState.progress;

    // SCROLL indicator: exit 0.083 → 0.095
    if (scrollWrapRef.current) {
      scrollWrapRef.current.style.opacity = String(1 - lerp01(0.083, 0.095, p));
    }

    // Poem text: exit 0.095 → 0.120
    if (poemWrapRef.current) {
      poemWrapRef.current.style.opacity = String(1 - lerp01(0.095, 0.120, p));
    }

    // Black overlay: fades in 0.142 → 0.167, fades out 0.167 → 0.200
    if (blackRef.current) {
      let opacity = 0;
      if (p >= 0.142 && p < 0.167) {
        opacity = lerp01(0.142, 0.167, p);
      } else if (p >= 0.167 && p < 0.200) {
        opacity = 1 - lerp01(0.167, 0.200, p);
      }
      blackRef.current.style.opacity = String(opacity);
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}, []);
```

The RAF loop runs every frame and directly mutates element styles — no React re-renders. This matches the pattern used by the canvas (`scrollState` is already a mutable object read every frame there).

- [ ] **Step 3: Update the JSX to add wrapper refs and the black overlay div**

Replace the entire `return` block with:

```tsx
return (
  <section
    data-chapter
    data-label={beat.label}
    className="relative h-[100vh]"
  >
    <div className="sticky top-0 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* poemWrapRef: receives scroll-driven opacity exit for poem text */}
      <div ref={poemWrapRef}>
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
          {/* scrollWrapRef: receives scroll-driven opacity exit for SCROLL indicator */}
          <div ref={scrollWrapRef}>
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
          </div>
        </motion.div>
      </div>
    </div>

    {/* Black overlay — covers entire viewport, z-50 sits above canvas (z-0) and story track */}
    <div
      ref={blackRef}
      className="fixed inset-0 z-50 bg-black pointer-events-none"
      style={{ opacity: 0 }}
    />
  </section>
);
```

Key structural notes:
- `poemWrapRef` wraps the entire poem + SCROLL block. Setting its opacity to 0 hides both without touching Framer Motion internals.
- `scrollWrapRef` is a separate inner wrapper for just the SCROLL indicator, so it can exit earlier than the poem text.
- The black `<div>` uses `position: fixed` (via Tailwind `fixed`) so it escapes the section's layout flow and covers the full viewport. `pointer-events-none` ensures scroll still works through it.
- Initial `style={{ opacity: 0 }}` prevents any flash before the first RAF tick.

- [ ] **Step 4: Manual browser verification — overlay and text timing**

With the dev server running, scroll through the intro and verify:

1. SCROLL indicator (the bouncing line + "Scroll" text) fades out right as the camera starts to move forward.
2. The poem text ("Let's explore together…") stays visible partway into the camera dive, then fades.
3. As the camera approaches the book cover, a black fade covers the screen.
4. After full black, the screen brightens again to reveal chapter 1 (tangle wireframe + chapter text).
5. Black overlay does not appear during chapters 1–5 when scrolling normally.
6. At progress = 0 (top of page), no black overlay is visible.

- [ ] **Step 5: Commit**

```bash
git add src/components/story/book-intro-overlay.tsx
git commit -m "feat: add black dive overlay and scroll-driven text exits to book intro"
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task covering it |
|---|---|
| Camera holds at isometric position for first 50% of intro band | Task 1, Step 3 (hold sub-phase, t ≤ 0.50) |
| Camera dives with smoothstep acceleration 50%–85% | Task 1, Step 3 (dive sub-phase, smoothstep 0.50→0.85) |
| Camera reaches book cover at 85%–100% | Task 1, Step 3 (entry sub-phase, smoothstep 0.85→1.00) |
| Parallax fades out during dive so it doesn't fight momentum | Task 1, Step 3 (parallaxScale) |
| Instant-snap damp fix on crossing INTRO_END | Task 1, Step 3 (wasInIntro ref + dampFactor=60) |
| Black overlay fades in 0.142→0.167, fades out 0.167→0.200 | Task 2, Step 2 (RAF tick, blackRef) |
| SCROLL indicator exits progress 0.083→0.095 | Task 2, Step 2 (RAF tick, scrollWrapRef) |
| Poem text exits progress 0.095→0.120 | Task 2, Step 2 (RAF tick, poemWrapRef) |
| book.tsx unchanged | ✓ not touched in either task |
| Chapter 1–5 keyframes unchanged | ✓ Task 1 Step 3 preserves existing else-branch |
| Entrance animations unchanged | ✓ Task 2 Step 3 preserves all `initial`/`whileInView`/`animate` props |

**Placeholder scan:** No TBDs or TODOs. All code blocks are complete.

**Type consistency:** `smoothstep` returns `number`. `lerp01` returns `number`. `dampFactor` is `number`. All `THREE.MathUtils` calls match their signatures. `desiredPos.current.set(...holdPos)` — `holdPos` is `[number, number, number]`, spread is valid. ✓
