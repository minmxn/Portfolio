# UI Clarity Redesign — Design Spec
**Date:** 2026-08-04  
**Status:** Approved

## Problem

The portfolio's 3D scroll narrative is cinematic in intent but cluttered in execution. Four UI elements compete for attention simultaneously:

1. A persistent full-weight top navigation bar
2. A chapter rail with all 6 labels permanently visible
3. A "CHAPTER 01" kicker above the poem copy
4. Spec badge pills rendered at 40% opacity at all times

The 3D scene should be the primary communication surface. The surrounding UI should dissolve into it, not frame it.

---

## Goals

- Eliminate persistent UI chrome during the immersive story scroll
- Reduce the chapter rail to a pure spatial signal (no text)
- Strip chapter copy down to the poem lines only
- Make Chapter 01 specs discoverable through 3D object interaction, not static badges

---

## Out of Scope

- Chapter 02–04 object interactions (deferred)
- Mobile layout changes (existing behavior retained)
- Any changes to the 3D scene geometry or morph animation

---

## Section 1: SiteHeader Auto-Hide

**File:** `src/components/site-header.tsx`

Convert to a client component (`"use client"`). Add a scroll listener and an IntersectionObserver:

**Behaviour:**
- On `window.scrollY > 80`: header transitions to `opacity-0 pointer-events-none` (400ms ease)
- On scroll direction reversal (scroll up detected): header fades back to full opacity
- On `#projects` section entering viewport (IntersectionObserver threshold ~0.1): header reappears permanently and listener is removed

**Implementation notes:**
- Track `lastScrollY` ref for direction detection
- CSS transition on the header element: `transition-opacity duration-[400ms]`
- DOM stays mounted throughout — no layout shift
- Cleanup both listeners on unmount

---

## Section 2: Chapter Rail — Dots Only

**File:** `src/components/story/chapter-rail.tsx`

Replace each label row with a single dot. Remove all `<span>` text elements.

**Dot spec:**
- Inactive: `w-2 h-2` rounded-full, `bg-foreground/25`
- Active: `w-2.5 h-2.5` rounded-full, `bg-glow`, box-shadow glow (e.g. `shadow-[0_0_6px_2px_var(--glow)]`)
- Transition: `duration-500` on size and color (existing timing kept)

**Hover tooltip:**
- Wrap each dot in a `group relative` container
- Label appears to the right as an absolutely positioned `<span>`: `opacity-0 group-hover:opacity-100 transition-opacity duration-150`
- Same typography as before: `font-sans text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-glow`
- Positioned: `left-5 top-1/2 -translate-y-1/2 whitespace-nowrap`

**No other changes** to subscription logic or positioning.

---

## Section 3: Chapter Copy Simplification

**File:** `src/components/story/chapter-copy.tsx`

Two removals:

1. **Delete the kicker line:**
   ```tsx
   // Remove entirely:
   <p className="mb-3 font-sans text-[0.65rem] ... uppercase">{beat.kicker}</p>
   ```

2. **Delete the spec badges block:**
   ```tsx
   // Remove entirely:
   {beat.spec && (
     <div className="mt-8 flex flex-wrap ...">
       {beat.spec.map(...)}
     </div>
   )}
   ```

The `spec` field on `StoryBeat` is retained in `content.ts` — it is now consumed by the Chapter 01 satellite nodes instead.

**Result:** each chapter section renders only the italic poem lines and, where present, the CTA button.

---

## Section 4: Chapter 01 — Satellite Spec Nodes

**File:** `src/components/r3f/chapters/chapter-01-tangle.tsx`

Add three interactive sphere nodes to the R3F scene. Each maps to one spec string from `beat.spec` (passed as a prop or read directly from the Ch01 story beat in `content.ts`).

### Specs (ordered)
```
["BUSINESS ANALYSIS", "PUBLIC SECTOR", "REQUIREMENTS TO SHIPPABLE SOFTWARE"]
```

### Node positions (world space)
| Index | Spec | Position |
|-------|------|----------|
| 0 | BUSINESS ANALYSIS | `[-1.2, 0.8, 0]` |
| 1 | PUBLIC SECTOR | `[1.4, 0.1, 0]` |
| 2 | REQUIREMENTS TO SHIPPABLE SOFTWARE | `[-0.8, -1.0, 0]` |

Positions may need minor tweaks after visual QA.

### Node geometry & material
- `sphereGeometry` args: `[0.10, 16, 16]`
- `meshStandardMaterial`: color `#a8d8ff`, emissive `#4499cc`, emissiveIntensity `0.3` (base)
- On hover: `emissiveIntensity` damps to `1.0` via `THREE.MathUtils.damp`
- On leave: damps back to `0.3`

### Fade-in
- Nodes are invisible (scale 0) until `chapterLocalProgress(1) > 0.15`
- From 0.15 → 0.35 of the chapter band: scale damps from `0 → 1`
- Prevents nodes appearing during the book dive / intro transition

### Hover label (drei `<Html>`)
- Rendered inside the hovered node's group, only when `hoveredIndex === i`
- Position offset: `[0.18, 0.18, 0]` (upper-right of sphere)
- Style: small chip — `border border-foreground/30 bg-background/70 backdrop-blur-sm px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold tracking-wide uppercase text-foreground/90 whitespace-nowrap`
- Fade: CSS `opacity` 0 → 1 over 200ms via inline transition or Framer Motion

### Pointer cursor
```ts
onPointerOver={() => {
  setHoveredIndex(i);
  document.body.style.cursor = "pointer";
}}
onPointerOut={() => {
  setHoveredIndex(null);
  document.body.style.cursor = "auto";
}}
```

### State
```ts
const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
```

Single useState at the component level. No external state needed.

---

## Verification Checklist

- [ ] Header fades out after 80px scroll, returns on scroll-up
- [ ] Header reappears on reaching `#projects`
- [ ] Rail shows only dots; active dot glows; hover reveals label
- [ ] Chapter copy: no kicker, no badges — poem lines only
- [ ] Ch01 nodes invisible before 15% chapter progress
- [ ] Ch01 nodes appear smoothly between 15–35% progress
- [ ] Hovering each node: emissive brightens, label appears
- [ ] Cursor changes to pointer on node hover
- [ ] No regression to Ch02–04 scenes
- [ ] No regression to Kling / Nomo case study pages
