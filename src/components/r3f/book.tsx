"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

const PAGE_MAX_ROTATIONS = [
  Math.PI * 0.16, // page 0 — bottom
  Math.PI * 0.36, // page 1
  Math.PI * 0.58, // page 2
  Math.PI * 0.80, // page 3
  Math.PI,        // page 4 — top
] as const;


export function BookIntro() {
  const group = useRef<THREE.Group>(null);
  const coverPivot = useRef<THREE.Group>(null);
  const pagePivots = useRef<(THREE.Group | null)[]>([null, null, null, null, null]);
  const halo = useRef<THREE.Mesh>(null);
  const glyphA = useRef<THREE.Mesh>(null);
  const glyphB = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(0);
    if (!group.current) return;

    // Presence fade — unchanged from v1
    const presence = 1 - Math.max(0, Math.min(1, (p - 0.6) / 0.4));
    group.current.visible = presence > 0.01;
    const s = 0.9 + (1 - presence) * 0.6;
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 3, delta));
    if (halo.current) {
      const mat = halo.current.material as THREE.MeshBasicMaterial;
      mat.opacity = presence * (0.35 + Math.sin(performance.now() * 0.001) * 0.1);
    }
    const emission = 0.8 + (1 - presence) * 3.5;
    for (const ref of [glyphA, glyphB]) {
      if (ref.current) {
        const mat = ref.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = emission;
      }
    }

    // Cover open: pivot rotates 0 → Math.PI across t 0.45 → 0.75
    if (coverPivot.current) {
      const targetRotation = smoothstep(0.45, 0.75, p) * Math.PI;
      coverPivot.current.rotation.z = THREE.MathUtils.damp(
        coverPivot.current.rotation.z,
        targetRotation,
        5,
        delta,
      );
    }

    // Page cascade fan: direct scroll-driven rotation, no smoothing
    const fanT = smoothstep(0.60, 0.92, p);
    for (let i = 0; i < 5; i++) {
      const pivot = pagePivots.current[i];
      if (pivot) pivot.rotation.z = PAGE_MAX_ROTATIONS[i] * fanT;
    }
  });

  const leather = "#3a2318";
  const pages = "#e8d9b3";
  const glyphMat = (
    <meshStandardMaterial
      color="#ffffff"
      emissive="#ffeecc"
      emissiveIntensity={1.2}
      roughness={0.3}
      metalness={0.2}
    />
  );

  return (
    <group ref={group} position={[-0.9, -0.6, 0.4]} rotation={[0, 0.3, 0]}>
      {/* Bottom cover — untouched */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Page cascade fan — 5 individual pages replacing the page block */}
      {([0.040, 0.050, 0.060, 0.070, 0.080] as const).map((yCenter, i) => (
        <group
          key={i}
          ref={(el) => { pagePivots.current[i] = el; }}
          position={[-0.32, yCenter, 0]}
        >
          <mesh position={[0.33, 0, 0]}>
            <boxGeometry args={[0.66, 0.01, 0.46]} />
            <meshStandardMaterial
              color={pages}
              roughness={0.9}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      {/* Spine — untouched */}
      <mesh position={[-0.34, 0.06, 0]}>
        <boxGeometry args={[0.03, 0.16, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Halo — untouched */}
      <mesh ref={halo} position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.62, 48]} />
        <meshBasicMaterial
          color="#e8c98c"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/*
        Cover pivot group.
        Origin at [-0.35, 0.12, 0] = left spine edge at cover height.
        Rotation around local Z swings the cover open.
        Top cover offset [0.35, 0, 0] keeps its left edge on the pivot origin.
        Glyphs offset [0.35, 0.04, 0] = original [0,0.16,0] minus pivot [−0.35,0.12,0].
      */}
      <group ref={coverPivot} position={[-0.35, 0.12, 0]}>
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.7, 0.06, 0.5]} />
          <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
        </mesh>
        <mesh ref={glyphA} position={[0.35, 0.04, 0]}>
          <boxGeometry args={[0.02, 0.005, 0.12]} />
          {glyphMat}
        </mesh>
        <mesh ref={glyphB} position={[0.35, 0.04, 0]}>
          <boxGeometry args={[0.12, 0.005, 0.02]} />
          {glyphMat}
        </mesh>
      </group>
    </group>
  );
}
