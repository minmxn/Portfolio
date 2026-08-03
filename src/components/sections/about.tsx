import { SectionHeading } from "@/components/editorial/section-heading";
import { about, edition } from "@/content";

export function About() {
  const meta = edition.sections.about;
  return (
    <section id="about" className="scroll-mt-20 border-t border-foreground/15">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <div className="grid gap-12 md:grid-cols-[1.7fr_1fr]">
          <div className="font-serif text-lg leading-relaxed">
            {about.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "dropcap" : "mt-5"}>
                {p}
              </p>
            ))}
          </div>
          <aside className="md:border-l md:border-foreground/15 md:pl-8">
            <h3 className="font-sans text-xs font-semibold tracking-[0.2em] text-brand uppercase">
              Areas of coverage
            </h3>
            <ul className="mt-4 divide-y divide-foreground/10 border-y border-foreground/10">
              {about.skills.map((s) => (
                <li key={s} className="font-serif py-2.5 text-[0.95rem]">
                  {s}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
