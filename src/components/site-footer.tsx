import { Mail, Send } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { site } from "@/content";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-foreground/10 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="font-display text-xl font-bold tracking-tight text-glow">
            {site.name}
          </p>
          <div className="flex items-center gap-5 text-muted-foreground">
            <a
              href={site.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="transition-colors hover:text-brand"
            >
              <LinkedinIcon className="size-5" />
            </a>
            <a
              href={site.socials.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="transition-colors hover:text-brand"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href={site.socials.telegram}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="transition-colors hover:text-brand"
            >
              <Send className="size-5" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email"
              className="transition-colors hover:text-brand"
            >
              <Mail className="size-5" />
            </a>
          </div>
          <p className="font-sans max-w-md text-xs tracking-wide text-muted-foreground">
            {site.tagline}. Built in Singapore with Next.js and WebGL.
          </p>
          <p className="font-sans text-xs tracking-[0.1em] text-muted-foreground uppercase">
            © {year} {site.name} · {site.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
