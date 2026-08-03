# Chapter 01 — Squiggly Line Animation Design

**Date:** 2026-08-04
**Status:** Implemented

## Goal

Replace the angular wireframe geometry on Chapter 01 with smooth, organic, calligraphic line art that feels flowing and alive — not polygon-like or mesh-like.

## Visual Story

The section text reads *"I turned tangled lines into solid forms."* The animation enacts this literally: chaotic squiggly loops gradually resolve into clean orbital rings, and a glass crystal solidifies at the centre.

## States

### Start state (scroll progress = 0)

Three overlapping closed loops rendered with Line2 (antialiased, smooth joins, `lineWidth={2}`):

- **Stroke A** (75 segs): large figure-8 / lemniscate — `sin(2t)` on X, `cos(t)` on Y, slight Z depth
- **Stroke B** (75 segs): same shape phase-shifted ~135° so it overlaps and interleaves with A
- **Stroke C** (60 segs): tighter inner loop at 3× frequency for density

Together they read as calligraphic, flowing, and non-geometric. The group rotates slowly on Y for a parallax 3D feel.

### Morph (progress 0 → 0.7)

Each point in the squiggly buffer blends linearly toward the corresponding point in the orbital ring buffer, eased with smoothstep. Line color brightens from dim blue to bright white-blue as the morph completes — the chaos "organises itself."

### Resolved state (progress 0.7 → 1)

Three great-circle rings in a gyroscope arrangement — no straight edges, all curves:

| Ring | Plane | Description |
|---|---|---|
| A | XZ (equatorial) | Horizontal orbital |
| B | Tilted 60° around Z | Diagonal orbital |
| C | Tilted 30° around X | Cross-plane orbital |

A glass icosahedron (`MeshTransmissionMaterial`) scales in from p=0.5 onward, completing the "solid form" the text promises. It is intentionally kept as a contrasting jewel-like object.

## Rendering

- `<Line segments>` from `@react-three/drei` — uses Line2 / LineSegments2 under the hood
- `lineWidth={2}` — visible and calligraphic without being heavy
- Geometry updated imperatively each frame via `linesRef.current.geometry.setPositions(live)` — bypasses React reconciliation for performance
- `SEGMENT_COUNT = 210` — high enough that all curves appear smooth at any rotation angle

## What was explicitly rejected

- Icosahedron / EdgesGeometry wireframe as morph target — too angular and polygon-like
- `LineBasicMaterial` / `THREE.LineSegments` — no antialiasing, 1px cap, broken joins
- Trefoil knot source geometry — looked like a geometric wire shape, not organic calligraphy
