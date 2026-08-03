import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { caseStudy } from "@/content";

export const metadata: Metadata = {
  title: `${caseStudy.name} | Case study`,
  description: caseStudy.tagline,
};

export default function NomoCaseStudy() {
  return (
    <article className="relative z-10 bg-background mx-auto max-w-3xl px-6 py-14 md:py-20">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-glow"
      >
        <ArrowLeft className="size-3.5" />
        Back to portfolio
      </Link>

      {/* Kicker */}
      <div className="mt-10 flex items-center gap-3 font-sans text-xs font-semibold tracking-[0.2em] text-glow uppercase">
        <span className="size-2 rounded-full bg-glow shadow-[0_0_10px_var(--glow)]" aria-hidden />
        Case study · Exhibit A
      </div>

      <h1 className="font-display mt-4 text-4xl leading-tight font-black tracking-tight text-balance sm:text-5xl">
        {caseStudy.name}
      </h1>
      <p className="font-serif mt-3 text-xl text-muted-foreground italic">
        {caseStudy.tagline}
      </p>

      {/* Stack */}
      <div className="mt-6 flex flex-wrap gap-2">
        {caseStudy.stack.map((s) => (
          <span
            key={s}
            className="font-sans border border-glow/30 bg-glow/5 px-2.5 py-0.5 text-[0.68rem] font-medium tracking-wide text-foreground/75 uppercase"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="font-sans mt-4 text-xs tracking-[0.1em] text-muted-foreground uppercase">
        Role: {caseStudy.role}
      </p>

      <div className="mt-6">
        <Button
          className="rounded-none"
          nativeButton={false}
          render={
            <a href={caseStudy.liveUrl} target="_blank" rel="noreferrer" />
          }
        >
          {caseStudy.liveLabel}
          <ExternalLink />
        </Button>
      </div>

      {/* Divider */}
      <div className="mt-10 space-y-[3px]" aria-hidden>
        <div className="border-t-2 border-foreground/30" />
        <div className="border-t border-foreground/15" />
      </div>

      {/* Sections */}
      <div className="mt-10 space-y-12">
        {caseStudy.sections.map((s, i) => (
          <section key={s.heading}>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {s.heading}
            </h2>
            {s.body && (
              <p
                className={`font-serif mt-3 text-lg leading-relaxed text-muted-foreground ${
                  i === 0 ? "dropcap" : ""
                }`}
              >
                {s.body}
              </p>
            )}
            {s.bullets && (
              <ul className="mt-4 space-y-3">
                {s.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="font-serif flex gap-3 text-lg leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-glow" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Footer nav */}
      <div className="mt-16 border-t border-foreground/15 pt-8 flex items-center justify-between">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-glow"
        >
          <ArrowLeft className="size-3.5" />
          All work
        </Link>
        <a
          href={caseStudy.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-glow uppercase transition-opacity hover:opacity-70"
        >
          {caseStudy.liveLabel}
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </article>
  );
}
