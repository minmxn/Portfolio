import { Rule } from "@/components/editorial/rule";

// Shared editorial section header: a red kicker, a serif display title,
// an optional italic dek, and a newspaper rule.
export function SectionHeading({
  kicker,
  title,
  dek,
}: {
  kicker: string;
  title: string;
  dek?: string;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2.5">
        <span className="inline-block size-2 bg-brand" aria-hidden />
        <span className="font-sans text-xs font-semibold tracking-[0.2em] text-brand uppercase">
          {kicker}
        </span>
      </div>
      <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {dek && (
        <p className="font-serif mt-2 max-w-2xl text-lg text-muted-foreground italic">
          {dek}
        </p>
      )}
      <Rule className="mt-5" />
    </div>
  );
}
