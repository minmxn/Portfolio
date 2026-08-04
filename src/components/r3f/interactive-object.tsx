"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getActiveCrack, setActiveCrack } from "@/components/r3f/interaction-state";
import { StoryCard } from "@/components/r3f/story-card";

// ---------------------------------------------------------------------------
// BeaconRing — pulsing radial ring that signals "this object is clickable"
// ---------------------------------------------------------------------------
function BeaconRing({ id, objectRadius }: { id: string; objectRadius: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);
  const innerR = objectRadius + 0.06;
  const outerR = innerR + 0.04;

  useFrame((_, delta) => {
    if (!ringRef.current) return;
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    if (getActiveCrack() === id) {
      mat.opacity = 0;
      return;
    }
    tRef.current = (tRef.current + delta / 2.5) % 1;
    const t = tRef.current;
    ringRef.current.scale.setScalar(1 + t * 1.2);
    mat.opacity = (1 - t) * 0.5;
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerR, outerR, 32]} />
      <meshBasicMaterial
        color="#7fb3ff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// FallbackMesh — placeholder geometry when no GLB model is provided.
// For "sphere", objectRadius is used as the sphere radius.
// ---------------------------------------------------------------------------
function FallbackMesh({
  kind,
  objectRadius = 0.12,
}: {
  kind: "sphere" | "box" | "tetra" | "torus" | "octa" | "cone" | "ico";
  objectRadius?: number;
}) {
  if (kind === "sphere") return <sphereGeometry args={[objectRadius, 16, 16]} />;
  if (kind === "box")    return <boxGeometry args={[0.22, 0.22, 0.22]} />;
  if (kind === "tetra")  return <tetrahedronGeometry args={[0.16, 0]} />;
  if (kind === "torus")  return <torusGeometry args={[0.14, 0.04, 12, 32]} />;
  if (kind === "octa")   return <octahedronGeometry args={[0.18, 0]} />;
  if (kind === "cone")   return <coneGeometry args={[0.14, 0.28, 4]} />;
  return <icosahedronGeometry args={[0.17, 0]} />;
}

// ---------------------------------------------------------------------------
// GlbMesh — renders a loaded GLB. Wrap the call site in <React.Suspense>.
// ---------------------------------------------------------------------------
function GlbMesh({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene.clone()} />;
}

// ---------------------------------------------------------------------------
// InteractiveObject
// ---------------------------------------------------------------------------
export type InteractiveObjectProps = {
  id: string;
  label: string;
  story: string;
  logo?: string;
  position: [number, number, number];
  /** Controls beacon ring inner radius and label height. Default 0.12. */
  objectRadius?: number;
  fallbackGeometry: "sphere" | "box" | "tetra" | "torus" | "octa" | "cone" | "ico";
  /** Optional GLB path. When provided, renders GlbMesh instead of fallback. */
  model?: string;
  color?: string;
  emissive?: string;
  baseEmissive?: number;
  /**
   * Ch03 only: IconMesh writes the current sweep emissive value here each frame.
   * InteractiveObject adds its open-burst on top: final = baseEmissiveRef.current + scaleRef * 1.8.
   */
  baseEmissiveRef?: React.MutableRefObject<number>;
};

export function InteractiveObject({
  id,
  label,
  story,
  logo,
  position,
  objectRadius = 0.12,
  fallbackGeometry,
  model,
  color = "#a8d8ff",
  emissive = "#4499cc",
  baseEmissive = 0.3,
  baseEmissiveRef,
}: InteractiveObjectProps) {
  const meshGroupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const scaleRef = useRef(0);
  const cardVisRef = useRef(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    return () => { document.body.style.cursor = "auto"; };
  }, []);

  useFrame((_, delta) => {
    const isOpen = getActiveCrack() === id;
    scaleRef.current = THREE.MathUtils.damp(scaleRef.current, isOpen ? 1 : 0, 6, delta);
    const s = scaleRef.current;

    if (meshGroupRef.current) {
      meshGroupRef.current.scale.setScalar(1 + s * 0.3);
    }
    if (matRef.current) {
      const base = baseEmissiveRef ? baseEmissiveRef.current : baseEmissive;
      matRef.current.emissiveIntensity = base + s * 1.8;
    }

    const shouldShow = isOpen && s > 0.4;
    if (shouldShow !== cardVisRef.current) {
      cardVisRef.current = shouldShow;
      setShowCard(shouldShow);
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setActiveCrack(getActiveCrack() === id ? null : id);
      }}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "auto"; }}
    >
      <group ref={meshGroupRef}>
        {model ? (
          <React.Suspense fallback={null}>
            <GlbMesh path={model} />
          </React.Suspense>
        ) : (
          <mesh>
            <FallbackMesh kind={fallbackGeometry} objectRadius={objectRadius} />
            <meshStandardMaterial
              ref={matRef}
              color={color}
              emissive={emissive}
              emissiveIntensity={baseEmissive}
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>
        )}
      </group>

      <BeaconRing id={id} objectRadius={objectRadius} />

      <Html position={[0, objectRadius + 0.25, 0]} center>
        <>
          <style>{`
            @keyframes io-label-enter { from { opacity: 0 } to { opacity: 1 } }
            .io-label {
              animation: io-label-enter 0.4s 0.8s both;
              font-size: 0.55rem;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              color: rgba(255,255,255,0.7);
              pointer-events: none;
              white-space: nowrap;
              font-family: var(--font-sans, sans-serif);
              transition: opacity 0.2s;
            }
          `}</style>
          <div className="io-label" style={{ opacity: showCard ? 0 : undefined }}>
            {label}
          </div>
        </>
      </Html>

      {showCard && (
        <Html position={[0, objectRadius + 0.65, 0]} center>
          <StoryCard
            title={label}
            logo={logo}
            story={story}
            onClose={() => setActiveCrack(null)}
          />
        </Html>
      )}
    </group>
  );
}
