import { Badge } from "@/components/ui/badge";
import { about } from "@/content";

export function About() {
  return (
    <section id="about" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {about.heading}
        </h2>
        <div className="mt-8 grid gap-12 md:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Skills
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {about.skills.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
