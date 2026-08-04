"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { InteractiveObject } from "@/components/r3f/interactive-object";
import type { CapabilityTier } from "@/hooks/use-device-capability";

export function Chapter02Pedestal({ tier: _tier }: { tier: CapabilityTier }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(2);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // Chapter scale-in over first 30%
    const scaleIn = Math.min(1, p / 0.3);
    const s = scaleIn * scaleIn * (3 - 2 * scaleIn);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 3, delta));

    // Scroll-close: clear ch02 crack when outside chapter band
    if ((p <= 0 || p >= 1) && getActiveCrack() === "ch02-nomo") {
      setActiveCrack(null);
    }
  });

  return (
    <group ref={group} position={[-0.6, -0.2, 0]} scale={0.001}>
      <InteractiveObject
        id="ch02-nomo"
        label="Nomo"
        story="Built Nomo from zero. Designed in Figma, shipped in React. Proof that I don't just write specs."
        position={[0, 0, 0]}
        objectRadius={0.15}
        fallbackGeometry="box"
        color="#f5d18a"
        emissive="#f5d18a"
        baseEmissive={0.6}
      />
    </group>
  );
}
