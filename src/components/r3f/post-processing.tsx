"use client";

import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// Post-processing stack per the shining spec:
// - Bloom on selective bright pixels (eyes, glyphs, torus-knot, pillar, halos).
// - Vignette darkens the edges to focus the eye on the character.
// - Noise adds subtle film grain, turning flat gradients into storybook canvas.
//
// Full tier: all three. Reduced tier: Vignette + softer Bloom, no Noise.

export function PostFX({ tier }: { tier: CapabilityTier }) {
  const isFull = tier === "full";
  return (
    <EffectComposer>
      <Bloom
        intensity={isFull ? 1.5 : 0.9}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.1} darkness={0.9} />
      {isFull ? (
        <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
      ) : (
        <></>
      )}
    </EffectComposer>
  );
}
