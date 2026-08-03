# Book Page Cascade Fan — Design Spec

**Date:** 2026-08-04
**Extends:** `2026-08-04-book-camera-dive-v2-design.md`
**Feature:** Replace the single page-block mesh with 5 individually animated page meshes that fan out in a cascade arc as the user scrolls

---

## Goal

After the cover swings open, 5 pages fan out simultaneously like a spreading deck of cards. Each page hinges at the left spine edge and rotates to a different maximum angle, creating an arc spread visible from the overhead sun-position camera. The fan overlaps with the tail end of the cover-open animation.

---

## User Experience

1. At t = 0.60 (mid-way through cover swing), the pages begin fanning out — all rotating around the spine edge.
2. By t = 0.92 (black overlay starts), the fan is fully open: top page flat (Math.PI), bottom page barely lifted. The result reads as a cascading arc of pages spread out to the right of the spine.
3. The camera then dives through this open, fanned layout.

---

## Architecture

One file changed: `src/components/r3f/book.tsx`

No changes to `camera-rig.tsx` or `book-intro-overlay.tsx`.

---

## Geometry Changes (`book.tsx`)

### Remove

The single page-block mesh at `position={[0.01, 0.06, 0]}` with `BoxGeometry [0.66, 0.05, 0.46]` is removed entirely.

### Add: 5 page pivot groups

Each page is `BoxGeometry [0.66, 0.01, 0.46]` (same total height as original block: 5 × 0.01 = 0.05). All 5 pivot groups sit inside the main `<group ref={group}>`, NOT inside `coverPivot`.

The hinge point is the left edge of the page block in parent group space:
`x = 0.01 − 0.33 = −0.32`

| Page index | Pivot position (parent space) | Mesh position (pivot-local) |
|---|---|---|
| 0 (bottom) | `[-0.32, 0.040, 0]` | `[0.33, 0, 0]` |
| 1 | `[-0.32, 0.050, 0]` | `[0.33, 0, 0]` |
| 2 | `[-0.32, 0.060, 0]` | `[0.33, 0, 0]` |
| 3 | `[-0.32, 0.070, 0]` | `[0.33, 0, 0]` |
| 4 (top) | `[-0.32, 0.080, 0]` | `[0.33, 0, 0]` |

### Page material

`meshStandardMaterial` with `color="#e8d9b3"` (same cream as the original page block), `roughness={0.9}`, `metalness={0}`, `side={THREE.DoubleSide}` (so back face renders when flipped past vertical).

---

## Animation

### Refs

Replace the single page-block mesh (no ref) with a `pagePivots` ref array:

```ts
const pagePivots = useRef<(THREE.Group | null)[]>([null, null, null, null, null]);
```

Attach via `ref={(el) => { pagePivots.current[i] = el; }}` on each pivot group.

### Per-page target rotation

Fan spread: top page flips furthest, bottom page barely lifts.

| Page index | Target rotation |
|---|---|
| 4 (top) | `Math.PI` |
| 3 | `Math.PI * 0.80` |
| 2 | `Math.PI * 0.58` |
| 1 | `Math.PI * 0.36` |
| 0 (bottom) | `Math.PI * 0.16` |

Define as a constant tuple (index 0 = bottom, index 4 = top):

```ts
const PAGE_MAX_ROTATIONS = [
  Math.PI * 0.16, // page 0 — bottom
  Math.PI * 0.36, // page 1
  Math.PI * 0.58, // page 2
  Math.PI * 0.80, // page 3
  Math.PI,        // page 4 — top
] as const;
```

### Timing

All 5 pages use the same scroll window: `smoothstep(0.60, 0.92, p)`. No per-page offset — they move in unison to different targets, which is what creates the fan arc.

### In `useFrame`

```ts
const fanT = smoothstep(0.60, 0.92, p);
for (let i = 0; i < 5; i++) {
  const pivot = pagePivots.current[i];
  if (!pivot) continue;
  const target = PAGE_MAX_ROTATIONS[i] * fanT;
  pivot.rotation.z = THREE.MathUtils.damp(pivot.rotation.z, target, 5, delta);
}
```

Damp factor `5` — same as the cover pivot.

---

## What Does Not Change

- Bottom cover, spine, halo, glyph meshes
- Cover pivot group and its animation (0.45 → 0.75, `Math.PI`)
- Presence fade logic (`presence` computed from p, group scale + visibility + halo opacity + glyph emission)
- Group position `[-0.9, -0.6, 0.4]` and rotation `[0, 0.3, 0]`
- `camera-rig.tsx` — camera path unchanged
- `book-intro-overlay.tsx` — overlay thresholds unchanged

---

## Success Criteria

- 5 pages visibly fan out in an arc when scrolling through t 0.60–0.92
- Top page (index 4) ends fully flipped; bottom page (index 0) ends barely lifted
- No z-fighting between stacked pages (each has a unique y-center)
- Pages share the presence fade — when the book fades/scales out, all pages go with it
- No regressions to cover-open animation or chapters 1–5
