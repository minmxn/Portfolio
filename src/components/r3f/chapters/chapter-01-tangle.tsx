"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, MeshTransmissionMaterial, Line } from "@react-three/drei";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";
import { story } from "@/content";

// Chapter 01 - "What I do": tangled low-poly wireframe knot morphs into a
// geometric crystal skeleton using Three.js morphAttributes. Toward the end
// of the chapter band, a transmission-material icosahedron emerges centred
// on the crystal position, giving the illusion of solid glass forming from
// the resolving lines.

// High segment count keeps all curves visually smooth (no polygon look).
const SEGMENT_COUNT = 210;
const TWO_PI = Math.PI * 2;
const SPECS = story[1].spec ?? [];
const POSITIONS: [number, number, number][] = [
  [-1.2, 0.8, 0],
  [1.4, 0.1, 0],
  [-0.8, -1.0, 0],
];
const BASE_EMISSIVE = 0.3;
const HOVER_EMISSIVE = 1.0;

function makeSquigglyLines(): Float32Array {
  const positions = new Float32Array(SEGMENT_COUNT * 2 * 3);

  // Three overlapping closed loops — lemniscate / figure-8 style curves.
  // High segment counts per stroke ensure smooth rendering.
  const strokes: { count: number; fn: (t: number) => readonly [number, number, number] }[] = [
    {
      count: 75,
      fn: (t) => {
        const x = Math.sin(t * TWO_PI * 2) * 0.58;
        const y = Math.cos(t * TWO_PI) * 0.45 + Math.sin(t * TWO_PI * 2) * 0.12;
        const z = Math.sin(t * TWO_PI * 1.5 + 0.3) * 0.22;
        return [x, y, z];
      },
    },
    {
      count: 75,
      fn: (t) => {
        const x = Math.sin(t * TWO_PI * 2 + Math.PI * 0.75) * 0.52;
        const y = Math.cos(t * TWO_PI + Math.PI * 0.5) * 0.42 - 0.08;
        const z = Math.cos(t * TWO_PI * 1.5 + 0.8) * 0.18;
        return [x, y, z];
      },
    },
    {
      count: 60,
      fn: (t) => {
        const x = Math.sin(t * TWO_PI * 3 + Math.PI * 0.4) * 0.38;
        const y = Math.cos(t * TWO_PI * 2 + Math.PI * 0.3) * 0.32 + 0.08;
        const z = Math.sin(t * TWO_PI * 2 + 1.0) * 0.25;
        return [x, y, z];
      },
    },
  ];

  let idx = 0;
  for (const { count, fn } of strokes) {
    for (let i = 0; i < count; i++) {
      positions.set(fn(i / count), idx * 6);
      positions.set(fn((i + 1) / count), idx * 6 + 3);
      idx++;
    }
  }
  return positions;
}

function makeCrystalArcs(): Float32Array {
  // Three great circles on a sphere — organic and rounded, not polygonal.
  // The morph resolves squiggly chaos into clean circular order.
  const positions = new Float32Array(SEGMENT_COUNT * 2 * 3);
  const R = 0.88;
  const counts = [75, 70, 65]; // sums to 210

  const circles: ((t: number) => readonly [number, number, number])[] = [
    // Equatorial ring (XZ plane)
    (t) => {
      const a = t * TWO_PI;
      return [R * Math.cos(a), 0, R * Math.sin(a)];
    },
    // Ring tilted 60° around Z — creates a diagonal orbital
    (t) => {
      const a = t * TWO_PI;
      return [R * Math.cos(a) * 0.5, R * Math.cos(a) * 0.866, R * Math.sin(a)];
    },
    // Ring tilted around X — third orbital, perpendicular feel
    (t) => {
      const a = t * TWO_PI;
      return [R * Math.cos(a), R * Math.sin(a) * 0.866, R * Math.sin(a) * 0.5];
    },
  ];

  let idx = 0;
  for (let c = 0; c < circles.length; c++) {
    const count = counts[c];
    for (let i = 0; i < count; i++) {
      positions.set(circles[c](i / count), idx * 6);
      positions.set(circles[c]((i + 1) / count), idx * 6 + 3);
      idx++;
    }
  }
  return positions;
}

export function Chapter01Tangle({ tier }: { tier: CapabilityTier }) {
  const group = useRef<THREE.Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linesRef = useRef<any>(null); // Line2 / LineSegments2 from drei
  const crystal = useRef<THREE.Mesh>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const nodeMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([null, null, null]);
  const emissiveValues = useRef([BASE_EMISSIVE, BASE_EMISSIVE, BASE_EMISSIVE]);
  const nodesGroupRef = useRef<THREE.Group>(null!);
  const nodeScaleValue = useRef(0);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  const buffers = useMemo(() => {
    const tangled = makeSquigglyLines();
    const crystal = makeCrystalArcs();
    const live = new Float32Array(tangled.length);
    live.set(tangled);
    return { tangled, crystal, live };
  }, []);

  // Initial point list for <Line> mount (stable — updated imperatively in useFrame)
  const initialPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const b = buffers.live;
    for (let i = 0; i < b.length; i += 3) {
      pts.push([b[i], b[i + 1], b[i + 2]]);
    }
    return pts;
  }, [buffers]);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(1);
    if (!group.current) return;
    group.current.visible = p > 0.001;

    group.current.rotation.y += delta * 0.12;

    if (linesRef.current) {
      const morph = Math.min(1, p / 0.7);
      const eased = morph * morph * (3 - 2 * morph);
      const live = buffers.live;
      const src = buffers.tangled;
      const dst = buffers.crystal;
      for (let i = 0; i < live.length; i++) {
        live[i] = src[i] + (dst[i] - src[i]) * eased;
      }
      // Line2 geometry update — handles needsUpdate internally
      linesRef.current.geometry.setPositions(live);

      const brightness = 0.35 + eased * 0.5;
      linesRef.current.material.color.setRGB(
        brightness * 0.7,
        brightness * 0.85,
        brightness * 1.0
      );
    }

    if (crystal.current) {
      const reveal = Math.max(0, Math.min(1, (p - 0.5) / 0.5));
      const s = reveal * 0.55;
      crystal.current.visible = reveal > 0.001;
      crystal.current.scale.setScalar(THREE.MathUtils.damp(crystal.current.scale.x, s, 3, delta));
      crystal.current.rotation.y -= delta * 0.2;
      crystal.current.rotation.x += delta * 0.05;
    }

    // Satellite node scale fade-in
    const targetNodeScale = p > 0.15 ? 1 : 0;
    nodeScaleValue.current = THREE.MathUtils.damp(
      nodeScaleValue.current,
      targetNodeScale,
      5,
      delta,
    );
    if (nodesGroupRef.current) {
      nodesGroupRef.current.scale.setScalar(nodeScaleValue.current);
    }

    // Per-node emissive intensity damping
    for (let i = 0; i < 3; i++) {
      const targetEmissive =
        hoveredIndexRef.current === i ? HOVER_EMISSIVE : BASE_EMISSIVE;
      emissiveValues.current[i] = THREE.MathUtils.damp(
        emissiveValues.current[i],
        targetEmissive,
        8,
        delta,
      );
      const mat = nodeMatRefs.current[i];
      if (mat) mat.emissiveIntensity = emissiveValues.current[i];
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Line2-based rendering: smooth antialiased joins, lineWidth > 1 */}
      <Line
        ref={linesRef}
        points={initialPoints}
        color="#7fb3ff"
        lineWidth={2}
        segments
        transparent
        opacity={0.85}
      />

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

      <group ref={nodesGroupRef}>
        {SPECS.map((spec, i) => (
          <group key={spec} position={POSITIONS[i]}>
            <mesh
              onPointerOver={() => {
                hoveredIndexRef.current = i;
                setHoveredIndex(i);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                hoveredIndexRef.current = null;
                setHoveredIndex(null);
                document.body.style.cursor = "auto";
              }}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                ref={(m) => {
                  nodeMatRefs.current[i] = m;
                }}
                color="#a8d8ff"
                emissive="#4499cc"
                emissiveIntensity={BASE_EMISSIVE}
              />
            </mesh>
            {hoveredIndex === i && (
              <Html
                position={[0.18, 0.18, 0]}
                style={{ pointerEvents: "none" }}
              >
                <div
                  className="whitespace-nowrap border border-white/30 bg-black/70 px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm"
                  style={{ animation: "fadeIn 0.2s ease forwards" }}
                >
                  {spec}
                </div>
              </Html>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}
