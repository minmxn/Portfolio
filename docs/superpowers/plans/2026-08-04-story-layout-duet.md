# Story Layout Duet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move chapter text to a left column on desktop so 3D objects and copy no longer compete for the same screen real estate.

**Architecture:** Three file changes — a gradient backdrop div in `story-overlay.tsx`, a float keyframe in `globals.css`, and a layout/animation update in `chapter-copy.tsx`. The 3D canvas, scroll rig, camera, and all other components are untouched.

**Tech Stack:** Next.js 16.2.12, React 19, Tailwind v4, Framer Motion 12

## Global Constraints

- No em dashes (`—`) and no double hyphens (`--`) anywhere in copy or comments
- Tailwind v4: CSS-first, no config file. All theme tokens live in `src/app/globals.css` via `@theme inline`. Use `bg-background/90` not `bg-[oklch(...)]`.
- Do not modify any file under `src/components/r3f/`, `src/components/scroll/`, or `src/hooks/`
- `BookIntroOverlay` and `EndSceneOverlay` must remain visually unchanged (centered layout)
- The static narrative fallback (`StaticNarrative`) must not be changed
- `npm run build` must pass with no TypeScript or Next.js errors
- No new npm packages

---

### Task 1: Gradient backdrop + float keyframe

**Files:**
- Modify: `src/components/story/story-overlay.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: `.animate-float` CSS class (used in Task 2)

Context: The canvas is `position: fixed; z-index: 0` (see `src/components/r3f/canvas-root.tsx:16`). The story track is `relative z-10`. A gradient backdrop at `z-[5]` sits above the canvas and below the story content, keeping chapter text legible without a hard edge. The float keyframe will be applied to the text wrapper in Task 2.

- [ ] **Step 1: Add the gradient backdrop div to `story-overlay.tsx`**

Open `src/components/story/story-overlay.tsx`. The current file is:

```tsx
"use client";

import { BookIntroOverlay } from "./book-intro-overlay";
import { ChapterCopy } from "./chapter-copy";
import { EndSceneOverlay } from "./end-scene-overlay";
import { story } from "@/content";

export function StoryOverlay() {
  // Sections 1..4 are the four chapters; 0 is intro, 5 is end (each has its
  // own dedicated overlay component with a different layout).
  const chapters = story.slice(1, 5);
  return (
    <div id="story-track" className="relative z-10">
      <BookIntroOverlay />
      {chapters.map((beat) => (
        <ChapterCopy key={beat.kicker} beat={beat} />
      ))}
      <EndSceneOverlay />
    </div>
  );
}
```

Replace it with:

```tsx
"use client";

import { BookIntroOverlay } from "./book-intro-overlay";
import { ChapterCopy } from "./chapter-copy";
import { EndSceneOverlay } from "./end-scene-overlay";
import { story } from "@/content";

export function StoryOverlay() {
  const chapters = story.slice(1, 5);
  return (
    <div id="story-track" className="relative z-10">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-0 z-[5] hidden w-[55vw] bg-gradient-to-r from-background/90 via-background/60 to-transparent md:block"
      />
      <BookIntroOverlay />
      {chapters.map((beat) => (
        <ChapterCopy key={beat.kicker} beat={beat} />
      ))}
      <EndSceneOverlay />
    </div>
  );
}
```

- [ ] **Step 2: Add `@keyframes float` and `.animate-float` to `globals.css`**

Open `src/app/globals.css`. Find the existing `@keyframes rise` block (around line 204) and the `.animate-rise` rule that follows it. Insert the float keyframe immediately after the existing `@media (prefers-reduced-motion: reduce)` block for `.animate-rise` (around line 222):

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-float {
  animation: float 5s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .animate-float {
    animation: none;
  }
}
```

- [ ] **Step 3: Start the dev server and confirm no build errors**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. The page should load without errors. The gradient backdrop is not yet visually obvious because `chapter-copy.tsx` has not changed yet — that is expected.

- [ ] **Step 4: Commit**

```bash
git add src/components/story/story-overlay.tsx src/app/globals.css
git commit -m "feat: add gradient backdrop and float keyframe for story layout duet"
```

---

### Task 2: Left-column layout in `chapter-copy.tsx`

**Files:**
- Modify: `src/components/story/chapter-copy.tsx`

**Interfaces:**
- Consumes: `.animate-float` CSS class from Task 1
- Produces: nothing consumed by later tasks

Context: The current `chapter-copy.tsx` centers all content. The new layout:
- On desktop (`md:` = 768px+): text aligns to a left column. On `md:` screens (no rail): `pl-10`. On `lg:` screens (rail visible at `left-6`, ~150px wide): `pl-44`.
- On mobile (< `md:`): centered, unchanged from today.
- Entrance animation: slides in from left (`x: -30 → 0`) instead of rising from below.
- The kicker (`beat.kicker`, e.g., "Chapter 01") is shown above the poem lines.
- Spec tags align left on desktop.
- A plain outer `div` carries `.animate-float`; the inner `motion.div` carries the entrance. Transforms are on separate elements — no conflict.

The chapter rail (`ChapterRail`) is `fixed top-1/2 left-6 hidden lg:flex` — it only appears at `lg:` (1024px+). `pl-44` (176px) clears its ~150px footprint.

- [ ] **Step 1: Replace `chapter-copy.tsx` with the new layout**

Replace the entire contents of `src/components/story/chapter-copy.tsx` with:

```tsx
"use client";

import { motion } from "framer-motion";
import type { StoryBeat } from "@/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ChapterCopy({ beat }: { beat: StoryBeat }) {
  return (
    <section
      data-chapter
      data-label={beat.label}
      className="relative h-[100vh]"
    >
      <div className="sticky top-0 flex min-h-screen items-center px-6 md:pl-10 lg:pl-44">
        <div className="animate-float w-full max-w-[420px]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-center md:text-left"
          >
            <p className="mb-3 font-sans text-[0.65rem] font-semibold tracking-[0.2em] text-glow/60 uppercase">
              {beat.kicker}
            </p>

            {beat.poem?.map((line, i) => (
              <p
                key={i}
                className="font-serif text-2xl leading-relaxed text-foreground/85 italic sm:text-3xl"
              >
                {line}
              </p>
            ))}

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
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify visually in the dev server**

With `npm run dev` still running, open `http://localhost:3000` and scroll through the story section. Confirm:

1. On a desktop viewport (>= 1024px): each chapter's poem lines sit in a left column, clearly separated from the 3D objects. The gradient fades the left edge of the canvas so text is legible. The kicker ("Chapter 01" etc.) appears above each poem block.
2. The text block has a slow continuous vertical float.
3. Scrolling into a chapter triggers the slide-in-from-left entrance animation.
4. On a mobile viewport (< 768px, use devtools): text is centered as before.
5. The Begin (BookIntroOverlay) and Reach Out (EndSceneOverlay) sections remain centered and visually unchanged.
6. Open devtools Console — no React errors or warnings.

- [ ] **Step 3: Run the production build to catch any type errors**

```bash
npm run build
```

Expected: build completes successfully. If there are TypeScript errors, fix them before committing.

- [ ] **Step 4: Commit**

```bash
git add src/components/story/chapter-copy.tsx
git commit -m "feat: move chapter text to left column, slide entrance, continuous float"
```
