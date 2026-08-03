"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

// Chapter 03 - "My toolkit": six low-poly abstract icons float in a loose ring
// around the character at slightly different heights. Each icon is a near-
// black silhouette by default; as the camera pans across the chapter, they
// illuminate one after another (emissive fades on, small halo appears).

const RADIUS = 1.6;
const ITEMS = 6;

function IconMesh({
  index,
  geometryKind,
}: {
  index: number;
  geometryKind: "tetra" | "torus" | "box" | "octa" | "cone" | "ico";
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const angle = (index / ITEMS) * Math.PI * 2;
  const baseX = Math.cos(angle) * RADIUS;
  const baseZ = Math.sin(angle) * RADIUS - 0.4;
  const baseY = ((index % 3) - 1) * 0.25;

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);
    if (!mesh.current) return;
    // Illumination sweeps across the ring in scroll order.
    const start = index / ITEMS;
    const end = start + 0.35;
    const local = Math.max(0, Math.min(1, (p - start) / (end - start)));
    const eased = local * local * (3 - 2 * local);

    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.05 + eased * 2.2;
    // Slight bob and spin.
    const t = performance.now() * 0.0007;
    mesh.current.position.y = baseY + Math.sin(t + index) * 0.08;
    mesh.current.rotation.y += delta * (0.25 + index * 0.03);
    mesh.current.rotation.x += delta * 0.08;

    if (halo.current) {
      const hMat = halo.current.material as THREE.MeshBasicMaterial;
      hMat.opacity = eased * 0.4;
      halo.current.scale.setScalar(0.7 + eased * 0.35);
    }
  });

  const color = "#b8d8ff";
  const emissive = "#7fb3ff";

  return (
    <group position={[baseX, baseY, baseZ]}>
      <mesh ref={mesh}>
        {geometryKind === "tetra" && <tetrahedronGeometry args={[0.16, 0]} />}
        {geometryKind === "torus" && <torusGeometry args={[0.14, 0.04, 12, 32]} />}
        {geometryKind === "box" && <boxGeometry args={[0.22, 0.22, 0.22]} />}
        {geometryKind === "octa" && <octahedronGeometry args={[0.18, 0]} />}
        {geometryKind === "cone" && <coneGeometry args={[0.14, 0.28, 4]} />}
        {geometryKind === "ico" && <icosahedronGeometry args={[0.17, 0]} />}
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.05} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.30, 24]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function Chapter03Toolkit() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);
    if (!group.current) return;
    group.current.visible = p > 0.001;
    group.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      <IconMesh index={0} geometryKind="tetra" />
      <IconMesh index={1} geometryKind="torus" />
      <IconMesh index={2} geometryKind="box" />
      <IconMesh index={3} geometryKind="octa" />
      <IconMesh index={4} geometryKind="cone" />
      <IconMesh index={5} geometryKind="ico" />
    </group>
  );
}
