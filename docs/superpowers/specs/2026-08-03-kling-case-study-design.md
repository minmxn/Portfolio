# Kling generative-video case study — design note

**Date:** 2026-08-03
**Owner:** Min Yi (min.y.seet@accenture.com)
**Route:** `/projects/kling`
**Status:** design only, no code until user approves

## Context

The Projects section of the portfolio already lists a second exhibit called *"Generative video experiments — Exploring AI video with Kling 3.0"* with a "Gallery coming soon" note. Min Yi has now produced a small library of Kling 3.0 assets (Little Prince character sheets in three views, a Fox in two views, and a final 60-second video) and wants to turn this dead-end exhibit into a real case study showing **the process of making the video** — not just the video itself.

This is a small, self-contained addition that lives alongside the (separately spec'd) shining 3D main narrative. It does not change that spec. It only fills in Exhibit B on the Projects section and adds a new route with the case study page.

## Approved decisions (locked)

| Decision | Choice |
|---|---|
| Case-study route | `/projects/kling` (mirrors `/projects/nomo`) |
| Aesthetic | Dark theme, same tokens as `/projects/nomo`. Warm gold accents allowed (they read as "Kling's palette" — muted golds + starry blues). |
| Story shape | Process narrative, not just a gallery. "How I made the Little Prince video with Kling 3.0." |
| Framing to hiring reader | Kling as a PM-thinking exploration: "Is generative video mature enough to use for product storytelling and prototyping?" |
| Home-page presence | Update the existing Exhibit B card to link to `/projects/kling`. Drop "Gallery coming soon." |
| Storyline echo | Add "Generative AI (Kling 3.0)" as a small mention in Ch03 "My toolkit" of the main narrative so the case study is visible from the scroll experience, not only from the Projects section. |

## Assets provided

Currently at `/assets/` (repo root — outside `public/`, so not served yet):

- `Prince_Front.png` (1536×2720, painterly watercolor style, blond boy in green suit with flowing yellow scarf)
- `Prince_Side.png`
- `Prince_Back.png`
- `Fox_Fonr.png` (typo in filename; will rename to `fox-front.png` on move)
- `Fox_Side.png`
- `The Little Prince.mp4` (~60 sec, ~1 MB, generated with Kling 3.0)

## Assets provided by Min Yi

**Global style prompt (used on every scene):**
> *"Cinematic painterly storybook watercolor and soft 3D, shallow depth of field, gentle film grain, muted warm golds and deep starry blues."*

**One example scene prompt (Prince on asteroid):**
> *"Prince stands on a tiny asteroid in star-filled space, his golden-yellow scarf drifting weightlessly, looking up at the stars with quiet wonder. Slow orbital camera drift, gentle push-in. Cool starlight rim-light on his hair. Ambient: soft cosmic hum, faint chimes, tender piano."*

Both quoted verbatim on the page.

## Content still needed from Min Yi (before build)

The page can ship with placeholders for these; a follow-up commit fills them in.

1. **1–2 additional scene prompts** used in the video (if any). Optional.
2. **"What surprised you"** — 2–3 sentences. What did Kling do well, what did it fail at (e.g., temporal character consistency, hand shapes, background stability)?
3. **"What I'd use this for"** — 2–3 sentences. Specifically: how you'd use generative video in a PM context (rapid product demos, prototype pitches, onboarding films, or something else).
4. **Video poster frame preference** — default to `Prince_Front.png`; user can pick a specific frame later.

## Page structure

The page follows the same shell as `/projects/nomo` (dark, thin serif for accents, sans for body, glow border accents), but its layout is more visual/gallery-heavy because the subject IS visual.

1. **Back nav** — small "Back to portfolio" chevron link → `/#projects`.
2. **Kicker + title** — "Case study · Exhibit B" · *"Generative video experiments"* — subtitle: *"A Little Prince, made with Kling 3.0."*
3. **Meta row** — role (*"Direction, prompt writing, edit"*), tool (*"Kling 3.0"*), duration (*"~60 sec"*), and a "Play film ↓" chevron that scrolls to the embedded player.
4. **Intent** — one paragraph on why *The Little Prince*: literary reference, warm painterly style, and a real test of Kling's ability to hold character consistency across multiple shots. Naming the challenge upfront frames the case study as PM thinking, not just "look what I made."
5. **Character reference sheets** — horizontal responsive gallery. Two rows:
   - Row 1: Prince — Front, Side, Back.
   - Row 2: Fox — Front, Side.
   Each image has a small caption under it (e.g. *"Prince, front — first generation, this is the seed that all other shots reference."*). Reference sheets ARE the substance of a character-consistency case study.
6. **Prompt & style** — two blockquotes side by side (stack on mobile):
   - Left: the global style prompt.
   - Right: the "Prince on asteroid" scene prompt (as an example of one scene's fuller prompt).
   Followed by a short paragraph noting the pattern: fixed style prompt + varying scene prompts kept the *look* consistent while giving each shot a distinct beat.
7. **The film** — embedded MP4 player, autoplay muted with a caption "Sound on for the ambience." Uses the `<video>` element with `playsInline poster={"/kling/prince-front.png"}`. Lazy-loads.
8. **What I learned** — three short paragraphs from Min Yi's follow-up notes:
   - **What surprised me** *(placeholder)*
   - **The limits I hit** *(placeholder)*
   - **What I'd use this for** *(placeholder)*
9. **Meta footer** — small caption line: *"Made with Kling 3.0 · Style: painterly watercolor + soft 3D · 2026."* + back-to-portfolio chevron and a "See Nomo ↓" chevron linking to `/projects/nomo`.

## Storyline echo (in the main narrative)

Add a small mention of Kling 3.0 in Chapter 03 "My toolkit" — either:
- In the hover-reveal spec pill list: append *"Generative AI (Kling 3.0)"* to the existing skills line, or
- As a distinct illuminating icon in the Ch03 floating-icon ring (the "spark / sparkles" glyph, lighting up when the camera passes it, tagged "Kling").

The Ch03 spec-pill option is the smaller change; the icon-in-ring option ties it more concretely to the visual narrative. Recommend **both** — the pill for scanning readers, the icon for scrollers.

## Files to create, modify, retire

### Move
- `/assets/*.png` → `/public/kling/`
  - `Prince_Front.png` → `/public/kling/prince-front.png`
  - `Prince_Side.png` → `/public/kling/prince-side.png`
  - `Prince_Back.png` → `/public/kling/prince-back.png`
  - `Fox_Fonr.png` → `/public/kling/fox-front.png` *(fix typo)*
  - `Fox_Side.png` → `/public/kling/fox-side.png`
- `/assets/The Little Prince.mp4` → `/public/kling/the-little-prince.mp4`

### Create
- `src/app/projects/kling/page.tsx` — the case study page (Server Component; reads Kling case-study data from `content.ts`).
- Optional: `src/components/kling-gallery.tsx` — the reference-sheet horizontal gallery, extracted so it's easy to iterate on.

### Modify
- `src/content.ts` — add a `caseStudyKling` export mirroring the existing `caseStudy` (Nomo) shape:
  - name, tagline, role, tool, duration, liveUrl (optional), stylePrompt, scenePromptExamples, referenceSheets (array of {src, alt, caption}), video (src, poster), learnings ({surprised, limits, useFor}).
  - The existing `projects` array's Kling entry updated: `href: "/projects/kling"`, drop the "coming soon" implication, add a `liveLabel` if the video has a public link (optional).
- `src/content.ts` — Ch03 story beat's `spec` field: append "Generative AI (Kling 3.0)".
- (Later, when the shining narrative is built) Ch03 chapter component: include a "sparks/sparkles" icon in the floating ring, tagged Kling.

### Retire
- `/assets/` folder emptied after the move (or removed, or kept as source-of-truth). Recommend: delete `/assets/` after move; the files live in `/public/kling/` and there's no reason to duplicate.

## Reuse

- `src/lib/utils.ts` `cn()` for class merging.
- The layout shell and dark tokens from `/projects/nomo/page.tsx` — the new page follows the same visual grammar (kicker → title → meta → sections → back nav).
- The existing dark palette + glow accents in `globals.css` — no new tokens needed.
- The `caseStudy` type in `content.ts` — extend, don't fork.

## Risks and open questions

1. **Video file size and hosting.** The current MP4 is 1 MB — small. If more scenes are added the video could grow. If it ever passes ~5 MB, host on a CDN (e.g., Vercel Blob or Cloudflare Stream) rather than shipping via `public/`. Not a blocker now.
2. **Kling watermark.** The generated PNGs and video carry a small "Kling AI 3.0" watermark in the bottom-right corner. Options: (a) leave it as-is — signals authenticity of source; (b) crop/mask it out per image; (c) note it as an intentional "made with Kling" credit in the page copy. Recommend (a) + (c) — leave it, credit it explicitly. Attempting to hide it would look worse than owning it.
3. **Video autoplay and reduced-motion.** Autoplay muted is fine on most browsers, but users with `prefers-reduced-motion: reduce` should get a static poster + a play button, not autoplay. The page should respect that.
4. **Missing content.** *"What surprised you"*, *"The limits I hit"*, and *"What I'd use this for"* need real content from Min Yi. Ship with placeholders; follow-up commit fills them in.

## Verification

1. `npx tsc --noEmit` clean.
2. `npm run build` prerenders `/projects/kling` statically alongside `/`, `/projects/nomo`, `/_not-found`.
3. Manual visit to `/projects/kling`: back nav works, all 5 PNGs load, video plays with poster fallback, layout responsive at 375/768/1440 widths.
4. `prefers-reduced-motion: reduce` → video does not autoplay; poster + play button visible instead.
5. Home page's Projects section: Exhibit B card now links to `/projects/kling` and no longer says "coming soon."
6. Ch03 spec pill (when the shining narrative is built) includes Kling in the tools list.
7. Kling watermark visible and credited in the page's meta footer.
