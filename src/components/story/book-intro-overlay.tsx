"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { story } from "@/content";
import { scrollState } from "@/components/scroll/scroll-state";

const EASE = [0.22, 1, 0.36, 1] as const;

export function BookIntroOverlay() {
  const beat = story[0];
  const poem = beat.poem ?? [];

  const poemWrapRef = useRef<HTMLDivElement>(null);
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const hasFiredBurst = useRef(false);

  useEffect(() => {
    // Maps progress x from [from, to] → [0, 1], clamped.
    function lerp01(from: number, to: number, x: number): number {
      if (x <= from) return 0;
      if (x >= to) return 1;
      return (x - from) / (to - from);
    }

    let rafId: number;

    function tick() {
      const p = scrollState.progress;

      // SCROLL indicator: exit 0.075 → 0.085
      if (scrollWrapRef.current) {
        scrollWrapRef.current.style.opacity = String(1 - lerp01(0.075, 0.085, p));
      }

      // Poem text: exit 0.100 → 0.125
      if (poemWrapRef.current) {
        poemWrapRef.current.style.opacity = String(1 - lerp01(0.100, 0.125, p));
      }

      // Black overlay: fades in 0.153 → 0.167, fades out 0.167 → 0.200
      if (blackRef.current) {
        let opacity = 0;
        if (p >= 0.153 && p < 0.167) {
          opacity = lerp01(0.153, 0.167, p);
        } else if (p >= 0.167 && p < 0.200) {
          opacity = 1 - lerp01(0.167, 0.200, p);
        }
        blackRef.current.style.opacity = String(opacity);
      }

      // Light burst: one-shot radial flash fired the moment the black peaks.
      // Plays in real time (not scroll-driven) so it feels like an event, not a scrub.
      if (p >= 0.167 && !hasFiredBurst.current && burstRef.current) {
        hasFiredBurst.current = true;
        burstRef.current.animate(
          [
            { opacity: "1", transform: "scale(0.82)" },
            { opacity: "0.88", transform: "scale(1.05)", offset: 0.14 },
            { opacity: "0", transform: "scale(1.65)" },
          ],
          { duration: 900, easing: "ease-out", fill: "forwards" },
        );
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section
      data-chapter
      data-label={beat.label}
      className="relative h-[100vh]"
    >
      <div className="sticky top-0 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* poemWrapRef: receives scroll-driven opacity exit for poem text */}
        <div ref={poemWrapRef}>
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
            {/* scrollWrapRef: receives scroll-driven opacity exit for SCROLL indicator */}
            <div ref={scrollWrapRef}>
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
            </div>
          </motion.div>
        </div>
      </div>

      {/* Black overlay — covers entire viewport, z-50 sits above canvas (z-0) and story track */}
      <div
        ref={blackRef}
        className="fixed inset-0 z-50 bg-black pointer-events-none"
        style={{ opacity: 0 }}
      />

      {/* Light burst — gold radial flash on top of the black at the book-exit threshold */}
      <div
        ref={burstRef}
        className="fixed inset-0 z-[51] pointer-events-none"
        style={{
          opacity: 0,
          background:
            "radial-gradient(ellipse at center, rgba(255,245,205,0.97) 0%, rgba(255,215,80,0.6) 26%, rgba(200,140,30,0.2) 52%, transparent 70%)",
        }}
      />
    </section>
  );
}
