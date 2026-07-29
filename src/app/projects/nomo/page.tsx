import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { caseStudy } from "@/content";

export const metadata: Metadata = {
  title: `${caseStudy.name} | Case study`,
  description: caseStudy.tagline,
};

export default function NomoCaseStudy() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      <header className="mt-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {caseStudy.name}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {caseStudy.tagline}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {caseStudy.stack.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Role: </span>
          {caseStudy.role}
        </p>
        <div className="mt-6">
          <Button
            nativeButton={false}
            render={
              <a href={caseStudy.liveUrl} target="_blank" rel="noreferrer" />
            }
          >
            {caseStudy.liveLabel}
            <ExternalLink />
          </Button>
        </div>
      </header>

      <div className="mt-12 space-y-10">
        {caseStudy.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {s.heading}
            </h2>
            {s.body && (
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            )}
            {s.bullets && (
              <ul className="mt-4 space-y-3">
                {s.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-lg leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
