import { cn } from "@/lib/utils";

// Classic newspaper rule: a thick line stacked over a thin one.
export function Rule({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("space-y-[3px]", className)}>
      <div className="border-t-2 border-foreground/70" />
      <div className="border-t border-foreground/35" />
    </div>
  );
}
