"use client";

import { useMemo, useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/components/scroll/scroll-state";
import { BackdropMaterial, pickBackdropKeyframes } from "./materials/backdrop-material";

extend({ BackdropMaterial });

// Full-screen backdrop that reads scrollState.progress each frame and blends
// between five (top, bottom) color keyframes. Sits at renderOrder -1 so it
// draws behind everything without needing depth writes.
export function Backdrop() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  // Reused across frames to avoid GC churn.
  const kf = useMemo(
    () => ({
      topA: new THREE.Color(),
      topB: new THREE.Color(),
      botA: new THREE.Color(),
      botB: new THREE.Color(),
    }),
    [],
  );

  useFrame((_, delta) => {
    const mat = materialRef.current as any;
    if (!mat) return;
    const picked = pickBackdropKeyframes(scrollState.progress);
    kf.topA.copy(picked.topA);
    kf.topB.copy(picked.topB);
    kf.botA.copy(picked.botA);
    kf.botB.copy(picked.botB);
    mat.uTopA = kf.topA;
    mat.uTopB = kf.topB;
    mat.uBotA = kf.botA;
    mat.uBotB = kf.botB;
    mat.uBlend = picked.blend;
    mat.uTime += delta;
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false} position={[0, 0, -50]}>
      <planeGeometry args={[100, 100]} />
      {/* @ts-expect-error extended material tag */}
      <backdropMaterial ref={materialRef} depthWrite={false} depthTest={false} />
    </mesh>
  );
}
