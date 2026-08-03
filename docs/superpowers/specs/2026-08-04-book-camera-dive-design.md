# Book Camera Dive — Design Spec

**Date:** 2026-08-04
**Feature:** Cinematic "enter the storybook" camera dive on the hero/intro section

---

## Goal

Replace the static intro experience (book just sits there, fades out) with a scroll-driven camera dive that makes the viewer feel like they are being pulled into the story. The book is the portal; scrolling is the action of entering it.

---

## User Experience

1. **Page loads.** Camera is elevated and angled, looking down at the book from ~30° above — an isometric view. Book is fully visible, centred, readable. "Let's explore together…" poem text is visible. SCROLL indicator appears.
2. **User scrolls (~0–50% of intro band).** Camera holds still. User reads. SCROLL indicator disappears at the start of the dive.
3. **User scrolls (~50–85% of intro band).** Camera begins a smooth forward dive toward the book cover. The poem text remains visible partway into the dive then fades, creating a "being pulled away from the words" feeling.
4. **User scrolls (~85–100% of intro band).** A black overlay fades in as the camera reaches the cover surface.
5. **Transition.** Full black. Camera silently snaps back to the chapter-1 position.
6. **Chapter 1 begins.** Black fades out. The existing chapter-1 scene (tangle wireframe, copy text) is visible as normal.

---

## Architecture

No new files. Three existing files are modified:

| File | Change |
|---|---|
| `src/components/r3f/camera-rig.tsx` | New sub-phase logic within the intro band; updated keyframe 0 start position |
| `src/components/story/book-intro-overlay.tsx` | Scroll-driven exit for poem text and SCROLL indicator; new black overlay div |
| `src/components/r3f/book.tsx` | No changes — book stays still throughout |

---

## Camera Path

`CameraRig` uses `scrollState.progress` (0–1 across all 6 chapters, 600vh total). The intro occupies `0.0 → 0.167`.

Within the intro band, a local sub-progress `t = progress / 0.167` (0..1) drives three sub-phases:

| Sub-phase | `t` range | Camera position | Look-at target |
|---|---|---|---|
| Hold | `0.00 → 0.50` | `[0.3, 1.8, 5.5]` (elevated isometric) | `[-0.3, -0.4, 0.0]` |
| Dive | `0.50 → 0.85` | lerps to `[0.1, 0.4, 1.2]` | `[-0.2, 0.0, 0.0]` |
| Entry | `0.85 → 1.00` | drives to `[0.0, 0.0, 0.3]` | `[0.0, 0.0, 0.0]` |

The hold is implemented as a clamp (sub-progress below 0.50 is clamped to 0 for the camera lerp). The dive and entry phases use a smoothstep remap so the camera accelerates into the cover rather than moving at constant speed.

After the intro band (`progress > 0.167`), the camera target jumps to the chapter-1 keyframe (`[0.0, 0.3, 3.5]`). Because the rig uses `THREE.MathUtils.damp` to smooth-chase targets, the camera will lag behind this jump. To prevent a visible slide when the black fades out, the damp factor is temporarily set to a very high value (e.g. `60`) for the single frame where `progress` first crosses `0.167`, forcing an instant snap. The normal damp factor resumes on the next frame. No changes to chapters 1–5.

**Pointer parallax:** Currently `±0.25 X`, `±0.15 Y`. During the dive sub-phase (`t > 0.50`) the parallax magnitude is lerped down to zero so it doesn't fight the forward momentum.

---

## Black Overlay

A fixed, full-screen `<div>` added to `book-intro-overlay.tsx`:

```
position: fixed, inset: 0, z-index: 50
background: black
pointer-events: none
opacity: driven by scrollState.progress via useAnimationFrame
```

Opacity schedule (keyed on raw `scrollState.progress`):

| Progress | Opacity |
|---|---|
| `< 0.142` | `0` |
| `0.142 → 0.167` | `0 → 1` (fade in as camera enters cover) |
| `0.167 → 0.200` | `1 → 0` (fade out as chapter 1 settles) |
| `> 0.200` | `0` |

The chapter-1 scene is already rendering behind the overlay during the fade-in, so when black clears there is no pop.

---

## Text Exit Timing

All exits are opacity-only (no transform), driven by `scrollState.progress` via the same `useAnimationFrame` loop as the overlay.

| Element | Exit start | Fully gone |
|---|---|---|
| SCROLL indicator | `progress 0.083` (dive begins) | `progress 0.095` |
| "Let's explore together" poem | `progress 0.095` | `progress 0.120` |

Entrance animations (Framer Motion) are unchanged.

---

## What Does Not Change

- The book geometry (`book.tsx`) — no animation added, no new meshes
- The chapter-1 through chapter-5 camera keyframes
- The `Float` idle breathing animation on the book
- The chapter copy blocks, `StoryOverlay`, `LenisProvider`, GSAP ScrollTrigger wiring
- The existing Bloom / Vignette / Noise postprocessing
- The static fallback (`static-narrative.tsx`) for low-capability devices

---

## Success Criteria

- On scroll, the camera visibly moves forward from an elevated view and appears to enter the book cover
- The black overlay appears cleanly before and disappears cleanly after the transition
- No geometry Z-fighting or clipping artifacts as camera reaches `z=0.3`
- Chapter 1 scene is fully in place when black fades out (no pop-in)
- Pointer parallax does not stutter or fight the dive
- No regressions to chapters 1–5 camera behaviour
