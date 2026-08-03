"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState, CHAPTER_COUNT } from "@/components/scroll/scroll-state";

const INTRO_END = 1 / 6; // progress value where intro band ends

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

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
  const scaled = progress * CHAPTER_COUNT - 0.5;
  const i = THREE.MathUtils.clamp(Math.floor(scaled), 0, CHAPTER_COUNT - 2);
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
  const desiredPos = useRef(new THREE.Vector3(0.3, 1.8, 5.5));
  const desiredLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const wasInIntro = useRef(true);

  useFrame((_, delta) => {
    const progress = scrollState.progress;
    const inIntro = progress < INTRO_END;

    // Detect the single crossing frame where we exit the intro band.
    const isCrossingFrame = wasInIntro.current && !inIntro;
    if (isCrossingFrame) wasInIntro.current = false;

    if (inIntro) {
      // t = local sub-progress within the intro band, 0..1
      const t = progress / INTRO_END;

      // Sub-phase positions and look-ats (from spec)
      const holdPos:  [number, number, number] = [0.3, 1.8, 5.5];
      const holdLook: [number, number, number] = [-0.3, -0.4, 0.0];
      const divePos:  [number, number, number] = [0.1, 0.4, 1.2];
      const diveLook: [number, number, number] = [-0.2, 0.0, 0.0];
      const entryPos: [number, number, number] = [0.0, 0.0, 0.3];
      const entryLook:[number, number, number] = [0.0, 0.0, 0.0];

      if (t <= 0.50) {
        // Hold: camera stationary at elevated isometric view
        desiredPos.current.set(...holdPos);
        desiredLook.current.set(...holdLook);
      } else if (t <= 0.85) {
        // Dive: smoothstep from hold position toward mid-dive position
        const f = smoothstep(0.50, 0.85, t);
        desiredPos.current.set(
          THREE.MathUtils.lerp(holdPos[0], divePos[0], f),
          THREE.MathUtils.lerp(holdPos[1], divePos[1], f),
          THREE.MathUtils.lerp(holdPos[2], divePos[2], f),
        );
        desiredLook.current.set(
          THREE.MathUtils.lerp(holdLook[0], diveLook[0], f),
          THREE.MathUtils.lerp(holdLook[1], diveLook[1], f),
          THREE.MathUtils.lerp(holdLook[2], diveLook[2], f),
        );
      } else {
        // Entry: smoothstep from mid-dive to book cover surface
        const f = smoothstep(0.85, 1.00, t);
        desiredPos.current.set(
          THREE.MathUtils.lerp(divePos[0], entryPos[0], f),
          THREE.MathUtils.lerp(divePos[1], entryPos[1], f),
          THREE.MathUtils.lerp(divePos[2], entryPos[2], f),
        );
        desiredLook.current.set(
          THREE.MathUtils.lerp(diveLook[0], entryLook[0], f),
          THREE.MathUtils.lerp(diveLook[1], entryLook[1], f),
          THREE.MathUtils.lerp(diveLook[2], entryLook[2], f),
        );
      }

      // Parallax fades out during the dive so it doesn't fight the camera's forward momentum.
      // At t=0.50 scale is 1.0; at t=0.85 scale is 0.0; stays 0 for entry.
      const parallaxScale = t <= 0.50
        ? 1.0
        : THREE.MathUtils.clamp(1.0 - (t - 0.50) / 0.35, 0, 1);
      const parallaxX = pointer.x * 0.25 * parallaxScale;
      const parallaxY = pointer.y * 0.15 * parallaxScale;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.current.x + parallaxX, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.current.y + parallaxY, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.current.z, 4, delta);
    } else {
      // Chapters 1–5: existing keyframe sampler, unchanged
      sampleKeyframe(progress, "pos", desiredPos.current);
      sampleKeyframe(progress, "look", desiredLook.current);

      const parallaxX = pointer.x * 0.25;
      const parallaxY = pointer.y * 0.15;

      if (isCrossingFrame) {
        // Hard-set camera directly to ch1 sampled values on the crossing frame.
        // damp() is frame-rate-dependent and closes only ~38% of the gap at 120Hz —
        // on a fast scroll the black overlay can clear while the camera is still sliding.
        camera.position.set(
          desiredPos.current.x + parallaxX,
          desiredPos.current.y + parallaxY,
          desiredPos.current.z,
        );
        currentLook.current.copy(desiredLook.current);
        camera.lookAt(currentLook.current);
        return;
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.current.x + parallaxX, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.current.y + parallaxY, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.current.z, 4, delta);
    }

    currentLook.current.x = THREE.MathUtils.damp(currentLook.current.x, desiredLook.current.x, 4, delta);
    currentLook.current.y = THREE.MathUtils.damp(currentLook.current.y, desiredLook.current.y, 4, delta);
    currentLook.current.z = THREE.MathUtils.damp(currentLook.current.z, desiredLook.current.z, 4, delta);
    camera.lookAt(currentLook.current);
  });

  return null;
}
