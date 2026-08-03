"use client";

import { useEffect, useState } from "react";

// A fixed side rail that shows the chapters and highlights the active one,
// so the reader always knows where they are in the story.
export function StoryRail({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]"),
    );
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement));
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed top-1/2 left-6 z-40 hidden -translate-y-1/2 transition-opacity duration-500 lg:block ${
        active >= 0 ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ul className="space-y-4">
        {labels.map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <span
              className={`h-px transition-all duration-300 ${
                i === active ? "w-9 bg-brand" : "w-4 bg-foreground/30"
              }`}
              aria-hidden
            />
            <span
              className={`font-sans text-[0.68rem] font-semibold tracking-[0.16em] uppercase transition-colors ${
                i === active ? "text-brand" : "text-muted-foreground/60"
              }`}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
