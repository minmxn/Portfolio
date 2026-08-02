# Shining-inspired 3D narrative portfolio — design spec

**Date:** 2026-08-02
**Owner:** Min Yi (min.y.seet@accenture.com)
**Status:** approved for implementation planning

## Context

The portfolio currently ships a working 3D scroll narrative on a "glowing tech WebGL" aesthetic (blue additive lines → glass icosahedron, Nomo torus-knot pedestal, luminous skill card grid, dual ascending beacon), driven by Lenis + GSAP + a module-store scroll authority and rendered via `@react-three/fiber` on Next 16.

This spec pivots the narrative to a fundamentally different aesthetic modeled on `shining.302chanwoo.com`: **minimalist low-poly, unlit-look flat shading, dreamlike gradients, atmospheric bloom on selectively-glowing objects, a low-poly character silhouette with glowing eyes, and short poetic serif overlays**. The current site's scroll infrastructure and content pipeline stay; the visual layer is fully replaced.

The professional substance of the portfolio (business analyst, Nomo case study, skills, certifications, contact) is preserved and hardened: overlays carry short poetic lines for atmosphere plus small hover-reveal spec pills so scanning recruiters still get concrete signal, and the DOM sections below the narrative (Projects, Certifications, Contact, and the Nomo case page) remain as they are today.

## Approved decisions (locked)

| Decision | Choice |
|---|---|
| Scope | Full replace of the 3D narrative and scroll rig visuals. Keep `content.ts`, below-fold DOM sections, Nomo case page, header/footer, dark theme tokens. |
| Character production | Built from R3F primitives (cone body, head, glowing sphere eyes). No GLTF, no rigging. Person silhouette with mystical lean (subtle hood, no cat ears). |
| Architecture | Approach A — cinematic narrative + normal page below. Fixed canvas + HTML overlay track driven by existing Lenis+GSAP+module-store scroll authority. Does NOT literally use drei's `<ScrollControls>`; delivers the same visual output with cleaner integration and better SEO/accessibility. |
| Ch03 icons | Try real technology logos first (React, Node.js, code brace, roadmap glyph, etc.). Fall back to abstract low-poly shapes only if the shining aesthetic breaks. |
| Ch02 Nomo showcase | Abstract interlocked torus-knot glyph on the pedestal, glowing softly, rotating slowly. |
| Book intro trigger | Auto-play on any scroll input; click on the book is a secondary trigger. |
| Ch04 poem closing line | "To build, to lead, to grow." ("CCA" moves to the spec pill.) |

## Architecture

### Page composition

- `/` = `<Experience/>` (the narrative) + `<Projects/> <Certifications/> <Contact/>` below (unchanged, dark).
- `/projects/nomo` = Nomo case study (unchanged, dark).

### Experience layer (inside `<Experience/>`)

- `<LenisProvider>` — instantiates Lenis smooth scroll, wires GSAP `ScrollTrigger` from `gsap.ticker`, creates one master ScrollTrigger over `#story-track` whose `onUpdate` writes normalized progress into the shared `scroll-state` module.
- `<CanvasRoot tier/>` — fixed `inset-0 z-0`. `dynamic(() => import('./scene'), { ssr: false })` from inside a client component, per Next 16's rule that `ssr:false` is not allowed in Server Components.
- `<StoryOverlay>` — `relative z-10` tall track containing **6 sections × 100vh = 600vh total**: book intro → Ch01 → Ch02 → Ch03 → Ch04 → end scene.
- `<ChapterRail>` — small fixed side progress indicator (desktop `lg:` only).
- `<StaticNarrative>` — the no-canvas fallback path for `prefers-reduced-motion` and low-power devices. Renders all poetic lines and spec pills as normal DOM.

### Scene (inside the Canvas)

- `<Backdrop>` — full-screen quad at `renderOrder=-1` with `depthWrite=false`. Custom `shaderMaterial` keyed to global scroll progress (see Background shader below).
- `<Character>` — the girl silhouette, always mounted. Position, rotation, and eye look-at are interpolated per chapter in `useFrame` from the scroll-state module store — zero React re-renders per frame.
- `<BookIntro>` — visible in the intro band (`progress < 0.17`); fades and scales out at the end of the band.
- `<Chapter01Tangle>` / `<Chapter02Nomo>` / `<Chapter03Toolkit>` / `<Chapter04Beacon>` — each owns its scene content and reads its own chapter-local progress from the module store.
- `<EndScene>` — the peaceful sunset composition in the `progress ≥ 0.83` band.
- `<CameraRig>` — reads global progress, dampens position and look-at along a keyframed path with light pointer parallax. drei `<PerformanceMonitor>` wrapping the scene auto-adjusts dpr on frame drops.
- `<PostFX tier/>` — Bloom + Vignette + Noise, tier-gated.

### Scroll bands (normalized global progress)

| Band | Range | Section |
|---|---|---|
| 0.00 – 0.17 | Intro | Book + landing text |
| 0.17 – 0.33 | Ch01 | Tangled knot → crystal |
| 0.33 – 0.50 | Ch02 | Nomo pedestal |
| 0.50 – 0.67 | Ch03 | Toolkit icons |
| 0.67 – 0.83 | Ch04 | Ascending beacon |
| 0.83 – 1.00 | End | Sunset + contact chips |

`scroll-state` exposes both the normalized global progress and a `sectionLocalProgress(index)` helper (0–1 across each section's band), used by every chapter and by the backdrop shader.

### Content (`src/content.ts`)

Extend the `StoryBeat` type with:
- `poem: string[]` — the poetic overlay lines (short, thin serif, centered).
- Existing fields (`title`, `lines`, `spec`, `cta`) reused for the hover-reveal spec pill and CTA row.

One content object supports both aesthetics; the below-fold DOM sections continue reading the same fields.

## Shared elements

### Book intro

- **Geometry:** low-poly leather book from primitives — three thin boxes (bottom cover, top cover, spine) and a thinner inset box for the pages. Sub-brown material with low metalness. A small emissive glyph (thin box, spiral or plus, `emissive` set) sits on the top cover.
- **Setting:** a subtle glowing halo ring on the ground plane; the character stands to the right, idle-floating.
- **Overlay text:** centered thin serif — *"Let's explore together..."* — with a small pulsing scroll chevron.
- **Trigger:** any wheel/touch scroll input OR click on the book fires a one-shot GSAP timeline: the glyph pulses white, Bloom intensity spikes briefly, the book scales up and fades out, the backdrop shifts toward Ch01's palette, and the user's scroll takes over.

### Character (built from primitives, `<Float>`-driven)

Composition (each part a `<mesh>` with `<meshStandardMaterial>` and `emissive` where noted):
- **Body:** slightly-tapered cone (`cylinderGeometry([0.18, 0.28, 0.9, 12])`) in `#111318`, low roughness, no metalness.
- **Head/hood:** rounded box or slightly-flattened sphere extending downward into the body to read as a hooded silhouette (mystical lean). Same near-black material.
- **Eyes:** two small emissive spheres, `#f0f4ff`, `emissiveIntensity ≈ 3`. Bloom catches them and makes them shine. Grouped so they can look-at.
- **Motion:** two nested groups. The **outer** group receives the per-chapter position/rotation lerp from `useFrame` (reading `scroll-state`, damped with `THREE.MathUtils.damp`). The **inner** group wraps the geometry in drei `<Float speed={0.7} rotationIntensity={0.15} floatIntensity={0.35}/>` for idle breathing. This layering ensures the idle float adds on top of the chapter positioning without fighting it.
- **Look-at:** eyes track a per-chapter focal point (crystal, Nomo pedestal, current illuminated toolkit icon, ascending beacon) via a small `useFrame` update.

### Gradient background shader

Full-screen quad, first child of the scene, `renderOrder=-1`, `depthWrite=false`. Custom `shaderMaterial` (drei factory) with uniforms `uProgress` (global scroll 0–1) and `uTime` (subtle shimmer).

Five color keyframes, each a `(top, bottom)` pair:

| Progress | Top | Bottom | Feel |
|---|---|---|---|
| 0.00 | `#0a3a3a` teal | `#04081a` deep-navy | Intro |
| 0.20 | `#083545` midnight-teal | `#1a0940` deep-violet | Ch01 |
| 0.45 | `#1c1a55` indigo | `#4a1f3d` warm-plum | Ch02 |
| 0.70 | `#2a1560` violet | `#5a2a5c` soft-magenta | Ch03 |
| 1.00 | `#081033` indigo | `#b76e79` rose-gold | Ch04 → End |

Fragment shader samples the two neighbouring keyframes by `uProgress` and `mix()`es them; a vertical `smoothstep` on `vUv.y` produces the top→bottom gradient; a very light film-noise perturbation from `uTime` (~1% amplitude) keeps the sky alive rather than flat.

## Chapter-by-chapter breakdown

### Intro — "Let's explore together"
- **3D:** low-poly book on a subtle ground ripple, halo ring, character to its right idle-floating. Backdrop at the teal keyframe.
- **Camera:** slightly above eye level, framed on the book.
- **Overlay:** centered thin serif — *"Let's explore together..."* — with scroll cue.
- **Trigger:** any scroll input OR click fires the reveal.

### Chapter 01 — "What I do"
- **3D:** character anchored roughly centered; around her, a tangled low-poly wireframe knot from `<lineSegments>` with `morphAttributes` — position A tangled, position B a geometric crystal skeleton. GSAP scrubs `morphTargetInfluences[0]` from 0 → 1 across the chapter band. In the last third of the band, wires resolve into a transmission-material glass crystal (icosahedron, `transmission=1`) that rotates slowly.
- **Camera:** slow dolly-in toward the crystal; character in near-foreground silhouette.
- **Character:** looks at the knot; eyes bright.
- **Backdrop:** midnight-teal → deep-violet.
- **Poem:**
  - *"I gave the chaos a name..."*
  - *"I turned tangled lines into solid forms."*
- **Spec pill (hover):** "Business analyst · public sector · turning multi-stakeholder requirements into shippable software."

### Chapter 02 — "What drives me"
- **3D:** the crystal unfolds/blooms into a low-poly pedestal. On the pedestal, an **abstract interlocked torus-knot** (the Nomo glyph) rotates and glows softly. Two warm-golden light shafts (cone geometry, additive blend) sweep the pedestal. The character steps closer and tilts to follow the glyph.
- **Camera:** zooms close and orbits slightly around the pedestal to give a sense of "showcase."
- **Backdrop:** shifts to indigo → warm-plum.
- **Poem:**
  - *"Building things makes me whole."*
  - *"Nomo was the first spark."*
- **Spec pill:** "Node.js · Groq LLM · NewsAPI · Telegram · Oracle Cloud · PM2"
- **CTA:** "Try Nomo" glow-bordered link, external → `https://t.me/nomogh_bot`.

### Chapter 03 — "My toolkit"
- **3D:** the pedestal bursts into 6–8 small low-poly technology-logo icons floating around the character in a loose ring at slightly different heights. Each icon is a dark silhouette (near-black, `emissive` off) until the camera pans across, at which point it lights up (`emissive` fades on, small halo ring appears). Icons rendered via drei `<Instances>` (or a small number of `<Instances>` groups by shape) to keep draw calls low.
- **Icons (real tech logos, first attempt):** React, Node.js, code brace `{}`, product roadmap glyph, LLM/spark glyph, Telegram, cloud, gear. Final set of 6–8 finalized during implementation. If logos visually break the shining aesthetic, we fall back to abstract low-poly shapes (tetrahedron, torus, cube, octahedron, etc.).
- **Camera:** slow horizontal/diagonal pan; character in mid-ground, drifting.
- **Backdrop:** violet → soft-magenta.
- **Poem:**
  - *"I gathered tools along the way..."*
  - *"Each one a small, shining star."*
- **Spec pill (hover):** full skills list from `about.skills` — Business Analysis, Requirements and Documentation, UAT and Test Coordination, Stakeholder Management, Release and Regression Planning, Agile Delivery, Prompt Engineering, APIs and LLM Integration.

### Chapter 04 — "What is next"
- **3D:** the floating skill icons drift upward and converge into an ascending pillar of light (tall cylinder with additive glow, plus a few rising particle orbs). A second faint pillar hints at the dual "PM + builder" paths. The pillar extends up into the horizon; the character stands facing it, tilted upward.
- **Camera:** slow upward tilt; framing shifts to give the sky more weight.
- **Backdrop:** transitions into the sunset — indigo → rose-gold.
- **Poem:**
  - *"Now I seek a higher vantage point..."*
  - *"To build, to lead, to grow."*
- **Spec pill:** "Growing into product management · CCA leadership · studying Claude Certified Architect."

### End — "Let's build something together"
- **3D:** peaceful sunset. Character silhouette centered, calm. The pillar softens into a slow-pulsing glow behind her. A few drifting particles.
- **Camera:** settles into a gentle idle drift.
- **Overlay:** centered thin serif — *"Let's build something together."* — with three glow-bordered link chips (LinkedIn / GitHub / Email) and a small *"See my work ↓"* chevron that scrolls to the DOM Projects section below.

## Post-processing recipe

`<EffectComposer>` on **full tier**:
- **Bloom** — `intensity=1.5`, `luminanceThreshold=0.6`, `luminanceSmoothing=0.9`, `mipmapBlur`. High threshold means only the girl's eyes, book glyph, torus-knot, illuminated logos, and beacon glow — everything else stays matte flat-shaded.
- **Vignette** — `eskil=false`, `offset=0.1`, `darkness=0.9`. Darkens the edges, focuses the eye on the character.
- **Noise** — `opacity=0.03`. Subtle film grain. Turns flat gradients into storybook canvas texture.

`Noise` is expected to be exported by `@react-three/postprocessing@3.0.4`; if it is not, implementation falls back to the underlying `pmndrs/postprocessing` `NoiseEffect` or a small custom shader pass.

**Reduced tier** (mobile / narrow / low-power): Vignette + softer Bloom (`intensity=0.9`); Noise dropped.

**Static tier** (`prefers-reduced-motion` / very weak devices): no canvas at all. `StaticNarrative` renders every poem, every spec pill, every CTA as normal DOM.

## Performance strategy

1. **`<Instances>` for Ch03 toolkit icons** — one draw call for 6–8 icons where geometry is shared; up to a small number of `<Instances>` groups per distinct shape. Target ≤ 5 draw calls for the whole toolkit chapter.
2. **`<PerformanceMonitor>`** wrapping the scene — auto-drops `dpr` from `[1,2]` → `[1,1.5]` → `[1,1]` when frame rate sags below ~50fps. Also fires an event we can use to disable Noise dynamically.
3. **Preload:** if any GLTF or textures ship (e.g. logo textures for Ch03), preload via `useGLTF.preload` / `useTexture.preload` at module top level so the intro doesn't stutter.
4. **Draw-call budget:** ≤ 20 total draw calls at any chapter. Backdrop 1, character ~4, book ~4 (intro only), morph knot 1 → crystal 1 (Ch01), pedestal ~2 + Nomo glyph 1 + shafts 2 (Ch02), toolkit instances ~1–5 (Ch03), beacon ~3 + particles 1 (Ch04). Fits well under budget.
5. **Frameloop:** `"always"` while the narrative is on-screen; an `IntersectionObserver` on `#story-track` pauses to `"never"` when the user has scrolled past into the DOM sections (saves battery on long reads).

## Files to create, modify, retire

### Create
- `src/components/r3f/character.tsx`
- `src/components/r3f/book.tsx`
- `src/components/r3f/backdrop.tsx`
- `src/components/r3f/materials/backdrop-material.ts`
- `src/components/r3f/materials/knot-morph-material.ts` (or morph-target geometry helper)
- `src/components/story/book-intro-overlay.tsx`
- `src/components/story/end-scene-overlay.tsx`

### Rewrite
- `src/components/r3f/scene.tsx` (new scene composition)
- `src/components/r3f/camera-rig.tsx` (new keyframes for character-following camera)
- `src/components/r3f/post-processing.tsx` (Bloom + Vignette + Noise)
- `src/components/r3f/chapters/chapter-01-tangle.tsx` (morph-target crystal)
- `src/components/r3f/chapters/chapter-02-pedestal.tsx` (Nomo torus-knot on pedestal)
- `src/components/r3f/chapters/chapter-03-grid.tsx` → renamed to `chapter-03-toolkit.tsx` (logo icons via Instances)
- `src/components/r3f/chapters/chapter-04-horizon.tsx` (ascending pillar)
- `src/components/story/story-overlay.tsx` (six sections: intro + 4 chapters + end)
- `src/components/story/chapter-copy.tsx` (poetic lines + spec pill + CTA)
- `src/components/experience.tsx` (compose the new pieces)
- `src/components/story/static-narrative.tsx` (render `poem` alongside existing prose)
- `src/content.ts` (add `poem: string[]` to StoryBeat; add intro + end beats)

### Retain as-is
- `src/components/scroll/scroll-state.ts` (add `sectionLocalProgress` helper)
- `src/components/scroll/lenis-provider.tsx`
- `src/hooks/use-device-capability.ts`
- `src/components/story/chapter-rail.tsx` (minor label update for 6 sections)
- `src/components/sections/projects.tsx`, `certifications.tsx`, `contact.tsx`
- `src/app/projects/nomo/page.tsx`
- `src/components/site-header.tsx`, `site-footer.tsx`
- `src/app/globals.css` (minor palette tuning for the sunset rose-gold accent)
- `src/app/layout.tsx`, `src/app/page.tsx`

### Retire (delete)
- `src/components/story/landing-hero.tsx` (replaced by book intro)
- `src/components/r3f/materials/line-morph-material.ts` (replaced by morph-target crystal)

## Verification

1. `npx tsc --noEmit` clean.
2. `npm run build` completes with prerender of `/` and `/projects/nomo`, no `ssr:false in Server Component` errors, no `window is not defined` SSR errors.
3. Served HTML at `/` contains every poetic line, every spec-pill copy, all chapter labels (SSR/SEO), and zero `<canvas>` elements server-side.
4. Manual scroll pass in a browser: book intro reveals → each of the four chapters scrubs cleanly → end scene resolves → DOM Projects/Certs/Contact sit correctly below with no z-order issues.
5. Gradient backdrop transitions continuously through all five keyframes without visible seams.
6. Character eyes track the correct focal point per chapter.
7. Ch01 morph completes; Ch02 Nomo glyph rotates on pedestal with light shafts; Ch03 logos illuminate in sequence across the pan; Ch04 pillar rises.
8. `prefers-reduced-motion: reduce` toggle → `StaticNarrative` renders with all poems, spec pills, and CTAs; no `<canvas>` in the DOM.
9. Mobile emulation (narrow viewport, coarse pointer) → reduced tier renders (softer Bloom, no Noise); `<PerformanceMonitor>` does not spam scale-down events on a healthy connection.
10. All CTAs functional: book click, Ch02 "Try Nomo" external link, end scene social chips (LinkedIn / GitHub / Email), *"See my work ↓"* chevron scrolls to DOM Projects.
