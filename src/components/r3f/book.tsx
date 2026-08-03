"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

export function BookIntro() {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const glyphA = useRef<THREE.Mesh>(null);
  const glyphB = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(0);
    if (!group.current) return;
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
  });

  const leather = "#3a2318";
  const pages = "#e8d9b3";
  const glyphMat = <meshStandardMaterial color="#ffffff" emissive="#ffeecc" emissiveIntensity={1.2} roughness={0.3} metalness={0.2} />;

  return (
    <group ref={group} position={[-0.9, -0.6, 0.4]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[0.01, 0.06, 0]}>
        <boxGeometry args={[0.66, 0.05, 0.46]} />
        <meshStandardMaterial color={pages} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[-0.34, 0.06, 0]}>
        <boxGeometry args={[0.03, 0.16, 0.5]} />
        <meshStandardMaterial color={leather} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh ref={glyphA} position={[0, 0.16, 0]}>
        <boxGeometry args={[0.02, 0.005, 0.12]} />
        {glyphMat}
      </mesh>
      <mesh ref={glyphB} position={[0, 0.16, 0]}>
        <boxGeometry args={[0.12, 0.005, 0.02]} />
        {glyphMat}
      </mesh>
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
    </group>
  );
}
