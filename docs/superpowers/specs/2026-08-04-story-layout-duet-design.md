# Story Layout Redesign — Choreographed Duet

**Date:** 2026-08-04
**Status:** Approved

## Problem

The shining narrative currently places chapter text in the center of the screen — the same space the 3D objects occupy. Text and objects compete for the same real estate, making both harder to focus on. Users cannot comfortably read the story and enjoy the 3D world at the same time.

## Solution

Split the screen into two zones that coexist rather than fight:

- **Text zone:** left column, ~40% of remaining screen width after the chapter rail, max 420px wide, left-aligned
- **Object zone:** the 3D canvas is unchanged — objects naturally own the center-right space that is freed up

Text animates in first, then the 3D objects bloom beside it. Both settle into gentle parallel motion. The effect is a choreographed duet rather than a collision.

## Layout Zones

### Text zone (desktop)

- Position: left-aligned, starting ~200px from the left edge (after the chapter rail)
- Width: ~40% of remaining width, capped at 420px
- Content: chapter number kicker, title, body lines, optional spec tags, optional CTA
- Gradient backdrop: a dark-to-transparent gradient fades left-to-right across the text zone for legibility over the canvas. No hard edge.

### Object zone

- The `<Canvas>` is fixed and full-screen — no changes to the 3D scene, camera rig, or post-processing
- With the text no longer centered, objects have the center-right quadrant to expand into. Bloom and glow are more visible.

### Exceptions — stay centered

- `BookIntroOverlay` (Begin section): stays centered. This is an emotional beat before the chapters start.
- `EndSceneOverlay` (Reach Out section): stays centered. Closing beat, full-screen presence.

### Mobile (< 768px)

The split requires horizontal space. Below 768px the layout collapses back to centered — same as the current state. The gradient backdrop remains so text stays readable over the canvas.

## Animation Choreography

### Text entrance

- Trigger: `whileInView` (same Framer Motion trigger used today)
- Animation: slide in from left (translateX: -30px → 0) + fade in (opacity: 0 → 1)
- Duration: ~500ms, ease-out

### 3D objects

- No changes to the 3D scene animation
- Objects bloom into view as the chapter scrolls — driven by `scroll-state.chapterProgress` as today
- Effective visual delay: text arrives ~200ms before the chapter's objects bloom, creating a natural read-before-reveal beat

### Settled state — continuous motion

- After the entrance, the text block floats gently: translateY ±4px on a ~5s loop, ease-in-out sine
- This keeps the text feeling alive alongside the moving 3D world without competing with it
- Implemented as a CSS `@keyframes` animation (not scroll-driven)
- If the float feels like too much after seeing the live build, it is a single CSS property change to disable

## Files to Change

Only the HTML overlay layer needs updating. The 3D canvas, scroll rig, camera, and post-processing are untouched.

### `src/components/story/chapter-copy.tsx`

Primary change. Current layout is `sticky top-0 flex min-h-screen flex-col items-center justify-content-center text-center`. New layout:

- Container: `sticky top-0 flex min-h-screen items-center` (no `justify-center`, no `text-center`)
- Inner wrapper: `ml-[200px] max-w-[420px]` on `md:` breakpoint; centered on mobile
- Text alignment: `text-left` on `md:`, `text-center` on mobile
- Gradient backdrop: a `::before` pseudo-element or a sibling `<div>` with `bg-gradient-to-r from-background/90 via-background/60 to-transparent` covering the left ~55% of the screen, `position: fixed`
- Text entrance: keep existing Framer Motion `whileInView` variants, add `x: -30` to the initial state
- Continuous float: add `animate` prop with a looping `y` keyframe, or a CSS animation class applied after the entrance completes

### `src/components/story/book-intro-overlay.tsx`

No changes. Already centered.

### `src/components/story/end-scene-overlay.tsx`

No changes. Already centered.

### `src/components/story/story-overlay.tsx`

No changes expected. The overlay is a thin wrapper around the chapter components.

## What Does Not Change

- `src/components/r3f/` — entire 3D layer untouched
- `src/components/scroll/` — scroll state and Lenis provider untouched
- `src/content.ts` — all copy untouched
- `src/hooks/use-device-capability.ts` — device detection untouched
- Static narrative fallback — untouched

## Success Criteria

1. On desktop (>= 768px): chapter text sits in the left column with a dark gradient behind it; 3D objects are clearly visible in the center-right without text overlap
2. On mobile (< 768px): layout is centered, same as before
3. Text entrance slides in from the left on scroll-into-view
4. After entering, text has a slow continuous float (not scroll-driven)
5. Begin and Reach Out sections remain centered
6. `npm run build` passes with no errors
7. No regressions in the static narrative fallback
