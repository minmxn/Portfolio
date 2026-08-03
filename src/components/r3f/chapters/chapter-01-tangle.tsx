"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// Chapter 01 - "What I do": tangled low-poly wireframe knot morphs into a
// geometric crystal skeleton using Three.js morphAttributes. Toward the end
// of the chapter band, a transmission-material icosahedron emerges centred
// on the crystal position, giving the illusion of solid glass forming from
// the resolving lines.

const SEGMENT_COUNT = 80;

function makeTangledKnot(): Float32Array {
  // A trefoil knot with amplitude noise, sampled as line segments (pairs of
  // consecutive samples). Each vertex is 3 floats, each segment is 2 vertices.
  const positions = new Float32Array(SEGMENT_COUNT * 2 * 3);
  const noise = (i: number) =>
    Math.sin(i * 1.9) * 0.35 + Math.cos(i * 2.7) * 0.28;
  const sample = (t: number) => {
    const a = 0.85;
    const x = Math.sin(t) + 2 * Math.sin(2 * t) + noise(t * 3) * a;
    const y = Math.cos(t) - 2 * Math.cos(2 * t) + noise(t * 3 + 2) * a;
    const z = -Math.sin(3 * t) + noise(t * 3 + 4) * a;
    return [x * 0.28, y * 0.28, z * 0.28] as const;
  };
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const t0 = (i / SEGMENT_COUNT) * Math.PI * 2;
    const t1 = ((i + 1) / SEGMENT_COUNT) * Math.PI * 2;
    const p0 = sample(t0);
    const p1 = sample(t1);
    positions.set(p0, i * 6);
    positions.set(p1, i * 6 + 3);
  }
  return positions;
}

function makeCrystalSkeleton(): Float32Array {
  // An icosahedron's edges, sampled as line segments. Each edge is one segment.
  const geom = new THREE.IcosahedronGeometry(0.9, 0);
  const edges = new THREE.EdgesGeometry(geom);
  const attr = edges.getAttribute("position") as THREE.BufferAttribute;
  const source = attr.array as Float32Array;
  // We may not have exactly SEGMENT_COUNT * 2 vertices. If shorter, repeat the
  // last edge; if longer, truncate. This keeps buffer sizes matched with the
  // tangled buffer for morph compatibility.
  const target = new Float32Array(SEGMENT_COUNT * 2 * 3);
  for (let i = 0; i < target.length; i++) {
    target[i] = source[i % source.length];
  }
  geom.dispose();
  edges.dispose();
  return target;
}

export function Chapter01Tangle({ tier }: { tier: CapabilityTier }) {
  const group = useRef<THREE.Group>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const crystal = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const tangled = makeTangledKnot();
    const crystalSkel = makeCrystalSkeleton();
    // Base position is the tangled knot; morph target 0 is the crystal skeleton.
    g.setAttribute("position", new THREE.BufferAttribute(tangled, 3));
    g.morphAttributes.position = [new THREE.BufferAttribute(crystalSkel, 3)];
    return g;
  }, []);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(1);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    // Rotate the whole group slowly for parallax.
    group.current.rotation.y += delta * 0.12;

    // Morph from tangled (p=0) to crystal skeleton (p=0.7). Eased.
    if (lines.current) {
      const morph = Math.min(1, p / 0.7);
      const eased = morph * morph * (3 - 2 * morph);
      const infl = lines.current.morphTargetInfluences;
      if (infl) infl[0] = eased;
      // Line color brightens as morph completes.
      const mat = lines.current.material as THREE.LineBasicMaterial;
      const brightness = 0.35 + eased * 0.5;
      mat.color.setRGB(brightness * 0.7, brightness * 0.85, brightness * 1.0);
    }

    // Crystal solid appears in the back half (p 0.5 -> 1.0), scaling in.
    if (crystal.current) {
      const reveal = Math.max(0, Math.min(1, (p - 0.5) / 0.5));
      const s = reveal * 0.55;
      crystal.current.visible = reveal > 0.001;
      crystal.current.scale.setScalar(THREE.MathUtils.damp(crystal.current.scale.x, s, 3, delta));
      crystal.current.rotation.y -= delta * 0.2;
      crystal.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <lineSegments ref={lines} geometry={geometry}>
        <lineBasicMaterial color="#7fb3ff" transparent opacity={0.85} />
      </lineSegments>

      <mesh ref={crystal} position={[0, 0.1, 0]} visible={false}>
        <icosahedronGeometry args={[0.9, 0]} />
        {tier === "full" ? (
          <MeshTransmissionMaterial
            transmission={1}
            thickness={0.4}
            roughness={0.15}
            ior={1.4}
            chromaticAberration={0.05}
            color="#dfeeff"
          />
        ) : (
          <meshStandardMaterial
            color="#dfeeff"
            emissive="#88a4ff"
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.15}
            transparent
            opacity={0.7}
          />
        )}
      </mesh>
    </group>
  );
}
