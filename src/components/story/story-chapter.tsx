"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { StoryBeat } from "@/content";

// A single line/word that fades and rises as the chapter scrolls through
// its own sub-range of the pinned scroll.
function ScrubItem({
  progress,
  start,
  end,
  children,
  className,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  children: ReactNode;
  className?: string;
}) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [26, 0]);
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

export function StoryChapter({ beat }: { beat: StoryBeat }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.18], [0.12, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.18], [22, 0]);
  const lineSpan = 0.5 / Math.max(beat.lines.length, 1);

  return (
    <section
      ref={ref}
      data-chapter
      data-label={beat.label}
      className="relative h-[160vh]"
    >
      <div className="sticky top-0 flex min-h-screen items-center py-24">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="flex items-center gap-4">
            <span className="font-sans text-xs font-semibold tracking-[0.28em] text-brand uppercase">
              {beat.kicker}
            </span>
            <span className="h-px flex-1 bg-foreground/20" aria-hidden />
            <span className="font-sans text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {beat.label}
            </span>
          </div>

          <motion.h2
            style={{ opacity: titleOpacity, y: titleY }}
            className="font-display mt-8 text-3xl leading-[1.06] font-black tracking-tight text-balance sm:text-5xl md:text-[3.5rem]"
          >
            {beat.title}
          </motion.h2>

          <div className="mt-8 space-y-4 font-serif text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {beat.lines.map((line, i) => {
              const start = 0.26 + i * lineSpan;
              return (
                <ScrubItem
                  key={i}
                  progress={scrollYProgress}
                  start={start}
                  end={start + lineSpan}
                >
                  {line}
                </ScrubItem>
              );
            })}
          </div>

          {beat.skills && (
            <div className="mt-8 flex flex-wrap gap-2.5">
              {beat.skills.map((s, i) => {
                const start = 0.4 + (i / beat.skills!.length) * 0.4;
                return (
                  <ScrubItem
                    key={s}
                    progress={scrollYProgress}
                    start={start}
                    end={start + 0.12}
                  >
                    <span className="inline-block border border-foreground/25 px-3 py-1 font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {s}
                    </span>
                  </ScrubItem>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
