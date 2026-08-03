import { Mail } from "lucide-react";
import { LinkedinIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/editorial/section-heading";
import { contact, edition, site } from "@/content";


export function Contact() {
  const meta = edition.sections.contact;
  return (
    <section
      id="contact"
      className="scroll-mt-20 border-t border-foreground/15 bg-muted/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <SectionHeading kicker={meta.kicker} title={meta.title} dek={meta.dek} />
        <div className="border-2 border-foreground/70 bg-background p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-center">
            <p className="font-serif text-xl leading-relaxed md:text-2xl">
              {contact.blurb}
            </p>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="justify-start rounded-none"
                nativeButton={false}
                render={<a href={`mailto:${site.email}`} />}
              >
                <Mail />
                Email me
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="justify-start rounded-none border-foreground/40"
                nativeButton={false}
                render={
                  <a
                    href={site.socials.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <LinkedinIcon />
                LinkedIn
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
