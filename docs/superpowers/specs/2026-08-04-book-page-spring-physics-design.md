# Book Page Spring Physics — Design Spec

**Date:** 2026-08-04
**Extends:** `2026-08-04-book-page-cascade-fan-design.md`
**Feature:** Replace exponential-decay damping on page pivots with per-page spring simulation (position + velocity), giving pages mass, inertia, and natural overshoot

---

## Goal

Pages currently feel stiff because `MathUtils.damp()` is pure exponential decay — no momentum, no overshoot, identical motion for all 5 pages. This spec replaces the fan animation with a spring simulation: each page tracks its own velocity, heavier/lower pages lag behind lighter/upper pages, and all pages overshoot slightly before settling.

---

## Architecture

One file changed: `src/components/r3f/book.tsx`

No changes to `camera-rig.tsx` or `book-intro-overlay.tsx`.

---

## Spring Physics Model

### Integration (semi-implicit Euler, per frame)

```
force  = stiffness × (target − position) − damping × velocity
velocity += force × delta
position += velocity × delta
```

Semi-implicit Euler (velocity updated before position) is unconditionally stable for the stiffness values used and requires no sub-stepping.

### Per-page constants

Pages are indexed 0 (bottom/heaviest) → 4 (top/lightest):

| Index | Stiffness | Damping | Stagger offset (t) |
|---|---|---|---|
| 0 (bottom) | 55 | 10 | 0.060 |
| 1 | 65 | 9 | 0.045 |
| 2 | 75 | 8 | 0.030 |
| 3 | 85 | 7 | 0.015 |
| 4 (top) | 100 | 6 | 0.000 |

**Stiffness** — lower = heavier, slower to react. **Damping** — higher = less oscillation. **Stagger offset** — delays each page's scroll target by this amount of local t, so the cascade ripples top-to-bottom.

All values are underdamped (damping ratio < 1), giving natural overshoot.

### Target computation

Each page's target rotation is computed from a staggered local t:

```ts
const staggeredT = Math.max(0, p - STAGGER[i]);
const target = PAGE_MAX_ROTATIONS[i] * smoothstep(0.60, 0.92, staggeredT);
```

Where `p = chapterLocalProgress(0)` and `PAGE_MAX_ROTATIONS` is unchanged from the cascade fan spec.

---

## Spring State Ref

Replace the old fan animation's reliance on `THREE.MathUtils.damp` with a persistent spring state per page:

```ts
const pageSpring = useRef(
  Array.from({ length: 5 }, () => ({ pos: 0, vel: 0 }))
);
```

This ref lives for the component's lifetime. The spring state persists across frames; no reset needed.

---

## useFrame Changes

Remove:
```ts
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

---

## Module-Scope Constants

Add after `PAGE_MAX_ROTATIONS` (before `BookIntro`):

```ts
const STIFFNESS = [55,  65,  75,  85, 100] as const; // index 0 = bottom
const DAMPING   = [10,   9,   8,   7,   6] as const;
const STAGGER   = [0.060, 0.045, 0.030, 0.015, 0.000] as const;
```

---

## What Does Not Change

- `PAGE_MAX_ROTATIONS` constant — same target angles
- `pagePivots` ref array — still used to set `rotation.z`
- Pivot group positions, mesh geometry, `DoubleSide` material
- Cover pivot animation (0.45 → 0.75, damp factor 5) — untouched
- Presence fade logic, all other meshes

---

## Success Criteria

- Pages feel like paper with mass — top page bounces slightly as it settles
- Bottom page visibly lags behind top page during the scroll fan
- Cascade reads top-to-bottom (top page reacts first)
- No page flies past its intended arc or clips through the camera
- No regression to cover-open animation or chapters 1–5
