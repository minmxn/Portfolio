"use client";

import { motion } from "framer-motion";
import type { StoryBeat } from "@/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ChapterCopy({ beat }: { beat: StoryBeat }) {
  return (
    <section
      data-chapter
      data-label={beat.label}
      className="relative h-[100vh] pointer-events-none"
    >
      <div className="sticky top-0 flex min-h-screen items-center px-6 md:pl-10 lg:pl-44">
        <div className="animate-float w-full max-w-[420px] pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-center md:text-left"
          >
            {beat.poem?.map((line, i) => (
              <p
                key={i}
                className="font-serif text-2xl leading-relaxed text-foreground/85 italic sm:text-3xl"
              >
                {line}
              </p>
            ))}

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
      </div>
    </section>
  );
}
