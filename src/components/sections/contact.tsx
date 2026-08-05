import { Mail } from "lucide-react";
import { LinkedinIcon } from "@/components/icons";
import { SectionHeading } from "@/components/editorial/section-heading";
import { contact, edition, site } from "@/content";

export function Contact() {
  const meta = edition.sections.contact;
  return (
    <section id="contact" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <p className="font-serif max-w-2xl text-xl leading-relaxed md:text-2xl">
          {contact.blurb}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 font-sans text-xs tracking-[0.08em]">
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2 text-glow hover:underline"
          >
            <Mail className="size-4" />
            Email me
          </a>
          <a
            href={site.socials.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-glow hover:underline"
          >
            <LinkedinIcon className="size-4" />
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
