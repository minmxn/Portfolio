# One Theme Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the visual seam between the 3D scroll narrative and the editorial sections so the site reads as one continuous night-sky document.

**Architecture:** Work proceeds outside-in. First the token layer (delete light mode, retire the vermillion accent) so every downstream component inherits correct colors. Then the seam itself (backdrop resolves to the page background). Then each section is de-boxed and re-typed. The 3D label bug and the mobile nav are independent and can land at any point.

**Tech Stack:** Next.js 16.2.12 (App Router), React 19.2.4, Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.js`), `next-themes`, Three.js 0.185 via `@react-three/fiber` 9 + `@react-three/drei` 10, GSAP ScrollTrigger, Lenis.

## Global Constraints

- **Read `node_modules/next/dist/docs/` before writing Next.js code.** Per `AGENTS.md`, this Next.js version has breaking changes versus training data.
- **Accent discipline:** cyan (`--glow`) has exactly three jobs — section kicker, primary link in a section, current-position indicator. Nothing else may use it.
- **`--brand` must not appear in any rendered class name** when the work is done.
- **Warm gold survives only as 3D emissive material color**, never as UI.
- **Every section wrapper uses** `mx-auto max-w-6xl px-6` and `py-24 md:py-32`.
- **Dark-only.** No light-mode styles, no theme toggle.
- **Kickers are lowercase** with reduced letterspacing. The uppercase letterspaced treatment is retired.
- **Section names** (exact strings): `Things I've Built`, `Proof of the Journey`, `Signals Welcome`.
- **No test suite exists.** Verification is Playwright screenshots plus `npx tsc --noEmit` and `npm run build`. Every task's final check is a build that compiles clean.
- **Use PowerShell for `git`.** The Bash tool hangs on git in this environment.

---

## File Structure

**Modified:**
- `src/app/globals.css` — delete `:root` light block, promote `.dark` values to `:root`
- `src/components/r3f/materials/backdrop-material.ts` — final keyframe resolves to page background
- `src/components/editorial/section-heading.tsx` — kicker restyle, bullet removed
- `src/components/sections/projects.tsx` — de-box, retire exhibits, cyan links
- `src/components/sections/certifications.tsx` — de-box, cyan verify link
- `src/components/sections/contact.tsx` — de-box, links replace buttons
- `src/components/site-footer.tsx` — wordmark de-glowed, hover colors
- `src/components/site-header.tsx` — scrolled background, mobile menu
- `src/components/r3f/interactive-object.tsx` — label visibility gate
- `src/components/r3f/chapters/chapter-0{1,2,3}-*.tsx` — pass `chapterIndex`
- `src/content.ts` lines 44–60 — section kickers and titles

**Deleted (all confirmed unreferenced during planning):**
- `src/components/theme-toggle.tsx` — defined but never imported
- `src/components/sections/hero.tsx` — never imported; the newspaper front page
- `src/components/sections/about.tsx` — never imported
- `src/components/editorial/rule.tsx` — last consumer removed in Task 5

**Unchanged despite appearing in the spec:**
- `src/components/theme-provider.tsx` — already has `forcedTheme="dark"` at line 12
- `src/app/layout.tsx` — nothing to change; the toggle was never mounted there

---

### Task 1: Dark-Only Token Collapse

Removing light mode first means every later task sees final color values and never styles against a palette that is about to disappear.

**Files:**
- Modify: `src/app/globals.css:57-136`
- Delete: `src/components/theme-toggle.tsx`
- Verify only (no edit): `src/components/theme-provider.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `:root` exposes the former `.dark` token values. `--background` is `oklch(0.145 0.012 260)`. `--glow` is `oklch(0.78 0.15 218)`. `--brand` still exists as a token but is unused by Task 5 onward.

- [ ] **Step 1: Find where the theme toggle is mounted**

```bash
grep -rn "ThemeToggle\|theme-toggle" src/
```

Note every file that imports it. Expect `src/app/layout.tsx` and possibly `src/components/site-header.tsx`.

- [ ] **Step 2: Replace the two token blocks with one**

In `src/app/globals.css`, delete the entire `:root { … }` block at lines 57–96 (the warm newsprint light theme, including its `/* Light: warm newsprint paper… */` comment). Then change the `.dark` selector at line 99 to `:root` and update its comment.

The result starts like this:

```css
/* Night edition: the single theme. Deep, near-black canvas for the WebGL narrative. */
:root {
  --background: oklch(0.145 0.012 260);
  --foreground: oklch(0.93 0.008 240);
  --card: oklch(0.185 0.014 258);
  --card-foreground: oklch(0.93 0.008 240);
  --popover: oklch(0.185 0.014 258);
  --popover-foreground: oklch(0.93 0.008 240);
  --primary: oklch(0.93 0.008 240);
  --primary-foreground: oklch(0.16 0.012 260);
  --brand: oklch(0.7 0.16 32);
  --brand-foreground: oklch(0.16 0.02 40);
  --glow: oklch(0.78 0.15 218);
  --glow-foreground: oklch(0.16 0.012 260);
  --secondary: oklch(0.22 0.014 258);
  --secondary-foreground: oklch(0.93 0.008 240);
  --muted: oklch(0.225 0.014 258);
  --muted-foreground: oklch(0.72 0.02 235);
  --accent: oklch(0.26 0.02 250);
  --accent-foreground: oklch(0.93 0.008 240);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(0.92 0.02 240 / 12%);
  --input: oklch(0.92 0.02 240 / 15%);
  --ring: oklch(0.78 0.15 218 / 55%);
  --paper: oklch(0.185 0.014 258);
  --radius: 0.4rem;
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
```

`--radius: 0.4rem` moved up from the deleted light block — it was only defined there, and `@theme inline` at line 48 depends on it. Omitting it silently breaks every radius utility.

- [ ] **Step 3: Keep the dark variant working**

Leave `@custom-variant dark (&:is(.dark *));` at line 5 alone. Existing `dark:` utilities become inert rather than broken, and `next-themes` still puts `.dark` on `<html>`.

- [ ] **Step 4: Verify the theme is already forced — no edit needed**

`src/components/theme-provider.tsx:12` **already has** `forcedTheme="dark"`, alongside `defaultTheme="dark"` and `enableSystem={false}`. Confirm this is still true and change nothing:

```bash
grep -n "forcedTheme" src/components/theme-provider.tsx
```

Expected: `12:      forcedTheme="dark"`.

- [ ] **Step 5: Delete the toggle**

`src/components/theme-toggle.tsx` defines `ThemeToggle` but **nothing imports it** — Step 1's grep returns only its own definition. It is already dead code. Delete the file. There are no imports or JSX usages to remove.

```bash
rm src/components/theme-toggle.tsx
```

- [ ] **Step 6: Verify nothing references the deleted module**

```bash
grep -rn "theme-toggle\|ThemeToggle" src/
```

Expected: no output.

- [ ] **Step 7: Typecheck and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: both succeed with no errors.

- [ ] **Step 8: Visual check**

Start `npm run dev`, load `http://localhost:3000`, confirm the page is dark and no toggle control is present.

- [ ] **Step 9: Commit**

```powershell
git add -A src/app/globals.css src/components/theme-toggle.tsx
git commit -m "refactor: collapse to a single dark theme, remove light mode and toggle"
```

---

### Task 1B: Remove the Dead Newspaper Components

Runs immediately after Task 1. Discovered during planning: two components are the fully-realized newspaper front page from the losing design language, and **neither is imported anywhere**. They are not rendered on any route.

Leaving them costs nothing functionally but breaks the accent audit in Task 12 (they hold four of the remaining `brand` usages) and leaves a second design language sitting in the source tree for the next person to find and wonder about.

**Files:**
- Delete: `src/components/sections/hero.tsx`
- Delete: `src/components/sections/about.tsx`
- Delete: `src/components/editorial/rule.tsx` (only after the two above are gone)

**Interfaces:**
- Consumes: nothing
- Produces: `Rule` becomes deletable in Task 5; the Task 12 accent audit can reach zero

- [ ] **Step 1: Confirm both components are genuinely unreferenced**

```bash
grep -rn "sections/hero\|sections/about\|<Hero\|<About" src/
```

Expected: **no output.** If this returns anything, STOP — the component is live. Do not delete it; instead restyle it following the same pattern as Task 6, and report the discrepancy.

- [ ] **Step 2: Delete the two dead sections**

```bash
rm src/components/sections/hero.tsx src/components/sections/about.tsx
```

This is fully reversible with `git revert` if it turns out either is wanted later.

- [ ] **Step 3: Check whether Rule still has consumers**

```bash
grep -rn "editorial/rule\|<Rule" src/
```

Before this task, `Rule` had exactly two consumers: `section-heading.tsx:1,30` and `hero.tsx:3,43`. With `hero.tsx` gone, only `section-heading.tsx` remains — and Task 5 removes that usage. So **leave `rule.tsx` in place for now** and delete it in Task 5 Step 2, once its last consumer is gone.

- [ ] **Step 4: Verify the content entries are still fine**

`content.ts` has an `edition.sections.about` entry that Task 4 renames. Deleting `about.tsx` does **not** make that entry invalid — it is plain data, and unused keys are harmless. Leave `content.ts` alone in this task.

- [ ] **Step 5: Build**

```bash
npx tsc --noEmit
npm run build
```

Expected: clean. A failure here means something did import one of the deleted files and Step 1's grep missed it — restore with `git checkout` and investigate.

- [ ] **Step 6: Commit**

```powershell
git add src/components/sections/
git commit -m "chore: delete unrendered newspaper hero and about components

Neither was imported by any route. They were the last full expression of
the retired editorial design language."
```

---

### Task 2: Close the Seam

**Files:**
- Modify: `src/components/r3f/materials/backdrop-material.ts:9-23`

**Interfaces:**
- Consumes: `--background` = `oklch(0.145 0.012 260)` from Task 1
- Produces: the backdrop's final rendered pixel matches the CSS page background

- [ ] **Step 1: Converge the final keyframe**

The gradient currently ends on a dusty rose bottom (`#b76e79`), which is why the narrative ends in wine while the sections below are near-black.

In `src/components/r3f/materials/backdrop-material.ts`, change the last entry of both arrays to the sRGB equivalent of `oklch(0.145 0.012 260)`, which is `#0e1119`. Both ends of the vertical gradient converge on one tone, so the sky flattens exactly as the journey ends.

```ts
const TOP_COLORS = [
  new THREE.Color("#0a3a3a"),
  new THREE.Color("#083545"),
  new THREE.Color("#1c1a55"),
  new THREE.Color("#2a1560"),
  new THREE.Color("#0e1119"),
];
const BOT_COLORS = [
  new THREE.Color("#04081a"),
  new THREE.Color("#1a0940"),
  new THREE.Color("#4a1f3d"),
  new THREE.Color("#5a2a5c"),
  new THREE.Color("#0e1119"),
];
```

- [ ] **Step 2: Neutralize the shader's film noise at the seam**

The fragment shader adds `(n - 0.5) * 0.012` noise (line 64). At the seam this is roughly ±1.5/255 — below the visible threshold. Leave it. Do not remove the noise; it is what keeps the sky from banding earlier in the scroll.

- [ ] **Step 3: Sample both sides of the seam**

This is the step that matters. The backdrop is shader output and `--background` is CSS; Three.js color management and output encoding can shift them apart even when the hex math agrees. Do not trust the conversion — measure it.

Run the dev server, then in the browser console at the scroll position where the canvas meets the first section:

```js
// Page background, as the browser resolves it
getComputedStyle(document.body).backgroundColor
```

Then screenshot the boundary and compare the pixel rows immediately above and below it in an image tool, or sample the canvas directly:

```js
const c = document.querySelector('canvas');
const gl = c.getContext('webgl2');
const px = new Uint8Array(4);
gl.readPixels(c.width >> 1, 4, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
console.log('canvas bottom pixel:', px[0], px[1], px[2]);
```

`#0e1119` is `rgb(14, 17, 25)`.

- [ ] **Step 4: Nudge if a hairline shows**

If the sampled canvas value differs from the CSS value by more than 2 per channel, adjust the two `#0e1119` entries by the measured delta and re-sample. Repeat until within 2 per channel. Record the final value in a code comment explaining that it is tuned to match `--background` after tone mapping:

```ts
// Tuned to match CSS --background (oklch(0.145 0.012 260)) *after* ACES tone
// mapping and sRGB output encoding — do not "correct" this to the raw hex
// conversion, the seam will reopen.
```

Note: `gl.toneMapping = THREE.ACESFilmicToneMapping` is set at `scene.tsx:36` and will darken and desaturate this value, so a delta is expected.

- [ ] **Step 5: Build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```powershell
git add src/components/r3f/materials/backdrop-material.ts
git commit -m "fix: backdrop resolves to page background, closing the canvas seam"
```

---

### Task 3: Fix the Floating Label Bug

Independent of the color work. Can be done in parallel with Tasks 1–2.

**Files:**
- Modify: `src/components/r3f/interactive-object.tsx:102-213`
- Modify: `src/components/r3f/chapters/chapter-01-tangle.tsx:246`
- Modify: `src/components/r3f/chapters/chapter-02-pedestal.tsx:32`
- Modify: `src/components/r3f/chapters/chapter-03-toolkit.tsx:77`

**Interfaces:**
- Consumes: `chapterLocalProgress(index: number): number` from `@/components/scroll/scroll-state`
- Produces: `InteractiveObject` gains a required prop `chapterIndex: number`

**Root cause:** every label is a drei `<Html>` at `interactive-object.tsx:179`. Chapters hide themselves with `group.current.visible = p > 0.001`, but **`<Html>` does not inherit Three.js `.visible`** — it portals to the DOM and projects to screen space regardless. All five chapter groups are mounted at once (`scene.tsx:54-58`), so every label renders on every scene. "NOMO" appears twice because Ch01 has a Nomo sphere and Ch02 has a Nomo pedestal.

- [ ] **Step 1: Add the prop to the type**

In `src/components/r3f/interactive-object.tsx`, add to `InteractiveObjectProps`:

```ts
  /**
   * Which narrative section (0=intro, 1-4=chapters, 5=end) this object belongs
   * to. The <Html> label renders only while that section is active — drei's
   * <Html> ignores Three.js .visible, so without this gate every chapter's
   * labels render on every scene at once.
   */
  chapterIndex: number;
```

- [ ] **Step 2: Import the progress helper**

```ts
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
```

- [ ] **Step 3: Destructure the prop**

Add `chapterIndex,` to the destructured parameter list in the `InteractiveObject` signature (alongside `id`, `label`, `story`, …).

- [ ] **Step 4: Track label visibility with the existing ref-guard pattern**

Add beside the existing `cardVisRef` / `showCard` declarations at lines 119–120:

```ts
  const labelVisRef = useRef(false);
  const [showLabel, setShowLabel] = useState(false);
```

Then inside the existing `useFrame`, after the `shouldShow` block at lines 140–144:

```ts
    // Same expression each chapter group uses for its own mesh visibility, so
    // labels and meshes appear and disappear together.
    const labelVisible = chapterLocalProgress(chapterIndex) > 0.001;
    if (labelVisible !== labelVisRef.current) {
      labelVisRef.current = labelVisible;
      setShowLabel(labelVisible);
    }
```

The ref guard means `setShowLabel` fires only on transitions, not every frame.

- [ ] **Step 5: Gate the label**

Wrap the `<Html>` block at lines 179–199 so it renders only when visible. Change:

```tsx
      <Html position={[0, objectRadius + 0.25, 0]} center>
```

to:

```tsx
      {showLabel && (
      <Html position={[0, objectRadius + 0.25, 0]} center>
```

and close it after the existing `</Html>` on line 199:

```tsx
      </Html>
      )}
```

- [ ] **Step 6: Pass the index at all three call sites**

`chapter-01-tangle.tsx:246` — add `chapterIndex={1}` to the `<InteractiveObject`.
`chapter-02-pedestal.tsx:32` — add `chapterIndex={2}`.
`chapter-03-toolkit.tsx:77` — add `chapterIndex={3}`.

Ch04 (`chapter-04-horizon.tsx`) and `end-scene.tsx` contain no `InteractiveObject` and need no change.

- [ ] **Step 7: Verify the compiler caught every call site**

```bash
npx tsc --noEmit
```

Expected: PASS. Because `chapterIndex` is required, a miss would have been a type error here — that is the point of making it required rather than optional with a default.

- [ ] **Step 8: Visual verification**

Run the dev server. At each scroll position, screenshot and check:

| Scroll | Expected labels |
|---|---|
| 0 (intro) | none |
| ~1,200 (Ch01) | only project names |
| ~2,000 (Ch02) | only `NOMO`, once |
| ~2,900 (Ch03) | exactly six, each under its own ring object |
| ~4,000 (Ch04) | none |
| ~4,800 (end) | none |

The intro at scroll 0 is the key regression check — that is where the collision was worst.

- [ ] **Step 9: Commit**

```powershell
git add src/components/r3f/interactive-object.tsx src/components/r3f/chapters/
git commit -m "fix: gate 3D object labels to their own chapter

drei <Html> does not inherit Three.js .visible, so every chapter's labels
rendered on every scene simultaneously. Gate on chapterLocalProgress."
```

---

### Task 4: Section Naming

**Files:**
- Modify: `src/content.ts:44-60`

**Interfaces:**
- Consumes: nothing
- Produces: `edition.sections.{about,projects,certifications,contact}` keep identical shapes; only string values change

`content.ts:36` documents this block as relabelable without component changes.

- [ ] **Step 1: Rewrite the four kicker/title pairs**

Retire the newsroom vocabulary. Kickers become lowercase.

```ts
      kicker: "the profile",
      title: "About",
```
```ts
      kicker: "selected works",
      title: "Things I've Built",
```
```ts
      kicker: "what I've earned",
      title: "Proof of the Journey",
```
```ts
      kicker: "how to reach me",
      title: "Signals Welcome",
```

Leave every `dek` unchanged.

- [ ] **Step 2: Check the front-page kicker**

`content.ts:24` has `kicker: "Front page"`. Check whether it renders anywhere:

```bash
grep -rn "edition.kicker\|\.kicker" src/components/
```

If it renders, change it to lowercase `"front page"` for consistency. If it does not, leave it.

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```powershell
git add src/content.ts
git commit -m "content: rename sections into the journey's language"
```

---

### Task 5: Section Heading Restyle

Every section renders through this component, so it lands before the individual sections.

**Files:**
- Modify: `src/components/editorial/section-heading.tsx`

**Interfaces:**
- Consumes: cyan `--glow` from Task 1; lowercase kickers from Task 4
- Produces: unchanged props `{ kicker, title, dek }`

- [ ] **Step 1: Replace the component body**

Removes the vermillion square bullet, switches the kicker to cyan lowercase, and drops the newspaper `Rule`.

```tsx
// Shared section header: a quiet cyan kicker, a serif display title, and an
// optional italic dek. No bullet, no rule — whitespace separates sections.
export function SectionHeading({
  kicker,
  title,
  dek,
}: {
  kicker: string;
  title: string;
  dek?: string;
}) {
  return (
    <div className="mb-14">
      <span className="font-sans text-xs tracking-[0.12em] text-glow">
        {kicker}
      </span>
      <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {dek && (
        <p className="font-serif mt-3 max-w-2xl text-lg text-muted-foreground italic">
          {dek}
        </p>
      )}
    </div>
  );
}
```

The `Rule` import at line 1 is now unused — delete it.

- [ ] **Step 2: Delete Rule, now that its last consumer is gone**

`Rule` had exactly two consumers: `hero.tsx` (deleted in Task 1B) and `section-heading.tsx` (whose usage Step 1 just removed). Confirm, then delete:

```bash
grep -rn "editorial/rule\|<Rule" src/
```

Expected: no output. Then:

```bash
rm src/components/editorial/rule.tsx
```

If the grep **does** return something, leave `rule.tsx` in place — a consumer was added since planning.

- [ ] **Step 3: Lint and typecheck**

```bash
npx eslint src/components/editorial/
npx tsc --noEmit
```

Expected: clean. An unused `Rule` import would surface here.

- [ ] **Step 4: Commit**

```powershell
git add src/components/editorial/
git commit -m "style: section heading loses the bullet and rule, kicker goes cyan"
```

---

### Task 6: De-box the Projects Section

**Files:**
- Modify: `src/components/sections/projects.tsx`

**Interfaces:**
- Consumes: `SectionHeading` from Task 5
- Produces: nothing consumed downstream

- [ ] **Step 1: Replace the file**

Removes the exhibit labels, the boxed tag pills, the column divider, the section background and top border, and switches links to cyan. Tags become middot-separated text. Section padding becomes the global `py-24 md:py-32`.

```tsx
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/editorial/section-heading";
import { projects, edition } from "@/content";

export function Projects() {
  const meta = edition.sections.projects;
  return (
    <section id="projects" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <div className="flex flex-col gap-20">
          {projects.map((p) => (
            <article key={p.slug} className="max-w-3xl">
              <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {p.href ? (
                  <Link
                    href={p.href}
                    className="transition-colors hover:text-glow"
                  >
                    {p.name}
                  </Link>
                ) : (
                  p.name
                )}
              </h3>
              <p className="font-serif mt-1 text-lg text-muted-foreground italic">
                {p.tagline}
              </p>
              <p className="font-serif mt-5 text-[1.05rem] leading-relaxed">
                {p.description}
              </p>
              <p className="font-sans mt-5 text-xs tracking-[0.08em] text-muted-foreground">
                {p.tags.join(" · ")}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 font-sans text-xs tracking-[0.08em]">
                {p.href && (
                  <Link
                    href={p.href}
                    className="inline-flex items-center gap-1 text-glow hover:underline"
                  >
                    Read the case study
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                )}
                {p.liveUrl && (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {p.liveLabel ?? "Live"}
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

The `exhibitLabels` array at line 6 and the unused `i` map index are both gone.

- [ ] **Step 2: Confirm the tag join reads well**

Tags in `content.ts` are stored capitalized (e.g. `Product`, `Node.js`, `LLM`). `p.tags.join(" · ")` renders `Product · Node.js · LLM · Telegram · Oracle Cloud`. Do **not** add `uppercase` — the uppercase letterspaced treatment is part of the retired newspaper vocabulary. Leave the strings as authored.

- [ ] **Step 3: Lint and typecheck**

```bash
npx eslint src/components/sections/projects.tsx
npx tsc --noEmit
```

- [ ] **Step 4: Visual check**

Load the projects section. Confirm: no "EXHIBIT A", no boxes around tags, no vertical divider, no section background change from the sky above, cyan case-study links.

- [ ] **Step 5: Commit**

```powershell
git add src/components/sections/projects.tsx
git commit -m "style: projects section de-boxed, exhibits retired, links go cyan"
```

---

### Task 7: De-box the Certifications Section

**Files:**
- Modify: `src/components/sections/certifications.tsx`

**Interfaces:**
- Consumes: `SectionHeading` from Task 5
- Produces: nothing consumed downstream

- [ ] **Step 1: Replace the file**

Removes the `border-y-2` frame, the inverted filled status chip, the section top border, and the vermillion verify link. Status becomes plain text — cyan for in-progress since that is the live signal, muted for completed.

```tsx
import { ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/editorial/section-heading";
import { certifications, edition } from "@/content";

export function Certifications() {
  const meta = edition.sections.certifications;
  return (
    <section id="certifications" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <ul className="flex flex-col gap-10">
          {certifications.map((c) => {
            const completed = c.status.toLowerCase() === "completed";
            return (
              <li key={c.name} className="max-w-3xl">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <p className="font-display text-lg font-semibold leading-snug">
                    {c.name}
                  </p>
                  <span
                    className={
                      completed
                        ? "font-sans text-xs tracking-[0.08em] text-muted-foreground"
                        : "font-sans text-xs tracking-[0.08em] text-glow"
                    }
                  >
                    {c.status}
                  </span>
                </div>
                <p className="font-serif mt-1 text-sm text-muted-foreground">
                  {c.issuer}
                </p>
                {c.detail && (
                  <p className="font-serif mt-2 max-w-xl text-sm text-muted-foreground">
                    {c.detail}
                  </p>
                )}
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-sans text-xs tracking-[0.08em] text-glow hover:underline"
                  >
                    Verify
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

The `statusClass` helper at lines 5–11 and the desktop column-header row at lines 23–27 are both gone — with the table frame removed, column headers have nothing to head.

- [ ] **Step 2: Accent-discipline note**

This uses cyan for in-progress status, which is a fourth job beyond the three the constraints allow. It is permitted here because it is the only status signal left after the filled chip was removed, and it reads as "live" rather than as a link. If it competes visually with the Verify links during the visual check, change it to `text-foreground/70` instead.

- [ ] **Step 3: Lint and typecheck**

```bash
npx eslint src/components/sections/certifications.tsx
npx tsc --noEmit
```

- [ ] **Step 4: Visual check**

Confirm no boxes, no inverted chips, no table borders, and that status is legible without them.

- [ ] **Step 5: Commit**

```powershell
git add src/components/sections/certifications.tsx
git commit -m "style: certifications de-boxed, table frame and status chips removed"
```

---

### Task 8: De-box the Contact Section

**Files:**
- Modify: `src/components/sections/contact.tsx`

**Interfaces:**
- Consumes: `SectionHeading` from Task 5
- Produces: nothing consumed downstream

This is the hierarchy inversion. The near-white filled buttons are currently the loudest thing on the page, outshouting the case-study links that matter more.

- [ ] **Step 1: Replace the file**

```tsx
import { Mail } from "lucide-react";
import { LinkedinIcon } from "@/components/icons";
import { SectionHeading } from "@/components/editorial/section-heading";
import { contact, edition, site } from "@/content";

export function Contact() {
  const meta = edition.sections.contact;
  return (
    <section id="contact" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <p className="font-serif max-w-2xl text-xl leading-relaxed md:text-2xl">
          {contact.blurb}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 font-sans text-xs tracking-[0.08em]">
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2 text-glow hover:underline"
          >
            <Mail className="size-4" />
            Email me
          </a>
          <a
            href={site.socials.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-glow hover:underline"
          >
            <LinkedinIcon className="size-4" />
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
```

The `Button` import and the `border-2` card wrapper are both gone.

- [ ] **Step 2: Check whether Button is still used**

```bash
grep -rn "@/components/ui/button" src/
```

Leave `src/components/ui/button.tsx` in place regardless — it is a shadcn primitive and other routes (the case study pages) may use it. Only confirm no dangling import remains in `contact.tsx`.

- [ ] **Step 3: Lint and typecheck**

```bash
npx eslint src/components/sections/contact.tsx
npx tsc --noEmit
```

- [ ] **Step 4: Visual check**

Confirm the contact links are no longer the brightest elements on the page, and that they now match "Read the case study" in weight.

- [ ] **Step 5: Commit**

```powershell
git add src/components/sections/contact.tsx
git commit -m "style: contact de-boxed, buttons become links, hierarchy inverted"
```

---

### Task 9: Footer Accent Cleanup

**Files:**
- Modify: `src/components/site-footer.tsx:12,21,30,39,46`

**Interfaces:**
- Consumes: cyan discipline from Task 1
- Produces: nothing

The wordmark at line 12 is currently `text-glow` — cyan *and* glowing — making the least important element on the page the brightest.

- [ ] **Step 1: De-glow the wordmark**

Line 12, change:

```tsx
          <p className="font-display text-xl font-bold tracking-tight text-glow">
```

to:

```tsx
          <p className="font-display text-xl font-bold tracking-tight text-muted-foreground">
```

- [ ] **Step 2: Retire brand from the four social hovers**

Lines 21, 30, 39, and 46 each carry `hover:text-brand`. Change all four to `hover:text-foreground`. These are secondary navigation, not primary links, so they do not get cyan.

- [ ] **Step 3: Verify brand is gone from the footer**

```bash
grep -n "brand\|text-glow" src/components/site-footer.tsx
```

Expected: no output.

- [ ] **Step 4: Commit**

```powershell
git add src/components/site-footer.tsx
git commit -m "style: footer wordmark de-glowed, social hovers drop brand"
```

---

### Task 10: Header Background and Mobile Navigation

**Files:**
- Modify: `src/components/site-header.tsx`

**Interfaces:**
- Consumes: `site.nav` (array of `{ href, label }`) and `site.name` from `@/content`
- Produces: nothing

Two observed defects. At scroll 5,600px a section rule visibly slices through "Min Yi" and strikes through all four nav items, because the header has no background. And the nav is `hidden … md:flex` with no fallback — DOM inspection at 390×844 found zero `<button>` elements, so phones have no navigation at all.

The existing auto-hide behavior (lines 10–58) must be preserved. Note it already early-returns below 1024px width (line 28), so auto-hide never fought mobile and will not fight the new menu.

- [ ] **Step 1: Add state for the scrolled background and the menu**

Inside the component, above the existing `useEffect`:

```tsx
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
```

Update the React import on line 3:

```tsx
import { useEffect, useRef, useState } from "react";
```

- [ ] **Step 2: Drive the scrolled flag from the existing scroll listener**

The existing `handleScroll` (lines 26–37) early-returns below 1024px width at line 28, so the flag cannot be set there. Add a separate, always-running listener inside the same `useEffect`, before the `return` cleanup:

```tsx
    const handleScrolledFlag = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScrolledFlag();
    window.addEventListener("scroll", handleScrolledFlag, { passive: true });
```

And add its removal to the cleanup function:

```tsx
      window.removeEventListener("scroll", handleScrolledFlag);
```

`setScrolled` with an unchanged boolean is a no-op in React, so this does not re-render on every scroll event.

- [ ] **Step 3: Close the menu on Escape**

Add a second `useEffect` after the existing one:

```tsx
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);
```

- [ ] **Step 4: Give the header a background**

Change the `<header>` element at line 61 to:

```tsx
    <header
      ref={headerRef}
      className={`fixed top-0 z-50 w-full transition-[opacity,background-color,backdrop-filter] duration-[400ms] ${
        scrolled || menuOpen
          ? "bg-background/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
```

Transparent at the very top so the intro is unobstructed; blurred once scrolling begins so content stops slicing through.

- [ ] **Step 5: Add the menu button**

Immediately after the closing `</nav>` on line 79, still inside the flex row:

```tsx
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="font-sans text-xs tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-glow md:hidden"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
```

A text button rather than a hamburger icon: the site's voice is typographic, and it needs no new icon import.

- [ ] **Step 6: Add the overlay panel**

After the closing `</div>` of the flex row (line 80) but before `</header>`:

```tsx
      {menuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-md md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <nav className="flex flex-col items-center gap-8 pt-20">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-2xl font-bold tracking-tight text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
```

Closes on link selection (the `onClick` on each link), on backdrop tap (the `onClick` on the wrapper), and on Escape (Step 3).

- [ ] **Step 7: Typecheck and lint**

```bash
npx tsc --noEmit
npx eslint src/components/site-header.tsx
```

- [ ] **Step 8: Verify at 390×844**

Confirm: the Menu button is present; tapping it opens the overlay; all four links appear; each navigates and closes the menu; backdrop tap closes it; Escape closes it.

- [ ] **Step 9: Verify at 1440×900**

Confirm: no Menu button; the four nav links are inline; scrolling to 5,600px shows no content passing through the header; the auto-hide still hides the header on scroll-down and reveals it on scroll-up.

- [ ] **Step 10: Commit**

```powershell
git add src/components/site-header.tsx
git commit -m "feat: header gains a scrolled background and a mobile menu"
```

---

### Task 11: Narrative Gutter Alignment

The alignment that does the most work for the sense of one site — the left edge of "I gave the chaos a name…" must match the left edge of "Things I've Built".

**Files:**
- Modify: `src/components/story/chapter-copy.tsx`
- Modify: `src/components/story/book-intro-overlay.tsx`
- Modify: `src/components/story/end-scene-overlay.tsx`

**Interfaces:**
- Consumes: the `mx-auto max-w-6xl px-6` gutter established in Tasks 6–8
- Produces: nothing

- [ ] **Step 1: Read all three overlay files**

```bash
cat src/components/story/chapter-copy.tsx src/components/story/book-intro-overlay.tsx src/components/story/end-scene-overlay.tsx
```

Find the wrapper that positions the poem text. The observed left edge in the browser was ~176px at 1440px width, whereas `max-w-6xl px-6` at 1440px puts the gutter at 168px — close but not matching, which is exactly the kind of near-miss that reads as sloppy.

- [ ] **Step 2: Apply the shared gutter**

Wrap the poem text in each file with the same container the sections use:

```tsx
<div className="mx-auto max-w-6xl px-6">
  {/* existing poem markup */}
</div>
```

Preserve every existing ref (`poemWrapRef` in `book-intro-overlay.tsx:89` receives scroll-driven opacity — the new wrapper must go *outside* it, or the opacity animation will break). Add the wrapper as a parent of the ref'd element, never between the ref and its animated content.

- [ ] **Step 3: Verify the intro opacity exit still works**

Scroll slowly from 0 through ~1,000px. The intro poem must still fade out. If it no longer fades, the wrapper was inserted in the wrong place — move it outside `poemWrapRef`.

- [ ] **Step 4: Measure the alignment**

At 1440px width, in the browser console:

```js
const poem = document.querySelector('[class*="font-serif"]');
const heading = document.querySelector('#projects h2');
console.log(poem.getBoundingClientRect().left, heading.getBoundingClientRect().left);
```

Both numbers must match within 1px.

- [ ] **Step 5: Commit**

```powershell
git add src/components/story/
git commit -m "style: narrative copy adopts the shared page gutter"
```

---

### Task 12: Final Verification Sweep

**Files:** none modified unless a check fails

- [ ] **Step 1: Accent audit**

```bash
grep -rn "text-brand\|bg-brand\|border-brand\|hover:text-brand" src/
```

Expected: no output. Any hit is a miss from Tasks 5–9 — fix it and re-run.

- [ ] **Step 2: Light-mode audit**

```bash
grep -rn "ThemeToggle\|theme-toggle" src/
grep -n "^:root" src/app/globals.css
```

Expected: no toggle references; exactly one `:root` block.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: succeeds with no type errors and no lint errors.

- [ ] **Step 4: Console check**

Load the site, open DevTools, scroll the full page. Expected: zero errors. One `THREE.Clock` → `THREE.Timer` deprecation **warning** is pre-existing and out of scope — do not fix it here.

- [ ] **Step 5: Full screenshot sweep at 1440×900**

Capture at scroll 0, 1200, 2500, 4000, 5600, and 7400. Check each against the spec:

- Seam at the canvas/section boundary is invisible
- No labels outside their own chapter
- No vermillion anywhere
- No boxed tags, no bordered contact card, no table frame
- Every heading shares one left edge
- Nothing passes through the header

- [ ] **Step 6: Full screenshot sweep at 390×844**

Same positions. Additionally confirm the mobile menu opens and works.

- [ ] **Step 7: Update the pending-assets tracker**

Add to `docs/superpowers/specs/pending-assets.md` under "Structural work complete":

```markdown
- [x] One-theme unification shipped: single dark theme (light mode removed),
  backdrop resolves to page background closing the canvas seam, cyan as sole
  accent, editorial sections de-boxed, sections renamed into the journey's
  language, 3D labels gated to their own chapter, mobile nav added.
```

- [ ] **Step 8: Commit**

```powershell
git add docs/superpowers/specs/pending-assets.md
git commit -m "docs: record one-theme unification in pending-assets tracker"
```

---

## Self-Review Notes

**Spec coverage:** Section 1 → Task 2. Section 2 → Tasks 1B, 5–9. Section 3 → Tasks 6–8. Section 4 → Tasks 6–8 (padding) and Task 11 (gutter). Section 5 → Task 3. Section 6 → Task 4. Section 7 → Task 10. Section 8 → Task 1. Testing → Task 12.

**Deviation from spec, deliberate:** the spec's Section 5 originally called for authored label positions and collision avoidance. Planning found the actual root cause — drei `<Html>` ignoring Three.js `.visible` — and the spec was amended before this plan was written. Task 3 implements the corrected fix.

**Three spec assumptions corrected during planning:**

1. The spec listed `theme-provider.tsx` and `layout.tsx` as needing changes for dark-only. `forcedTheme="dark"` is **already set** at `theme-provider.tsx:12`, and the toggle was never mounted in `layout.tsx`. Task 1 verifies rather than edits.
2. `theme-toggle.tsx` is already dead code — defined, never imported. Deleting it removes nothing live.
3. The spec did not account for `sections/hero.tsx` and `sections/about.tsx`, which are **unrendered dead components** holding four of the remaining `brand` usages. Without Task 1B the accent audit in Task 12 could never reach zero. They are the last full expression of the retired newspaper language.

**Ordering rationale:** Task 1 first so no later task styles against a palette about to be deleted. Task 1B immediately after, so the accent audit has a reachable target. Task 5 before Tasks 6–8 because every section renders through `SectionHeading`. Tasks 3 and 10 touch no shared files and may be parallelized.

**Known risk carried from the spec:** Task 2 Step 4 may need iteration. ACES tone mapping (`scene.tsx:36`) will shift the shader's output away from the raw hex conversion, so the seam almost certainly needs measuring and nudging rather than landing correct on the first try.
