"use client";

// Canvas-free version of the narrative for reduced-motion visitors and weak
// devices. Same copy, no WebGL, no scroll scrubbing: chapters simply stack on a
// soft ambient gradient and fade in on view. There is no <canvas> in the DOM on
// this path, so nothing WebGL is ever downloaded or run.

import { motion } from "framer-motion";
import { story, hero, site } from "@/content";

export function StaticNarrative() {
  return (
    <div className="ambient-glow relative">
      {/* Static landing header */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl">
          <p className="font-sans text-xs font-semibold tracking-[0.3em] text-glow uppercase">
            {site.location} · Portfolio
          </p>
          <h1 className="font-display mt-5 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
            {site.name}
          </h1>
          <p className="font-serif mt-5 text-xl leading-relaxed text-muted-foreground italic sm:text-2xl">
            {hero.headline}
          </p>
          <p className="font-sans mt-5 text-sm leading-relaxed text-muted-foreground/80">
            {hero.subhead}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-32">
        {story.map((beat, i) => (
          <motion.section
            key={beat.kicker}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={i > 0 ? "mt-28 md:mt-36" : ""}
          >
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-glow" />
              <span className="font-sans text-xs font-semibold tracking-[0.28em] text-glow uppercase">
                {beat.kicker}
              </span>
              <span className="h-px flex-1 bg-foreground/15" aria-hidden />
              <span className="font-sans text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                {beat.label}
              </span>
            </div>

            <h2 className="font-display mt-6 text-3xl leading-[1.1] font-black tracking-tight text-balance text-foreground sm:text-4xl">
              {beat.title}
            </h2>

            {beat.poem && (
              <div className="mt-6 space-y-2 border-l-2 border-glow/40 pl-4">
                {beat.poem.map((line, k) => (
                  <p
                    key={k}
                    className="font-serif text-lg italic leading-relaxed text-foreground/85"
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-4 font-serif text-lg leading-relaxed text-muted-foreground">
              {beat.lines.map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>

            {beat.spec && (
              <div className="mt-5 flex flex-wrap gap-2">
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

            {beat.skills && (
              <div className="mt-7 flex flex-wrap gap-2.5">
                {beat.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-block border border-glow/30 bg-glow/5 px-3 py-1 font-sans text-xs font-medium tracking-wide text-foreground/80 uppercase"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {beat.cta && (
              <div className="mt-7">
                <a
                  href={beat.cta.href}
                  target={beat.cta.external ? "_blank" : undefined}
                  rel={beat.cta.external ? "noreferrer" : undefined}
                  className="inline-flex items-center gap-2 border border-glow/50 bg-glow/10 px-5 py-2.5 font-sans text-xs font-semibold tracking-[0.15em] text-glow uppercase"
                >
                  {beat.cta.label}
                </a>
              </div>
            )}
          </motion.section>
        ))}
      </div>
    </div>
  );
}
