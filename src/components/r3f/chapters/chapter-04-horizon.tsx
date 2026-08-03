"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

// Chapter 04 - "What is next": a tall pillar of light rises. A second, fainter
// pillar sits behind it (the dual "PM + builder" paths). Small additive particle
// orbs rise from the base as the chapter progresses.

const ORB_COUNT = 12;

export function Chapter04Horizon() {
  const group = useRef<THREE.Group>(null);
  const pillarA = useRef<THREE.Mesh>(null);
  const pillarB = useRef<THREE.Mesh>(null);
  const orbGroup = useRef<THREE.Group>(null);
  const orbPhases = useMemo(
    () => Array.from({ length: ORB_COUNT }, (_, i) => (i / ORB_COUNT) * Math.PI * 2),
    [],
  );

  useFrame((_, delta) => {
    const p = chapterLocalProgress(4);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // Pillars rise and brighten across the chapter.
    const rise = Math.min(1, p / 0.7);
    const eased = rise * rise * (3 - 2 * rise);
    if (pillarA.current) {
      pillarA.current.scale.y = 0.05 + eased * 4.5;
      pillarA.current.position.y = -0.3 + pillarA.current.scale.y * 0.5;
      const mat = pillarA.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + eased * 0.75;
    }
    if (pillarB.current) {
      pillarB.current.scale.y = 0.05 + eased * 3.5;
      pillarB.current.position.y = -0.3 + pillarB.current.scale.y * 0.5;
      const mat = pillarB.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + eased * 0.35;
    }

    if (orbGroup.current) {
      const t = performance.now() * 0.001;
      orbGroup.current.children.forEach((child, i) => {
        const phase = orbPhases[i];
        // Each orb travels from y=-0.4 to y=3, staggered by phase.
        const life = ((t * 0.3 + phase) % (Math.PI * 2)) / (Math.PI * 2); // 0..1
        child.position.y = -0.4 + life * 3.4;
        child.position.x = Math.sin(phase * 3 + t * 0.2) * 0.12;
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = Math.sin(life * Math.PI) * eased * 0.85;
      });
    }
  });

  const glow = "#f6c48a"; // warm sunset gold

  return (
    <group ref={group} position={[0, 0, -0.3]}>
      {/* Main pillar */}
      <mesh ref={pillarA} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1, 16, 1, true]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Second pillar (dual path hint) */}
      <mesh ref={pillarB} position={[0.35, 0, -0.15]}>
        <cylinderGeometry args={[0.05, 0.08, 1, 12, 1, true]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={0.03}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Rising particle orbs */}
      <group ref={orbGroup}>
        {orbPhases.map((_, i) => (
          <mesh key={i} position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial
              color={glow}
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
