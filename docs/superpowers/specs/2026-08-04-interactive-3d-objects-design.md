# Interactive 3D Objects — Crack-Open Story Reveal

**Date:** 2026-08-04
**Status:** Approved for implementation

## Overview

Every 3D object in the scene is currently decorative. This spec makes them interactive: clicking an object cracks it open (two halves separate), a glowing core is revealed, and a floating card appears with a real story — a project, a tool, or an engagement from Min Yi's career.

Three chapters gain interactive objects: Ch01 (project spheres), Ch02 (Nomo pedestal), Ch03 (toolkit ring).

---

## Interaction Model

Each object has three states:

- **Idle** — object whole, cursor becomes pointer on hover, subtle emissive glow increase
- **Cracked** — two halves spring apart, core sphere scales in, floating info card appears above
- **Closing** — halves return, core fades, card disappears

Rules:
- Only one object can be cracked at a time. Clicking a second object closes the first.
- Clicking the cracked object again (or the × in the card) re-seals it.
- Scrolling to a new chapter closes all open cracks automatically.
- Clicking does not freeze scroll.

---

## Crack-Open Mechanic

### Three.js Setup

Enable clipping on the renderer once, in the Canvas setup:

```
gl.localClippingEnabled = true
```

Each interactive object is rendered as two meshes sharing the same geometry:

```
topMesh    clippingPlanes: [Plane(0, -1, 0, 0)]   keeps y > 0
bottomMesh clippingPlanes: [Plane(0,  1, 0, 0)]   keeps y < 0
```

At rest the halves are flush (split = 0). On click, a `dampedSplit` value (0 to 1) is driven in `useFrame` using `THREE.MathUtils.damp(factor = 6)`:

```
topMesh.position.y    =  dampedSplit * 0.35
bottomMesh.position.y = -dampedSplit * 0.35
```

### Core Sphere

A `SphereGeometry(0.12, 12, 12)` sits at the object's center, hidden at rest (`scale = 0`). When cracked it scales to 1 via damp. Material: warm `#f6b979`, `AdditiveBlending`, drives existing bloom. Matches the orb pattern used in Ch04 particles.

### Split Axis

All objects split on the horizontal y=0 plane. This works naturally for every primitive: tetrahedron, torus, box, octahedron, cone, icosahedron, and the Nomo pedestal cylinder.

### No New Dependencies

All animation uses the existing `THREE.MathUtils.damp` in `useFrame` pattern. No `@react-spring/three` needed.

---

## Object-to-Story Mapping

### Ch01 — Project Spheres (chapter-01-tangle.tsx)

Three satellite spheres at existing `POSITIONS`. Each cracks open to reveal a glowing project name chip (no external logo — the name is the reveal). This replaces the hover label chip interaction specified in `2026-08-04-ui-clarity-redesign.md` — the crack-open card is the new interaction for these nodes.

| Sphere | Project | Story |
|---|---|---|
| 1 | Nomo | Built a productivity app from zero. First time I proved I could ship, not just spec. |
| 2 | Generative AI Video | Explored how gen AI could produce video at scale. Part research, part prototype. |
| 3 | Gifted Education Programme | Multi-stakeholder, no clear brief. I mapped the chaos and turned it into a roadmap. |

### Ch02 — Nomo Pedestal (chapter-02-pedestal.tsx)

The pedestal cylinder group is the click target. On crack:
- Cylinder halves separate
- The existing torus-knot glyph scales up (from its current size to 1.5x) as the "logo reveal"
- Card story: Built Nomo from zero. Designed in Figma, shipped in React. Proof that I don't just write specs.

The torus-knot already exists in the scene — no new asset needed.

### Ch03 — Toolkit Ring (chapter-03-toolkit.tsx)

Six `IconMesh` components become independently clickable. Each cracks open to reveal the tool's SVG logo.

| Shape | Tool | Story |
|---|---|---|
| Tetrahedron | Figma | Prototyped Nomo's entire UI before writing a line of code. |
| Torus | JIRA | Managed delivery across public sector programmes from backlog to release. |
| Box | Excel | Every BA's secret weapon. Where raw data becomes a decision. |
| Octahedron | Confluence | Wrote the docs that let engineers ship without needing another meeting. |
| Cone | SQL | Queried Oracle to surface insights no one thought to ask for. |
| Icosahedron | AI | Claude, ChatGPT, Gemini. I use AI as a thinking partner, not a shortcut. |

Logo assets needed in `public/logos/`: `figma.svg`, `jira.svg`, `excel.svg`, `confluence.svg`, `sql.svg`, `ai-trio.svg` (a combined Claude + ChatGPT + Gemini lockup).

---

## Info Card Design

Uses `<Html>` from `@react-three/drei`, pinned to world position `[object.x, object.y + 0.8, object.z]`, billboarded (always faces camera).

Card structure:
```
[ logo or styled name — 20px, bold ]
[ one-sentence story  — 13px, muted white ]
[ × ]  top-right corner, click to close
```

Visual style: `background: rgba(10,8,20,0.85)`, `border: 1px solid rgba(255,255,255,0.12)`, `border-radius: 8px`, `padding: 12px 16px`, `min-width: 200px`, `max-width: 260px`, `backdrop-filter: blur(8px)`.

Entrance: opacity 0 to 1 over 200ms, `translateY(+6px)` to `translateY(0)`.

On mobile (viewport width < 768px): card renders as a fixed bottom sheet (`position: fixed; bottom: 0; left: 0; right: 0`) instead of floating in 3D space.

---

## Scroll and State Integration

Each chapter component already reads `chapterLocalProgress(index)` in `useFrame`. Crack state is local to each component (`useState<number | null>` for `crackedIndex`).

Auto-close on chapter exit: in each chapter's `useFrame`, when `chapterLocalProgress(index)` drops below 0 or rises above 1, reset `crackedIndex` to null (triggering the closing animation).

Global mutual exclusion: a new `src/components/r3f/interaction-state.ts` module (same pattern as `scroll-state.ts`) exports an `activeCrack` ref and `setActiveCrack(id: string | null)` helper. This ensures only one object across all chapters can be cracked at a time.

---

## Out of Scope

- Ch04 (ascending pillar) and End Scene remain animation-only.
- No new routes or pages are created.
- The Generative AI Video story text is a placeholder — update in `src/content.ts` once final copy is confirmed.
- Logo SVGs are sourced from official brand kits; no custom illustration needed.
