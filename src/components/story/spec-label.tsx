"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeHoveredSpec } from "@/components/scroll/spec-hover-state";

export function SpecLabel() {
  const [spec, setSpec] = useState<string | null>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeHoveredSpec(setSpec);
    const onMove = (e: MouseEvent) => {
      if (labelRef.current) {
        labelRef.current.style.left = `${e.clientX + 14}px`;
        labelRef.current.style.top = `${e.clientY - 10}px`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      unsub();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  if (!spec) return null;

  return (
    <div
      ref={labelRef}
      className="pointer-events-none fixed z-[200] whitespace-nowrap border border-white/30 bg-black/70 px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.2s ease forwards" }}
    >
      {spec}
    </div>
  );
}
