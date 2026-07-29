import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { certifications } from "@/content";

export function Certifications() {
  return (
    <section id="certifications" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Certifications
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Credentials, and the ones I am working toward.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {certifications.map((c) => (
            <Card key={c.name} className="[--card-spacing:--spacing(6)]">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg leading-snug">
                    {c.name}
                  </CardTitle>
                  <Badge
                    variant={c.status === "Completed" ? "default" : "outline"}
                  >
                    {c.status}
                  </Badge>
                </div>
                <CardDescription>{c.issuer}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {c.detail && (
                  <p className="text-muted-foreground">{c.detail}</p>
                )}
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                  >
                    Verify
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
