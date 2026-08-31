import { ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/editorial/section-heading";
import { certifications, edition } from "@/content";

export function Certifications() {
  const meta = edition.sections.certifications;
  return (
    <section id="certifications" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <ul className="flex flex-col gap-10">
          {certifications.map((c) => {
            const completed = c.status.toLowerCase() === "completed";
            return (
              <li key={c.name} className="max-w-3xl">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <p className="font-display text-lg font-semibold leading-snug">
                    {c.name}
                  </p>
                  <span
                    className={
                      completed
                        ? "font-sans text-xs tracking-[0.08em] text-muted-foreground"
                        : "font-sans text-xs tracking-[0.08em] text-foreground/70"
                    }
                  >
                    {c.status}
                  </span>
                </div>
                <p className="font-serif mt-1 text-sm text-muted-foreground">
                  {c.issuer}
                </p>
                {c.detail && (
                  <p className="font-serif mt-2 max-w-xl text-sm text-muted-foreground">
                    {c.detail}
                  </p>
                )}
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-sans text-xs tracking-[0.08em] text-glow hover:underline"
                  >
                    Verify
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
