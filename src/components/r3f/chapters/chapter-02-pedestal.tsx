"use client";

// Chapter 02 - "What drives me": the camera zooms into the resolved structure,
// which opens into a showcase pedestal for the Nomo project. Dynamic light
// shafts sweep the pedestal; the whole group tilts with the mouse pointer for
// an interactive, alive feel.
//
// The pedestal is: a floating torus-knot "product glyph" above a round base
// disc, flanked by two volumetric light shafts (cone geometry, additive blend).
// The group idles with a slow breath and a gentle auto-yaw, intensified when
// the chapter is active.

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// How fast the tilt follows the pointer (damping factor).
const TILT_DAMP = 5;

export function Chapter02Pedestal({ tier }: { tier: CapabilityTier }) {
  const groupRef = useRef<THREE.Group>(null);
  const glyphRef = useRef<THREE.Mesh>(null);
  const shaft1Ref = useRef<THREE.Mesh>(null);
  const shaft2Ref = useRef<THREE.Mesh>(null);
  const baseRef = useRef<THREE.Mesh>(null);
  const tiltX = useRef(0);
  const tiltY = useRef(0);

  const { pointer } = useThree();

  useFrame((_, delta) => {
    const p = chapterLocalProgress(2);
    if (!groupRef.current) return;

    const reveal = THREE.MathUtils.smoothstep(p, 0.05, 0.5);
    groupRef.current.visible = reveal > 0.001;

    // Entire pedestal fades/scales in over the first half of the chapter.
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, reveal * 1.0, 6, delta),
    );

    // Slow auto-yaw; quietens once settled.
    if (glyphRef.current) {
      const spin = 0.18 + (1 - Math.min(p, 1)) * 0.3;
      glyphRef.current.rotation.y += delta * spin;
      glyphRef.current.rotation.x += delta * 0.07;
      // Gentle breath on the glyph scale.
      const breath = 1 + Math.sin(performance.now() * 0.0012) * 0.04;
      glyphRef.current.scale.setScalar(breath);
    }

    // Mouse-tilt the whole pedestal for the interactive feel.
    tiltX.current = THREE.MathUtils.damp(
      tiltX.current,
      -pointer.y * 0.32 * reveal,
      TILT_DAMP,
      delta,
    );
    tiltY.current = THREE.MathUtils.damp(
      tiltY.current,
      pointer.x * 0.32 * reveal,
      TILT_DAMP,
      delta,
    );
    groupRef.current.rotation.x = tiltX.current;
    groupRef.current.rotation.y = tiltY.current;

    // Light shafts sweep slowly and pulse with the breath.
    const shaftIntensity = 0.25 + Math.sin(performance.now() * 0.0008) * 0.12;
    [shaft1Ref.current, shaft2Ref.current].forEach((s, i) => {
      if (!s) return;
      const mat = s.material as THREE.MeshBasicMaterial;
      mat.opacity = shaftIntensity * reveal * (tier === "full" ? 1 : 0.6);
      s.rotation.z += delta * (i === 0 ? 0.04 : -0.06);
    });

    // Platform ring pulses.
    if (baseRef.current) {
      const baseMat = baseRef.current.material as THREE.MeshStandardMaterial;
      baseMat.emissiveIntensity =
        0.4 + Math.sin(performance.now() * 0.001 + 1) * 0.2 * reveal;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]} visible={false}>
      {/* Platform disc */}
      <mesh ref={baseRef} rotation-x={-Math.PI / 2} position-y={-1.5}>
        <cylinderGeometry args={[1.8, 2.0, 0.08, 64]} />
        <meshStandardMaterial
          color="#1a2a3a"
          emissive="#3a86ff"
          emissiveIntensity={0.4}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Product glyph — Nomo's identity: a torus knot (interconnected systems) */}
      <mesh ref={glyphRef} position={[0, 0.15, 0]}>
        <torusKnotGeometry args={[0.62, 0.19, 160, 28, 2, 3]} />
        <meshStandardMaterial
          color="#c8eeff"
          emissive="#5ab4ff"
          emissiveIntensity={1.1}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>

      {/* Light shaft left */}
      <mesh
        ref={shaft1Ref}
        position={[-1.1, 1.8, -0.5]}
        rotation={[0, 0, Math.PI / 5]}
      >
        <coneGeometry args={[0.18, 4.5, 12, 1, true]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Light shaft right */}
      <mesh
        ref={shaft2Ref}
        position={[1.1, 1.8, -0.5]}
        rotation={[0, 0, -Math.PI / 5]}
      >
        <coneGeometry args={[0.18, 4.5, 12, 1, true]} />
        <meshBasicMaterial
          color="#7ac4ff"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floating ring accent */}
      <mesh position={[0, 0.15, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.15, 0.012, 16, 100]} />
        <meshStandardMaterial
          color="#aaddff"
          emissive="#6fb8ff"
          emissiveIntensity={0.9}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}
