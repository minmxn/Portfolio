"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

// End scene: peaceful sunset. The Chapter 04 pillar has faded; a soft glow
// hangs where it was. Small drifting particles rise gently.

const DRIFT_COUNT = 16;

export function EndScene() {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const drift = useRef<THREE.Group>(null);
  const phases = useMemo(
    () => Array.from({ length: DRIFT_COUNT }, () => Math.random() * Math.PI * 2),
    [],
  );

  useFrame((_, delta) => {
    const p = chapterLocalProgress(5);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // The glow pulses gently, opacity ramping in during the first 30% of end band.
    const presence = Math.min(1, p / 0.3);
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      mat.opacity = presence * (0.28 + Math.sin(performance.now() * 0.0008) * 0.08);
      glow.current.scale.setScalar(1 + Math.sin(performance.now() * 0.0006) * 0.06);
    }
    // Drifting particles.
    if (drift.current) {
      const t = performance.now() * 0.001;
      drift.current.children.forEach((child, i) => {
        const phase = phases[i];
        const life = ((t * 0.15 + phase) % (Math.PI * 2)) / (Math.PI * 2);
        child.position.y = -0.5 + life * 2.5;
        child.position.x = Math.sin(phase * 5) * 0.8 + Math.sin(t * 0.2 + i) * 0.05;
        child.position.z = Math.cos(phase * 5) * 0.4;
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(life * Math.PI) * presence * 0.6;
      });
    }
  });

  const warmGlow = "#f6b979";

  return (
    <group ref={group} position={[0, 0, -0.2]}>
      {/* Soft glow disk where the pillar was */}
      <mesh ref={glow} position={[0, 1.2, -0.3]}>
        <sphereGeometry args={[0.5, 24, 20]} />
        <meshBasicMaterial
          color={warmGlow}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Drifting particles */}
      <group ref={drift}>
        {phases.map((_, i) => (
          <mesh key={i} position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial
              color={warmGlow}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
