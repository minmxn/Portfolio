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
