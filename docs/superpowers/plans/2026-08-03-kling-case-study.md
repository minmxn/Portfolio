# Kling case study implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current "coming soon" Kling exhibit into a full case-study page at `/projects/kling` that showcases the Little Prince Kling 3.0 assets (reference sheets + prompts + film), treats the prompts as first-class exhibits, and updates the home Projects card and the Ch03 story beat to reference it.

**Architecture:** Server Component page (no client state beyond video playback control) that reads a new `caseStudyKling` data object from `src/content.ts`, mirrors the visual grammar of `/projects/nomo`, and delegates video playback with reduced-motion respect to a single small `<KlingVideo>` client component. Assets move from the repo-root `/assets/` staging area into `/public/kling/` where Next serves them as static files.

**Tech Stack:** Next.js 16.2.12 (App Router), React 19.2.4, TypeScript, Tailwind CSS v4 (CSS-first, no config file), `next/image` for reference sheets, `next/link` for internal navigation, `lucide-react` for icons. **No new dependencies.**

## Global Constraints

The following apply to every task and are non-negotiable:

- **Copy style:** No em dashes, no double hyphens anywhere in `src/content.ts` or in JSX copy. Use commas, semicolons, or periods instead. (This rule is written into `src/content.ts` at the top of the file.)
- **Next.js 16 SSR rule:** `next/dynamic` with `{ ssr: false }` is not allowed in Server Components. If any future work needs it, the import must live inside a `"use client"` component. (Not triggered by this plan, but stated for completeness.)
- **Force dark theme:** The site is forced dark (`layout.tsx` sets `className="dark ..."`, `theme-provider.tsx` uses `forcedTheme="dark"`). Do not introduce theme-toggle logic or light-mode fallbacks. Style using existing dark tokens in `src/app/globals.css` (`--background`, `--foreground`, `--muted-foreground`, `--glow`, etc.).
- **Tailwind v4:** No `tailwind.config.*` file exists. Theme tokens live in `src/app/globals.css` via `@theme inline` + `:root`/`.dark`. Do not create a Tailwind config file.
- **Content in `src/content.ts` is the source of truth.** No hardcoded copy in components except structural UI labels (e.g. "Back to portfolio"). All page copy must be reachable from `content.ts`.
- **Reduced motion:** any auto-playing / auto-animating element must respect `prefers-reduced-motion: reduce` and provide a static fallback. Applies to the embedded video.
- **Prompts are quoted verbatim** on the page (see verbatim strings in Task 2 and Task 5).
- **Verification cadence:** the project has no test framework installed (`package.json` has no `test` script; there is no `jest`/`vitest` dependency). The plan therefore substitutes classic TDD's "write test → watch it fail → make it pass" with **`npx tsc --noEmit` (typecheck) → `npm run build` (prerender) → manual browser check** for tasks that produce runtime UI. This is honest for a static presentation page; adding a test runner just for this would be YAGNI.

---

## File structure

**Create:**
- `public/kling/` — directory for served assets.
- `src/app/projects/kling/page.tsx` — the case study page (Server Component).
- `src/components/kling/kling-video.tsx` — client component for the embedded video with reduced-motion respect.
- `src/components/kling/kling-gallery.tsx` — Server Component for the character reference sheet gallery.
- `src/components/kling/prompt-card.tsx` — Server Component for one prompt exhibit card (reused twice on the page).

**Modify:**
- `src/content.ts` — add `CaseStudyKling` type + `caseStudyKling` data; add `href` to the Kling entry in `projects[]`; append `"Generative AI (Kling 3.0)"` to the Ch03 story beat's `skills` list; add `spec` field to the Ch03 story beat.
- `docs/superpowers/specs/pending-assets.md` — check off Kling case study structural work when complete.

**Move / rename (via git-friendly `mv`):**
- `assets/Prince_Front.png` → `public/kling/prince-front.png`
- `assets/Prince_Side.png` → `public/kling/prince-side.png`
- `assets/Prince_Back.png` → `public/kling/prince-back.png`
- `assets/Fox_Fonr.png` → `public/kling/fox-front.png` *(fix typo)*
- `assets/Fox_Side.png` → `public/kling/fox-side.png`
- `assets/The Little Prince.mp4` → `public/kling/the-little-prince.mp4`

**Do NOT touch:** `assets/nomo/` — Min Yi's Nomo screenshots stage there for a separate future case study update.

---

## Task 1: Move Kling assets into public/

**Files:**
- Delete (via git mv): `assets/Prince_Front.png`, `assets/Prince_Side.png`, `assets/Prince_Back.png`, `assets/Fox_Fonr.png`, `assets/Fox_Side.png`, `assets/The Little Prince.mp4`
- Create: `public/kling/prince-front.png`, `public/kling/prince-side.png`, `public/kling/prince-back.png`, `public/kling/fox-front.png`, `public/kling/fox-side.png`, `public/kling/the-little-prince.mp4`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: six static assets served by Next from `/kling/*` URLs. Task 2 and later reference these URLs verbatim.

- [ ] **Step 1: Create the target directory**

```bash
mkdir -p public/kling
```

- [ ] **Step 2: Move and rename every asset**

The filenames must match exactly what later tasks reference. `Fox_Fonr.png` fixes a typo to `fox-front.png`. The MP4 gets kebab-cased.

```bash
mv "assets/Prince_Front.png" public/kling/prince-front.png
mv "assets/Prince_Side.png"  public/kling/prince-side.png
mv "assets/Prince_Back.png"  public/kling/prince-back.png
mv "assets/Fox_Fonr.png"     public/kling/fox-front.png
mv "assets/Fox_Side.png"     public/kling/fox-side.png
mv "assets/The Little Prince.mp4" public/kling/the-little-prince.mp4
```

- [ ] **Step 3: Verify all six files landed in the right place with the right names**

```bash
ls public/kling/
```

Expected output (order may differ):
```
fox-front.png  fox-side.png  prince-back.png  prince-front.png  prince-side.png  the-little-prince.mp4
```

- [ ] **Step 4: Verify the assets folder is clean of Kling files**

```bash
ls assets/
```

Expected: only the `nomo/` sub-directory remains (the Nomo screenshots staging area, untouched).

- [ ] **Step 5: Commit**

```bash
git add public/kling/ assets/
git commit -m "Move Kling assets into public/kling for serving

Kling PNGs and video move out of the repo-root assets/ staging area
into public/kling/ so Next serves them as static files. Fox_Fonr.png
typo corrected to fox-front.png. Nomo screenshots staging area under
assets/nomo/ is untouched."
```

---

## Task 2: Extend content.ts with Kling case study data

**Files:**
- Modify: `src/content.ts` — add `CaseStudyKling` type and `caseStudyKling` export; add `href` to projects[].kling; add `spec` and expanded `skills` to story[2] (Chapter 03).

**Interfaces:**
- Consumes: existing types (`Project`, `StoryBeat`) and the `about.skills` array in the same file. The Kling asset URLs from Task 1 (`/kling/prince-front.png`, etc.).
- Produces:
  - `type CaseStudyKling` and `const caseStudyKling: CaseStudyKling` — consumed by Tasks 3, 4, 5, 6, 7.
  - Updated `projects` array — the home page's `Projects` section re-renders with a working link.
  - Updated `story[2]` (Chapter 03) with `spec` + expanded `skills` — surfaces the Kling mention in the main narrative.

- [ ] **Step 1: Add the `CaseStudyKling` type and data object**

Open `src/content.ts` and, immediately after the existing `caseStudy` block (the Nomo one, roughly around line 182), insert:

```ts
export type CaseStudyKling = {
  name: string;
  tagline: string;
  role: string;
  tool: string;
  duration: string;
  intent: string;
  references: {
    row: "prince" | "fox";
    src: string;
    alt: string;
    caption: string;
  }[];
  prompts: {
    style: { text: string; caption: string };
    scenes: { title: string; text: string; caption: string }[];
  };
  patternExplainer: string;
  video: {
    src: string;
    poster: string;
    caption: string;
  };
  learnings: {
    surprised: string;
    limits: string;
    useFor: string;
  };
  metaCredit: string;
};

export const caseStudyKling: CaseStudyKling = {
  name: "Generative video experiments",
  tagline: "A Little Prince, made with Kling 3.0.",
  role: "Direction, prompt writing, edit",
  tool: "Kling 3.0",
  duration: "About 60 seconds",
  intent:
    "I picked The Little Prince because it is a beloved painterly world, and because it is a real test of what generative video can and cannot do yet. Keeping one character consistent across multiple shots is the hard part. Framing this as a challenge up front turns the experiment into a product thinking exercise, not just a demo.",
  references: [
    {
      row: "prince",
      src: "/kling/prince-front.png",
      alt: "The Little Prince, front view, blond hair, green suit, yellow flowing scarf, painterly watercolor",
      caption: "Prince, front. The seed that every other shot references.",
    },
    {
      row: "prince",
      src: "/kling/prince-side.png",
      alt: "The Little Prince, side view",
      caption: "Prince, side. Checks silhouette against the front seed.",
    },
    {
      row: "prince",
      src: "/kling/prince-back.png",
      alt: "The Little Prince, back view",
      caption: "Prince, back. The hardest angle to keep on model.",
    },
    {
      row: "fox",
      src: "/kling/fox-front.png",
      alt: "A small fox, front view, painterly watercolor",
      caption: "Fox, front. The Prince's companion in the story.",
    },
    {
      row: "fox",
      src: "/kling/fox-side.png",
      alt: "A small fox, side view, painterly watercolor",
      caption: "Fox, side. Same energy at a different angle.",
    },
  ],
  prompts: {
    style: {
      text: "Cinematic painterly storybook watercolor and soft 3D, shallow depth of field, gentle film grain, muted warm golds and deep starry blues.",
      caption:
        "This is the visual DNA. It defines the aesthetic; every scene prompt inherits it.",
    },
    scenes: [
      {
        title: "Prince on the asteroid",
        text: "Prince stands on a tiny asteroid in star-filled space, his golden-yellow scarf drifting weightlessly, looking up at the stars with quiet wonder. Slow orbital camera drift, gentle push-in. Cool starlight rim-light on his hair. Ambient: soft cosmic hum, faint chimes, tender piano.",
        caption:
          "One shot's fuller prompt. Beat, camera move, lighting, and audio bed layered on top of the pinned style.",
      },
    ],
  },
  patternExplainer:
    "The pattern is a fixed style prompt plus varying scene prompts. The style prompt keeps every shot on the same visual grammar, so cuts between scenes feel like the same film. The scene prompts change the beat, the camera, the lighting, and the audio bed. This is the how a hiring reader wants to see, not just the what.",
  video: {
    src: "/kling/the-little-prince.mp4",
    poster: "/kling/prince-front.png",
    caption: "Sound on for the ambience.",
  },
  learnings: {
    surprised:
      "Pending. Min Yi to fill in what Kling did well, in two or three sentences.",
    limits:
      "Pending. Min Yi to fill in Kling's failure modes, in two or three sentences.",
    useFor:
      "Pending. Min Yi to fill in how she would use generative video in a product management context, in two or three sentences.",
  },
  metaCredit:
    "Made with Kling 3.0. Style: painterly watercolor plus soft 3D. 2026.",
};
```

- [ ] **Step 2: Update the Kling entry in the `projects` array**

Find the entry with `slug: "kling"` (around line 113). Replace the whole entry with:

```ts
  {
    slug: "kling",
    name: "Generative video experiments",
    tagline: "Exploring AI video with Kling 3.0",
    description:
      "A short film I made with Kling 3.0, and the process behind it. Character reference sheets, prompts as artifacts, and the finished piece.",
    tags: ["Generative AI", "Kling 3.0", "Video"],
    href: "/projects/kling",
  },
```

Note the `href` is new, the description is refreshed, and the "Gallery coming soon" comment is gone.

- [ ] **Step 3: Extend the Ch03 story beat**

Find the story beat with `label: "My toolkit"` (around line 282). Replace the whole beat with:

```ts
  {
    kicker: "Chapter 03",
    label: "My toolkit",
    title: "An analyst's discipline, with a builder's hands.",
    lines: [
      "Years of requirements, UAT, releases, and stakeholder work, plus the engineering I picked up to ship my own products.",
    ],
    skills: [...about.skills, "Generative AI (Kling 3.0)"],
    spec: ["Business Analysis", "Product Thinking", "AI and Automation", "Generative Video (Kling 3.0)"],
  },
```

The change: `skills` now spreads `about.skills` and appends the Kling mention (per the design spec's Storyline Echo section); `spec` is a new short pill row for the compact tag treatment used elsewhere.

- [ ] **Step 4: Typecheck**

Run:
```bash
npx tsc --noEmit
```

Expected: clean exit (no output, exit code 0).

- [ ] **Step 5: Commit**

```bash
git add src/content.ts
git commit -m "Add Kling case study data and Ch03 toolkit reference

New CaseStudyKling type and caseStudyKling data object; Kling project
entry gets href /projects/kling; Ch03 story beat now references Kling
in both its skills list and its compact spec pill."
```

---

## Task 3: Create the case study page scaffold (route, header, intent)

**Files:**
- Create: `src/app/projects/kling/page.tsx`

**Interfaces:**
- Consumes: `caseStudyKling` from `@/content` (Task 2).
- Produces: a routable page at `/projects/kling` rendering the back nav, kicker, title, tagline, meta row, "Play film" chevron, and Intent paragraph. Later tasks (4, 5, 6, 7) will add sections below the Intent inside this same file.

- [ ] **Step 1: Create the page file**

Create `src/app/projects/kling/page.tsx` with this content:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { caseStudyKling } from "@/content";

export const metadata: Metadata = {
  title: `${caseStudyKling.name} | Case study`,
  description: caseStudyKling.tagline,
};

export default function KlingCaseStudy() {
  return (
    <article className="relative z-10 bg-background mx-auto max-w-3xl px-6 py-14 md:py-20">
      {/* Back nav */}
      <Link
        href="/#projects"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-glow"
      >
        <ArrowLeft className="size-3.5" />
        Back to portfolio
      </Link>

      {/* Kicker */}
      <div className="mt-10 flex items-center gap-3 font-sans text-xs font-semibold tracking-[0.2em] text-glow uppercase">
        <span
          className="size-2 rounded-full bg-glow shadow-[0_0_10px_var(--glow)]"
          aria-hidden
        />
        Case study · Exhibit B
      </div>

      {/* Title and tagline */}
      <h1 className="font-display mt-4 text-4xl leading-tight font-black tracking-tight text-balance sm:text-5xl">
        {caseStudyKling.name}
      </h1>
      <p className="font-serif mt-3 text-xl text-muted-foreground italic">
        {caseStudyKling.tagline}
      </p>

      {/* Meta row */}
      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
        <div>
          <dt className="font-sans text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Role
          </dt>
          <dd className="font-serif mt-1 text-sm text-foreground/85">
            {caseStudyKling.role}
          </dd>
        </div>
        <div>
          <dt className="font-sans text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Tool
          </dt>
          <dd className="font-serif mt-1 text-sm text-foreground/85">
            {caseStudyKling.tool}
          </dd>
        </div>
        <div>
          <dt className="font-sans text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Duration
          </dt>
          <dd className="font-serif mt-1 text-sm text-foreground/85">
            {caseStudyKling.duration}
          </dd>
        </div>
      </dl>

      {/* Play film chevron */}
      <div className="mt-6">
        <a
          href="#film"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-glow uppercase transition-opacity hover:opacity-70"
        >
          Play the film
          <ChevronDown className="size-3.5" />
        </a>
      </div>

      {/* Divider */}
      <div className="mt-10 space-y-[3px]" aria-hidden>
        <div className="border-t-2 border-foreground/30" />
        <div className="border-t border-foreground/15" />
      </div>

      {/* Intent */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          The intent
        </h2>
        <p className="font-serif mt-3 text-lg leading-relaxed text-muted-foreground dropcap">
          {caseStudyKling.intent}
        </p>
      </section>
    </article>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Build to confirm the route prerenders**

```bash
npm run build 2>&1 | tail -12
```

Expected: `/projects/kling` appears in the Route (app) table with `○ (Static)`.

- [ ] **Step 4: Manual browser check**

If a dev server is already running, hard-refresh; otherwise:

```bash
npm run dev
```

Visit `http://localhost:3000/projects/kling`. Expected:
- Back-to-portfolio link at the top
- "Case study · Exhibit B" kicker in glow color
- Large display heading "Generative video experiments"
- Italic serif tagline "A Little Prince, made with Kling 3.0."
- Three-column meta row (Role, Tool, Duration)
- "Play the film" chevron link
- A double-rule divider
- "The intent" section with a drop-cap paragraph

- [ ] **Step 5: Commit**

```bash
git add src/app/projects/kling/page.tsx
git commit -m "Add Kling case study page scaffold at /projects/kling

Server Component route with back nav, kicker, title, tagline, meta
row for role/tool/duration, jump-to-film chevron, divider, and intent
paragraph. Reads all copy from caseStudyKling in content.ts. Later
tasks add gallery, prompts, video, and learnings below."
```

---

## Task 4: Character reference sheet gallery

**Files:**
- Create: `src/components/kling/kling-gallery.tsx`
- Modify: `src/app/projects/kling/page.tsx` — insert the gallery below the Intent section.

**Interfaces:**
- Consumes: `caseStudyKling.references` (from Task 2). Layout: filters references by `row` ("prince" then "fox") and renders each row as a horizontal responsive strip.
- Produces: `<KlingGallery references={...} />` component. Rendered once by the page inside a `<section>` labeled "Character reference sheets".

- [ ] **Step 1: Create the gallery component**

Create `src/components/kling/kling-gallery.tsx`:

```tsx
import Image from "next/image";
import type { CaseStudyKling } from "@/content";

type Reference = CaseStudyKling["references"][number];

export function KlingGallery({
  references,
}: {
  references: Reference[];
}) {
  const princeRefs = references.filter((r) => r.row === "prince");
  const foxRefs = references.filter((r) => r.row === "fox");

  return (
    <div className="space-y-10">
      <ReferenceRow label="Prince" refs={princeRefs} />
      <ReferenceRow label="Fox" refs={foxRefs} />
    </div>
  );
}

function ReferenceRow({
  label,
  refs,
}: {
  label: string;
  refs: Reference[];
}) {
  return (
    <div>
      <p className="font-sans text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {refs.map((ref) => (
          <figure key={ref.src} className="flex flex-col">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-sm border border-foreground/10 bg-muted/40">
              <Image
                src={ref.src}
                alt={ref.alt}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="font-serif mt-2 text-xs leading-snug text-muted-foreground">
              {ref.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount the gallery in the page**

Open `src/app/projects/kling/page.tsx`.

Add this import at the top with the other imports:

```tsx
import { KlingGallery } from "@/components/kling/kling-gallery";
```

Then, immediately after the closing `</section>` of the "The intent" section, insert:

```tsx
      {/* Character reference sheets */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Character reference sheets
        </h2>
        <p className="font-serif mt-3 text-base leading-relaxed text-muted-foreground">
          Reference sheets are the substance of a character consistency case
          study. The Prince starts from a single seed image, then Kling has to
          reproduce him from other angles. The Fox is his companion in the
          story.
        </p>
        <div className="mt-8">
          <KlingGallery references={caseStudyKling.references} />
        </div>
      </section>
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Build to confirm image imports resolve**

```bash
npm run build 2>&1 | tail -12
```

Expected: build succeeds; `/projects/kling` still prerendered static.

- [ ] **Step 5: Manual browser check**

Refresh `http://localhost:3000/projects/kling`. Below Intent, you should see:
- A "Character reference sheets" heading with an explanatory paragraph
- Row 1: "PRINCE" label, three vertical images (front, side, back) with captions underneath
- Row 2: "FOX" label, two vertical images (front, side) with captions
- Images fill their aspect ratio (portrait), no distortion
- No console errors in the browser devtools

- [ ] **Step 6: Commit**

```bash
git add src/components/kling/kling-gallery.tsx src/app/projects/kling/page.tsx
git commit -m "Add Prince and Fox reference sheet gallery to Kling case study

KlingGallery Server Component splits references by row and renders
each as a responsive grid using next/image with an aspect-9/16 frame.
Page mounts it below Intent with an explanatory heading and body."
```

---

## Task 5: Prompt exhibits (style + scene) as elevated cards

**Files:**
- Create: `src/components/kling/prompt-card.tsx`
- Modify: `src/app/projects/kling/page.tsx` — insert the prompts section below the gallery.

**Interfaces:**
- Consumes: `caseStudyKling.prompts.style`, `caseStudyKling.prompts.scenes[]`, `caseStudyKling.patternExplainer`.
- Produces: `<PromptCard variant="style" | "scene" title? kicker text caption />` component. Two variants differ only in the left-border accent color (glow for style, warm gold for scene) and default kicker copy.

- [ ] **Step 1: Create the prompt card component**

Create `src/components/kling/prompt-card.tsx`:

```tsx
export type PromptCardProps = {
  variant: "style" | "scene";
  kicker: string;
  title?: string;
  text: string;
  caption: string;
};

export function PromptCard({
  variant,
  kicker,
  title,
  text,
  caption,
}: PromptCardProps) {
  // The style prompt gets the glow accent; the scene prompt gets a warm gold
  // accent (Kling's palette). Both accents are the left border only.
  const accent =
    variant === "style"
      ? "border-l-glow bg-glow/[0.04]"
      : "border-l-[oklch(0.78_0.14_75)] bg-[oklch(0.78_0.14_75)]/[0.04]";

  return (
    <figure className={`rounded-sm border-l-4 ${accent} border-y border-r border-foreground/10 p-6 md:p-8`}>
      <figcaption className="font-sans text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {kicker}
      </figcaption>
      {title && (
        <p className="font-sans mt-1 text-xs font-semibold tracking-[0.15em] text-foreground/70 uppercase">
          {title}
        </p>
      )}
      <blockquote className="font-serif mt-4 text-lg leading-relaxed text-foreground/90 md:text-xl">
        {text}
      </blockquote>
      <p className="font-sans mt-4 text-xs leading-relaxed text-muted-foreground">
        {caption}
      </p>
    </figure>
  );
}
```

- [ ] **Step 2: Mount the prompts section in the page**

Open `src/app/projects/kling/page.tsx`.

Add this import at the top:

```tsx
import { PromptCard } from "@/components/kling/prompt-card";
```

Then, immediately after the closing `</section>` of the reference sheets section, insert:

```tsx
      {/* The prompts (headline exhibit) */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          The prompts
        </h2>
        <p className="font-serif mt-3 text-base leading-relaxed text-muted-foreground">
          The prompt is the craft in generative video. These are the actual
          prompts I used, quoted verbatim.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <PromptCard
            variant="style"
            kicker="Style prompt · pinned to every scene"
            text={caseStudyKling.prompts.style.text}
            caption={caseStudyKling.prompts.style.caption}
          />
          {caseStudyKling.prompts.scenes.map((scene) => (
            <PromptCard
              key={scene.title}
              variant="scene"
              kicker="Scene prompt · example beat"
              title={scene.title}
              text={scene.text}
              caption={scene.caption}
            />
          ))}
        </div>

        <p className="font-serif mt-8 text-base leading-relaxed text-muted-foreground">
          {caseStudyKling.patternExplainer}
        </p>
      </section>
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Build**

```bash
npm run build 2>&1 | tail -12
```

Expected: build succeeds; page still prerenders.

- [ ] **Step 5: Manual browser check**

Refresh `/projects/kling`. Below the reference sheets, you should see:
- A "The prompts" heading with an explanatory intro paragraph
- Two cards side-by-side on md+ (stacked on mobile):
  - Left: soft glow left-border, "STYLE PROMPT · PINNED TO EVERY SCENE" kicker, the verbatim style prompt in larger serif, a caption below
  - Right: warm-gold left-border, "SCENE PROMPT · EXAMPLE BEAT" kicker, "PRINCE ON THE ASTEROID" title, verbatim scene prompt, caption
- Try selecting text in each card — it should be selectable
- Below the cards: a paragraph explaining the pattern

- [ ] **Step 6: Commit**

```bash
git add src/components/kling/prompt-card.tsx src/app/projects/kling/page.tsx
git commit -m "Elevate style and scene prompts as first-class exhibit cards

New PromptCard component with two variants (style/scene) that
differ only in left-border accent color. The style prompt uses glow;
scene prompts use warm gold. Both quote the prompt verbatim in a
larger serif face, with a kicker above and a caption below. Page
mounts a two-card grid and a pattern explainer paragraph."
```

---

## Task 6: KlingVideo client component with reduced-motion respect

**Files:**
- Create: `src/components/kling/kling-video.tsx`
- Modify: `src/app/projects/kling/page.tsx` — insert the film section below the prompts.

**Interfaces:**
- Consumes: `caseStudyKling.video.src`, `.poster`, `.caption`.
- Produces: `<KlingVideo src poster caption />` client component. Reads `prefers-reduced-motion` on mount via `window.matchMedia`. If motion is fine, autoplays muted with loop and `playsInline`. If motion is reduced, does not autoplay; user clicks a play button overlaid on the poster. The reveal element has `id="film"` so the "Play the film" chevron in Task 3 lands here.

- [ ] **Step 1: Create the client component**

Create `src/components/kling/kling-video.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

export function KlingVideo({
  src,
  poster,
  caption,
}: {
  src: string;
  poster: string;
  caption: string;
}) {
  // Start with reduced motion assumed so SSR + first paint never autoplay;
  // the effect below flips it to false when the user's OS allows motion.
  const [reducedMotion, setReducedMotion] = useState(true);
  const [userStarted, setUserStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const shouldAutoplay = !reducedMotion;
  const showManualPlayButton = reducedMotion && !userStarted;

  const handlePlay = () => {
    setUserStarted(true);
    const el = videoRef.current;
    if (el) {
      el.muted = true;
      el.play().catch(() => {
        /* Autoplay may still be blocked; the native controls remain visible. */
      });
    }
  };

  return (
    <figure id="film" className="scroll-mt-20">
      <div className="relative overflow-hidden rounded-sm border border-foreground/10 bg-black">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          playsInline
          muted
          loop
          preload="metadata"
          autoPlay={shouldAutoplay}
          className="block h-auto w-full"
        />
        {showManualPlayButton && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Play the film"
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-colors hover:bg-black/30"
          >
            <span className="flex size-16 items-center justify-center rounded-full border border-glow/50 bg-glow/10 text-glow shadow-[0_0_24px_var(--glow)]">
              <Play className="size-6" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="font-sans mt-3 text-xs tracking-wide text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
```

Key details a reviewer might miss:
- Initial state is `reducedMotion = true` (assume reduced until confirmed otherwise). This prevents any autoplay flicker during hydration on a user who has the setting on.
- Native `controls` are always present. The manual play button is an ADDITIONAL affordance for reduced-motion users, not the only way to play.
- `preload="metadata"` avoids downloading the whole video on page load if the user never plays it.
- `scroll-mt-20` on the `figure` makes the `#film` anchor land nicely below any fixed header.

- [ ] **Step 2: Mount the video in the page**

Open `src/app/projects/kling/page.tsx`.

Add this import at the top:

```tsx
import { KlingVideo } from "@/components/kling/kling-video";
```

Then, immediately after the closing `</section>` of the prompts section, insert:

```tsx
      {/* The film */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          The film
        </h2>
        <div className="mt-6">
          <KlingVideo
            src={caseStudyKling.video.src}
            poster={caseStudyKling.video.poster}
            caption={caseStudyKling.video.caption}
          />
        </div>
      </section>
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Build**

```bash
npm run build 2>&1 | tail -12
```

Expected: build succeeds. `/projects/kling` remains prerendered static (client component hydrates on client).

- [ ] **Step 5: Manual browser check — default (motion allowed)**

With OS motion set to "allow" (default on most machines), refresh `/projects/kling`. Below the prompts section, you should see:
- A "The film" heading
- The Prince Front image as a video poster, then the video begins autoplaying muted on loop
- Native player controls visible (bottom of the video)
- Caption "Sound on for the ambience." below the video

Click the "Play the film" chevron near the top of the page; the page should smooth-scroll to the video.

- [ ] **Step 6: Manual browser check — reduced motion**

Enable `prefers-reduced-motion: reduce`:
- Windows: Settings → Accessibility → Visual effects → turn off "Animation effects".
- macOS: System Settings → Accessibility → Display → "Reduce motion".
- Or in Chrome DevTools: More tools → Rendering → Emulate CSS prefers-reduced-motion: reduce.

Hard refresh. Expected:
- Video does NOT autoplay
- A large glowing round Play button is overlaid on the poster
- Clicking Play starts playback and the overlay disappears
- Native controls still work regardless

- [ ] **Step 7: Commit**

```bash
git add src/components/kling/kling-video.tsx src/app/projects/kling/page.tsx
git commit -m "Add Kling video player with reduced-motion respect

KlingVideo client component reads prefers-reduced-motion via
matchMedia. Motion-fine users see autoplay muted looped; reduced
motion users see the poster with a glowing Play button overlay
and no autoplay. Native controls always available. Film section
mounted in the page with a #film anchor for the Play the film
chevron to land on."
```

---

## Task 7: Learnings, meta footer, and closing nav

**Files:**
- Modify: `src/app/projects/kling/page.tsx` — insert the What I Learned section, meta credit line, and closing footer nav below the film.

**Interfaces:**
- Consumes: `caseStudyKling.learnings.surprised`, `.limits`, `.useFor`, `caseStudyKling.metaCredit`.
- Produces: the final three page sections. `pending-assets.md` still tracks the three learnings paragraphs as `[ ]` until Min Yi supplies real text.

- [ ] **Step 1: Add the "What I learned" section, meta footer, and closing nav**

Open `src/app/projects/kling/page.tsx`.

Add this import at the top (alongside the existing `ArrowLeft, ChevronDown` import), if not already there:

```tsx
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
```

Then, immediately after the closing `</section>` of the film section, insert:

```tsx
      {/* What I learned */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          What I learned
        </h2>
        <div className="mt-6 space-y-8">
          <LearningEntry
            heading="What surprised me"
            body={caseStudyKling.learnings.surprised}
          />
          <LearningEntry
            heading="The limits I hit"
            body={caseStudyKling.learnings.limits}
          />
          <LearningEntry
            heading="What I would use this for"
            body={caseStudyKling.learnings.useFor}
          />
        </div>
      </section>

      {/* Meta credit */}
      <p className="font-sans mt-14 text-xs leading-relaxed tracking-wide text-muted-foreground/80">
        {caseStudyKling.metaCredit}
      </p>

      {/* Footer nav */}
      <div className="mt-8 border-t border-foreground/15 pt-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-glow"
        >
          <ArrowLeft className="size-3.5" />
          All work
        </Link>
        <Link
          href="/projects/nomo"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-glow uppercase transition-opacity hover:opacity-70"
        >
          See Nomo case study
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
```

Then, ABOVE the `KlingCaseStudy` function (near the top of the file, after the imports), add this helper Server Component:

```tsx
function LearningEntry({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  const isPending = body.startsWith("Pending.");
  return (
    <div>
      <h3 className="font-display text-lg font-semibold tracking-tight">
        {heading}
      </h3>
      <p
        className={`font-serif mt-2 text-base leading-relaxed ${
          isPending
            ? "text-muted-foreground/60 italic"
            : "text-muted-foreground"
        }`}
      >
        {body}
      </p>
    </div>
  );
}
```

The `isPending` check dims the placeholder paragraphs so they read as "waiting for content" rather than as real copy. Real answers from Min Yi will not start with "Pending." so the styling flips automatically once she fills them in.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Build**

```bash
npm run build 2>&1 | tail -12
```

Expected: build succeeds.

- [ ] **Step 4: Manual browser check**

Refresh `/projects/kling`. Below the film, you should see:
- A "What I learned" heading with three subheadings (What surprised me, The limits I hit, What I would use this for), each with a dimmed italic placeholder paragraph
- A meta credit line
- A horizontal rule
- On the left, an "All work" chevron back to `/#projects`
- On the right, a "See Nomo case study" chevron linking to `/projects/nomo`

- [ ] **Step 5: Commit**

```bash
git add src/app/projects/kling/page.tsx
git commit -m "Add What I Learned, meta credit, and closing footer nav

Three LearningEntry blocks styled dim + italic while their bodies
start with 'Pending.' so unfinished content is visually distinct.
Meta credit line and a footer nav row with All work back-link and
See Nomo case study forward-link."
```

---

## Task 8: End-to-end verification and pending-assets tracker update

**Files:**
- Modify: `docs/superpowers/specs/pending-assets.md` — mark structural work complete, keep content items outstanding.

**Interfaces:**
- Consumes: everything from Tasks 1–7.
- Produces: verified working `/projects/kling` route, updated tracker.

- [ ] **Step 1: Full typecheck**

```bash
npx tsc --noEmit
```

Expected: clean exit, no output.

- [ ] **Step 2: Full production build**

```bash
npm run build 2>&1 | tail -20
```

Expected:
- "Compiled successfully" line
- Route (app) table includes `○ /projects/kling` marked as static (prerendered)
- No SSR errors, no `window is not defined`, no `ssr: false in Server Component`

- [ ] **Step 3: SSR content check via dev server**

Start the dev server if not running:

```bash
npm run dev
```

Wait for "Ready in..." then in another terminal:

```bash
curl -s http://localhost:3000/projects/kling | grep -c "Cinematic painterly storybook"
curl -s http://localhost:3000/projects/kling | grep -c "Prince stands on a tiny asteroid"
```

Expected: both commands print `1` (each verbatim prompt appears exactly once in the server-rendered HTML — proves the prompts are SEO-visible and screen-reader accessible, not JS-gated).

- [ ] **Step 4: Home page verification**

Visit `http://localhost:3000` and scroll to the Projects section. Expected:
- Exhibit B card ("Generative video experiments") shows the refreshed description
- The card now has a "Read the case study" link that navigates to `/projects/kling`
- The old "coming soon" comment is gone from the code and the card

- [ ] **Step 5: Responsive check**

At `http://localhost:3000/projects/kling`, use browser devtools to test three widths:
- 375px (mobile): meta row stacks; reference gallery becomes single column; prompt cards stack
- 768px (tablet): meta row shows three columns; reference gallery shows three-up (Prince) / two-up (Fox); prompt cards side-by-side
- 1440px (desktop): as above; container caps at max-w-3xl and centers

No overflow, no clipped text, no broken images.

- [ ] **Step 6: Cross-link check**

- Click "Back to portfolio" at the top of `/projects/kling` → lands at `/#projects` (Projects section on home).
- Click "Play the film" chevron → smooth-scrolls to the `#film` anchor.
- Click "See Nomo case study" in the footer → navigates to `/projects/nomo`.
- Click "All work" in the footer → back to `/#projects`.

- [ ] **Step 7: Update the pending-assets tracker**

Open `docs/superpowers/specs/pending-assets.md`. Under "Kling case study reflections", the three items remain `[ ]` (Min Yi still needs to write them). At the bottom of the file, above the "Done" section, add this note:

```markdown
## Structural work complete

- [x] `/projects/kling` case study route built and verified — reference sheets, prompt exhibits, embedded video (with reduced-motion respect), placeholder Learnings sections, and closing footer nav are all live. Home Projects card links to it. Ch03 story beat references Kling. Awaiting Min Yi's three Learnings paragraphs to replace placeholder text.
```

- [ ] **Step 8: Commit tracker update**

```bash
git add docs/superpowers/specs/pending-assets.md
git commit -m "Mark Kling case study structural work complete in tracker

Route, gallery, prompts, video, and footer nav all built and
verified. Only Min Yi's three Learnings paragraphs remain
outstanding; they will replace the placeholder text on a follow-up
commit."
```

- [ ] **Step 9: Final check — plan is done**

Run one last time to confirm the tree is clean and everything committed:

```bash
git log --oneline -10
git status
```

Expected: eight new commits from Tasks 1–7 plus one from Task 8's tracker update; `git status` shows a clean working tree (or only pre-existing changes unrelated to this plan).

---

## Self-review notes

**Spec coverage:** every section of the design spec has a task.
- §Move assets → Task 1
- §Prompts (showcased) → Task 5 (elevated exhibit cards)
- §Content still needed → Task 2 stores placeholders; Task 7 dims them until real content arrives
- §Page structure §1–§9 → Tasks 3 (§1–4), 4 (§5), 5 (§6), 6 (§7), 7 (§8–9)
- §Storyline echo → Task 2 (Ch03 skills + spec)
- §Files to create → Tasks 3, 4, 5, 6 (page + three components under `src/components/kling/`)
- §Reuse (cn, dark tokens, caseStudy shape) → mirrored throughout
- §Risks (autoplay/reduced-motion, missing content) → Task 6 (reduced-motion), Task 7 (placeholders)
- §Verification points 1–8 → Task 8 covers them explicitly

**Type consistency:** `CaseStudyKling`'s shape defined in Task 2 is consumed by Tasks 3, 4, 5, 6, 7 with the exact field names (`references`, `prompts.style`, `prompts.scenes`, `patternExplainer`, `video`, `learnings.surprised/limits/useFor`, `metaCredit`). `PromptCard`'s `variant` union `"style" | "scene"` matches how Task 5 calls it. `KlingVideo`'s props `{src, poster, caption}` match what Task 6 passes and what Task 2 defines under `caseStudyKling.video`.

**Placeholder scan:** the only placeholder text in the plan is the intentional "Pending. Min Yi to fill in..." strings inside `caseStudyKling.learnings` — those are user-facing dim italic markers that will be replaced with real content later, not plan placeholders. Everything a code step needs is written out.

**No test-runner honesty:** because this project has no `test` script or test framework, the plan uses `tsc + build + curl-html + manual browser check` as the verification cadence. This is called out in the Global Constraints so the executing agent doesn't waste time looking for a test suite that isn't there.
