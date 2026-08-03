"use client";

// Client-only mount point for the WebGL scene. The Scene is dynamically imported
// with { ssr: false } from INSIDE this Client Component because Next.js 16 does
// not allow ssr:false in Server Components. The canvas is fixed and full-screen,
// sitting behind the HTML overlay track (which owns the scroll height).

import dynamic from "next/dynamic";
import type { CapabilityTier } from "@/hooks/use-device-capability";

const Scene = dynamic(() => import("./scene"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="fixed inset-0 z-0 ambient-glow"
    />
  ),
});

export function CanvasRoot({ tier }: { tier: CapabilityTier }) {
  return (
    <div aria-hidden className="fixed inset-0 z-0">
      <Scene tier={tier} />
    </div>
  );
}
