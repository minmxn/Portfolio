"use client";

// Top-level composition of the 3D narrative. Resolves the device tier, then
// either mounts the full WebGL experience (fixed canvas + scroll rig + overlay
// track + rail) or, for reduced-motion / weak devices, the canvas-free static
// narrative. Server render and first client paint use the static path, so the
// text is always present for SEO and no WebGL is attempted during SSR.

import { LenisProvider } from "@/components/scroll/lenis-provider";
import { CanvasRoot } from "@/components/r3f/canvas-root";
import { StoryOverlay } from "@/components/story/story-overlay";
import { ChapterRail } from "@/components/story/chapter-rail";
import { SpecLabel } from "@/components/story/spec-label";
import { StaticNarrative } from "@/components/story/static-narrative";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { story } from "@/content";

export function Experience() {
  const tier = useDeviceCapability();

  if (tier === "static") {
    return <StaticNarrative />;
  }

  return (
    <LenisProvider>
      <CanvasRoot tier={tier} />
      <ChapterRail labels={story.map((s) => s.label)} />
      <StoryOverlay />
      <SpecLabel />
    </LenisProvider>
  );
}
