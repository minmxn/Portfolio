# Interactive 3D Objects — Crack-Open Story Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make 3D objects in three scroll chapters clickable — they crack open (two clipped halves separate), a glowing core sphere appears, and a floating HTML card shows a real project or tool story.

**Architecture:** Each chapter manages its own crack state using `THREE.MathUtils.damp` in `useFrame`. A module-level `interaction-state.ts` (same pattern as `scroll-state.ts`) enforces one-object-at-a-time mutual exclusion. A shared `StoryCard` React component renders via drei's `<Html>` into 3D space. No new npm dependencies.

**Tech Stack:** React 18, Next.js (App Router), @react-three/fiber v9, @react-three/drei v10, Three.js, TypeScript

## Global Constraints

- No em dashes and no double hyphens in any copy (see `src/content.ts` header comment)
- No new npm dependencies — use `THREE.MathUtils.damp` in `useFrame` for all animation
- All animation uses `factor = 6` for `damp` unless stated otherwise
- `gl.localClippingEnabled = true` must be set before any clipping planes are used
- Top clip plane: `new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)` — keeps y > 0
- Bottom clip plane: `new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)` — keeps y < 0
- Core sphere material: color `#f6b979`, `AdditiveBlending`, `depthWrite: false`
- Story copy: no em dashes, no double hyphens
- `interaction-state.ts` IDs: `"ch01-0"`, `"ch01-1"`, `"ch01-2"`, `"ch02-nomo"`, `"ch03-0"` through `"ch03-5"`

---

## File Structure

### New files
- `src/components/r3f/interaction-state.ts` — module-level activeCrack, same pattern as scroll-state.ts
- `src/components/r3f/story-card.tsx` — floating HTML card rendered via drei `<Html>`
- `public/logos/figma.svg`
- `public/logos/jira.svg`
- `public/logos/excel.svg`
- `public/logos/confluence.svg`
- `public/logos/sql.svg`
- `public/logos/ai-trio.svg`

### Modified files
- `src/components/r3f/scene.tsx` — add `gl.localClippingEnabled = true`
- `src/components/r3f/chapters/chapter-01-tangle.tsx` — satellite sphere crack-open
- `src/components/r3f/chapters/chapter-02-pedestal.tsx` — Nomo pedestal crack-open
- `src/components/r3f/chapters/chapter-03-toolkit.tsx` — toolkit ring crack-open

---

### Task 1: Shared infrastructure — interaction-state module and renderer clipping

**Files:**
- Create: `src/components/r3f/interaction-state.ts`
- Modify: `src/components/r3f/scene.tsx` (lines 35–38)

**Interfaces:**
- Produces: `getActiveCrack(): string | null`, `setActiveCrack(id: string | null): void` — consumed by all three chapter tasks

- [ ] **Step 1: Create interaction-state.ts**

```ts
// src/components/r3f/interaction-state.ts
// Module-level active crack state — plain mutable module, no React, same
// pattern as scroll-state.ts. Chapters poll getActiveCrack() in useFrame.

let _activeCrack: string | null = null;

export function getActiveCrack(): string | null {
  return _activeCrack;
}

export function setActiveCrack(id: string | null): void {
  _activeCrack = id;
}
```

- [ ] **Step 2: Enable clipping on the renderer in scene.tsx**

In `src/components/r3f/scene.tsx`, update the `onCreated` callback:

```tsx
onCreated={({ gl, scene }) => {
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.localClippingEnabled = true;
  scene.fog = new THREE.FogExp2("#0a0e17", 0.06);
}}
```

- [ ] **Step 3: Visual smoke test**

Run `npm run dev`, open the browser. The scene should render exactly as before — no visual change, no console errors. Clipping being enabled has no effect until clipping planes are added to materials.

- [ ] **Step 4: Commit**

```bash
git add src/components/r3f/interaction-state.ts src/components/r3f/scene.tsx
git commit -m "feat: add interaction-state module and enable renderer clipping"
```

---

### Task 2: StoryCard floating HTML component

**Files:**
- Create: `src/components/r3f/story-card.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: `StoryCard` component with props `{ title: string; logo?: string; story: string; onClose: () => void }` — consumed by Tasks 4, 5, 6

- [ ] **Step 1: Create story-card.tsx**

```tsx
// src/components/r3f/story-card.tsx
"use client";

interface StoryCardProps {
  title: string;
  logo?: string;
  story: string;
  onClose: () => void;
}

export function StoryCard({ title, logo, story, onClose }: StoryCardProps) {
  return (
    <>
      <style>{`
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .story-card {
          animation: card-enter 200ms ease-out both;
          background: rgba(10,8,20,0.85);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 12px 16px;
          min-width: 200px;
          max-width: 260px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          position: relative;
          color: white;
          user-select: none;
          pointer-events: auto;
          font-family: inherit;
          white-space: normal;
        }
        .story-card__close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 0;
          font-family: inherit;
        }
        .story-card__close:hover { color: rgba(255,255,255,0.9); }
        .story-card__title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 6px;
          padding-right: 24px;
          letter-spacing: 0.01em;
        }
        .story-card__logo {
          height: 24px;
          display: block;
          margin-bottom: 8px;
          object-fit: contain;
        }
        .story-card__body {
          margin: 0;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          line-height: 1.5;
        }
      `}</style>
      <div
        className="story-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="story-card__close"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close"
        >
          ×
        </button>
        {logo ? (
          <img src={logo} alt={title} className="story-card__logo" />
        ) : (
          <p className="story-card__title">{title}</p>
        )}
        <p className="story-card__body">{story}</p>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Visual smoke test**

This component renders inside drei's `<Html>`, which won't be visible until wired into a chapter. Skip visual test here — it's verified in Tasks 4–6. Ensure no TypeScript errors: `npx tsc --noEmit`.

- [ ] **Step 3: Commit**

```bash
git add src/components/r3f/story-card.tsx
git commit -m "feat: add StoryCard floating HTML component for crack-open reveals"
```

---

### Task 3: SVG logo assets

**Files:**
- Create: `public/logos/figma.svg`, `public/logos/jira.svg`, `public/logos/excel.svg`, `public/logos/confluence.svg`, `public/logos/sql.svg`, `public/logos/ai-trio.svg`

**Interfaces:**
- Consumes: nothing
- Produces: six SVG files at `/logos/*.svg` — consumed by Task 6 (Ch03 toolkit)

- [ ] **Step 1: Create public/logos/figma.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 84" fill="none">
  <path d="M28 0H0v28h28V0z" fill="#FF7262"/>
  <path d="M56 0H28v28h28V0z" fill="#F24E1E"/>
  <path d="M28 28H0v28h28V28z" fill="#A259FF"/>
  <path d="M28 56H0v22a6 6 0 006 6h22V56z" fill="#0ACF83"/>
  <circle cx="42" cy="42" r="14" fill="#1ABCFE"/>
</svg>
```

- [ ] **Step 2: Create public/logos/jira.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <path d="M16 2L30 16 16 30 2 16z" fill="#2684FF"/>
  <path d="M16 8L24 16 16 24 12 20l6-4-6-4z" fill="white" opacity="0.9"/>
</svg>
```

- [ ] **Step 3: Create public/logos/excel.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="4" fill="#217346"/>
  <path d="M8 8h6v6H8zM18 8h6v6h-6zM8 18h6v6H8zM18 18h6v6h-6z" fill="white" opacity="0.3"/>
  <path d="M6 10l6 12M18 10l-6 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 4: Create public/logos/confluence.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <path d="M2 22c6-2 12-8 14-14 2 6 8 12 14 14-6 2-12 8-14 14C14 30 8 24 2 22z" fill="#2684FF"/>
  <path d="M6 22c4-2 8-6 10-10 2 4 6 8 10 10-4 2-8 6-10 10C14 28 10 24 6 22z" fill="#1868DB"/>
</svg>
```

- [ ] **Step 5: Create public/logos/sql.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <ellipse cx="16" cy="8" rx="12" ry="5" fill="#4a90d9"/>
  <path d="M4 8v8c0 2.76 5.37 5 12 5s12-2.24 12-5V8" fill="#2c6fad" opacity="0.7"/>
  <path d="M4 16v8c0 2.76 5.37 5 12 5s12-2.24 12-5v-8" fill="#1a4f7a" opacity="0.7"/>
  <ellipse cx="16" cy="8" rx="12" ry="5" fill="none" stroke="#7ab5e8" stroke-width="1"/>
</svg>
```

- [ ] **Step 6: Create public/logos/ai-trio.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 24" fill="none">
  <circle cx="12" cy="12" r="10" fill="#CC785C"/>
  <text x="12" y="16" text-anchor="middle" font-size="8" font-weight="bold" fill="white" font-family="sans-serif">C</text>
  <circle cx="32" cy="12" r="10" fill="#19C37D"/>
  <text x="32" y="16" text-anchor="middle" font-size="8" font-weight="bold" fill="white" font-family="sans-serif">G</text>
  <circle cx="52" cy="12" r="10" fill="#4285F4"/>
  <text x="52" y="16" text-anchor="middle" font-size="8" font-weight="bold" fill="white" font-family="sans-serif">G</text>
</svg>
```

- [ ] **Step 7: Verify assets load**

Run `npm run dev`. Open `http://localhost:3000/logos/figma.svg` in a browser tab — the SVG should render. Repeat for all six files.

- [ ] **Step 8: Commit**

```bash
git add public/logos/
git commit -m "feat: add SVG logo assets for toolkit crack-open reveals"
```

---

### Task 4: Ch01 — satellite sphere crack-open

**Files:**
- Modify: `src/components/r3f/chapters/chapter-01-tangle.tsx`

**Interfaces:**
- Consumes: `getActiveCrack`, `setActiveCrack` from `interaction-state.ts`; `StoryCard` from `story-card.tsx`
- Produces: three clickable spheres at existing `POSITIONS`, each cracking open to a project story card

**Context:** The current file already has `SPECS`, `POSITIONS`, `hoveredIndexRef`, `nodeMatRefs`, `emissiveValues`, `nodesGroupRef`, `nodeScaleValue` and the sphere meshes in JSX. This task replaces the hover spec-label interaction entirely and uses the crack-open mechanic instead.

The existing sphere meshes use one mesh per node. Replace with two clipped half-meshes per node. The `nodesGroupRef` scale animation (fade in at p > 0.15) is kept. The crystal group rotation (`group.current.rotation.y += delta * 0.12`) pauses while any Ch01 crack is open to prevent the card from orbiting.

- [ ] **Step 1: Add project data constants and new imports**

At the top of `chapter-01-tangle.tsx`, after existing imports add:

```tsx
import { Html } from "@react-three/drei";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { StoryCard } from "@/components/r3f/story-card";
```

Remove the existing import:
```tsx
import { setHoveredSpec } from "@/components/scroll/spec-hover-state";
```

Replace the `SPECS` constant and add project data:

```tsx
// Remove: const SPECS = story[1].spec ?? [];
// Remove: import { story } from "@/content";  (only if story is no longer used)

const PROJECTS = [
  {
    name: "Nomo",
    story: "Built a productivity app from zero. First time I proved I could ship, not just spec.",
  },
  {
    name: "Generative AI Video",
    story: "Explored how gen AI could produce video at scale. Part research, part prototype.",
  },
  {
    name: "Gifted Education Programme",
    story: "Multi-stakeholder, no clear brief. I mapped the chaos and turned it into a roadmap.",
  },
] as const;
```

- [ ] **Step 2: Replace refs and add new crack refs inside Chapter01Tangle**

Remove these refs (no longer needed):
```tsx
// Remove: const hoveredIndexRef = useRef<number | null>(null);
// Remove: const nodeMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([null, null, null]);
// Remove: const emissiveValues = useRef([BASE_EMISSIVE, BASE_EMISSIVE, BASE_EMISSIVE]);
```

Add these refs after the existing `nodeScaleValue` ref:

```tsx
const splitRefs = useRef([0, 0, 0]);
const topHalfRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
const bottomHalfRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
const coreRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
const cardIndexRef = useRef<number | null>(null);
const [cardIndex, setCardIndex] = useState<number | null>(null);
```

Add `useState` to the existing React import.

Add the two clip planes with `useMemo`:

```tsx
const { topPlane, bottomPlane } = useMemo(
  () => ({
    topPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    bottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
  }),
  [],
);
```

- [ ] **Step 3: Update useFrame — replace hover logic with crack animation**

Inside `useFrame`, replace the entire "Per-node emissive intensity damping" block (the `for` loop for `hoveredIndexRef`) with this crack animation block:

```tsx
// Pause crystal rotation while a crack is open (prevents card orbiting)
const anyOpen = getActiveCrack()?.startsWith("ch01") ?? false;
if (!anyOpen) {
  group.current.rotation.y += delta * 0.12;
}

// Per-node crack animation
let newCardIndex: number | null = null;
for (let i = 0; i < 3; i++) {
  const isThisOpen = getActiveCrack() === `ch01-${i}`;
  splitRefs.current[i] = THREE.MathUtils.damp(
    splitRefs.current[i],
    isThisOpen ? 1 : 0,
    6,
    delta,
  );
  const s = splitRefs.current[i];

  const top = topHalfRefs.current[i];
  const bottom = bottomHalfRefs.current[i];
  const core = coreRefs.current[i];

  if (top) top.position.y = s * 0.1;
  if (bottom) bottom.position.y = -s * 0.1;
  if (core) {
    const cs = THREE.MathUtils.damp(core.scale.x, s, 6, delta);
    core.scale.setScalar(cs);
  }

  if (isThisOpen && s > 0.4) newCardIndex = i;
}

if (newCardIndex !== cardIndexRef.current) {
  cardIndexRef.current = newCardIndex;
  setCardIndex(newCardIndex);
}
```

Also remove the now-unused `group.current.rotation.y += delta * 0.12;` line that was previously in useFrame (it's now inside the `!anyOpen` guard above).

- [ ] **Step 4: Replace sphere JSX with cracked half-meshes**

In the JSX, replace the entire `<group ref={nodesGroupRef}>` block with:

```tsx
<group ref={nodesGroupRef}>
  {PROJECTS.map((proj, i) => (
    <group key={proj.name} position={POSITIONS[i]}>
      {/* Top half */}
      <mesh
        ref={(m) => { topHalfRefs.current[i] = m; }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveCrack(getActiveCrack() === `ch01-${i}` ? null : `ch01-${i}`);
        }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#a8d8ff"
          emissive="#4499cc"
          emissiveIntensity={BASE_EMISSIVE}
          clippingPlanes={[topPlane]}
          clipShadows
        />
      </mesh>

      {/* Bottom half */}
      <mesh ref={(m) => { bottomHalfRefs.current[i] = m; }}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#a8d8ff"
          emissive="#4499cc"
          emissiveIntensity={BASE_EMISSIVE}
          clippingPlanes={[bottomPlane]}
          clipShadows
        />
      </mesh>

      {/* Core glow sphere */}
      <mesh ref={(m) => { coreRefs.current[i] = m; }} scale={0}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial
          color="#f6b979"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Story card */}
      {cardIndex === i && (
        <Html position={[0, 0.65, 0]} center>
          <StoryCard
            title={proj.name}
            story={proj.story}
            onClose={() => setActiveCrack(null)}
          />
        </Html>
      )}
    </group>
  ))}
</group>
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors before continuing.

- [ ] **Step 6: Visual test**

Run `npm run dev`. Scroll to Chapter 01. Verify:
- Three satellite spheres appear as before (scale in at p > 0.15)
- Hovering a sphere shows pointer cursor
- Clicking a sphere: the two halves separate, a warm core glow appears, a StoryCard floats above with the project name and story
- Clicking the × in the card closes it (halves return)
- Clicking the same sphere again closes it
- Clicking a different sphere closes the first and opens the second
- While a crack is open, the crystal group stops rotating
- Scrolling past Ch01 closes all cracks

- [ ] **Step 7: Commit**

```bash
git add src/components/r3f/chapters/chapter-01-tangle.tsx
git commit -m "feat: Ch01 satellite spheres crack open to reveal project stories"
```

---

### Task 5: Ch02 — Nomo pedestal crack-open

**Files:**
- Modify: `src/components/r3f/chapters/chapter-02-pedestal.tsx`

**Interfaces:**
- Consumes: `getActiveCrack`, `setActiveCrack` from `interaction-state.ts`; `StoryCard` from `story-card.tsx`
- Produces: clickable pedestal column that cracks open; existing torus-knot scales up as the "logo reveal"

**Context:** The pedestal group starts at `scale={0.001}` and scales to 1 during the first 30% of Ch02. The column mesh is at `position={[0, 0, 0]}` inside this group. The torus-knot is at `position={[0, 0.55, 0]}`. The crack-open splits the column's top and bottom halves. The torus-knot scales up to 1.5x when cracked.

- [ ] **Step 1: Add imports**

```tsx
import { useState, useMemo } from "react";
import { Html } from "@react-three/drei";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { StoryCard } from "@/components/r3f/story-card";
```

- [ ] **Step 2: Add crack refs and clip planes inside Chapter02Pedestal**

After existing refs (`group`, `knot`, `shaftA`, `shaftB`), add:

```tsx
const topColRef = useRef<THREE.Mesh>(null);
const bottomColRef = useRef<THREE.Mesh>(null);
const splitRef = useRef(0);
const cardVisRef = useRef(false);
const [showCard, setShowCard] = useState(false);

const { topPlane, bottomPlane } = useMemo(
  () => ({
    topPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    bottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
  }),
  [],
);
```

- [ ] **Step 3: Update useFrame with crack animation**

After the existing `shaftB` opacity update, add:

```tsx
// Pedestal crack animation
const isCracked = getActiveCrack() === "ch02-nomo";
splitRef.current = THREE.MathUtils.damp(splitRef.current, isCracked ? 1 : 0, 6, delta);
const s = splitRef.current;

if (topColRef.current) topColRef.current.position.y = s * 0.22;
if (bottomColRef.current) bottomColRef.current.position.y = -s * 0.22;

if (knot.current) {
  const knotTarget = 1 + s * 0.5;
  knot.current.scale.setScalar(
    THREE.MathUtils.damp(knot.current.scale.x, knotTarget, 6, delta),
  );
}

const shouldShow = isCracked && s > 0.4;
if (shouldShow !== cardVisRef.current) {
  cardVisRef.current = shouldShow;
  setShowCard(shouldShow);
}
```

- [ ] **Step 4: Replace the column mesh with two clipped halves**

In the JSX, the current column mesh is:
```tsx
{/* Pedestal column */}
<mesh position={[0, 0, 0]}>
  <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
  <meshStandardMaterial color={pedestalColor} roughness={0.85} metalness={0.05} />
</mesh>
```

Replace it with:

```tsx
{/* Pedestal column — top half */}
<mesh
  ref={topColRef}
  onClick={(e) => {
    e.stopPropagation();
    setActiveCrack(getActiveCrack() === "ch02-nomo" ? null : "ch02-nomo");
  }}
  onPointerOver={() => { document.body.style.cursor = "pointer"; }}
  onPointerOut={() => { document.body.style.cursor = "auto"; }}
>
  <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
  <meshStandardMaterial
    color={pedestalColor}
    roughness={0.85}
    metalness={0.05}
    clippingPlanes={[topPlane]}
    clipShadows
  />
</mesh>

{/* Pedestal column — bottom half */}
<mesh ref={bottomColRef}>
  <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
  <meshStandardMaterial
    color={pedestalColor}
    roughness={0.85}
    metalness={0.05}
    clippingPlanes={[bottomPlane]}
    clipShadows
  />
</mesh>

{/* Core glow sphere at column centre */}
{/* (scale animated imperatively via knot scale-up — no separate core mesh needed) */}

{/* Story card */}
{showCard && (
  <Html position={[0, 1.1, 0]} center>
    <StoryCard
      title="Nomo"
      story="Built Nomo from zero. Designed in Figma, shipped in React. Proof that I don't just write specs."
      onClose={() => setActiveCrack(null)}
    />
  </Html>
)}
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Visual test**

Run `npm run dev`. Scroll to Chapter 02. Verify:
- Pedestal renders normally (scales in, torus-knot rotates)
- Clicking the column: top half slides up, bottom half slides down, torus-knot scales to 1.5x, StoryCard appears above
- Clicking × or column again re-seals
- Opening a Ch01 crack while Ch02 is open closes Ch02 (mutual exclusion via interaction-state)

- [ ] **Step 7: Commit**

```bash
git add src/components/r3f/chapters/chapter-02-pedestal.tsx
git commit -m "feat: Ch02 Nomo pedestal cracks open to reveal project story"
```

---

### Task 6: Ch03 — toolkit ring crack-open

**Files:**
- Modify: `src/components/r3f/chapters/chapter-03-toolkit.tsx`

**Interfaces:**
- Consumes: `getActiveCrack`, `setActiveCrack` from `interaction-state.ts`; `StoryCard` from `story-card.tsx`; `/logos/*.svg` from Task 3
- Produces: six independently clickable toolkit shapes, each cracking to reveal a tool logo and story

**Context:** Each `IconMesh` currently has one mesh with dynamic `emissiveIntensity` updated imperatively in `useFrame`. This task replaces the single mesh with two clipped halves while keeping the existing illumination sweep animation. The ring rotation (`group.current.rotation.y += delta * 0.08`) pauses when any Ch03 object is cracked.

- [ ] **Step 1: Add imports to chapter-03-toolkit.tsx**

```tsx
import { useState, useMemo } from "react";
import { Html } from "@react-three/drei";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { StoryCard } from "@/components/r3f/story-card";
```

- [ ] **Step 2: Add toolkit data constant**

After the `ITEMS = 6` constant, add:

```tsx
const TOOLKIT = [
  { tool: "Figma",      logo: "/logos/figma.svg",      story: "Prototyped Nomo's entire UI before writing a line of code." },
  { tool: "JIRA",       logo: "/logos/jira.svg",       story: "Managed delivery across public sector programmes from backlog to release." },
  { tool: "Excel",      logo: "/logos/excel.svg",      story: "Every BA's secret weapon. Where raw data becomes a decision." },
  { tool: "Confluence", logo: "/logos/confluence.svg", story: "Wrote the docs that let engineers ship without needing another meeting." },
  { tool: "SQL",        logo: "/logos/sql.svg",        story: "Queried Oracle to surface insights no one thought to ask for." },
  { tool: "AI",         logo: "/logos/ai-trio.svg",    story: "Claude, ChatGPT, Gemini. I use AI as a thinking partner, not a shortcut." },
] as const;
```

- [ ] **Step 3: Update IconMesh props and internals**

Replace the entire `IconMesh` function with this version that adds crack state and clip planes:

```tsx
function IconMesh({
  index,
  geometryKind,
}: {
  index: number;
  geometryKind: "tetra" | "torus" | "box" | "octa" | "cone" | "ico";
}) {
  const topRef = useRef<THREE.Mesh>(null);
  const bottomRef = useRef<THREE.Mesh>(null);
  const topMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const bottomMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const halo = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const splitRef = useRef(0);
  const cardVisRef = useRef(false);
  const [showCard, setShowCard] = useState(false);

  const angle = (index / ITEMS) * Math.PI * 2;
  const baseX = Math.cos(angle) * RADIUS;
  const baseZ = Math.sin(angle) * RADIUS - 0.4;
  const baseY = ((index % 3) - 1) * 0.25;

  const { topPlane, bottomPlane } = useMemo(
    () => ({
      topPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      bottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    }),
    [],
  );

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);
    const crackId = `ch03-${index}`;
    const isCracked = getActiveCrack() === crackId;

    // Illumination sweep (keep existing behavior)
    const start = index / ITEMS;
    const end = start + 0.35;
    const local = Math.max(0, Math.min(1, (p - start) / (end - start)));
    const eased = local * local * (3 - 2 * local);
    const eI = 0.05 + eased * 2.2;
    if (topMatRef.current) topMatRef.current.emissiveIntensity = eI;
    if (bottomMatRef.current) bottomMatRef.current.emissiveIntensity = eI;

    // Bob and spin
    const t = performance.now() * 0.0007;
    const groupY = baseY + Math.sin(t + index) * 0.08;
    if (topRef.current) {
      topRef.current.parent!.position.y = groupY;
      topRef.current.rotation.y += delta * (0.25 + index * 0.03);
      topRef.current.rotation.x += delta * 0.08;
    }
    if (bottomRef.current) {
      bottomRef.current.rotation.y = topRef.current?.rotation.y ?? 0;
      bottomRef.current.rotation.x = topRef.current?.rotation.x ?? 0;
    }

    if (halo.current) {
      const hMat = halo.current.material as THREE.MeshBasicMaterial;
      hMat.opacity = eased * 0.4;
      halo.current.scale.setScalar(0.7 + eased * 0.35);
    }

    // Crack animation
    splitRef.current = THREE.MathUtils.damp(splitRef.current, isCracked ? 1 : 0, 6, delta);
    const s = splitRef.current;
    if (topRef.current) topRef.current.position.y = s * 0.18;
    if (bottomRef.current) bottomRef.current.position.y = -s * 0.18;
    if (coreRef.current) {
      const cs = THREE.MathUtils.damp(coreRef.current.scale.x, s, 6, delta);
      coreRef.current.scale.setScalar(cs);
    }

    const shouldShow = isCracked && s > 0.4;
    if (shouldShow !== cardVisRef.current) {
      cardVisRef.current = shouldShow;
      setShowCard(shouldShow);
    }
  });

  const color = "#b8d8ff";
  const emissive = "#7fb3ff";
  const item = TOOLKIT[index];

  const geom = (
    <>
      {geometryKind === "tetra" && <tetrahedronGeometry args={[0.16, 0]} />}
      {geometryKind === "torus" && <torusGeometry args={[0.14, 0.04, 12, 32]} />}
      {geometryKind === "box" && <boxGeometry args={[0.22, 0.22, 0.22]} />}
      {geometryKind === "octa" && <octahedronGeometry args={[0.18, 0]} />}
      {geometryKind === "cone" && <coneGeometry args={[0.14, 0.28, 4]} />}
      {geometryKind === "ico" && <icosahedronGeometry args={[0.17, 0]} />}
    </>
  );

  return (
    <group position={[baseX, baseY, baseZ]}>
      {/* Top half */}
      <mesh
        ref={topRef}
        onClick={(e) => {
          e.stopPropagation();
          setActiveCrack(getActiveCrack() === `ch03-${index}` ? null : `ch03-${index}`);
        }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        {geom}
        <meshStandardMaterial
          ref={topMatRef}
          color={color}
          emissive={emissive}
          emissiveIntensity={0.05}
          roughness={0.4}
          metalness={0.15}
          clippingPlanes={[topPlane]}
          clipShadows
        />
      </mesh>

      {/* Bottom half */}
      <mesh ref={bottomRef}>
        {geom}
        <meshStandardMaterial
          ref={bottomMatRef}
          color={color}
          emissive={emissive}
          emissiveIntensity={0.05}
          roughness={0.4}
          metalness={0.15}
          clippingPlanes={[bottomPlane]}
          clipShadows
        />
      </mesh>

      {/* Core glow */}
      <mesh ref={coreRef} scale={0}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial
          color="#f6b979"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Halo ring */}
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.30, 24]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Story card */}
      {showCard && (
        <Html position={[0, 0.65, 0]} center>
          <StoryCard
            title={item.tool}
            logo={item.logo}
            story={item.story}
            onClose={() => setActiveCrack(null)}
          />
        </Html>
      )}
    </group>
  );
}
```

- [ ] **Step 4: Pause ring rotation when any Ch03 crack is open**

In `Chapter03Toolkit`'s `useFrame`, replace:

```tsx
group.current.rotation.y += delta * 0.08;
```

With:

```tsx
const anyCh03Open = getActiveCrack()?.startsWith("ch03") ?? false;
if (!anyCh03Open) {
  group.current.rotation.y += delta * 0.08;
}
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors. Common issue: `ref` on JSX geometry elements may need explicit types — add `as THREE.MeshStandardMaterial` casts if needed on `topMatRef` / `bottomMatRef`.

- [ ] **Step 6: Visual test**

Run `npm run dev`. Scroll to Chapter 03. Verify:
- Six shapes orbit and illuminate as before
- Hovering any shape shows pointer cursor
- Clicking a shape: halves separate, core glow appears, StoryCard with tool logo and story appears above
- Ring stops rotating while a card is open
- Clicking × re-seals; ring resumes rotating
- Opening a Ch01 or Ch02 crack while a Ch03 crack is open closes the Ch03 crack
- All six tools open correctly with their respective logos and stories

- [ ] **Step 7: Commit**

```bash
git add src/components/r3f/chapters/chapter-03-toolkit.tsx
git commit -m "feat: Ch03 toolkit ring shapes crack open to reveal tool stories"
```

---

## Self-Review Notes

**Spec coverage:**
- Interaction model (idle/cracked/closing, mutual exclusion, scroll-close): Tasks 1 + 4–6
- Crack mechanic (clipping planes, damp, core sphere): Tasks 4–6
- Ch01 project stories: Task 4
- Ch02 Nomo pedestal + torus-knot scale-up: Task 5
- Ch03 toolkit ring + logos: Tasks 3 + 6
- StoryCard design (colors, blur, entrance animation): Task 2
- `interaction-state.ts` module: Task 1
- `gl.localClippingEnabled`: Task 1

**Gap noted:** The spec mentions ring/crystal rotation pausing when a crack is open. Ch01 crystal rotation pause is handled in Task 4 step 3. Ch03 ring rotation pause is handled in Task 6 step 4.

**Gap noted:** Ch01 task removes the `setHoveredSpec` import and call. If `spec-hover-state.ts` is no longer used by any other component, it can be deleted in a follow-up cleanup. Do NOT delete it in these tasks — verify first.

**Type consistency:** `getActiveCrack()` returns `string | null` throughout. `setActiveCrack(null)` closes. Crack IDs are `"ch01-0"`, `"ch01-1"`, `"ch01-2"`, `"ch02-nomo"`, `"ch03-0"` through `"ch03-5"` — consistent across all tasks.

**Mobile bottom sheet:** Not implemented in this plan (requires a DOM-level overlay outside the Canvas). Flagged as a follow-up enhancement.
