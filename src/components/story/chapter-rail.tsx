"use client";

// A minimal fixed progress rail (desktop only). Subscribes to the shared
// scroll-state's chapter changes rather than observing the DOM, so it stays in
// perfect lockstep with the 3D. Hidden on small screens to keep the overlay
// uncluttered.

import { useEffect, useState } from "react";
import { scrollState, subscribeChapter } from "@/components/scroll/scroll-state";
import { cn } from "@/lib/utils";

export function ChapterRail({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(scrollState.chapter);

  useEffect(() => {
    setActive(scrollState.chapter);
    return subscribeChapter(setActive);
  }, []);

  return (
    <nav
      aria-hidden
      className="fixed top-1/2 left-6 z-20 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
    >
      {labels.map((label, i) => {
        const isActive = i === active;
        return (
          <div key={label} className="flex items-center gap-3">
            <span
              className={cn(
                "h-px transition-all duration-500",
                isActive ? "w-8 bg-glow" : "w-4 bg-foreground/25",
              )}
            />
            <span
              className={cn(
                "font-sans text-[0.65rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-500",
                isActive ? "text-glow" : "text-muted-foreground/60",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
