"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { StoryCard } from "@/components/r3f/story-card";
import type { CapabilityTier } from "@/hooks/use-device-capability";

// Chapter 01 - "What I do": tangled low-poly wireframe knot morphs into a
// geometric crystal skeleton using Three.js morphAttributes. Toward the end
// of the chapter band, a transmission-material icosahedron emerges centred
// on the crystal position, giving the illusion of solid glass forming from
// the resolving lines.

// High segment count keeps all curves visually smooth (no polygon look).
const SEGMENT_COUNT = 210;
const TWO_PI = Math.PI * 2;
const POSITIONS: [number, number, number][] = [
  [-1.2, 0.8, 0],
  [1.4, 0.1, 0],
  [-0.8, -1.0, 0],
];
const BASE_EMISSIVE = 0.3;

const PROJECTS = [
  {
    name: "Nomo",
    story: "Built a productivity app from zero. First time I proved I could ship, not just spec.",
  },
  {
    name: "Generative AI Video",
    story: "Explored how gen AI could produce video at scale. Part research, part prototype.",
  },
  {
    name: "Gifted Education Programme",
    story: "Multi-stakeholder, no clear brief. I mapped the chaos and turned it into a roadmap.",
  },
] as const;

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
  const nodesGroupRef = useRef<THREE.Group>(null!);
  const nodeScaleValue = useRef(0);
  const splitRefs = useRef([0, 0, 0]);
  const topHalfRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const bottomHalfRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const coreRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const cardIndexRef = useRef<number | null>(null);
  const [cardIndex, setCardIndex] = useState<number | null>(null);

  const { topPlane, bottomPlane } = useMemo(
    () => ({
      topPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      bottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    }),
    [],
  );

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

    // Pause crystal rotation while a crack is open (prevents card orbiting)
    const anyOpen = getActiveCrack()?.startsWith("ch01") ?? false;
    if (!anyOpen) {
      group.current.rotation.y += delta * 0.12;
    }

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

    // Scroll-close: clear ch01 cracks when outside chapter band
    if ((p <= 0 || p >= 1) && getActiveCrack()?.startsWith("ch01")) {
      setActiveCrack(null);
    }

    // Per-node crack animation
    let newCardIndex: number | null = null;
    for (let i = 0; i < 3; i++) {
      const isThisOpen = getActiveCrack() === `ch01-${i}`;
      splitRefs.current[i] = THREE.MathUtils.damp(
        splitRefs.current[i],
        isThisOpen ? 1 : 0,
        6,
        delta,
      );
      const s = splitRefs.current[i];

      const top = topHalfRefs.current[i];
      const bottom = bottomHalfRefs.current[i];
      const core = coreRefs.current[i];

      if (top) top.position.y = s * 0.1;
      if (bottom) bottom.position.y = -s * 0.1;
      if (core) {
        const cs = THREE.MathUtils.damp(core.scale.x, s, 6, delta);
        core.scale.setScalar(cs);
      }

      if (isThisOpen && s > 0.4) newCardIndex = i;
    }

    if (newCardIndex !== cardIndexRef.current) {
      cardIndexRef.current = newCardIndex;
      setCardIndex(newCardIndex);
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
        {PROJECTS.map((proj, i) => (
          <group key={proj.name} position={POSITIONS[i]}
            onClick={(e) => {
              e.stopPropagation();
              setActiveCrack(getActiveCrack() === `ch01-${i}` ? null : `ch01-${i}`);
            }}
            onPointerOver={() => { document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { document.body.style.cursor = "auto"; }}
          >
            {/* Top half */}
            <mesh
              ref={(m) => { topHalfRefs.current[i] = m; }}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                color="#a8d8ff"
                emissive="#4499cc"
                emissiveIntensity={BASE_EMISSIVE}
                clippingPlanes={[topPlane]}
                clipShadows
              />
            </mesh>

            {/* Bottom half */}
            <mesh ref={(m) => { bottomHalfRefs.current[i] = m; }}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                color="#a8d8ff"
                emissive="#4499cc"
                emissiveIntensity={BASE_EMISSIVE}
                clippingPlanes={[bottomPlane]}
                clipShadows
              />
            </mesh>

            {/* Core glow sphere */}
            <mesh ref={(m) => { coreRefs.current[i] = m; }} scale={0}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial
                color="#f6b979"
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* Story card */}
            {cardIndex === i && (
              <Html position={[0, 0.65, 0]} center>
                <StoryCard
                  title={proj.name}
                  story={proj.story}
                  onClose={() => setActiveCrack(null)}
                />
              </Html>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}
