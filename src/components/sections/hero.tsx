import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hero } from "@/content";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {hero.highlights.map((h) => (
            <Badge key={h} variant="secondary">
              {h}
            </Badge>
          ))}
        </div>
        <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {hero.headline}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {hero.subhead}
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<a href={hero.primaryCta.href} />}
          >
            {hero.primaryCta.label}
            <ArrowRight />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={hero.secondaryCta.href}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
