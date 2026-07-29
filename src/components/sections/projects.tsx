import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projects } from "@/content";

export function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Projects
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A few things I have built and explored.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <Card
              key={p.slug}
              className="[--card-spacing:--spacing(6)] transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <CardDescription className="text-base">
                  {p.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{p.description}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-5 pt-1 text-sm font-medium">
                  {p.href && (
                    <Link
                      href={p.href}
                      className="inline-flex items-center gap-1 text-brand hover:underline"
                    >
                      Read the case study
                      <ArrowUpRight className="size-4" />
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
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
