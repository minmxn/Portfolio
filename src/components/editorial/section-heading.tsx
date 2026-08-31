// Shared section header: a quiet cyan kicker, a serif display title, and an
// optional italic dek. No bullet, no rule — whitespace separates sections.
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
    <div className="mb-14">
      <span className="font-sans text-xs tracking-[0.12em] text-glow">
        {kicker}
      </span>
      <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {dek && (
        <p className="font-serif mt-3 max-w-2xl text-lg text-muted-foreground italic">
          {dek}
        </p>
      )}
    </div>
  );
}
