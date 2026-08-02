import Image from "next/image";
import type { CaseStudyKling } from "@/content";

type Reference = CaseStudyKling["references"][number];

export function KlingGallery({
  references,
}: {
  references: Reference[];
}) {
  const princeRefs = references.filter((r) => r.row === "prince");
  const foxRefs = references.filter((r) => r.row === "fox");

  return (
    <div className="space-y-10">
      <ReferenceRow label="Prince" refs={princeRefs} />
      <ReferenceRow label="Fox" refs={foxRefs} />
    </div>
  );
}

function ReferenceRow({
  label,
  refs,
}: {
  label: string;
  refs: Reference[];
}) {
  return (
    <div>
      <p className="font-sans text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {refs.map((ref) => (
          <figure key={ref.src} className="flex flex-col">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-sm border border-foreground/10 bg-muted/40">
              <Image
                src={ref.src}
                alt={ref.alt}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="font-serif mt-2 text-xs leading-snug text-muted-foreground">
              {ref.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
