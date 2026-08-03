# Book Page Cascade Fan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single page-block mesh in `BookIntro` with 5 individually animated page meshes that fan out in a cascade arc as the user scrolls through t 0.60–0.92 of the intro band.

**Architecture:** All changes are confined to `src/components/r3f/book.tsx`. The single `BoxGeometry [0.66, 0.05, 0.46]` page-block mesh is replaced by 5 thin `[0.66, 0.01, 0.46]` meshes, each in its own pivot group that rotates around the left spine edge. The `useFrame` loop drives all 5 pivots to different target angles via the same `smoothstep(0.60, 0.92, p)` window, producing a fan arc.

**Tech Stack:** React Three Fiber v9, Three.js v0.185, TypeScript

## Global Constraints

- `chapterLocalProgress(0)` returns local intro `t` 0..1 — always use this, never read `scrollState.progress` directly inside `book.tsx`
- `smoothstep` helper already defined in `book.tsx` — reuse it, do not redefine
- `THREE.MathUtils.damp(current, target, factor, delta)` — use factor `5` for page pivots (same as cover pivot)
- `THREE.DoubleSide` — required on page material so the back face renders when flipped past vertical
- Page-block mesh (`BoxGeometry [0.66, 0.05, 0.46]` at `position={[0.01, 0.06, 0]}`) must be fully removed — not kept alongside the new pages
- No changes to `camera-rig.tsx` or `book-intro-overlay.tsx`
- No new npm packages

---

### Task 1: Page Cascade Fan — book.tsx

**Files:**
- Modify: `src/components/r3f/book.tsx`

**Interfaces:**
- Consumes: `chapterLocalProgress(0)` → local `t` 0..1; `smoothstep` (already in file); `THREE.MathUtils.damp`
- Produces: nothing new for other files — self-contained animation

**Context on existing file:**

```
Current structure of BookIntro's JSX (inside <group ref={group} ...>):
  - Bottom cover mesh at [0, 0, 0]        ← keep untouched
  - Page block mesh at [0.01, 0.06, 0]    ← REMOVE THIS
  - Spine mesh at [-0.34, 0.06, 0]        ← keep untouched
  - Halo mesh at [0, -0.06, 0]            ← keep untouched
  - <group ref={coverPivot} ...>          ← keep untouched
      top cover mesh, glyphA, glyphB

Current useFrame: reads p = chapterLocalProgress(0), animates presence
fade on group, cover pivot rotation. The page block has no ref and is
not animated.
```

- [ ] **Step 1: Add `pagePivots` ref**

In the component body, after the existing `useRef` declarations, add:

```ts
const pagePivots = useRef<(THREE.Group | null)[]>([null, null, null, null, null]);
```

- [ ] **Step 2: Add `PAGE_MAX_ROTATIONS` constant**

At module scope (after the `smoothstep` function, before `BookIntro`), add:

```ts
const PAGE_MAX_ROTATIONS = [
  Math.PI * 0.16, // page 0 — bottom
  Math.PI * 0.36, // page 1
  Math.PI * 0.58, // page 2
  Math.PI * 0.80, // page 3
  Math.PI,        // page 4 — top
] as const;
```

- [ ] **Step 3: Add page fan animation to `useFrame`**

Inside `useFrame`, after the cover pivot block (the `if (coverPivot.current)` block), add:

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

- [ ] **Step 4: Replace page block mesh with 5 page pivot groups in JSX**

Remove:
```tsx
{/* Page block — untouched */}
<mesh position={[0.01, 0.06, 0]}>
  <boxGeometry args={[0.66, 0.05, 0.46]} />
  <meshStandardMaterial color={pages} roughness={0.9} metalness={0} />
</mesh>
```

Replace with (place at the same JSX position, between the bottom cover and the spine):
```tsx
{/* Page cascade fan — 5 individual pages replacing the page block */}
{([0.040, 0.050, 0.060, 0.070, 0.080] as const).map((yCenter, i) => (
  <group
    key={i}
    ref={(el) => { pagePivots.current[i] = el; }}
    position={[-0.32, yCenter, 0]}
  >
    <mesh position={[0.33, 0, 0]}>
      <boxGeometry args={[0.66, 0.01, 0.46]} />
      <meshStandardMaterial
        color={pages}
        roughness={0.9}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  </group>
))}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: 0 errors. Fix any type errors before proceeding.

- [ ] **Step 6: Visual smoke-test in browser**

Run the dev server (`npm run dev`). Open the portfolio. Slowly scroll through the intro band:

- At rest (t = 0): book shows with page block area visible, no pages fanned
- Mid-scroll (t ≈ 0.60–0.75): cover swinging AND pages beginning to fan
- Late scroll (t ≈ 0.85–0.92): fan fully spread — top page nearly flat, bottom barely lifted
- No z-fighting (pages should not flicker into each other)
- Chapters 1–5 unaffected

If cover or pages swing in the wrong direction, check `PAGE_MAX_ROTATIONS` signs (positive = same direction as cover).

- [ ] **Step 7: Commit**

```bash
git add src/components/r3f/book.tsx
git commit -m "feat: replace page block with 5-page cascade fan animation"
```
