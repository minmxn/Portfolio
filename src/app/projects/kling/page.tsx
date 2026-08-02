import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { caseStudyKling } from "@/content";

export const metadata: Metadata = {
  title: `${caseStudyKling.name} | Case study`,
  description: caseStudyKling.tagline,
};

export default function KlingCaseStudy() {
  return (
    <article className="relative z-10 bg-background mx-auto max-w-3xl px-6 py-14 md:py-20">
      {/* Back nav */}
      <Link
        href="/#projects"
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-glow"
      >
        <ArrowLeft className="size-3.5" />
        Back to portfolio
      </Link>

      {/* Kicker */}
      <div className="mt-10 flex items-center gap-3 font-sans text-xs font-semibold tracking-[0.2em] text-glow uppercase">
        <span
          className="size-2 rounded-full bg-glow shadow-[0_0_10px_var(--glow)]"
          aria-hidden
        />
        Case study · Exhibit B
      </div>

      {/* Title and tagline */}
      <h1 className="font-display mt-4 text-4xl leading-tight font-black tracking-tight text-balance sm:text-5xl">
        {caseStudyKling.name}
      </h1>
      <p className="font-serif mt-3 text-xl text-muted-foreground italic">
        {caseStudyKling.tagline}
      </p>

      {/* Meta row */}
      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
        <div>
          <dt className="font-sans text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Role
          </dt>
          <dd className="font-serif mt-1 text-sm text-foreground/85">
            {caseStudyKling.role}
          </dd>
        </div>
        <div>
          <dt className="font-sans text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Tool
          </dt>
          <dd className="font-serif mt-1 text-sm text-foreground/85">
            {caseStudyKling.tool}
          </dd>
        </div>
        <div>
          <dt className="font-sans text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase">
            Duration
          </dt>
          <dd className="font-serif mt-1 text-sm text-foreground/85">
            {caseStudyKling.duration}
          </dd>
        </div>
      </dl>

      {/* Play film chevron */}
      <div className="mt-6">
        <a
          href="#film"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-glow uppercase transition-opacity hover:opacity-70"
        >
          Play the film
          <ChevronDown className="size-3.5" />
        </a>
      </div>

      {/* Divider */}
      <div className="mt-10 space-y-[3px]" aria-hidden>
        <div className="border-t-2 border-foreground/30" />
        <div className="border-t border-foreground/15" />
      </div>

      {/* Intent */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          The intent
        </h2>
        <p className="font-serif mt-3 text-lg leading-relaxed text-muted-foreground dropcap">
          {caseStudyKling.intent}
        </p>
      </section>
    </article>
  );
}
