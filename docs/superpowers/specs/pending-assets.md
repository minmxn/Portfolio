# Pending assets & content — Min Yi's portfolio

**Purpose:** single source of truth for content and assets Min Yi still needs to provide before the site can ship the shining narrative + Kling case study + Nomo case study updates.

**How to use:** Claude checks this file at the start of every session and prompts Min Yi for anything still marked `[ ]`. Update this file whenever an item moves to done or a new gap appears.

## Nomo case study assets

- [x] 4 screenshots added to `public/nomo/` and displayed in 2×2 grid on the case study page.

*Optional additions:*
- [ ] `assets/nomo/nomo-poll.png` — a daily poll message, if she has a good one.
- [ ] `assets/nomo/nomo-freetext.png` — an example of the free-text question feature answering a live query.

## Kling case study reflections

- [x] All three learnings paragraphs written and committed (surprised, limits, useFor).

*Optional:*
- [ ] 2–4 additional Kling scene prompts used, to strengthen the "how it was built" story.

## Personal assets

- [x] Resume removed from site (Min Yi chose not to share it publicly).
- [ ] Headshot / avatar — optional. Only needed if you want to appear in the About or Contact areas.

## Kling-generatable enrichments (optional)

- [ ] "Prince meets Fox" scene — short clip or still. Emotional beat of the Little Prince story; would anchor the Kling case study.
- [ ] High-contrast Kling case study hero image — one dramatic still (Prince on the asteroid, muted gold + starry blue), sized for a wide banner. Would make `/projects/kling` cinematic on first paint.

## Structural work complete

- [x] `/projects/kling` case study route built and verified: reference sheets, prompt exhibits, embedded video (with reduced-motion respect), placeholder Learnings sections, and closing footer nav are all live. Home Projects card links to it. Ch03 story beat references Kling. Awaiting Min Yi's three Learnings paragraphs to replace placeholder text.

- [x] Home `/` shining narrative rebuild shipped: book intro, four chapters (morph-target crystal, Nomo pedestal + torus-knot, six-icon toolkit ring, ascending pillar), end scene with contact chips. Gradient backdrop shader, hooded person silhouette character, Bloom + Vignette + Noise post-processing, six-section camera rig. StaticNarrative renders poem + prose fallback for reduced-motion users.

- [x] One-theme unification shipped: single dark theme (light mode removed),
  backdrop resolves to page background closing the canvas seam, cyan as sole
  accent, editorial sections de-boxed, sections renamed into the journey's
  language, 3D labels gated to their own chapter, mobile nav added.

## Browser verification still needed — one-theme unification

Automated browser checks (Playwright MCP) were unavailable throughout this
project's implementation (Tasks 2, 3, 5–9, 10, 11, 12). `npx tsc --noEmit`
and `npm run build` are clean, but nothing below has been visually confirmed
in a real browser. Run `npm run dev` and work through this list before
considering the redesign done.

### Scroll 0 — intro (book-intro-overlay)

- **Intro poem fade** ("Let's explore together…" + "Scroll" indicator): scroll
  from 0 to ~1000px. The poem and scroll indicator should visibly fade to
  fully transparent and not remain visible/overlapping once Chapter 01
  content is in view. A wrapper div (`mx-auto max-w-6xl px-6`) was added
  around `poemWrapRef`'s element in Task 11 — confirm the opacity animation
  (driven by `poemWrapRef.current.style.opacity` in a scroll handler) still
  fires correctly with the new ancestor in place.
- **No 3D labels**: at scroll 0, no floating `<Html>` labels from any chapter
  object should be visible.

### Canvas/section seam (all scroll positions, highest risk)

- The backdrop shader's bottom color (`#0e1119`, in
  `src/components/r3f/materials/backdrop-material.ts`) was only checked via
  raw hex math against the CSS `--background` value — it was **never
  empirically sampled against the live, ACES-tone-mapped + sRGB-encoded
  render** (tone mapping is set at `scene.tsx:36`). A hairline seam at the
  canvas/section boundary is plausible.
  - How to check: open DevTools console, run
    `getComputedStyle(document.body).backgroundColor` and compare against a
    `gl.readPixels` sample of the canvas's bottom row (or simply screenshot
    the seam and zoom in) at each chapter transition, especially where the
    canvas meets a section background.
  - Correct: no visible line/band of different color where canvas ends and
    page background begins, at any scroll position, in the actual rendered
    (tone-mapped) output.

### Ch01 (~scroll 1,200)

- Labels: only project-name labels for Ch01 objects, none from other
  chapters bleeding in.

### Ch02 (~scroll 2,000)

- Labels: only `NOMO`, appearing exactly once (no duplicate "NOMO" label
  stacked or offset from a leftover element).

### Ch03 (~scroll 2,900)

- Labels: exactly six labels, each positioned under its own ring object (not
  floating unattached, not overlapping each other). This was the specific
  bug fixed in Task 3 (drei `<Html>` ignoring Three.js `.visible`) —
  regression-check this scroll position carefully.

### Ch04 (~scroll 4,000) and end scene (~scroll 4,800 / 7,400)

- No 3D labels should appear at either position.

### Header, ~5,600px scroll (desktop 1440×900)

- Header keeps its `bg-background/80 backdrop-blur-md` background while
  scrolled (Task 10). Confirm no section content or rule lines visually
  slice through the "Min Yi" wordmark or the nav links at this scroll depth.

### Desktop auto-hide, 1440×900

- Header fades out on scroll-down past ~80px, fades back in on scroll-up,
  and becomes permanently visible once `#projects` scrolls into view — this
  pre-existing behavior (driven by `header.style.opacity`) should be
  unaffected by Task 10's new background classes.

### Mobile menu, 390×844

- No hamburger icon — a text "Menu" button, `md:hidden`.
- Tapping "Menu" opens the overlay, label changes to "Close",
  `aria-expanded` becomes `true`.
- All four nav links appear, stacked/centered.
- Closes on: clicking a link (and navigates), clicking the backdrop (no
  navigation), and pressing Escape.
- Header background at 390px: transparent at scroll 0, gains blur/dark
  background once scrolled past ~24px, and while the menu is open even at
  scroll 0.

### Left-edge alignment, 1440×900

- The chapter poem ("I gave the chaos a name…", Chapter 01) and the
  editorial section headings (Projects, Certifications, Contact) should
  share one left edge (~168px at 1440px width). Check in DevTools console:
  ```js
  const poem = document.querySelector('[data-label="What I do"] p.font-serif');
  const heading = document.querySelector('#projects h2');
  console.log(poem.getBoundingClientRect().left, heading.getBoundingClientRect().left);
  ```
  Both values should match within 1px.

### General sweep, both 1440×900 and 390×844, scroll 0/1200/2500/4000/5600/7400

- No vermillion/orange color anywhere (cyan is the sole accent now).
- No boxed project tags, no bordered contact card, no certifications table
  frame/column-header row/filled status chip.
- Every section heading shares one left edge.
- Nothing passes through or overlaps the header.
- DevTools console: zero errors across a full scroll of the page. One
  `THREE.Clock` → `THREE.Timer` deprecation **warning** is pre-existing and
  out of scope — do not treat it as a failure.

## Done (kept for reference)

- [x] `assets/Prince_Front.png` — Little Prince, front view.
- [x] `assets/Prince_Side.png` — Little Prince, side view.
- [x] `assets/Prince_Back.png` — Little Prince, back view.
- [x] `assets/Fox_Fonr.png` — Fox, front view (filename typo will be normalized on move to `public/kling/fox-front.png`).
- [x] `assets/Fox_Side.png` — Fox, side view.
- [x] `assets/The Little Prince.mp4` — the final Kling video.
- [x] Global Kling style prompt provided (documented in `2026-08-03-kling-case-study-design.md`).
- [x] Prince-on-asteroid scene prompt provided (documented in `2026-08-03-kling-case-study-design.md`).
