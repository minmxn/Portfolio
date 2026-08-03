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
