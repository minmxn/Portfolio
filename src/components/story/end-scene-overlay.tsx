"use client";

import { motion } from "framer-motion";
import { site, story } from "@/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export function EndSceneOverlay() {
  const beat = story[5];
  const poem = beat.poem ?? [];

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
          <p className="font-serif text-2xl leading-relaxed text-foreground/90 italic sm:text-3xl">
            {poem.join(" ")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-glow/40 bg-glow/[0.06] px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase backdrop-blur-sm transition-colors hover:bg-glow/[0.12]"
            >
              LinkedIn
            </a>
            <a
              href={site.socials.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-glow/40 bg-glow/[0.06] px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase backdrop-blur-sm transition-colors hover:bg-glow/[0.12]"
            >
              GitHub
            </a>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 border border-glow/40 bg-glow/[0.06] px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase backdrop-blur-sm transition-colors hover:bg-glow/[0.12]"
            >
              Email
            </a>
          </div>
          {beat.cta && (
            <a
              href={beat.cta.href}
              className="mt-8 inline-flex items-center gap-1.5 font-sans text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              {beat.cta.label}
              <span aria-hidden>↓</span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
