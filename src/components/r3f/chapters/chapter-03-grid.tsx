"use client";

// Chapter 03 - "My toolkit": the central glyph disperses into a floating 3D
// grid of skill cards. The camera pans right (see camera-rig keyframe) while
// each column of cards illuminates in sequence, front-to-back. Cards float in
// zero gravity with a gentle idle bob keyed to their index.
//
// Four columns map to the four skill categories; rows hold individual skills.
// Cards are thin box meshes with a glowing emissive face; the outline ring
// reveals as the column activates.

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterLocalProgress } from "@/components/scroll/scroll-state";

// Four skill categories taken directly from content.ts about.skills,
// grouped thematically to match the "Frontend / Backend / Architecture /
// Product" column spec.
const COLUMNS = [
  {
    label: "Analysis",
    skills: ["Business Analysis", "Requirements and Documentation"],
    color: "#4fc3f7",
    emissive: "#0288d1",
  },
  {
    label: "Delivery",
    skills: ["UAT and Test Coordination", "Release and Regression Planning", "Agile Delivery"],
    color: "#81d4fa",
    emissive: "#0277bd",
  },
  {
    label: "Engineering",
    skills: ["APIs and LLM Integration", "Prompt Engineering"],
    color: "#b3e5fc",
    emissive: "#01579b",
  },
  {
    label: "Product",
    skills: ["Stakeholder Management"],
    color: "#e1f5fe",
    emissive: "#0288d1",
  },
];

const CARD_W = 1.6;
const CARD_H = 0.55;
const CARD_D = 0.06;
const COL_GAP = 2.1;
const ROW_GAP = 0.75;

type CardRef = {
  mesh: THREE.Mesh;
  colIndex: number;
  baseY: number;
  bobOffset: number;
};

export function Chapter03Grid() {
  const groupRef = useRef<THREE.Group>(null);
  const cardRefs = useRef<CardRef[]>([]);

  const cards = useMemo(() => {
    const result: {
      pos: [number, number, number];
      colIndex: number;
      color: string;
      emissive: string;
      baseY: number;
      bobOffset: number;
    }[] = [];
    COLUMNS.forEach((col, ci) => {
      const totalH = (col.skills.length - 1) * ROW_GAP;
      col.skills.forEach((_, ri) => {
        const x = ci * COL_GAP - (COLUMNS.length - 1) * COL_GAP * 0.5;
        const y = ri * ROW_GAP - totalH * 0.5;
        result.push({
          pos: [x, y, 0],
          colIndex: ci,
          color: col.color,
          emissive: col.emissive,
          baseY: y,
          bobOffset: (ci * 1.3 + ri * 0.9) * Math.PI * 0.5,
        });
      });
    });
    return result;
  }, []);

  useFrame((_) => {
    const p = chapterLocalProgress(3);
    if (!groupRef.current) return;

    groupRef.current.visible = p > 0.02;

    const t = performance.now() * 0.001;
    const numCols = COLUMNS.length;

    cardRefs.current.forEach((cr) => {
      if (!cr.mesh) return;
      // Column activates sequentially across scroll progress.
      const colStart = cr.colIndex / numCols;
      const reveal = THREE.MathUtils.smoothstep(p, colStart, colStart + 0.35);

      cr.mesh.scale.setScalar(0.0001 + reveal);
      cr.mesh.position.y = cr.baseY + Math.sin(t + cr.bobOffset) * 0.09 * reveal;

      const mat = cr.mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + reveal * 1.1;
      mat.opacity = 0.15 + reveal * 0.85;
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {cards.map((c, i) => {
        const col = COLUMNS[c.colIndex];
        return (
          <mesh
            key={i}
            position={c.pos}
            ref={(el) => {
              if (el) {
                cardRefs.current[i] = {
                  mesh: el,
                  colIndex: c.colIndex,
                  baseY: c.baseY,
                  bobOffset: c.bobOffset,
                };
              }
            }}
          >
            <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
            <meshStandardMaterial
              color={c.color}
              emissive={col.emissive}
              emissiveIntensity={0.3}
              roughness={0.3}
              metalness={0.25}
              transparent
              opacity={0.15}
            />
          </mesh>
        );
      })}

      {/* Outline rings above each column label position */}
      {COLUMNS.map((col, ci) => {
        const x = ci * COL_GAP - (COLUMNS.length - 1) * COL_GAP * 0.5;
        const maxRows = Math.max(...COLUMNS.map((c) => c.skills.length));
        return (
          <mesh
            key={`ring-${ci}`}
            position={[x, maxRows * ROW_GAP * 0.5 + 0.5, 0]}
            rotation-x={Math.PI / 2}
          >
            <torusGeometry args={[0.28, 0.02, 12, 48]} />
            <meshStandardMaterial
              color={col.color}
              emissive={col.emissive}
              emissiveIntensity={1.2}
              roughness={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}
