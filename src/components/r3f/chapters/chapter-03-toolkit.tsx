"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { StoryCard } from "@/components/r3f/story-card";

// Chapter 03 - "My toolkit": six low-poly abstract icons float in a loose ring
// around the character at slightly different heights. Each icon is a near-
// black silhouette by default; as the camera pans across the chapter, they
// illuminate one after another (emissive fades on, small halo appears).

const RADIUS = 1.6;
const ITEMS = 6;

const TOOLKIT = [
  { tool: "Figma",      logo: "/logos/figma.svg",      story: "Prototyped Nomo's entire UI before writing a line of code." },
  { tool: "JIRA",       logo: "/logos/jira.svg",       story: "Managed delivery across public sector programmes from backlog to release." },
  { tool: "Excel",      logo: "/logos/excel.svg",      story: "Every BA's secret weapon. Where raw data becomes a decision." },
  { tool: "Confluence", logo: "/logos/confluence.svg", story: "Wrote the docs that let engineers ship without needing another meeting." },
  { tool: "SQL",        logo: "/logos/sql.svg",        story: "Queried Oracle to surface insights no one thought to ask for." },
  { tool: "AI",         logo: "/logos/ai-trio.svg",    story: "Claude, ChatGPT, Gemini. I use AI as a thinking partner, not a shortcut." },
] as const;

function IconMesh({
  index,
  geometryKind,
}: {
  index: number;
  geometryKind: "tetra" | "torus" | "box" | "octa" | "cone" | "ico";
}) {
  const topRef = useRef<THREE.Mesh>(null);
  const bottomRef = useRef<THREE.Mesh>(null);
  const topMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const bottomMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const halo = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const splitRef = useRef(0);
  const cardVisRef = useRef(false);
  const [showCard, setShowCard] = useState(false);

  const angle = (index / ITEMS) * Math.PI * 2;
  const baseX = Math.cos(angle) * RADIUS;
  const baseZ = Math.sin(angle) * RADIUS - 0.4;
  const baseY = ((index % 3) - 1) * 0.25;

  const { topPlane, bottomPlane } = useMemo(
    () => ({
      topPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      bottomPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    }),
    [],
  );

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);
    const crackId = `ch03-${index}`;
    const isCracked = getActiveCrack() === crackId;

    // Illumination sweep (keep existing behavior)
    const start = index / ITEMS;
    const end = start + 0.35;
    const local = Math.max(0, Math.min(1, (p - start) / (end - start)));
    const eased = local * local * (3 - 2 * local);
    const eI = 0.05 + eased * 2.2;
    if (topMatRef.current) topMatRef.current.emissiveIntensity = eI;
    if (bottomMatRef.current) bottomMatRef.current.emissiveIntensity = eI;

    // Bob and spin
    const t = performance.now() * 0.0007;
    const groupY = baseY + Math.sin(t + index) * 0.08;
    if (topRef.current) {
      topRef.current.parent!.position.y = groupY;
      topRef.current.rotation.y += delta * (0.25 + index * 0.03);
      topRef.current.rotation.x += delta * 0.08;
    }
    if (bottomRef.current) {
      bottomRef.current.rotation.y = topRef.current?.rotation.y ?? 0;
      bottomRef.current.rotation.x = topRef.current?.rotation.x ?? 0;
    }

    if (halo.current) {
      const hMat = halo.current.material as THREE.MeshBasicMaterial;
      hMat.opacity = eased * 0.4;
      halo.current.scale.setScalar(0.7 + eased * 0.35);
    }

    // Crack animation
    splitRef.current = THREE.MathUtils.damp(splitRef.current, isCracked ? 1 : 0, 6, delta);
    const s = splitRef.current;
    if (topRef.current) topRef.current.position.y = s * 0.18;
    if (bottomRef.current) bottomRef.current.position.y = -s * 0.18;
    if (coreRef.current) {
      const cs = THREE.MathUtils.damp(coreRef.current.scale.x, s, 6, delta);
      coreRef.current.scale.setScalar(cs);
    }

    const shouldShow = isCracked && s > 0.4;
    if (shouldShow !== cardVisRef.current) {
      cardVisRef.current = shouldShow;
      setShowCard(shouldShow);
    }
  });

  const color = "#b8d8ff";
  const emissive = "#7fb3ff";
  const item = TOOLKIT[index];

  const geom = (
    <>
      {geometryKind === "tetra" && <tetrahedronGeometry args={[0.16, 0]} />}
      {geometryKind === "torus" && <torusGeometry args={[0.14, 0.04, 12, 32]} />}
      {geometryKind === "box" && <boxGeometry args={[0.22, 0.22, 0.22]} />}
      {geometryKind === "octa" && <octahedronGeometry args={[0.18, 0]} />}
      {geometryKind === "cone" && <coneGeometry args={[0.14, 0.28, 4]} />}
      {geometryKind === "ico" && <icosahedronGeometry args={[0.17, 0]} />}
    </>
  );

  return (
    <group position={[baseX, baseY, baseZ]}>
      {/* Top half */}
      <mesh
        ref={topRef}
        onClick={(e) => {
          e.stopPropagation();
          setActiveCrack(getActiveCrack() === `ch03-${index}` ? null : `ch03-${index}`);
        }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        {geom}
        <meshStandardMaterial
          ref={topMatRef}
          color={color}
          emissive={emissive}
          emissiveIntensity={0.05}
          roughness={0.4}
          metalness={0.15}
          clippingPlanes={[topPlane]}
          clipShadows
        />
      </mesh>

      {/* Bottom half */}
      <mesh ref={bottomRef}>
        {geom}
        <meshStandardMaterial
          ref={bottomMatRef}
          color={color}
          emissive={emissive}
          emissiveIntensity={0.05}
          roughness={0.4}
          metalness={0.15}
          clippingPlanes={[bottomPlane]}
          clipShadows
        />
      </mesh>

      {/* Core glow */}
      <mesh ref={coreRef} scale={0}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial
          color="#f6b979"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Halo ring */}
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

      {/* Story card */}
      {showCard && (
        <Html position={[0, 0.65, 0]} center>
          <StoryCard
            title={item.tool}
            logo={item.logo}
            story={item.story}
            onClose={() => setActiveCrack(null)}
          />
        </Html>
      )}
    </group>
  );
}

export function Chapter03Toolkit() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);
    if (!group.current) return;
    group.current.visible = p > 0.001;
    const anyCh03Open = getActiveCrack()?.startsWith("ch03") ?? false;
    if (!anyCh03Open) {
      group.current.rotation.y += delta * 0.08;
    }
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
