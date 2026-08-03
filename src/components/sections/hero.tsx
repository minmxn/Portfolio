import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/editorial/rule";
import { hero, site } from "@/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-14 md:pt-14 md:pb-20">
        {/* kicker */}
        <div className="animate-rise flex items-center justify-center gap-3 font-sans text-xs font-semibold tracking-[0.2em] text-brand uppercase">
          <span className="h-px w-8 bg-brand/60" aria-hidden />
          {hero.kicker}
          <span className="h-px w-8 bg-brand/60" aria-hidden />
        </div>

        {/* banner headline */}
        <h1
          className="animate-rise font-display mx-auto mt-5 max-w-4xl text-center text-4xl leading-[1.03] font-black tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ animationDelay: "60ms" }}
        >
          {hero.headline}
        </h1>

        {/* deck */}
        <p
          className="animate-rise font-serif mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground sm:text-xl"
          style={{ animationDelay: "120ms" }}
        >
          {hero.subhead}
        </p>

        {/* byline */}
        <div
          className="animate-rise mt-6 flex items-center justify-center gap-3 font-sans text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
          style={{ animationDelay: "160ms" }}
        >
          <span className="h-px w-6 bg-foreground/30" aria-hidden />
          {hero.byline}
          <span className="h-px w-6 bg-foreground/30" aria-hidden />
        </div>

        <Rule className="mt-9" />

        {/* front page body */}
        <div className="mt-9 grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="dropcap font-serif text-lg leading-relaxed">
              {hero.lede}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-none"
                nativeButton={false}
                render={<a href={hero.primaryCta.href} />}
              >
                {hero.primaryCta.label}
                <ArrowRight />
              </Button>
            </div>
          </div>

          <aside className="md:border-l md:border-foreground/15 md:pl-8">
            <h2 className="font-sans text-xs font-semibold tracking-[0.2em] text-brand uppercase">
              In this edition
            </h2>
            <ul className="mt-4 divide-y divide-foreground/10">
              {site.nav.map((item, i) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group flex items-baseline gap-3 py-2.5"
                  >
                    <span className="font-sans text-xs font-semibold text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-brand">
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
