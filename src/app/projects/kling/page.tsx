import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { caseStudyKling } from "@/content";
import { KlingGallery } from "@/components/kling/kling-gallery";
import { KlingVideo } from "@/components/kling/kling-video";
import { PromptCard } from "@/components/kling/prompt-card";

export const metadata: Metadata = {
  title: `${caseStudyKling.name} | Case study`,
  description: caseStudyKling.tagline,
};

function LearningEntry({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  const isPending = body.startsWith("Pending.");
  return (
    <div>
      <h3 className="font-display text-lg font-semibold tracking-tight">
        {heading}
      </h3>
      <p
        className={`font-serif mt-2 text-base leading-relaxed ${
          isPending
            ? "text-muted-foreground/60 italic"
            : "text-muted-foreground"
        }`}
      >
        {body}
      </p>
    </div>
  );
}

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

      {/* Character reference sheets */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Character reference sheets
        </h2>
        <p className="font-serif mt-3 text-base leading-relaxed text-muted-foreground">
          Reference sheets are the substance of a character consistency case
          study. The Prince starts from a single seed image, then Kling has to
          reproduce him from other angles. The Fox is his companion in the
          story.
        </p>
        <div className="mt-8">
          <KlingGallery references={caseStudyKling.references} />
        </div>
      </section>

      {/* The prompts (headline exhibit) */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          The prompts
        </h2>
        <p className="font-serif mt-3 text-base leading-relaxed text-muted-foreground">
          The prompt is the craft in generative video. These are the actual
          prompts I used, quoted verbatim.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <PromptCard
            variant="style"
            kicker="Style prompt · pinned to every scene"
            text={caseStudyKling.prompts.style.text}
            caption={caseStudyKling.prompts.style.caption}
          />
          {caseStudyKling.prompts.scenes.map((scene) => (
            <PromptCard
              key={scene.title}
              variant="scene"
              kicker="Scene prompt · example beat"
              title={scene.title}
              text={scene.text}
              caption={scene.caption}
            />
          ))}
        </div>

        <p className="font-serif mt-8 text-base leading-relaxed text-muted-foreground">
          {caseStudyKling.patternExplainer}
        </p>
      </section>

      {/* The film */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          The film
        </h2>
        <div className="mt-6">
          <KlingVideo
            src={caseStudyKling.video.src}
            poster={caseStudyKling.video.poster}
            caption={caseStudyKling.video.caption}
          />
        </div>
      </section>

      {/* What I learned */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          What I learned
        </h2>
        <div className="mt-6 space-y-8">
          <LearningEntry
            heading="What surprised me"
            body={caseStudyKling.learnings.surprised}
          />
          <LearningEntry
            heading="The limits I hit"
            body={caseStudyKling.learnings.limits}
          />
          <LearningEntry
            heading="What I would use this for"
            body={caseStudyKling.learnings.useFor}
          />
        </div>
      </section>

      {/* Meta credit */}
      <p className="font-sans mt-14 text-xs leading-relaxed tracking-wide text-muted-foreground/80">
        {caseStudyKling.metaCredit}
      </p>

      {/* Footer nav */}
      <div className="mt-8 border-t border-foreground/15 pt-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-glow"
        >
          <ArrowLeft className="size-3.5" />
          All work
        </Link>
        <Link
          href="/projects/nomo"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold tracking-[0.12em] text-glow uppercase transition-opacity hover:opacity-70"
        >
          See Nomo case study
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
