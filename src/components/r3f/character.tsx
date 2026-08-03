"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// Position and lookAt targets per section index 0..5.
// Section 0 = intro (beside the book), 1 = Ch01 (facing tangled knot),
// 2 = Ch02 (near pedestal), 3 = Ch03 (drifting through toolkit ring),
// 4 = Ch04 (base of pillar, tilted up), 5 = end (centred, calm).
const CHARACTER_POS: [number, number, number][] = [
  [1.4, -0.4, 0.0],
  [0.0, -0.4, 0.0],
  [1.2, -0.4, 0.5],
  [0.0, -0.4, 1.0],
  [0.0, -0.4, 0.0],
  [0.0, -0.4, 0.0],
];
const CHARACTER_LOOK_AT: [number, number, number][] = [
  [-0.6, 0.0, 0.0],   // book on the left
  [0.0, 0.2, 0.0],    // crystal in front
  [-0.8, 0.2, 0.0],   // pedestal to the left
  [0.0, 0.5, 0.0],    // ring around
  [0.0, 3.0, 0.0],    // beacon up
  [0.0, 1.5, 0.0],    // sunset ahead
];
const CHARACTER_ROT_Y: number[] = [-0.35, 0, -0.4, 0, 0, 0];

export function Character({ tier }: { tier: CapabilityTier }) {
  // Outer group: receives the per-section position/rotation lerp each frame.
  const outer = useRef<THREE.Group>(null);
  // Eyes group: rotates via lookAt each frame.
  const eyes = useRef<THREE.Group>(null);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!outer.current) return;

    // Interpolate between the two neighbouring section keyframes using the
    // global scroll progress. Same interp math as the camera rig.
    const sections = CHARACTER_POS.length; // 6
    const scaled = scrollState.progress * sections - 0.5;
    const i = THREE.MathUtils.clamp(Math.floor(scaled), 0, sections - 2);
    const t = THREE.MathUtils.clamp(scaled - i, 0, 1);
    const posA = CHARACTER_POS[i];
    const posB = CHARACTER_POS[i + 1];
    const lookA = CHARACTER_LOOK_AT[i];
    const lookB = CHARACTER_LOOK_AT[i + 1];
    const rotA = CHARACTER_ROT_Y[i];
    const rotB = CHARACTER_ROT_Y[i + 1];

    const targetX = THREE.MathUtils.lerp(posA[0], posB[0], t);
    const targetY = THREE.MathUtils.lerp(posA[1], posB[1], t);
    const targetZ = THREE.MathUtils.lerp(posA[2], posB[2], t);
    outer.current.position.x = THREE.MathUtils.damp(outer.current.position.x, targetX, 4, delta);
    outer.current.position.y = THREE.MathUtils.damp(outer.current.position.y, targetY, 4, delta);
    outer.current.position.z = THREE.MathUtils.damp(outer.current.position.z, targetZ, 4, delta);
    outer.current.rotation.y = THREE.MathUtils.damp(
      outer.current.rotation.y,
      THREE.MathUtils.lerp(rotA, rotB, t),
      4,
      delta,
    );

    // Eyes look toward the current focal point.
    if (eyes.current) {
      lookTarget.set(
        THREE.MathUtils.lerp(lookA[0], lookB[0], t),
        THREE.MathUtils.lerp(lookA[1], lookB[1], t) + 0.3, // eye height
        THREE.MathUtils.lerp(lookA[2], lookB[2], t),
      );
      eyes.current.lookAt(lookTarget);
    }
  });

  const bodyColor = "#111318";
  const eyeColor = "#f0f4ff";
  const eyeEmissive = tier === "full" ? 3 : 1.8;

  return (
    <group ref={outer}>
      {/* Inner group: idle breathing motion via <Float>. */}
      <Float speed={0.7} rotationIntensity={0.15} floatIntensity={0.35}>
        {/* Body: tapered cone */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 0.9, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.9} metalness={0} />
        </mesh>
        {/* Head + hood: slightly-flattened sphere extending down into body */}
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.95} metalness={0} />
        </mesh>
        {/* Hood extension: a slightly larger sphere behind the head, cut off
            below eye line to read as a hood silhouette. */}
        <mesh position={[0, 0.48, -0.04]} scale={[1.25, 1.15, 1.35]}>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.95} metalness={0} />
        </mesh>
        {/* Eyes: grouped so they can lookAt. Placed at the shaded front of the head. */}
        <group ref={eyes} position={[0, 0.55, 0]}>
          <mesh position={[-0.07, 0, 0.2]}>
            <sphereGeometry args={[0.028, 12, 10]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={eyeEmissive}
              roughness={0.2}
              metalness={0}
            />
          </mesh>
          <mesh position={[0.07, 0, 0.2]}>
            <sphereGeometry args={[0.028, 12, 10]} />
            <meshStandardMaterial
              color={eyeColor}
              emissive={eyeColor}
              emissiveIntensity={eyeEmissive}
              roughness={0.2}
              metalness={0}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}
