export type PromptCardProps = {
  variant: "style" | "scene";
  kicker: string;
  title?: string;
  text: string;
  caption: string;
};

export function PromptCard({
  variant,
  kicker,
  title,
  text,
  caption,
}: PromptCardProps) {
  // The style prompt gets the glow accent; the scene prompt gets a warm gold
  // accent (Kling's palette). Both accents are the left border only.
  const accent =
    variant === "style"
      ? "border-l-glow bg-glow/[0.04]"
      : "border-l-[oklch(0.78_0.14_75)] bg-[oklch(0.78_0.14_75)]/[0.04]";

  return (
    <figure className={`rounded-sm border-l-4 ${accent} border-y border-r border-foreground/10 p-6 md:p-8`}>
      <figcaption className="font-sans text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {kicker}
      </figcaption>
      {title && (
        <p className="font-sans mt-1 text-xs font-semibold tracking-[0.15em] text-foreground/70 uppercase">
          {title}
        </p>
      )}
      <blockquote className="font-serif mt-4 text-lg leading-relaxed text-foreground/90 md:text-xl">
        {text}
      </blockquote>
      <p className="font-sans mt-4 text-xs leading-relaxed text-muted-foreground">
        {caption}
      </p>
    </figure>
  );
}
