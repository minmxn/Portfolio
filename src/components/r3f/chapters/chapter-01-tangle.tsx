"use client";

// Chapter 01 - "What I do": a tangled, chaotic web of glowing lines that
// straightens and snaps into a structured, illuminated glass icosahedron as the
// chapter scrolls. Driven entirely by the shared scroll-state (chapter 0's
// local progress) inside useFrame, so it never triggers a React re-render.

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import { createLineMorphMaterial } from "../materials/line-morph-material";
import type { CapabilityTier } from "@/hooks/use-device-capability";

const NODE_COUNT = 170;
const STRUCTURE_RADIUS = 2.15;
// Ring offsets that connect each node to a few others, forming a web.
const LINKS = [1, 7, 23, 54];

// Deterministic pseudo-random so the tangle is stable across renders/SSR.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGeometry() {
  const rand = mulberry32(1337);

  // Ordered: nodes distributed evenly on a sphere (Fibonacci lattice).
  const ordered: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    ordered.push(
      new THREE.Vector3(
        Math.cos(theta) * r,
        y,
        Math.sin(theta) * r,
      ).multiplyScalar(STRUCTURE_RADIUS),
    );
  }

  // Tangled: chaotic cloud, each node flung to a random spot with extra noise.
  const tangled: THREE.Vector3[] = ordered.map(() => {
    const u = rand();
    const v = rand();
    const radius = 1.6 + rand() * 2.6;
    const t = Math.acos(2 * u - 1);
    const p = 2 * Math.PI * v;
    return new THREE.Vector3(
      Math.sin(t) * Math.cos(p) * radius,
      Math.cos(t) * radius * 1.15,
      Math.sin(t) * Math.sin(p) * radius,
    );
  });

  const positions: number[] = [];
  const tangledAttr: number[] = [];
  const pushPair = (a: number, b: number) => {
    positions.push(ordered[a].x, ordered[a].y, ordered[a].z);
    positions.push(ordered[b].x, ordered[b].y, ordered[b].z);
    tangledAttr.push(tangled[a].x, tangled[a].y, tangled[a].z);
    tangledAttr.push(tangled[b].x, tangled[b].y, tangled[b].z);
  };

  for (let i = 0; i < NODE_COUNT; i++) {
    for (const link of LINKS) {
      pushPair(i, (i + link) % NODE_COUNT);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute(
    "aTangled",
    new THREE.Float32BufferAttribute(tangledAttr, 3),
  );
  return geometry;
}

export function Chapter01Tangle({ tier }: { tier: CapabilityTier }) {
  const groupRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(buildGeometry, []);
  const material = useMemo(() => createLineMorphMaterial(), []);
  materialRef.current = material;

  useFrame((_, delta) => {
    const p = chapterLocalProgress(1);

    material.uniforms.uProgress.value = p;

    if (groupRef.current) {
      // Chaotic tumble that calms as the structure resolves.
      const spin = (1 - p) * 0.5 + 0.06;
      groupRef.current.rotation.y += delta * spin;
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        (1 - p) * 0.35,
        3,
        delta,
      );
    }

    if (glassRef.current) {
      // Glass core emerges only in the back half, once lines have ordered.
      const reveal = THREE.MathUtils.smoothstep(p, 0.55, 1);
      const s = 0.0001 + reveal * 1.35;
      glassRef.current.scale.setScalar(s);
      glassRef.current.visible = reveal > 0.001;
      glassRef.current.rotation.y -= delta * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} material={material} frustumCulled={false} />

      <mesh ref={glassRef} visible={false}>
        <icosahedronGeometry args={[1, 0]} />
        {tier === "full" ? (
          <MeshTransmissionMaterial
            transmission={1}
            thickness={0.6}
            roughness={0.08}
            ior={1.4}
            chromaticAberration={0.06}
            anisotropy={0.2}
            distortion={0.2}
            distortionScale={0.3}
            temporalDistortion={0.1}
            color="#bfefff"
            emissive="#2b6fff"
            emissiveIntensity={0.15}
          />
        ) : (
          <meshStandardMaterial
            color="#bfefff"
            emissive="#3a86ff"
            emissiveIntensity={0.7}
            roughness={0.2}
            metalness={0.1}
            transparent
            opacity={0.85}
            wireframe
          />
        )}
      </mesh>
    </group>
  );
}
