# Book Page Spring Physics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace exponential-decay `MathUtils.damp()` on page pivots with a per-page spring simulation (position + velocity), giving pages mass, cascade lag, and natural overshoot.

**Architecture:** Single file change — `src/components/r3f/book.tsx`. Add three module-scope constant arrays, add a `pageSpring` ref, and replace the 6-line fan animation block with a spring integration loop.

**Tech Stack:** React Three Fiber v9, Three.js v0.185, TypeScript

## Global Constraints

- `chapterLocalProgress(0)` provides local `t` 0..1 — do not read `scrollState.progress` directly
- `smoothstep` helper already in file — reuse it, do not redefine
- Semi-implicit Euler integration: update velocity BEFORE position each frame
- No new npm packages
- No changes to `camera-rig.tsx` or `book-intro-overlay.tsx`
- Cover pivot animation (`if (coverPivot.current)` block) must remain completely untouched

---

### Task 1: Spring Physics for Page Pivots — book.tsx

**Files:**
- Modify: `src/components/r3f/book.tsx`

**Interfaces:**
- Consumes: `chapterLocalProgress(0)`, `smoothstep`, `pagePivots` ref (already in file), `PAGE_MAX_ROTATIONS` (already in file)
- Produces: nothing new for other files

**Current state of `book.tsx`** (read the file to confirm before editing):
- Module scope has `smoothstep` function and `PAGE_MAX_ROTATIONS` constant
- Component has: `group`, `coverPivot`, `pagePivots`, `halo`, `glyphA`, `glyphB` refs
- `useFrame` has: presence fade block → cover pivot block → fan animation block
- Fan animation block to REPLACE:
  ```ts
  // Page cascade fan: all pages spread to their target arc angle
  const fanT = smoothstep(0.60, 0.92, p);
  for (let i = 0; i < 5; i++) {
    const pivot = pagePivots.current[i];
    if (!pivot) continue;
    const target = PAGE_MAX_ROTATIONS[i] * fanT;
    pivot.rotation.z = THREE.MathUtils.damp(pivot.rotation.z, target, 5, delta);
  }
  ```

- [ ] **Step 1: Add three constant arrays at module scope**

After `PAGE_MAX_ROTATIONS` (before `export function BookIntro`), add:

```ts
const STIFFNESS = [55,  65,  75,  85, 100] as const; // index 0 = bottom page
const DAMPING   = [10,   9,   8,   7,   6] as const;
const STAGGER   = [0.060, 0.045, 0.030, 0.015, 0.000] as const;
```

- [ ] **Step 2: Add `pageSpring` ref in component body**

After the existing `useRef` declarations (after `glyphB`), add:

```ts
const pageSpring = useRef(
  Array.from({ length: 5 }, () => ({ pos: 0, vel: 0 }))
);
```

- [ ] **Step 3: Replace fan animation block in `useFrame`**

Remove the entire fan animation block:
```ts
// Page cascade fan: all pages spread to their target arc angle
const fanT = smoothstep(0.60, 0.92, p);
for (let i = 0; i < 5; i++) {
  const pivot = pagePivots.current[i];
  if (!pivot) continue;
  const target = PAGE_MAX_ROTATIONS[i] * fanT;
  pivot.rotation.z = THREE.MathUtils.damp(pivot.rotation.z, target, 5, delta);
}
```

Replace with:
```ts
// Page spring physics: each page has mass (stiffness/damping) and cascades top-to-bottom
for (let i = 0; i < 5; i++) {
  const staggeredT = Math.max(0, p - STAGGER[i]);
  const target = PAGE_MAX_ROTATIONS[i] * smoothstep(0.60, 0.92, staggeredT);
  const spring = pageSpring.current[i];
  const force = STIFFNESS[i] * (target - spring.pos) - DAMPING[i] * spring.vel;
  spring.vel += force * delta;
  spring.pos += spring.vel * delta;
  const pivot = pagePivots.current[i];
  if (pivot) pivot.rotation.z = spring.pos;
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors. Fix any type errors before proceeding.

- [ ] **Step 5: Visual smoke-test**

Run `npm run dev`. Scroll through the intro band slowly and quickly:

- **Slow scroll**: pages fan open with slight cascade (top page leads, bottom lags)
- **Fast scroll then stop**: top page bounces/overshoots slightly before settling; bottom page oscillates less
- **Back-scroll**: pages chase target back toward 0, spring dynamics apply in reverse
- Cover animation unaffected
- Chapters 1–5 unaffected

If pages wildly overshoot or oscillate too much, reduce STIFFNESS values. If still stiff, reduce DAMPING.

- [ ] **Step 6: Commit**

```bash
git add src/components/r3f/book.tsx
git commit -m "feat: add spring physics to page cascade fan — mass, inertia, cascade lag"
```
