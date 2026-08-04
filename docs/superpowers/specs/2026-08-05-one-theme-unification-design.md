# One Theme Unification — Design Spec

**Date:** 2026-08-05
**Status:** Approved

## Problem

The site currently speaks two visual languages that do not acknowledge each other.

The scroll narrative (intro → Ch01–Ch04 → end scene) is cinematic: a deep gradient
night sky running teal → indigo → violet → rose, warm gold emissive light, italic
serif copy, weightless floating objects.

At roughly 5,000px this hard-cuts into an editorial newspaper: near-black flat
background, vermillion accents, hairline rules, boxed tag pills, a 2px-bordered
contact card, and courtroom/newsroom vocabulary ("EXHIBIT A", "ON THE RECORD",
"CORRESPONDENCE").

The root cause is that there are three uncoordinated palettes and two accent colors:

1. `globals.css` `:root` — warm newsprint paper, ink type, **vermillion** brand
   (`--brand: oklch(0.505 0.174 26)`)
2. `globals.css` `.dark` — near-black navy, **orange** brand
   (`--brand: oklch(0.7 0.16 32)`), **cyan** glow (`--glow: oklch(0.78 0.15 218)`)
3. The 3D scene — roughly thirty hardcoded hex values across
   `materials/backdrop-material.ts`, `scene.tsx`, `book.tsx`, `interactive-object.tsx`,
   and each `chapters/chapter-0*.tsx`, referencing no token at all

Because the two halves share no accent, each half has to shout to establish which
world it belongs to. That shouting is the "messiness" — the boxes, the rules, the
high-contrast buttons, the competing reds and cyans.

## Decisions Made

Confirmed with Min Yi during brainstorming:

- **The cinematic world leads.** The editorial sections adapt to it. The 3D narrative
  is the site's differentiator and is preserved.
- **Everything must follow the one theme** — including wording, not just styling. The
  newsroom vocabulary belongs to the language that lost and is therefore replaced,
  not merely restyled.
- **Tool labels are anchored to Chapter 03 only.**
- **The site ships dark-only.** Flagged as a real loss of existing work; accepted.
- **Themed section names are preferred** over plainer recruiter-legible ones. Flagged
  as a legibility tradeoff; accepted.

## Goals

- One background world from first paint to footer, with no visible seam
- One accent color (cyan) with exactly three defined jobs
- Typography and whitespace carrying hierarchy in place of borders and boxes
- One vertical rhythm and one shared left edge across narrative and editorial halves
- Section names drawn from the journey's language
- Working navigation on mobile

## Out of Scope

- **Scroll length and chapter copy density.** The narrative currently renders only
  `beat.poem`, omitting `beat.title` and `beat.lines`. This was a deliberate prior
  decision recorded in `2026-08-04-ui-clarity-redesign.md` and is a separate content
  question, not a styling one. Not revisited here.
- 3D scene geometry, camera rig, morph animation, and chapter object behavior
- The `/projects/kling` and `/projects/nomo` case study routes
- Any change to `content.ts` prose (only kickers and section titles change)

---

## Section 1: One Background World

**Files:** `src/components/r3f/materials/backdrop-material.ts`,
`src/app/globals.css`, `src/components/sections/*.tsx`

The backdrop's five keyframes currently end on a dusty rose bottom (`#b76e79`) at
progress 1.0, which is why the narrative ends in wine and the flat near-black
editorial background reads as a different site.

**Change:** the final keyframe pair resolves to a single settled night color rather
than a rose — and that color is the existing `--background`, so the canvas and the
sections below it match by construction rather than by hand-tuning two values toward
each other.

- `TOP_COLORS[4]` and `BOT_COLORS[4]` both become the sRGB equivalent of the existing
  dark `--background`, `oklch(0.145 0.012 260)` ≈ `#0e1119`. Both ends of the vertical
  gradient converge, so the sky flattens to a single tone exactly as the journey ends.
- No new color token is introduced. `--background` is the single source of truth.
- Remove `bg-muted/40` from `projects.tsx:13` and `contact.tsx:13`, and the
  equivalent on the certifications section
- Remove `border-t border-foreground/15` from those same section wrappers — the
  sections no longer announce themselves as separate documents

The end scene's warm light stays as *emitted light from objects*, which is what
makes the resolution feel like arrival rather than a fade to black.

**Acceptance:** screenshotting the boundary between the canvas and the first
editorial section shows no detectable edge.

---

## Section 2: One Accent

**Files:** `src/app/globals.css`, all of `src/components/sections/`,
`src/components/editorial/section-heading.tsx`, `src/components/site-footer.tsx`

Vermillion/orange `--brand` is removed from all rendered UI. Cyan (`--glow`) becomes
the sole accent.

**Cyan has exactly three jobs. Nothing else may use it:**

1. The section kicker (small, lowercase, letterspaced)
2. The primary link within a section ("Read the case study", "Email me")
3. The current-position indicator (chapter rail active dot)

**Specific replacements:**

- `section-heading.tsx:17` — the `size-2 bg-brand` square bullet is deleted outright
- `section-heading.tsx:18` — `text-brand` → `text-glow`
- `projects.tsx:24` — `text-brand` → `text-glow`
- `projects.tsx:43,61` — `hover:text-brand` / `text-brand` → cyan link treatment
- `site-footer.tsx` — the glowing cyan wordmark loses both cyan and the glow, becoming
  `text-muted-foreground`. It is currently the brightest element on the page and the
  least important one.

Warm gold survives **only** inside the 3D scene as emissive material color
(`chapter-02-pedestal.tsx`, `chapter-04-horizon.tsx`, `end-scene.tsx`, `book.tsx`).
Light may be warm; interface may not.

**Acceptance:** grepping `src/components` for `brand` returns no matches in rendered
class names.

---

## Section 3: Type Instead of Boxes

**Files:** `src/components/sections/projects.tsx`,
`src/components/sections/contact.tsx`, `src/components/sections/certifications.tsx`

The existing three-font system (display serif / italic serif / sans) carries the
hierarchy alone. Borders come off.

- **Tag pills** (`projects.tsx:31`): drop `border border-foreground/25 px-2 py-0.5`.
  Tags become plain small-caps sans text on one line, separated by middots:
  `product · node.js · llm · telegram · oracle cloud`
- **Column divider** (`projects.tsx:23`): remove `md:border-r md:border-foreground/12`.
  Whitespace separates the columns.
- **Contact card** (`contact.tsx:17`): remove `border-2 border-foreground/70
  bg-background p-8`. The card becomes plain text on the night background.
- **Contact buttons** (`contact.tsx:35`): the high-contrast near-white filled bars
  become plain cyan text links matching "Read the case study".
- **Section rules**: at most one hairline per section, at `foreground/10`.

**Hierarchy inversion:** "Read the case study" is currently small red text while
"Email me" is a full-width near-white bar. The case study is the stronger asset. After
this change both are cyan text links, and the case study link sits higher in the page
with more space around it.

---

## Section 4: One Rhythm, One Left Edge

**Files:** all of `src/components/sections/`, `src/components/story/chapter-copy.tsx`

The narrative copy and the editorial copy currently sit at different left edges and
different max-widths. Aligning them does more for the sense of one site than any
color change.

- Every section uses the same wrapper: `mx-auto max-w-6xl px-6`
- Every section uses the same vertical rhythm: `py-24 md:py-32`
- The narrative overlay copy adopts the same `max-w-6xl px-6` gutter, so the left edge
  of "I gave the chaos a name…" and the left edge of "Nomo News Bot" are the same x
  position

**Acceptance:** a vertical guide dropped at the left gutter touches the first
character of every heading and every poem line at 1440px width.

---

## Section 5: Tool Labels → Chapter 03 Only

**Files:** `src/components/story/spec-label.tsx`,
`src/components/r3f/chapters/chapter-03-toolkit.tsx`, wherever the ambient label
layer is mounted

Currently these labels (SQL, FIGMA, JIRA, CONFLUENCE, EXCEL, NOMO, GIFTED EDUCATION
PROGRAMME, GENERATIVE AI VIDEO) drift across every scene at every depth. They
overlap into unreadable collisions on the intro (observed: "GIFTED" and "GENERATIVE
AI VIDEO" rendering on top of each other), and "NOMO" appears twice in a single
frame.

**Change:**

- The ambient label layer is removed from the intro, Ch01, Ch02, Ch04, and the end
  scene. Those scenes get empty sky.
- In Ch03, each label attaches to one of the six toolkit icon objects, positioned
  beneath its own object in screen space.
- Resting state is low opacity; the label brightens when its object is hovered,
  reusing the existing hover mechanism in `interactive-object.tsx` and
  `spec-hover-state.ts`.
- Each label appears exactly once.

This turns the labels from ambient debris into the actual point of the toolkit
chapter.

---

## Section 6: Section Naming

**File:** `src/content.ts` lines 44–60 only

That block is explicitly documented at `content.ts:36` as relabelable without
component changes.

| Current kicker | Current title | New kicker | New title |
|---|---|---|---|
| Selected works | The Work | selected works | Things I've Built |
| On the record | Credentials on File | what I've earned | Proof of the Journey |
| Correspondence | Letters and Commissions | how to reach me | Signals Welcome |
| The profile | About | *(unchanged)* | *(unchanged)* |

`EXHIBIT A` / `EXHIBIT B` labels are removed from the projects section entirely.

Kickers become lowercase — the uppercase letterspaced treatment is part of the
newspaper vocabulary being retired. Letterspacing is retained at a smaller value.

---

## Section 7: Header and Mobile Navigation

**File:** `src/components/site-header.tsx`

Two defects, both observed in the browser:

1. The header has no background, so content scrolls through it. At scroll 5,600px a
   section rule visibly slices "Min Yi" in half and strikes through all four nav
   items.
2. The nav is `hidden … md:flex` with no fallback. The header contains zero `<button>`
   elements. On a phone there is no navigation at all — confirmed by DOM inspection at
   390×844.

**Changes:**

- Scrolled state gains `backdrop-blur-md` plus a `--night`-derived translucent fill.
  Transparent at the very top so the intro is unobstructed.
- A menu button appears below `md`, opening a full-screen overlay panel styled as
  night sky with the four links set in display serif, centered. Closes on link
  selection, on Escape, and on backdrop tap.
- The existing auto-hide behavior from `2026-08-04-ui-clarity-redesign.md` is
  preserved.

---

## Section 8: Dark-Only

**Files:** `src/app/globals.css`, `src/components/theme-toggle.tsx`,
`src/components/theme-provider.tsx`, `src/app/layout.tsx`

The design now assumes a night sky throughout. The warm newsprint light theme cannot
host a WebGL nebula, and maintaining a light variant would reintroduce the second
visual language this spec exists to remove.

- `next-themes` is configured with `forcedTheme="dark"`
- `theme-toggle.tsx` is deleted and its mount point removed
- The `:root` light token block in `globals.css` is deleted; `.dark` values are
  promoted to `:root`
- `next-themes` is left as a dependency (unused config is cheaper than re-adding it
  later)

This was flagged to Min Yi as a real loss of existing work and accepted.

---

## Testing

The site has no test suite, and the failures this spec addresses are visual. Verify
with Playwright screenshots at 1440×900 and 390×844:

1. **Seam test** — screenshot the canvas/section boundary; no visible edge
2. **Accent audit** — `grep -r "brand" src/components` returns no rendered class usage
3. **Alignment test** — left gutter guide at 1440px touches every heading and poem line
4. **Label test** — screenshot intro, Ch01, Ch02, Ch04, end scene; no floating labels.
   Screenshot Ch03; six labels, no overlap, no duplicates
5. **Mobile nav test** — at 390px the menu button exists, opens, and all four links
   navigate
6. **Header test** — scroll to 5,600px; no content passes through the header
7. **Console** — zero errors (one known `THREE.Clock` deprecation warning is
   pre-existing and out of scope)

## Risks

- **Color-space conversion at the seam.** The backdrop is a shader output and
  `--background` is an oklch CSS value; they must land on the same rendered pixel.
  Three.js color management and the canvas output encoding can shift the shader value
  slightly. Verify the seam by sampling both sides in the browser rather than trusting
  the hex conversion, and nudge the keyframe if a hairline shows.
- **Removing light mode is irreversible in practice.** The `:root` block is deleted;
  restoring it means rewriting it.
- **"Proof of the Journey" is less scannable than "Certifications"** for a recruiter
  skimming quickly. Accepted deliberately in favor of theme consistency. Reverting is
  a one-line change in `content.ts` if it proves to be a problem.
