import { ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/editorial/section-heading";
import { certifications, edition } from "@/content";

function statusClass(status: string) {
  const base =
    "inline-flex h-fit w-fit items-center border px-2.5 py-1 font-sans text-[0.66rem] font-bold tracking-[0.1em] uppercase";
  return status.toLowerCase() === "completed"
    ? `${base} border-foreground bg-foreground text-background`
    : `${base} border-foreground/40 text-muted-foreground`;
}

export function Certifications() {
  const meta = edition.sections.certifications;
  return (
    <section
      id="certifications"
      className="scroll-mt-20 border-t border-foreground/15"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <div className="border-y-2 border-foreground/70">
          <div className="hidden grid-cols-[1.6fr_1fr_auto] gap-4 border-b border-foreground/25 py-2 font-sans text-[0.68rem] font-semibold tracking-[0.15em] text-muted-foreground uppercase md:grid">
            <span>Credential</span>
            <span>Issuer</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-foreground/15">
            {certifications.map((c) => (
              <li
                key={c.name}
                className="grid grid-cols-1 gap-2 py-4 md:grid-cols-[1.6fr_1fr_auto] md:items-baseline md:gap-4"
              >
                <div>
                  <p className="font-display text-lg font-semibold leading-snug">
                    {c.name}
                  </p>
                  {c.detail && (
                    <p className="font-serif mt-1 max-w-xl text-sm text-muted-foreground">
                      {c.detail}
                    </p>
                  )}
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 font-sans text-[0.68rem] font-semibold tracking-[0.12em] text-brand uppercase hover:underline"
                    >
                      Verify
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
                <p className="font-serif text-sm text-muted-foreground md:text-base">
                  {c.issuer}
                </p>
                <span className={statusClass(c.status)}>{c.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
