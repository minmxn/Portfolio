// Single source of truth for scroll progress, shared across the DOM tree and
// the R3F reconciler. It is a plain module object (not React state) so the
// per-frame 3D reads inside useFrame never trigger a re-render. GSAP
// ScrollTrigger writes into it; the Canvas reads it every frame.

// "Chapter" here means "narrative section" — includes the intro and end scenes
// alongside the four literal chapters, totalling six sections × 100vh = 600vh.
export const CHAPTER_COUNT = 6;

export type ScrollState = {
  /** Normalized scroll across the whole story track, 0 at the top, 1 at the end. */
  progress: number;
  /** Active section index, 0..CHAPTER_COUNT-1 (0=intro, 1-4=chapters, 5=end). */
  chapter: number;
  /** Progress within the active chapter, 0..1. */
  chapterProgress: number;
};

export const scrollState: ScrollState = {
  progress: 0,
  chapter: 0,
  chapterProgress: 0,
};

/**
 * Progress of a single chapter mapped from the global scroll: 0 before the
 * chapter's region, 0..1 across it, then held at 1 afterwards. Lets each
 * chapter animate within its own scroll band and stay resolved past it.
 */
export function chapterLocalProgress(index: number): number {
  const band = 1 / CHAPTER_COUNT;
  const local = (scrollState.progress - index * band) / band;
  return local < 0 ? 0 : local > 1 ? 1 : local;
}

// DOM-side listeners (e.g. the progress rail) that need to react when the
// active chapter changes. The Canvas does NOT use these; it polls in useFrame.
type ChapterListener = (chapter: number) => void;
const chapterListeners = new Set<ChapterListener>();

export function subscribeChapter(fn: ChapterListener): () => void {
  chapterListeners.add(fn);
  return () => chapterListeners.delete(fn);
}

/**
 * Write a fresh global progress value and derive chapter + chapterProgress.
 * Called by the master ScrollTrigger's onUpdate.
 */
export function setProgress(progress: number): void {
  const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  scrollState.progress = clamped;

  const scaled = clamped * CHAPTER_COUNT;
  const chapter = Math.min(CHAPTER_COUNT - 1, Math.floor(scaled));
  scrollState.chapterProgress = scaled - chapter;

  if (chapter !== scrollState.chapter) {
    scrollState.chapter = chapter;
    for (const fn of chapterListeners) fn(chapter);
  }
}
