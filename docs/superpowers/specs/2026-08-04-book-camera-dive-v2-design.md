# Book Camera Dive v2 — Design Spec

**Date:** 2026-08-04
**Replaces:** `2026-08-04-book-camera-dive-design.md`
**Feature:** Cover-open animation + sun-position camera dive into the open storybook

---

## Goal

The viewer sees the book from a high, sun-like overhead angle. As they scroll, the book cover swings open (classic right-swing hinge), revealing the page interior. The camera then dives steeply down into the open book, entering the story through the pages rather than crashing into a closed cover.

---

## User Experience

1. **Page loads.** Camera is high and steep — like looking down from where the sun would be. Book is fully visible, clearly lit from above. "Let's explore together…" text is present. SCROLL indicator shows.
2. **User scrolls (0–45% of intro band).** Camera holds still at sun position. User reads.
3. **At 45% scroll.** SCROLL indicator fades. The book cover begins swinging open — hinged at the left spine, right edge lifts up and swings over. Camera drifts slowly forward and downward, accompanying the opening.
4. **At 60% scroll.** Poem text fades mid-opening. Cover continues swinging.
5. **At 75% scroll.** Cover is fully open (lying flat to the right of the book). Camera begins the steep dive — accelerating downward into the exposed page interior.
6. **At 92% scroll.** Black overlay fades in as the camera reaches page-block level.
7. **Full black.** Camera snaps to chapter-1 position.
8. **Black fades out.** Chapter 1 scene visible.

---

## Architecture

Three files are modified:

| File | Change |
|---|---|
| `src/components/r3f/book.tsx` | Wrap top cover + glyph meshes in a pivot group; animate pivot rotation driven by `chapterLocalProgress(0)` |
| `src/components/r3f/camera-rig.tsx` | Revise sub-phase positions: sun start, cover-open drift, steep dive into open book |
| `src/components/story/book-intro-overlay.tsx` | Update text/SCROLL exit timing to match new scroll phases |

---

## Book Cover Animation (`book.tsx`)

### Geometry restructure

The top cover mesh (`BoxGeometry [0.7, 0.06, 0.5]` at local `[0, 0.12, 0]`) and both glyph meshes (`glyphA`, `glyphB` at `[0, 0.16, 0]`) are moved inside a **pivot group**.

Pivot group:
- **Local position:** `[-0.35, 0.12, 0]` — left spine edge, at cover height
- **Rotation axis:** local Z axis
- **Rotation range:** `0 → Math.PI` (closed → fully open)

Inside the pivot group, the cover mesh is repositioned to `[0.35, 0, 0]` so its left edge aligns with the pivot origin. The glyph meshes move to `[0.35, 0.04, 0]` (same relative offset from the cover surface).

Everything else (bottom cover, page block, spine, halo) stays in the main group, untouched.

### Rotation animation

Driven by `chapterLocalProgress(0)` (local `t`, 0..1):

| t range | Cover rotation |
|---|---|
| `0.00 → 0.45` | `0` — closed |
| `0.45 → 0.75` | smoothstep `0 → Math.PI` — swings open |
| `0.75 → 1.00` | `Math.PI` — fully open |

`THREE.MathUtils.damp` with factor `5` smooths toward the target rotation each frame.

**Rotation direction:** Positive `+Math.PI` rotates the cover counterclockwise around the local Z axis from above — the right edge lifts up toward the camera, then falls to the left of the spine. From the steep overhead camera perspective this reads as "cover opening and falling away." If the visual result looks wrong on screen, try `-Math.PI` instead. The implementer should verify with a live browser check.

### Presence / fade-out

The existing presence fade (book group scale-up + opacity drop when `t > 0.6`) remains, but the threshold shifts slightly: the book stays solid until the camera is well into the dive. No change to the fade logic — it already works with the `t` value from `chapterLocalProgress(0)`.

---

## Camera Path (`camera-rig.tsx`)

`INTRO_END = 1/6` (unchanged). Sub-progress `t = progress / INTRO_END` (0..1).

### Sub-phases

| Sub-phase | t range | Camera position | Look-at |
|---|---|---|---|
| Hold (sun) | `0.00 → 0.45` | `[-0.5, 4.5, 3.5]` | `[-0.9, -0.6, 0.4]` |
| Cover opens + drift | `0.45 → 0.75` | smoothstep to `[-0.7, 2.0, 2.0]` | `[-0.9, -0.2, 0.4]` |
| Dive | `0.75 → 0.92` | smoothstep to `[-0.9, 0.2, 0.5]` | `[-0.9, -1.5, 0.4]` |
| Entry | `0.92 → 1.00` | smoothstep to `[-0.9, -0.3, 0.5]` | `[-0.9, -1.5, 0.4]` |

Camera always looks at the book center or below it — the look-at drops steeply during the dive so the viewer feels like falling into the pages.

### Parallax

Fades from full → zero across `t 0.45 → 0.75` (during the cover-open drift). Zero for the dive and entry. No parallax fighting the dive direction.

### Crossing-frame snap

Unchanged from v1: on the frame where `progress` first crosses `INTRO_END`, `camera.position` and `currentLook` are hard-set to the chapter-1 sampled values (no damp).

### `desiredPos` initialisation

Update to `[-0.5, 4.5, 3.5]` (new sun-position start) to prevent first-frame jump.

---

## Black Overlay & Text Timing (`book-intro-overlay.tsx`)

Updated progress thresholds (raw `scrollState.progress`):

| Element | Exit start | Fully gone |
|---|---|---|
| SCROLL indicator | `0.075` (t≈0.45 of intro band) | `0.085` |
| Poem text | `0.100` (t≈0.60) | `0.125` |
| Black overlay in | `0.153` (t≈0.92) | `0.167` (INTRO_END) |
| Black overlay out | `0.167` | `0.200` |

All driven by the same `useAnimationFrame` RAF loop as v1. No structural changes to the overlay component.

---

## What Does Not Change

- Bottom cover, page block, spine, halo geometry in `book.tsx`
- The book's group position `[-0.9, -0.6, 0.4]` and rotation `[0, 0.3, 0]`
- Chapter 1–5 camera keyframes
- The crossing-frame hard-snap logic
- Bloom / Vignette / Noise postprocessing
- Static fallback for low-capability devices

---

## Success Criteria

- Book cover visibly swings open (right-hand swing, spine on left) as camera drifts down
- Camera starts from a steep overhead "sun" angle — the book reads small and elevated at page load
- Dive phase feels like falling into the open pages, not flying at a closed cover
- Black overlay appears and clears cleanly; chapter 1 is in place when black fades
- No geometry clipping between the swinging cover and the camera path
- No regressions to chapters 1–5
