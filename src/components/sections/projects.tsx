import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/editorial/section-heading";
import { projects, edition } from "@/content";

const exhibitLabels = ["Exhibit A", "Exhibit B", "Exhibit C", "Exhibit D"];

export function Projects() {
  const meta = edition.sections.projects;
  return (
    <section
      id="projects"
      className="scroll-mt-20 border-t border-foreground/15 bg-muted/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <div className="divide-y divide-foreground/15">
          {projects.map((p, i) => (
            <article
              key={p.slug}
              className="grid gap-6 py-10 first:pt-0 md:grid-cols-[0.8fr_2.2fr] md:gap-10"
            >
              <div className="md:border-r md:border-foreground/12 md:pr-8">
                <p className="font-sans text-xs font-semibold tracking-[0.2em] text-brand uppercase">
                  {exhibitLabels[i] ?? "Exhibit"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="font-sans border border-foreground/25 px-2 py-0.5 text-[0.68rem] font-medium tracking-wide text-muted-foreground uppercase"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  {p.href ? (
                    <Link
                      href={p.href}
                      className="transition-colors hover:text-brand"
                    >
                      {p.name}
                    </Link>
                  ) : (
                    p.name
                  )}
                </h3>
                <p className="font-serif mt-1 text-lg text-muted-foreground italic">
                  {p.tagline}
                </p>
                <p className="font-serif mt-4 max-w-2xl text-[1.05rem] leading-relaxed">
                  {p.description}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-xs font-semibold tracking-[0.12em] uppercase">
                  {p.href && (
                    <Link
                      href={p.href}
                      className="inline-flex items-center gap-1 text-brand hover:underline"
                    >
                      Read the case study
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  )}
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {p.liveLabel ?? "Live"}
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
