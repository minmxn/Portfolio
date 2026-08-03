# UI Clarity Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip persistent UI chrome from the 3D scroll narrative and replace Chapter 01's static spec badges with interactive satellite nodes anchored to 3D objects.

**Architecture:** Four isolated file edits — each task touches exactly one component. No new files needed. Tasks are independent and can be done in any order; Task 4 is the most complex and should be done last.

**Tech Stack:** Next.js (App Router), React 18, TypeScript, Tailwind CSS v4, Three.js, `@react-three/fiber`, `@react-three/drei`, Framer Motion (already in project).

## Global Constraints

- No changes to geometry, morph animation, or any scene outside Chapter 01.
- No changes to mobile layout (`lg:` breakpoint guards stay intact).
- `spec` field on `StoryBeat` in `content.ts` is NOT deleted — it is consumed by Task 4.
- All Tailwind uses v4 syntax (`@theme inline`, CSS variables via `--color-*`).
- No new npm packages.

---

## File Map

| File | Change |
|------|--------|
| `src/components/site-header.tsx` | Add `"use client"`, auto-hide on scroll |
| `src/components/story/chapter-rail.tsx` | Replace label rows with dot + hover tooltip |
| `src/components/story/chapter-copy.tsx` | Delete kicker paragraph and spec badges block |
| `src/components/r3f/chapters/chapter-01-tangle.tsx` | Add satellite spec nodes with hover labels |
| `src/app/globals.css` | Add `@keyframes fadeIn` for node label entrance |

---

## Task 1: Strip Chapter Copy

**Files:**
- Modify: `src/components/story/chapter-copy.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: `ChapterCopy` renders poem lines + optional CTA only (no kicker, no badges)

- [ ] **Step 1: Remove the kicker paragraph**

In `chapter-copy.tsx`, delete this block (currently lines 24–26):
```tsx
<p className="mb-3 font-sans text-[0.65rem] font-semibold tracking-[0.2em] text-glow/60 uppercase">
  {beat.kicker}
</p>
```

- [ ] **Step 2: Remove the spec badges block**

Delete this entire block (currently lines 37–48):
```tsx
{beat.spec && (
  <div className="mt-8 flex flex-wrap justify-center gap-2 opacity-0 transition-opacity duration-500 hover:opacity-100 focus-within:opacity-100 md:justify-start md:opacity-40">
    {beat.spec.map((s) => (
      <span
        key={s}
        className="inline-block border border-foreground/20 px-2.5 py-0.5 font-sans text-[0.68rem] font-medium tracking-wide text-muted-foreground uppercase"
      >
        {s}
      </span>
    ))}
  </div>
)}
```

After both removals, the `<motion.div>` inner content should be:
```tsx
<motion.div
  initial={{ opacity: 0, x: -30 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, amount: 0.4 }}
  transition={{ duration: 0.9, ease: EASE }}
  className="text-center md:text-left"
>
  {beat.poem?.map((line, i) => (
    <p
      key={i}
      className="font-serif text-2xl leading-relaxed text-foreground/85 italic sm:text-3xl"
    >
      {line}
    </p>
  ))}

  {beat.cta && (
    <div className="mt-6">
      <a
        href={beat.cta.href}
        target={beat.cta.external ? "_blank" : undefined}
        rel={beat.cta.external ? "noreferrer" : undefined}
        className="inline-flex items-center gap-2 border border-glow/40 bg-glow/[0.06] px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase backdrop-blur-sm transition-colors hover:bg-glow/[0.12]"
      >
        {beat.cta.label}
      </a>
    </div>
  )}
</motion.div>
```

- [ ] **Step 3: Verify TypeScript**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Visual check**

Start dev server (`npm run dev`), scroll to any chapter section. Confirm: no "CHAPTER 01" kicker text, no badge pills. Only italic poem lines remain.

- [ ] **Step 5: Commit**

```powershell
git add src/components/story/chapter-copy.tsx
git commit -m "feat: strip kicker and spec badges from chapter copy"
```

---

## Task 2: Chapter Rail — Dots Only

**Files:**
- Modify: `src/components/story/chapter-rail.tsx`

**Interfaces:**
- Consumes: same `labels: string[]` prop, same `subscribeChapter` subscription
- Produces: each item renders a circle dot with a hover-reveal label tooltip

- [ ] **Step 1: Replace the row markup**

The current `return` block renders `<div key={label} className="flex items-center gap-3">` rows with two `<span>` children. Replace the entire `{labels.map(...)}` block:

```tsx
{labels.map((label, i) => {
  const isActive = i === active;
  return (
    <div key={label} className="group relative flex items-center">
      <span
        className={cn(
          "rounded-full transition-all duration-500",
          isActive
            ? "h-2.5 w-2.5 bg-glow shadow-[0_0_6px_2px_var(--color-glow)]"
            : "h-2 w-2 bg-foreground/25",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap font-sans text-[0.65rem] font-semibold tracking-[0.2em] uppercase opacity-0 transition-opacity duration-150 group-hover:opacity-100",
          isActive ? "text-glow" : "text-muted-foreground/60",
        )}
      >
        {label}
      </span>
    </div>
  );
})}
```

The outer `<nav>` element and its `className` stay exactly as-is.

- [ ] **Step 2: Verify TypeScript**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Visual check**

Scroll through the story. Confirm: left side shows only small circles (no persistent text). Active chapter's circle is larger and glows. Hover any dot → label appears to its right, disappears on leave.

- [ ] **Step 4: Commit**

```powershell
git add src/components/story/chapter-rail.tsx
git commit -m "feat: replace chapter rail labels with dots-only + hover tooltips"
```

---

## Task 3: SiteHeader Auto-Hide

**Files:**
- Modify: `src/components/site-header.tsx`

**Interfaces:**
- Consumes: `window.scrollY`, `window` scroll event, `IntersectionObserver` on `#projects`
- Produces: header fades to invisible after 80px scroll, reappears on scroll-up or when `#projects` enters viewport

- [ ] **Step 1: Add "use client" and React imports**

Add at the very top of the file, before the `import Link` line:
```tsx
"use client";

import { useEffect, useRef } from "react";
```

The file currently has no `"use client"` directive and no React imports.

- [ ] **Step 2: Add headerRef and transition class**

Add `ref={headerRef}` and `transition-opacity duration-[400ms]` to the `<header>` element:

Change:
```tsx
export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full">
```

To:
```tsx
export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
```

And:
```tsx
    <header ref={headerRef} className="fixed top-0 z-50 w-full transition-opacity duration-[400ms]">
```

- [ ] **Step 3: Add the scroll + IntersectionObserver effect**

Add this `useEffect` inside `SiteHeader`, after the `headerRef` declaration and before the `return`:

```tsx
useEffect(() => {
  const header = headerRef.current;
  if (!header) return;

  let lastScrollY = window.scrollY;
  let permanentlyVisible = false;

  const show = () => {
    header.style.opacity = "1";
    header.style.pointerEvents = "";
  };
  const hide = () => {
    header.style.opacity = "0";
    header.style.pointerEvents = "none";
  };

  const handleScroll = () => {
    if (permanentlyVisible) return;
    const currentY = window.scrollY;
    const scrollingUp = currentY < lastScrollY;
    if (currentY > 80 && !scrollingUp) {
      hide();
    } else {
      show();
    }
    lastScrollY = currentY;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        permanentlyVisible = true;
        show();
      }
    },
    { threshold: 0.1 },
  );

  const projectsSection = document.querySelector("#projects");
  if (projectsSection) observer.observe(projectsSection);

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", handleScroll);
    observer.disconnect();
  };
}, []);
```

- [ ] **Step 4: Verify TypeScript**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Visual check**

Load the page. Scroll down past 80px — header fades out. Scroll back up — header reappears. Keep scrolling down to the Projects section — header reappears and stays.

- [ ] **Step 6: Commit**

```powershell
git add src/components/site-header.tsx
git commit -m "feat: auto-hide site header during story scroll, restore on scroll-up or projects"
```

---

## Task 4: Chapter 01 Satellite Spec Nodes

**Files:**
- Modify: `src/components/r3f/chapters/chapter-01-tangle.tsx`
- Modify: `src/app/globals.css` (add `@keyframes fadeIn`)

**Interfaces:**
- Consumes: `story[1].spec` from `@/content` — the three spec strings for Ch01
- Produces: three hoverable sphere nodes that reveal floating `<Html>` labels anchored in world space

### Step-by-step

- [ ] **Step 1: Add `@keyframes fadeIn` to globals.css**

Append to the end of `src/app/globals.css`:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

- [ ] **Step 2: Update imports in chapter-01-tangle.tsx**

Change the import line:
```tsx
import { useMemo, useRef } from "react";
```
To:
```tsx
import { useMemo, useRef, useState } from "react";
```

Change the drei import line:
```tsx
import { MeshTransmissionMaterial, Line } from "@react-three/drei";
```
To:
```tsx
import { Html, MeshTransmissionMaterial, Line } from "@react-three/drei";
```

Add after the existing imports (before the `// Chapter 01` comment):
```tsx
import { story } from "@/content";
```

- [ ] **Step 3: Add module-level constants**

Add these constants directly after the existing `const TWO_PI = Math.PI * 2;` line:

```tsx
const SPECS = story[1].spec ?? [];
const POSITIONS: [number, number, number][] = [
  [-1.2, 0.8, 0],
  [1.4, 0.1, 0],
  [-0.8, -1.0, 0],
];
const BASE_EMISSIVE = 0.3;
const HOVER_EMISSIVE = 1.0;
```

- [ ] **Step 4: Add state and refs inside the component**

Inside `Chapter01Tangle`, after the existing `const crystal = useRef<THREE.Mesh>(null);` line, add:

```tsx
const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
const hoveredIndexRef = useRef<number | null>(null);
const nodeMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([null, null, null]);
const emissiveValues = useRef([BASE_EMISSIVE, BASE_EMISSIVE, BASE_EMISSIVE]);
const nodesGroupRef = useRef<THREE.Group>(null!);
const nodeScaleValue = useRef(0);
```

`hoveredIndexRef` is a ref mirror of `hoveredIndex` — it prevents stale-closure reads inside `useFrame`.

- [ ] **Step 5: Add node animation to the existing useFrame**

Inside the existing `useFrame((_, delta) => { ... })`, append these lines before the closing `}`:

```tsx
// Satellite node scale fade-in
const targetNodeScale = p > 0.15 ? 1 : 0;
nodeScaleValue.current = THREE.MathUtils.damp(
  nodeScaleValue.current,
  targetNodeScale,
  5,
  delta,
);
if (nodesGroupRef.current) {
  nodesGroupRef.current.scale.setScalar(nodeScaleValue.current);
}

// Per-node emissive intensity damping
for (let i = 0; i < 3; i++) {
  const targetEmissive =
    hoveredIndexRef.current === i ? HOVER_EMISSIVE : BASE_EMISSIVE;
  emissiveValues.current[i] = THREE.MathUtils.damp(
    emissiveValues.current[i],
    targetEmissive,
    8,
    delta,
  );
  const mat = nodeMatRefs.current[i];
  if (mat) mat.emissiveIntensity = emissiveValues.current[i];
}
```

Note: `p` is already defined earlier in the `useFrame` body as `const p = chapterLocalProgress(1);`.

- [ ] **Step 6: Add the satellite nodes group to the JSX**

Inside the `return (...)`, after the closing `</mesh>` of the crystal mesh and before the closing `</group>`, add:

```tsx
<group ref={nodesGroupRef}>
  {SPECS.map((spec, i) => (
    <group key={spec} position={POSITIONS[i]}>
      <mesh
        onPointerOver={() => {
          hoveredIndexRef.current = i;
          setHoveredIndex(i);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hoveredIndexRef.current = null;
          setHoveredIndex(null);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          ref={(m) => {
            nodeMatRefs.current[i] = m;
          }}
          color="#a8d8ff"
          emissive="#4499cc"
          emissiveIntensity={BASE_EMISSIVE}
        />
      </mesh>
      {hoveredIndex === i && (
        <Html
          position={[0.18, 0.18, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            className="whitespace-nowrap border border-white/30 bg-black/70 px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease forwards" }}
          >
            {spec}
          </div>
        </Html>
      )}
    </group>
  ))}
</group>
```

Note: The label uses hardcoded `border-white/30 bg-black/70 text-white/90` rather than CSS-variable Tailwind tokens (`border-foreground/30 bg-background/70`) because `drei`'s `<Html>` renders into a DOM portal and the dark theme's CSS variables resolve correctly, but hardcoded values are more reliable across render environments. If the theme is always dark (the `dark` class is force-set on `<html>` in `layout.tsx`), `text-foreground/90` will also work — swap if preferred.

- [ ] **Step 7: Verify TypeScript**

```powershell
npx tsc --noEmit
```
Expected: no errors. If you see `Property 'spec' does not exist`, check that `story[1].spec` is typed as `string[] | undefined` in `content.ts` (it is — the `?? []` fallback handles it).

- [ ] **Step 8: Visual QA**

Scroll into Chapter 01. Checklist:
- Nodes are invisible at chapter start
- Nodes fade in smoothly after ~15% chapter progress
- Hovering each sphere: cursor changes to pointer, emissive brightens, label chip appears upper-right of node
- Three labels read: "Business analysis", "Public sector", "Requirements to shippable software"
- Leaving the sphere: emissive dims, label disappears, cursor resets
- The main tangle morph animation is unaffected
- No labels visible for Ch02–04 scenes

Adjust `POSITIONS` constants if nodes overlap the tangle or crystal mesh.

- [ ] **Step 9: Commit**

```powershell
git add src/components/r3f/chapters/chapter-01-tangle.tsx src/app/globals.css
git commit -m "feat: add interactive satellite spec nodes to Chapter 01"
```

---

## Final Verification

Run through the full verification checklist from the spec:

- [ ] Header fades out after 80px scroll
- [ ] Header returns on scroll-up
- [ ] Header reappears permanently at `#projects`
- [ ] Rail shows only dots; active dot glows cyan; hover any dot reveals label
- [ ] Chapter copy: poem lines only — no kicker, no badges
- [ ] Ch01 nodes invisible before 15% chapter progress
- [ ] Ch01 nodes scale in smoothly from 15%
- [ ] Hovering each node: emissive brightens, label chip appears
- [ ] Cursor is pointer over nodes
- [ ] No Ch02–04 regressions
- [ ] No regression on `/projects/kling` or `/projects/nomo`

```powershell
npx tsc --noEmit
npm run build
```
Expected: clean build, no type errors.
