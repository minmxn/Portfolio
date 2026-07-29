import { FileText, Mail } from "lucide-react";
import { LinkedinIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { contact, site } from "@/content";

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {contact.heading}
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {contact.blurb}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<a href={`mailto:${site.email}`} />}
          >
            <Mail />
            Email me
          </Button>
          <Button
            size="lg"
            variant="outline"
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
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<a href={site.resumeUrl} target="_blank" rel="noreferrer" />}
          >
            <FileText />
            Resume
          </Button>
        </div>
      </div>
    </section>
  );
}
