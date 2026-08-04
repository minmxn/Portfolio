"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { InteractiveObject } from "@/components/r3f/interactive-object";

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
  const haloRef = useRef<THREE.Mesh>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const baseEmissiveRef = useRef(0.05);

  const angle = (index / ITEMS) * Math.PI * 2;
  const baseX = Math.cos(angle) * RADIUS;
  const baseZ = Math.sin(angle) * RADIUS - 0.4;
  const baseY = ((index % 3) - 1) * 0.25;

  const item = TOOLKIT[index];

  useFrame((_, delta) => {
    const p = chapterLocalProgress(3);

    // Illumination sweep: writes to baseEmissiveRef for InteractiveObject to read
    const start = index / ITEMS;
    const end = start + 0.35;
    const local = Math.max(0, Math.min(1, (p - start) / (end - start)));
    const eased = local * local * (3 - 2 * local);
    baseEmissiveRef.current = 0.05 + eased * 2.2;

    // Bob animation: writes directly to outer group Y
    const t = performance.now() * 0.0007;
    const groupY = baseY + Math.sin(t + index) * 0.08;
    if (outerGroupRef.current) {
      outerGroupRef.current.position.y = groupY;
    }

    // Halo ring
    if (haloRef.current) {
      const hMat = haloRef.current.material as THREE.MeshBasicMaterial;
      hMat.opacity = eased * 0.4;
      haloRef.current.scale.setScalar(0.7 + eased * 0.35);
    }

    // Scroll-close
    if ((p <= 0 || p >= 1) && getActiveCrack()?.startsWith("ch03")) {
      setActiveCrack(null);
    }

    // Suppress unused delta warning
    void delta;
  });

  return (
    <group ref={outerGroupRef} position={[baseX, baseY, baseZ]}>
      <InteractiveObject
        id={`ch03-${index}`}
        label={item.tool}
        logo={item.logo}
        story={item.story}
        position={[0, 0, 0]}
        objectRadius={0.18}
        fallbackGeometry={geometryKind}
        color="#b8d8ff"
        emissive="#7fb3ff"
        baseEmissive={0.05}
        baseEmissiveRef={baseEmissiveRef}
      />

      {/* Halo ring: illumination glow at base of object */}
      <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.30, 24]} />
        <meshBasicMaterial
          color="#7fb3ff"
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
