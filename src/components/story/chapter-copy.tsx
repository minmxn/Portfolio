"use client";

import { motion } from "framer-motion";
import type { StoryBeat } from "@/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ChapterCopy({ beat }: { beat: StoryBeat }) {
  return (
    <section
      data-chapter
      data-label={beat.label}
      className="relative h-[100vh]"
    >
      <div className="sticky top-0 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="max-w-xl"
        >
          {beat.poem?.map((line, i) => (
            <p
              key={i}
              className="font-serif text-2xl leading-relaxed text-foreground/85 italic sm:text-3xl"
            >
              {line}
            </p>
          ))}

          {beat.spec && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 opacity-0 transition-opacity duration-500 hover:opacity-100 focus-within:opacity-100 md:opacity-40">
              {beat.spec.map((s) => (
                <span
                  key={s}
                  className="inline-block border border-foreground/20 px-2.5 py-0.5 font-sans text-[0.68rem] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {beat.cta && (
            <div className="mt-6">
              <a
                href={beat.cta.href}
                target={beat.cta.external ? "_blank" : undefined}
                rel={beat.cta.external ? "noreferrer" : undefined}
                className="inline-flex items-center gap-2 border border-glow/40 bg-glow/[0.06] px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase backdrop-blur-sm transition-colors hover:bg-glow/[0.12]"
              >
                {beat.cta.label}
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
