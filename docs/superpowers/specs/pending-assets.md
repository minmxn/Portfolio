# Pending assets & content — Min Yi's portfolio

**Purpose:** single source of truth for content and assets Min Yi still needs to provide before the site can ship the shining narrative + Kling case study + Nomo case study updates.

**How to use:** Claude checks this file at the start of every session and prompts Min Yi for anything still marked `[ ]`. Update this file whenever an item moves to done or a new gap appears.

## Nomo case study assets

Screenshots to save into `assets/nomo/`. Naming below is what the Nomo case-study page will reference; keep it exact.

- [ ] `assets/nomo/nomo-morning-briefing.png` — the 8am daily briefing (bullet snapshot).
- [ ] `assets/nomo/nomo-daily-quiz.png` — the daily quiz message (3 questions, Easy/Medium/Hard).
- [ ] `assets/nomo/nomo-quiz-answers.png` — the quiz answers reveal (with explanations).
- [ ] `assets/nomo/nomo-news-reader.png` — the 12pm swipeable news reader (Windows AI Foundry example).

*Optional additions:*
- [ ] `assets/nomo/nomo-poll.png` — a daily poll message, if she has a good one.
- [ ] `assets/nomo/nomo-freetext.png` — an example of the free-text question feature answering a live query.

## Kling case study reflections

Short paragraphs for the "What I learned" section of `/projects/kling`. See `2026-08-03-kling-case-study-design.md` for the full plan.

- [ ] **What surprised me** — 2–3 sentences on what Kling did well.
- [ ] **The limits I hit** — 2–3 sentences on failure modes (character consistency, hands, backgrounds, temporal drift, etc.).
- [ ] **What I'd use this for** — 2–3 sentences on how you'd use generative video in PM work (product demos, prototype pitches, onboarding films, storytelling for a launch, etc.).

*Optional:*
- [ ] Video poster frame preference (defaults to `prince-front.png` if not chosen).
- [ ] 2–4 additional Kling scene prompts you used, to strengthen the "how it was built" story.

## Personal assets

- [ ] Real resume PDF at `public/resume.pdf` (currently a placeholder).
- [ ] Headshot / avatar — optional. Only needed if you want to appear in the About or Contact areas.

## Kling-generatable enrichments (optional)

- [ ] "Prince meets Fox" scene — short clip or still. Emotional beat of the Little Prince story; would anchor the Kling case study.
- [ ] High-contrast Kling case study hero image — one dramatic still (Prince on the asteroid, muted gold + starry blue), sized for a wide banner. Would make `/projects/kling` cinematic on first paint.

## Structural work complete

- [x] `/projects/kling` case study route built and verified: reference sheets, prompt exhibits, embedded video (with reduced-motion respect), placeholder Learnings sections, and closing footer nav are all live. Home Projects card links to it. Ch03 story beat references Kling. Awaiting Min Yi's three Learnings paragraphs to replace placeholder text.

- [x] Home `/` shining narrative rebuild shipped: book intro, four chapters (morph-target crystal, Nomo pedestal + torus-knot, six-icon toolkit ring, ascending pillar), end scene with contact chips. Gradient backdrop shader, hooded person silhouette character, Bloom + Vignette + Noise post-processing, six-section camera rig. StaticNarrative renders poem + prose fallback for reduced-motion users.

## Done (kept for reference)

- [x] `assets/Prince_Front.png` — Little Prince, front view.
- [x] `assets/Prince_Side.png` — Little Prince, side view.
- [x] `assets/Prince_Back.png` — Little Prince, back view.
- [x] `assets/Fox_Fonr.png` — Fox, front view (filename typo will be normalized on move to `public/kling/fox-front.png`).
- [x] `assets/Fox_Side.png` — Fox, side view.
- [x] `assets/The Little Prince.mp4` — the final Kling video.
- [x] Global Kling style prompt provided (documented in `2026-08-03-kling-case-study-design.md`).
- [x] Prince-on-asteroid scene prompt provided (documented in `2026-08-03-kling-case-study-design.md`).
