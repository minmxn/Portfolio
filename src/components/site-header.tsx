import Link from "next/link";
import { site } from "@/content";

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-foreground/90 transition-colors hover:text-foreground"
        >
          {site.name}
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-sans text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-glow"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
