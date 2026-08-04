# Interactive 3D Objects v2 — Beacon Affordance + Model-Ready Reveal

**Date:** 2026-08-04
**Status:** Approved for implementation
**Supersedes:** `2026-08-04-interactive-3d-objects-design.md`

## Overview

Replaces the crack-open mechanic with a discoverable beacon-ring affordance and a clean scale-up reveal. Introduces a shared `InteractiveObject` component that accepts an optional GLB model path — chapters ship with placeholder geometry today and swap in real models when assets are sourced.

The pointer-events fix (`pointer-events-none` on `#story-track`) is already committed. This spec covers only the 3D interaction redesign.

---

## What Changes

| Was | Now |
|---|---|
| Crack-open (clipping planes, two half-meshes) | Single mesh, scale-up spring |
| No affordance — user had to discover | Beacon pulse ring + floating name label |
| Abstract placeholder shapes only | Architecture accepts optional GLB path |
| Ch02 pedestal + torus-knot + light shafts | Single placeholder box (Ch02 stripped to one object) |
| Spread across three chapter files | Centralised `InteractiveObject` component |

`interaction-state.ts` and `StoryCard` are unchanged.

---

## Beacon Ring

A looping radial pulse on every interactive object while its chapter is visible.

- Geometry: `ringGeometry(innerRadius, innerRadius + 0.04, 32)` where `innerRadius` = object radius + 0.06
- Material: `meshBasicMaterial`, color `#7fb3ff`, `AdditiveBlending`, `depthWrite: false`, `side: DoubleSide`
- Animation (in `useFrame`): a `t` value cycles 0→1 over 2.5s. Scale = `1 + t * 1.2`. Opacity = `(1 - t) * 0.5`.
- Ring is flat in XZ plane (`rotation.x = -Math.PI / 2`), centred on the object.
- Pauses (opacity 0) when the object is open.

---

## Floating Name Label

A small HTML chip above each object, visible while the chapter is active and the object is closed.

- Rendered via `<Html>` at `[0, objectRadius + 0.25, 0]`, `center`
- Style: `font-sans text-[0.55rem] tracking-[0.2em] uppercase text-white/70 pointer-events-none`
- Fade-in: CSS `opacity: 0` → `opacity: 1` after 0.8s delay (CSS `transition: opacity 0.4s 0.8s`)
- Hides (`opacity: 0`) when the object is open (story card replaces it)

---

## Click Reveal

Replaces crack-open. No clipping planes needed.

- `scaleRef` (mutable number, 0–1) driven by `THREE.MathUtils.damp(factor=6)` in `useFrame`
- Target: `isOpen ? 1 : 0` where `isOpen = getActiveCrack() === id`
- Object scale: `1 + scaleRef * 0.3` (rests at 1.0×, opens to 1.3×)
- Emissive intensity: `baseEmissive + scaleRef * 1.8`
- Story card appears when `scaleRef > 0.4` (same guard pattern as before, via `cardVisRef`)
- Click handler on the outer group: toggle `activeCrack` between `id` and `null`
- `onPointerOver` / `onPointerOut`: cursor pointer (unchanged)

---

## `InteractiveObject` Component

**File:** `src/components/r3f/interactive-object.tsx` (new)

```ts
type InteractiveObjectProps = {
  id: string;
  label: string;
  story: string;
  logo?: string;
  position: [number, number, number];
  objectRadius?: number;       // default 0.12 — controls beacon ring size and label height
  fallbackGeometry: "sphere" | "box" | "tetra" | "torus" | "octa" | "cone" | "ico";
  model?: string;              // optional GLB path, e.g. "/models/phone.glb"
  color?: string;              // default "#a8d8ff"
  emissive?: string;           // default "#4499cc"
  baseEmissive?: number;       // default 0.3
  matRef?: React.RefObject<THREE.MeshStandardMaterial>; // Ch03: lets IconMesh write emissiveIntensity imperatively
};
```

Internal structure:
```
<group position={position} onClick={toggle} onPointerOver={cursor} onPointerOut={cursor}>
  <group ref={meshGroupRef}>         ← scale animated here (1.0 → 1.3)
    {model ? <GlbMesh path={model} /> : <FallbackMesh kind={fallbackGeometry} />}
    <meshStandardMaterial ref={matRef} ... />
  </group>
  <BeaconRing radius={objectRadius} />
  <Html ...><label /></Html>          ← name label, hidden when open
  {showCard && <Html ...><StoryCard /></Html>}
</group>
```

`GlbMesh` is an internal sub-component:
```tsx
function GlbMesh({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene.clone()} />;
}
```

`useGLTF.preload(model)` is called at module level when `model` is provided (same pattern as `character.tsx`).

---

## Object Mapping

### Ch01 — chapter-01-tangle.tsx

Three satellite spheres. `nodesGroupRef` scale animation and scroll-close guard remain.

| id | label | story | fallbackGeometry | model (future) |
|---|---|---|---|---|
| `ch01-0` | Nomo | Built a productivity app from zero. First time I proved I could ship, not just spec. | `sphere` | `/models/phone.glb` |
| `ch01-1` | Gen AI Video | Explored how gen AI could produce video at scale. Part research, part prototype. | `sphere` | `/models/camera.glb` |
| `ch01-2` | GEP | Multi-stakeholder, no clear brief. I mapped the chaos and turned it into a roadmap. | `sphere` | `/models/folder.glb` |

`objectRadius`: 0.1 (sphere radius used in ch01)

Remove: `splitRefs`, `topHalfRefs`, `bottomHalfRefs`, `coreRefs`, `topPlane`, `bottomPlane`, `cardIndexRef`, `cardIndex` state, individual per-node crack animation block.

### Ch02 — chapter-02-pedestal.tsx

Pedestal column, torus-knot, and light shafts are all removed. Replaced by a single `<InteractiveObject>`.

| id | label | story | fallbackGeometry | model (future) |
|---|---|---|---|---|
| `ch02-nomo` | Nomo | Built Nomo from zero. Designed in Figma, shipped in React. Proof that I don't just write specs. | `box` | `/models/phone.glb` |

`objectRadius`: 0.15

The `group` scale-in animation (chapter entering) is preserved: the outer group still scales from 0 to 1 over the first 30% of the chapter. `InteractiveObject` sits inside it at `position={[0, 0, 0]}`.

Remove: `topColRef`, `bottomColRef`, `splitRef`, `cardVisRef`, `showCard`, `knot`, `shaftA`, `shaftB`, `topPlane`, `bottomPlane`, and all their JSX.

### Ch03 — chapter-03-toolkit.tsx

`IconMesh` is rewritten to wrap `InteractiveObject`. The illumination sweep (`emissiveIntensity` per frame) is driven by `IconMesh`'s own `useFrame` via the forwarded `matRef` prop: `IconMesh` holds a `React.RefObject<THREE.MeshStandardMaterial>`, passes it to `InteractiveObject`, and writes `matRef.current.emissiveIntensity = sweepValue` each frame. `InteractiveObject` uses the same ref for its own emissive burst on open (additive on top of whatever `IconMesh` wrote that frame).

| index | id | tool | logo | fallbackGeometry |
|---|---|---|---|---|
| 0 | `ch03-0` | Figma | `/logos/figma.svg` | `tetra` |
| 1 | `ch03-1` | JIRA | `/logos/jira.svg` | `torus` |
| 2 | `ch03-2` | Excel | `/logos/excel.svg` | `box` |
| 3 | `ch03-3` | Confluence | `/logos/confluence.svg` | `octa` |
| 4 | `ch03-4` | SQL | `/logos/sql.svg` | `cone` |
| 5 | `ch03-5` | AI | `/logos/ai-trio.svg` | `ico` |

Bob animation and halo ring remain in `IconMesh` wrapping the `InteractiveObject`.

Remove from `IconMesh`: `topRef`, `bottomRef`, `topMatRef`, `bottomMatRef`, `topPlane`, `bottomPlane`, `splitRef`, `coreRef`, crack animation block.

---

## Scroll-Close

Same pattern as before. Each chapter's `useFrame` checks `chapterLocalProgress(n)`:
```ts
if ((p <= 0 || p >= 1) && getActiveCrack()?.startsWith("ch0N")) {
  setActiveCrack(null);
}
```

`InteractiveObject` does not own scroll-close — it stays in each chapter's `useFrame` as before.

---

## Files Changed

| File | Action |
|---|---|
| `src/components/r3f/interactive-object.tsx` | **Create** |
| `src/components/r3f/chapters/chapter-01-tangle.tsx` | Modify — remove crack, use `InteractiveObject` |
| `src/components/r3f/chapters/chapter-02-pedestal.tsx` | Modify — strip to single `InteractiveObject` |
| `src/components/r3f/chapters/chapter-03-toolkit.tsx` | Modify — `IconMesh` uses `InteractiveObject` |
| `src/components/r3f/story-card.tsx` | No change |
| `src/components/r3f/interaction-state.ts` | No change |
| `src/components/story/story-overlay.tsx` | No change (fix already committed) |

---

## Out of Scope

- Sourcing or importing real GLB model files — the architecture accepts them via the `model` prop but no `.glb` files are added in this implementation.
- Ch04 and End Scene remain animation-only.
- No new npm dependencies.
