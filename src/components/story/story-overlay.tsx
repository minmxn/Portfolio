"use client";

import { BookIntroOverlay } from "./book-intro-overlay";
import { ChapterCopy } from "./chapter-copy";
import { EndSceneOverlay } from "./end-scene-overlay";
import { story } from "@/content";

export function StoryOverlay() {
  const chapters = story.slice(1, 5);
  return (
    <div id="story-track" className="relative z-10 pointer-events-none">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-0 hidden w-[55vw] bg-gradient-to-r from-background/90 via-background/60 to-transparent md:block"
      />
      <BookIntroOverlay />
      {chapters.map((beat) => (
        <ChapterCopy key={beat.kicker} beat={beat} />
      ))}
      <EndSceneOverlay />
    </div>
  );
}
