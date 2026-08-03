"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState, CHAPTER_COUNT } from "@/components/scroll/scroll-state";

type Keyframe = { pos: [number, number, number]; look: [number, number, number] };

// Six keyframes, one per narrative section:
// 0 intro: framed on the book (which sits slightly to the left)
// 1 Ch01: pulled back to see the whole tangled knot
// 2 Ch02: closer, angled around the pedestal
// 3 Ch03: wider, camera drifts to reveal the toolkit ring
// 4 Ch04: tilted up toward the ascending pillar
// 5 end: settled, gentle idle drift
const KEYFRAMES: Keyframe[] = [
  { pos: [0.3, 0.4, 3.2], look: [-0.5, -0.1, 0.0] },
  { pos: [0.0, 0.3, 3.5], look: [0.0, 0.1, 0.0] },
  { pos: [0.6, 0.2, 2.8], look: [-0.3, 0.15, 0.0] },
  { pos: [0.0, 0.6, 3.6], look: [0.0, 0.4, 0.0] },
  { pos: [0.0, 0.9, 3.4], look: [0.0, 1.6, 0.0] },
  { pos: [0.0, 0.5, 3.0], look: [0.0, 0.8, 0.0] },
];

function sampleKeyframe(
  progress: number,
  key: "pos" | "look",
  out: THREE.Vector3,
): THREE.Vector3 {
  const scaled = progress * (CHAPTER_COUNT - 1);
  const i = Math.min(CHAPTER_COUNT - 2, Math.floor(scaled));
  const f = THREE.MathUtils.clamp(scaled - i, 0, 1);
  const a = KEYFRAMES[i][key];
  const b = KEYFRAMES[i + 1][key];
  return out.set(
    THREE.MathUtils.lerp(a[0], b[0], f),
    THREE.MathUtils.lerp(a[1], b[1], f),
    THREE.MathUtils.lerp(a[2], b[2], f),
  );
}

export function CameraRig() {
  const { camera, pointer } = useThree();
  const desiredPos = useRef(new THREE.Vector3(0, 0.4, 3.2));
  const desiredLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    sampleKeyframe(scrollState.progress, "pos", desiredPos.current);
    sampleKeyframe(scrollState.progress, "look", desiredLook.current);

    // Light pointer parallax on X and Y.
    const parallaxX = pointer.x * 0.25;
    const parallaxY = pointer.y * 0.15;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.current.x + parallaxX, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.current.y + parallaxY, 4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.current.z, 4, delta);

    currentLook.current.x = THREE.MathUtils.damp(currentLook.current.x, desiredLook.current.x, 4, delta);
    currentLook.current.y = THREE.MathUtils.damp(currentLook.current.y, desiredLook.current.y, 4, delta);
    currentLook.current.z = THREE.MathUtils.damp(currentLook.current.z, desiredLook.current.z, 4, delta);
    camera.lookAt(currentLook.current);
  });

  return null;
}
