import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/editorial/section-heading";
import { projects, edition } from "@/content";

export function Projects() {
  const meta = edition.sections.projects;
  return (
    <section id="projects" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <div className="flex flex-col gap-20">
          {projects.map((p) => (
            <article key={p.slug} className="max-w-3xl">
              <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {p.href ? (
                  <Link
                    href={p.href}
                    className="transition-colors hover:text-glow"
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
              <p className="font-serif mt-5 text-[1.05rem] leading-relaxed">
                {p.description}
              </p>
              <p className="font-sans mt-5 text-xs tracking-[0.08em] text-muted-foreground">
                {p.tags.join(" · ")}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 font-sans text-xs tracking-[0.08em]">
                {p.href && (
                  <Link
                    href={p.href}
                    className="inline-flex items-center gap-1 text-glow hover:underline"
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
