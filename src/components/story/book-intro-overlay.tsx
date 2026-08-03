"use client";

import { motion } from "framer-motion";
import { story } from "@/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export function BookIntroOverlay() {
  const beat = story[0];
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
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          className="max-w-xl"
        >
          <p className="font-serif text-2xl leading-relaxed text-foreground/85 italic sm:text-3xl">
            {poem.join(" ")}
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
            className="mt-8 flex flex-col items-center gap-2 text-muted-foreground/60"
          >
            <span className="font-sans text-[0.6rem] tracking-[0.25em] uppercase">Scroll</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="block h-6 w-px bg-gradient-to-b from-glow/60 to-transparent"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
