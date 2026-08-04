# Interactive 3D Objects v2 — Beacon Affordance + Model-Ready Reveal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the crack-open interaction mechanic across Ch01/02/03 with a pulsing beacon-ring affordance and a scale-up reveal, using a new shared `InteractiveObject` component that accepts an optional GLB model path for future asset swaps.

**Architecture:** A single `InteractiveObject` component owns beacon ring, floating label, scale-up animation, emissive burst, and story card mounting. All three chapter files delegate their interactive objects to it. The existing `interaction-state.ts` (mutual exclusion) and `StoryCard` components are untouched. Scroll-close logic stays in each chapter's `useFrame`.

**Tech Stack:** React Three Fiber v9, `@react-three/drei` v10, Three.js 0.185, Next.js 16 App Router, TypeScript

## Global Constraints

- No new npm dependencies
- No em dashes or double hyphens in any copy
- `THREE.MathUtils.damp(factor=6)` for all new reveal animations
- Beacon ring pulse period: 2.5s cycle
- Object scale-up: `1 + scaleRef * 0.3` (rests at 1.0×, opens to 1.3×)
- Emissive burst formula: `base + scaleRef * 1.8`
- Story card appears when `scaleRef > 0.4`
- `gl.localClippingEnabled` in `scene.tsx` — leave as-is (harmless)
- Crack-open IDs must remain the same: `ch01-0`, `ch01-1`, `ch01-2`, `ch02-nomo`, `ch03-0` through `ch03-5`

---

### Task 1: InteractiveObject component

**Files:**
- Create: `src/components/r3f/interactive-object.tsx`

**Interfaces:**
- Consumes: `getActiveCrack`, `setActiveCrack` from `@/components/r3f/interaction-state`
- Consumes: `StoryCard` from `@/components/r3f/story-card`
- Consumes: `Html`, `useGLTF` from `@react-three/drei`
- Produces: `InteractiveObject` (default export + named), `InteractiveObjectProps` (type export) — used by Tasks 2, 3, 4

- [ ] **Step 1: Create the file with all sub-components and the main export**

Write `src/components/r3f/interactive-object.tsx` with this exact content:

```tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { StoryCard } from "@/components/r3f/story-card";

// ---------------------------------------------------------------------------
// BeaconRing — pulsing radial ring that signals "this object is clickable"
// ---------------------------------------------------------------------------
function BeaconRing({ id, objectRadius }: { id: string; objectRadius: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);
  const innerR = objectRadius + 0.06;
  const outerR = innerR + 0.04;

  useFrame((_, delta) => {
    if (!ringRef.current) return;
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    if (getActiveCrack() === id) {
      mat.opacity = 0;
      return;
    }
    tRef.current = (tRef.current + delta / 2.5) % 1;
    const t = tRef.current;
    ringRef.current.scale.setScalar(1 + t * 1.2);
    mat.opacity = (1 - t) * 0.5;
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerR, outerR, 32]} />
      <meshBasicMaterial
        color="#7fb3ff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// FallbackMesh — placeholder geometry when no GLB model is provided.
// For "sphere", objectRadius is used as the sphere radius.
// ---------------------------------------------------------------------------
function FallbackMesh({
  kind,
  objectRadius = 0.12,
}: {
  kind: "sphere" | "box" | "tetra" | "torus" | "octa" | "cone" | "ico";
  objectRadius?: number;
}) {
  if (kind === "sphere") return <sphereGeometry args={[objectRadius, 16, 16]} />;
  if (kind === "box")    return <boxGeometry args={[0.22, 0.22, 0.22]} />;
  if (kind === "tetra")  return <tetrahedronGeometry args={[0.16, 0]} />;
  if (kind === "torus")  return <torusGeometry args={[0.14, 0.04, 12, 32]} />;
  if (kind === "octa")   return <octahedronGeometry args={[0.18, 0]} />;
  if (kind === "cone")   return <coneGeometry args={[0.14, 0.28, 4]} />;
  return <icosahedronGeometry args={[0.17, 0]} />;
}

// ---------------------------------------------------------------------------
// GlbMesh — renders a loaded GLB. Wrap the call site in <React.Suspense>.
// ---------------------------------------------------------------------------
function GlbMesh({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene.clone()} />;
}

// ---------------------------------------------------------------------------
// InteractiveObject
// ---------------------------------------------------------------------------
export type InteractiveObjectProps = {
  id: string;
  label: string;
  story: string;
  logo?: string;
  position: [number, number, number];
  /** Controls beacon ring inner radius and label height. Default 0.12. */
  objectRadius?: number;
  fallbackGeometry: "sphere" | "box" | "tetra" | "torus" | "octa" | "cone" | "ico";
  /** Optional GLB path. When provided, renders GlbMesh instead of fallback. */
  model?: string;
  color?: string;
  emissive?: string;
  baseEmissive?: number;
  /**
   * Ch03 only: IconMesh writes the current sweep emissive value here each frame.
   * InteractiveObject adds its open-burst on top: final = baseEmissiveRef.current + scaleRef * 1.8.
   */
  baseEmissiveRef?: React.MutableRefObject<number>;
};

export function InteractiveObject({
  id,
  label,
  story,
  logo,
  position,
  objectRadius = 0.12,
  fallbackGeometry,
  model,
  color = "#a8d8ff",
  emissive = "#4499cc",
  baseEmissive = 0.3,
  baseEmissiveRef,
}: InteractiveObjectProps) {
  const meshGroupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const scaleRef = useRef(0);
  const cardVisRef = useRef(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    return () => { document.body.style.cursor = "auto"; };
  }, []);

  useFrame((_, delta) => {
    const isOpen = getActiveCrack() === id;
    scaleRef.current = THREE.MathUtils.damp(scaleRef.current, isOpen ? 1 : 0, 6, delta);
    const s = scaleRef.current;

    if (meshGroupRef.current) {
      meshGroupRef.current.scale.setScalar(1 + s * 0.3);
    }
    if (matRef.current) {
      const base = baseEmissiveRef ? baseEmissiveRef.current : baseEmissive;
      matRef.current.emissiveIntensity = base + s * 1.8;
    }

    const shouldShow = isOpen && s > 0.4;
    if (shouldShow !== cardVisRef.current) {
      cardVisRef.current = shouldShow;
      setShowCard(shouldShow);
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setActiveCrack(getActiveCrack() === id ? null : id);
      }}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "auto"; }}
    >
      <group ref={meshGroupRef}>
        {model ? (
          <React.Suspense fallback={null}>
            <GlbMesh path={model} />
          </React.Suspense>
        ) : (
          <mesh>
            <FallbackMesh kind={fallbackGeometry} objectRadius={objectRadius} />
            <meshStandardMaterial
              ref={matRef}
              color={color}
              emissive={emissive}
              emissiveIntensity={baseEmissive}
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>
        )}
      </group>

      <BeaconRing id={id} objectRadius={objectRadius} />

      <Html position={[0, objectRadius + 0.25, 0]} center>
        <>
          <style>{`
            @keyframes io-label-enter { from { opacity: 0 } to { opacity: 1 } }
            .io-label {
              animation: io-label-enter 0.4s 0.8s both;
              font-size: 0.55rem;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              color: rgba(255,255,255,0.7);
              pointer-events: none;
              white-space: nowrap;
              font-family: var(--font-sans, sans-serif);
              transition: opacity 0.2s;
            }
          `}</style>
          <div className="io-label" style={{ opacity: showCard ? 0 : undefined }}>
            {label}
          </div>
        </>
      </Html>

      {showCard && (
        <Html position={[0, objectRadius + 0.65, 0]} center>
          <StoryCard
            title={label}
            logo={logo}
            story={story}
            onClose={() => setActiveCrack(null)}
          />
        </Html>
      )}
    </group>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd c:\Users\min.y.seet\Desktop\portfolio && npx tsc --noEmit`

Expected: no errors in `interactive-object.tsx`. If you get errors about `THREE.MeshBasicMaterial` cast or `ref` type on `<meshStandardMaterial>`, they are pre-existing patterns in this codebase — check `chapter-01-tangle.tsx` for reference.

- [ ] **Step 3: Commit**

```bash
git add src/components/r3f/interactive-object.tsx
git commit -m "feat: add InteractiveObject component with beacon ring and scale-up reveal"
```

---

### Task 2: Ch01 — replace satellite node crack-open with InteractiveObject

**Files:**
- Modify: `src/components/r3f/chapters/chapter-01-tangle.tsx`

**Interfaces:**
- Consumes: `InteractiveObject`, `InteractiveObjectProps` from `@/components/r3f/interactive-object` (Task 1)
- The `PROJECTS` array, `POSITIONS` array, and `chapterLocalProgress(1)` usage remain unchanged

- [ ] **Step 1: Update imports**

Replace the import block at the top of `chapter-01-tangle.tsx`. The new import block is:

```tsx
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Line } from "@react-three/drei";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { InteractiveObject } from "@/components/r3f/interactive-object";
import type { CapabilityTier } from "@/hooks/use-device-capability";
```

Removed vs current: `useState`, `useMemo`, `Html` (from drei), `StoryCard`
Added: `InteractiveObject`

- [ ] **Step 2: Remove crack-open refs, state, and clip planes from the component body**

Inside `Chapter01Tangle`, remove these lines entirely:

```tsx
const splitRefs = useRef([0, 0, 0]);
const topHalfRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
const bottomHalfRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
const coreRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
const cardIndexRef = useRef<number | null>(null);
const [cardIndex, setCardIndex] = useState<number | null>(null);

const { topPlane, bottomPlane } = useMemo(
  () => ({
    topPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    bottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
  }),
  [],
);
```

Also remove the `BASE_EMISSIVE` constant:
```tsx
const BASE_EMISSIVE = 0.3;
```

Also remove the `useEffect` cursor cleanup (InteractiveObject now owns cursor cleanup per-instance):
```tsx
useEffect(() => {
  return () => {
    document.body.style.cursor = "auto";
  };
}, []);
```

- [ ] **Step 3: Remove crack animation block from useFrame**

Inside the `useFrame` callback, remove the entire crack animation block:

```tsx
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

Keep everything else in `useFrame` as-is: visibility check, rotation pause guard, lines morph, crystal animation, nodeScaleValue animation, scroll-close guard.

After removal, the `useFrame` body should look like this (verify your result matches):

```tsx
  useFrame((_, delta) => {
    const p = chapterLocalProgress(1);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // Pause crystal rotation while a crack is open (prevents card orbiting)
    const anyOpen = getActiveCrack()?.startsWith("ch01") ?? false;
    if (!anyOpen) {
      group.current.rotation.y += delta * 0.12;
    }

    if (linesRef.current) {
      const morph = Math.min(1, p / 0.7);
      const eased = morph * morph * (3 - 2 * morph);
      const live = buffers.live;
      const src = buffers.tangled;
      const dst = buffers.crystal;
      for (let i = 0; i < live.length; i++) {
        live[i] = src[i] + (dst[i] - src[i]) * eased;
      }
      linesRef.current.geometry.setPositions(live);

      const brightness = 0.35 + eased * 0.5;
      linesRef.current.material.color.setRGB(
        brightness * 0.7,
        brightness * 0.85,
        brightness * 1.0
      );
    }

    if (crystal.current) {
      const reveal = Math.max(0, Math.min(1, (p - 0.5) / 0.5));
      const s = reveal * 0.55;
      crystal.current.visible = reveal > 0.001;
      crystal.current.scale.setScalar(THREE.MathUtils.damp(crystal.current.scale.x, s, 3, delta));
      crystal.current.rotation.y -= delta * 0.2;
      crystal.current.rotation.x += delta * 0.05;
    }

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

    // Scroll-close: clear ch01 cracks when outside chapter band
    if ((p <= 0 || p >= 1) && getActiveCrack()?.startsWith("ch01")) {
      setActiveCrack(null);
    }
  });
```

- [ ] **Step 4: Replace per-node JSX with InteractiveObject**

Inside the `<group ref={nodesGroupRef}>`, replace all the per-project `<group key={proj.name} ...>` blocks (three of them, each with two half-meshes, core sphere, and story card) with:

```tsx
      <group ref={nodesGroupRef}>
        {PROJECTS.map((proj, i) => (
          <InteractiveObject
            key={proj.name}
            id={`ch01-${i}`}
            label={proj.name}
            story={proj.story}
            position={POSITIONS[i]}
            objectRadius={0.1}
            fallbackGeometry="sphere"
            color="#a8d8ff"
            emissive="#4499cc"
            baseEmissive={0.3}
          />
        ))}
      </group>
```

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: no errors. `getActiveCrack` / `setActiveCrack` are still imported and used in `useFrame` for the scroll-close guard and the rotation pause — verify those calls still compile.

- [ ] **Step 6: Visual check in dev server**

Open http://localhost:3000 (or port 3001 if 3000 is in use). Scroll to Ch01. Verify:
- Three spheres visible at the existing positions
- Each sphere has a pulsing ring radiating outward
- A small label floats above each sphere ("Nomo", "Gen AI Video", "GEP")
- Clicking a sphere scales it up (1.0→1.3×) and shows the story card
- Clicking the × or clicking again closes it
- Scrolling out of Ch01 closes any open card
- Cursor becomes pointer on hover

- [ ] **Step 7: Commit**

```bash
git add src/components/r3f/chapters/chapter-01-tangle.tsx
git commit -m "feat: Ch01 satellite spheres use InteractiveObject with beacon ring reveal"
```

---

### Task 3: Ch02 — strip pedestal to single InteractiveObject

**Files:**
- Modify: `src/components/r3f/chapters/chapter-02-pedestal.tsx`

**Interfaces:**
- Consumes: `InteractiveObject` from `@/components/r3f/interactive-object` (Task 1)
- The outer group scale-in animation (scales 0→1 over first 30% of chapter) is preserved

- [ ] **Step 1: Rewrite chapter-02-pedestal.tsx entirely**

Replace the entire contents of `src/components/r3f/chapters/chapter-02-pedestal.tsx` with:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { InteractiveObject } from "@/components/r3f/interactive-object";
import type { CapabilityTier } from "@/hooks/use-device-capability";

export function Chapter02Pedestal({ tier: _tier }: { tier: CapabilityTier }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(2);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // Chapter scale-in over first 30%
    const scaleIn = Math.min(1, p / 0.3);
    const s = scaleIn * scaleIn * (3 - 2 * scaleIn);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 3, delta));

    // Scroll-close: clear ch02 crack when outside chapter band
    if ((p <= 0 || p >= 1) && getActiveCrack() === "ch02-nomo") {
      setActiveCrack(null);
    }
  });

  return (
    <group ref={group} position={[-0.6, -0.2, 0]} scale={0.001}>
      <InteractiveObject
        id="ch02-nomo"
        label="Nomo"
        story="Built Nomo from zero. Designed in Figma, shipped in React. Proof that I don't just write specs."
        position={[0, 0, 0]}
        objectRadius={0.15}
        fallbackGeometry="box"
        color="#f5d18a"
        emissive="#f5d18a"
        baseEmissive={0.6}
      />
    </group>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: no errors. The `tier` prop is accepted (prefixed `_tier` to mark it unused).

- [ ] **Step 3: Visual check in dev server**

Scroll to Ch02. Verify:
- A single glowing golden box appears (placeholder for the Nomo phone model)
- Beacon ring pulses around it
- Label "Nomo" floats above
- Clicking scales it up and shows the story card
- Scrolling out of Ch02 closes the card
- The pedestal, torus-knot, and light shafts are gone

- [ ] **Step 4: Commit**

```bash
git add src/components/r3f/chapters/chapter-02-pedestal.tsx
git commit -m "feat: Ch02 stripped to single InteractiveObject placeholder, removes pedestal and torus-knot"
```

---

### Task 4: Ch03 — rewrite IconMesh to wrap InteractiveObject

**Files:**
- Modify: `src/components/r3f/chapters/chapter-03-toolkit.tsx`

**Interfaces:**
- Consumes: `InteractiveObject` from `@/components/r3f/interactive-object` (Task 1)
- `Chapter03Toolkit` component signature and ring-rotation logic are unchanged
- `TOOLKIT` array and `RADIUS`/`ITEMS` constants are unchanged

- [ ] **Step 1: Update imports**

Replace the import block at the top of `chapter-03-toolkit.tsx` with:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { InteractiveObject } from "@/components/r3f/interactive-object";
```

Removed vs current: `useState`, `useMemo`, `Html` (from drei), `StoryCard`
Added: `InteractiveObject`

- [ ] **Step 2: Rewrite IconMesh**

Replace the entire `IconMesh` function (everything from `function IconMesh` to its closing `}`) with:

```tsx
function IconMesh({
  index,
  geometryKind,
}: {
  index: number;
  geometryKind: "tetra" | "torus" | "box" | "octa" | "cone" | "ico";
}) {
  const haloRef = useRef<THREE.Mesh>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const baseEmissiveRef = useRef(0.05);

  const angle = (index / ITEMS) * Math.PI * 2;
  const baseX = Math.cos(angle) * RADIUS;
  const baseZ = Math.sin(angle) * RADIUS - 0.4;
  const baseY = ((index % 3) - 1) * 0.25;

  const item = TOOLKIT[index];

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);

    // Illumination sweep — writes to baseEmissiveRef for InteractiveObject to read
    const start = index / ITEMS;
    const end = start + 0.35;
    const local = Math.max(0, Math.min(1, (p - start) / (end - start)));
    const eased = local * local * (3 - 2 * local);
    baseEmissiveRef.current = 0.05 + eased * 2.2;

    // Bob animation — writes directly to outer group Y
    const t = performance.now() * 0.0007;
    const groupY = baseY + Math.sin(t + index) * 0.08;
    if (outerGroupRef.current) {
      outerGroupRef.current.position.y = groupY;
    }

    // Halo ring
    if (haloRef.current) {
      const hMat = haloRef.current.material as THREE.MeshBasicMaterial;
      hMat.opacity = eased * 0.4;
      haloRef.current.scale.setScalar(0.7 + eased * 0.35);
    }

    // Scroll-close
    if ((p <= 0 || p >= 1) && getActiveCrack()?.startsWith("ch03")) {
      setActiveCrack(null);
    }

    // Suppress unused delta warning
    void delta;
  });

  return (
    <group ref={outerGroupRef} position={[baseX, baseY, baseZ]}>
      <InteractiveObject
        id={`ch03-${index}`}
        label={item.tool}
        logo={item.logo}
        story={item.story}
        position={[0, 0, 0]}
        objectRadius={0.18}
        fallbackGeometry={geometryKind}
        color="#b8d8ff"
        emissive="#7fb3ff"
        baseEmissive={0.05}
        baseEmissiveRef={baseEmissiveRef}
      />

      {/* Halo ring — illumination glow at base of object */}
      <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.30, 24]} />
        <meshBasicMaterial
          color="#7fb3ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
```

Note: the `void delta` line suppresses a TypeScript "declared but never read" warning since delta is destructured from `useFrame` but not used directly in this function (it was used in crack animation which is now removed). If TypeScript does not warn, remove that line.

- [ ] **Step 3: Verify Chapter03Toolkit is unchanged**

The `Chapter03Toolkit` export at the bottom of the file should remain exactly as-is:

```tsx
export function Chapter03Toolkit() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);
    if (!group.current) return;
    group.current.visible = p > 0.001;
    const anyCh03Open = getActiveCrack()?.startsWith("ch03") ?? false;
    if (!anyCh03Open) {
      group.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      <IconMesh index={0} geometryKind="tetra" />
      <IconMesh index={1} geometryKind="torus" />
      <IconMesh index={2} geometryKind="box" />
      <IconMesh index={3} geometryKind="octa" />
      <IconMesh index={4} geometryKind="cone" />
      <IconMesh index={5} geometryKind="ico" />
    </group>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`

Expected: no errors. Verify `baseEmissiveRef` type matches `InteractiveObjectProps.baseEmissiveRef` (`React.MutableRefObject<number>`).

- [ ] **Step 5: Full build check**

Run: `npm run build`

Expected: `✓ Compiled successfully`. TypeScript check + static generation both pass.

- [ ] **Step 6: Visual check in dev server**

Scroll to Ch03. Verify:
- All six toolkit shapes are visible with their existing illumination sweep
- Each shape has a pulsing beacon ring
- A small label floats above each shape (Figma, JIRA, Excel, Confluence, SQL, AI)
- Clicking any shape scales it up and shows the story card with the SVG logo
- Clicking a second shape closes the first (mutual exclusion)
- Scrolling out of Ch03 closes any open card
- The ring rotation in `Chapter03Toolkit` continues normally
- Labels disappear while a card is open and reappear when closed

- [ ] **Step 7: Commit**

```bash
git add src/components/r3f/chapters/chapter-03-toolkit.tsx
git commit -m "feat: Ch03 IconMesh wraps InteractiveObject, adds beacon ring affordance"
```
