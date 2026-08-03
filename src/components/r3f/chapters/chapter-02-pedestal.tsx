"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// Chapter 02 - "What drives me": a low-poly pedestal appears; on top rotates
// an abstract interlocked torus-knot representing Nomo. Two warm-golden cone
// light shafts sweep across the pedestal, drawn additively so they read as
// light and not solid geometry.

export function Chapter02Pedestal({ tier }: { tier: CapabilityTier }) {
  const group = useRef<THREE.Group>(null);
  const knot = useRef<THREE.Mesh>(null);
  const shaftA = useRef<THREE.Mesh>(null);
  const shaftB = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(2);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // Pedestal group scales in during the first 30% of the chapter.
    const scaleIn = Math.min(1, p / 0.3);
    const s = scaleIn * scaleIn * (3 - 2 * scaleIn);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 3, delta));

    if (knot.current) {
      knot.current.rotation.y += delta * 0.35;
      knot.current.rotation.x += delta * 0.15;
    }

    // Light shafts sway slowly; opacity pulses.
    const t = performance.now() * 0.0006;
    if (shaftA.current) {
      const mat = shaftA.current.material as THREE.MeshBasicMaterial;
      shaftA.current.rotation.z = -0.35 + Math.sin(t) * 0.06;
      mat.opacity = 0.28 + Math.sin(t * 1.3) * 0.08;
    }
    if (shaftB.current) {
      const mat = shaftB.current.material as THREE.MeshBasicMaterial;
      shaftB.current.rotation.z = 0.35 + Math.cos(t) * 0.06;
      mat.opacity = 0.28 + Math.cos(t * 1.3) * 0.08;
    }
  });

  const pedestalColor = "#1a141c";
  const knotColor = "#f5d18a";
  const knotEmissive = tier === "full" ? 1.6 : 1.0;
  const shaftColor = "#f6d795";

  return (
    <group ref={group} position={[-0.6, -0.2, 0]} scale={0.001}>
      {/* Pedestal base (short wide cylinder) */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.35, 0.42, 0.12, 16]} />
        <meshStandardMaterial color={pedestalColor} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Pedestal column */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
        <meshStandardMaterial color={pedestalColor} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Nomo glyph: an abstract interlocked torus-knot floating above the pedestal */}
      <mesh ref={knot} position={[0, 0.55, 0]}>
        <torusKnotGeometry args={[0.14, 0.04, 96, 12, 2, 3]} />
        <meshStandardMaterial
          color={knotColor}
          emissive={knotColor}
          emissiveIntensity={knotEmissive}
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>
      {/* Two warm-golden light shafts: tall thin cones drawn additively */}
      <mesh ref={shaftA} position={[-0.35, 0.6, -0.2]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.28, 1.4, 24, 1, true]} />
        <meshBasicMaterial
          color={shaftColor}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={shaftB} position={[0.35, 0.6, -0.2]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.28, 1.4, 24, 1, true]} />
        <meshBasicMaterial
          color={shaftColor}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
