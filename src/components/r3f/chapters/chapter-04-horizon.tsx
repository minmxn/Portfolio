"use client";

// Chapter 04 - "What is next": skill nodes re-assemble upward into a dual-path
// ascending light beacon pointing toward the future. The camera tilts up to an
// open horizon (see camera-rig keyframe ch04). Ambient light blooms outward;
// two rising columns represent the PM + builder dual-path; a pulsing halo
// crowns the top.

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";

export function Chapter04Horizon({ tier }: { tier: CapabilityTier }) {
  const groupRef = useRef<THREE.Group>(null);
  const beaconARef = useRef<THREE.Mesh>(null); // PM path
  const beaconBRef = useRef<THREE.Mesh>(null); // Builder path
  const haloRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const groundRef = useRef<THREE.Mesh>(null);
  const matARef = useRef<THREE.MeshStandardMaterial>(null);
  const matBRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(4);
    if (!groupRef.current) return;

    groupRef.current.visible = p > 0.02;

    const reveal = THREE.MathUtils.smoothstep(p, 0.05, 0.65);
    const t = performance.now() * 0.001;

    // Two beacons rise from below.
    const beaconH = reveal * 3.8;
    [beaconARef.current, beaconBRef.current].forEach((b, i) => {
      if (!b) return;
      b.scale.y = 0.0001 + beaconH;
      // Drift them slightly apart as they rise.
      b.position.x = (i === 0 ? -0.55 : 0.55) * reveal;
    });

    // Emissive pulse — stronger near the crown.
    const pulse = 1 + Math.sin(t * 1.6) * 0.35 * reveal;
    if (matARef.current) matARef.current.emissiveIntensity = pulse * 1.2;
    if (matBRef.current) matBRef.current.emissiveIntensity = pulse * 1.0;

    // Halo ring expands and rotates.
    if (haloRef.current) {
      const haloScale = 0.0001 + reveal * 1.5;
      haloRef.current.scale.setScalar(haloScale);
      haloRef.current.rotation.z += delta * 0.35;
      haloRef.current.rotation.x += delta * 0.12;
    }

    // Corona outer ring (full tier only) — wide slow sweep.
    if (coronaRef.current) {
      coronaRef.current.scale.setScalar(0.0001 + reveal * 2.6);
      const mat = coronaRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = reveal * 0.18 * (0.7 + Math.sin(t * 0.7) * 0.3);
      coronaRef.current.rotation.z -= delta * 0.12;
    }

    // Horizon ground disc brightens.
    if (groundRef.current) {
      const gMat = groundRef.current.material as THREE.MeshStandardMaterial;
      gMat.emissiveIntensity = reveal * (0.15 + Math.sin(t * 0.9) * 0.06);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} visible={false}>
      {/* Horizon ground plane — large flat disc */}
      <mesh ref={groundRef} rotation-x={-Math.PI / 2} position-y={-2.2}>
        <circleGeometry args={[9, 80]} />
        <meshStandardMaterial
          color="#0a1628"
          emissive="#1a4fff"
          emissiveIntensity={0.15}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Beacon A — PM path (product manager) */}
      <mesh ref={beaconARef} position={[-0.55, 0.3, 0]}>
        <cylinderGeometry args={[0.055, 0.14, 1, 20]} />
        <meshStandardMaterial
          ref={matARef}
          color="#d0eeff"
          emissive="#5ab4ff"
          emissiveIntensity={1.2}
          roughness={0.18}
          metalness={0.3}
        />
      </mesh>

      {/* Beacon B — builder path */}
      <mesh ref={beaconBRef} position={[0.55, 0.3, 0]}>
        <cylinderGeometry args={[0.055, 0.14, 1, 20]} />
        <meshStandardMaterial
          ref={matBRef}
          color="#e8f8ff"
          emissive="#7acfff"
          emissiveIntensity={1.0}
          roughness={0.22}
          metalness={0.25}
        />
      </mesh>

      {/* Bridge ring connecting the two beacons at mid-height */}
      <mesh position={[0, 0.9, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.65, 0.018, 12, 80]} />
        <meshStandardMaterial
          color="#bbeeff"
          emissive="#4aa8ff"
          emissiveIntensity={1.4}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Crown halo ring */}
      <mesh ref={haloRef} position={[0, 2.4, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.42, 0.028, 14, 80]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#9de0ff"
          emissiveIntensity={2.0}
          roughness={0.0}
          metalness={0.1}
        />
      </mesh>

      {/* Outer corona — widest glow ring, full tier only */}
      {tier === "full" && (
        <mesh ref={coronaRef} position={[0, 2.4, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[1.1, 0.04, 8, 80]} />
          <meshBasicMaterial
            color="#5ab4ff"
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Ascending particle trail — small spheres that float upward */}
      {[...Array(tier === "full" ? 9 : 4)].map((_, i) => {
        const angle = (i / 9) * Math.PI * 2;
        const r = 0.3 + (i % 3) * 0.15;
        return (
          <FloatingOrb
            key={i}
            baseX={Math.cos(angle) * r}
            baseZ={Math.sin(angle) * r}
            phase={i * 0.7}
          />
        );
      })}
    </group>
  );
}

// A small glowing orb that bobs upward in the beacon's column.
function FloatingOrb({
  baseX,
  baseZ,
  phase,
}: {
  baseX: number;
  baseZ: number;
  phase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_) => {
    const p = chapterLocalProgress(4);
    if (!ref.current) return;
    const reveal = THREE.MathUtils.smoothstep(p, 0.2, 0.8);
    const t = (performance.now() * 0.0007 + phase) % (Math.PI * 2);
    ref.current.position.y = -1.5 + ((t / (Math.PI * 2)) * 4.5 * reveal);
    ref.current.scale.setScalar(reveal * (0.04 + Math.sin(t * 3) * 0.01));
  });

  return (
    <mesh ref={ref} position={[baseX, -1.5, baseZ]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color="#9de0ff"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
