"use client";

// A minimal fixed progress rail (desktop only). Subscribes to the shared
// scroll-state's chapter changes rather than observing the DOM, so it stays in
// perfect lockstep with the 3D. Hidden on small screens to keep the overlay
// uncluttered.

import { useEffect, useState } from "react";
import { scrollState, subscribeChapter } from "@/components/scroll/scroll-state";
import { scrollToChapter } from "@/components/scroll/lenis-provider";
import { cn } from "@/lib/utils";

export function ChapterRail({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(scrollState.chapter);

  useEffect(() => {
    setActive(scrollState.chapter);
    return subscribeChapter(setActive);
  }, []);

  return (
    <nav
      className="fixed top-1/2 left-6 z-20 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
    >
      {labels.map((label, i) => {
        const isActive = i === active;
        return (
          <button
            key={label}
            onClick={() => scrollToChapter(i)}
            className="group relative flex cursor-pointer items-center bg-transparent p-1 -m-1"
            aria-label={label}
          >
            <span
              className={cn(
                "rounded-full transition-all duration-500",
                isActive
                  ? "h-2.5 w-2.5 bg-glow shadow-[0_0_6px_2px_var(--color-glow)]"
                  : "h-2 w-2 bg-foreground/25",
              )}
            />
            <span
              className={cn(
                "pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap font-sans text-[0.65rem] font-semibold tracking-[0.2em] uppercase opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                isActive ? "text-glow" : "text-muted-foreground/60",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
