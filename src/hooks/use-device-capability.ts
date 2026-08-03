"use client";

// Resolves the quality tier for the 3D narrative from the visitor's device and
// accessibility preferences. SSR-safe: returns "static" on the server and until
// the first client effect runs, so nothing WebGL is ever attempted during
// prerender and reduced-motion users never see a canvas.

import { useEffect, useState } from "react";

export type CapabilityTier = "full" | "reduced" | "static";

function resolveTier(): CapabilityTier {
  if (typeof window === "undefined") return "static";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) return "static";

  // Weak hardware or a small/coarse-pointer device gets a lighter canvas.
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;

  // Very constrained: skip WebGL entirely, serve the static narrative.
  if (cores <= 2 || (memory !== undefined && memory <= 2)) return "static";

  if (coarsePointer || narrow || cores <= 4 || (memory !== undefined && memory <= 4)) {
    return "reduced";
  }

  return "full";
}

export function useDeviceCapability(): CapabilityTier {
  // Start at "static" so server and first client render agree (no hydration
  // mismatch), then upgrade once we can read the real environment.
  const [tier, setTier] = useState<CapabilityTier>("static");

  useEffect(() => {
    setTier(resolveTier());

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setTier(resolveTier());
    motionQuery.addEventListener("change", onChange);
    return () => motionQuery.removeEventListener("change", onChange);
  }, []);

  return tier;
}
