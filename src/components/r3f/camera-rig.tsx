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
  const desiredPos = useRef(new THREE.Vector3(-0.5, 4.5, 3.5));
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

      const sunPos:    [number, number, number] = [-0.5,  4.5,  3.5];
      const sunLook:   [number, number, number] = [-0.9, -0.6,  0.4];
      const driftPos:  [number, number, number] = [-0.7,  2.0,  2.0];
      const driftLook: [number, number, number] = [-0.9, -0.2,  0.4];
      const divePos:   [number, number, number] = [-0.9,  0.2,  0.5];
      const diveLook:  [number, number, number] = [-0.9, -0.6,  0.4];
      const entryPos:  [number, number, number] = [-0.9, -0.4,  0.45];
      const entryLook: [number, number, number] = [-0.9, -0.6,  0.4];

      if (t <= 0.45) {
        // Hold: steep overhead sun position, camera stationary
        desiredPos.current.set(...sunPos);
        desiredLook.current.set(...sunLook);
      } else if (t <= 0.75) {
        // Drift: camera eases down as cover opens
        const f = smoothstep(0.45, 0.75, t);
        desiredPos.current.set(
          THREE.MathUtils.lerp(sunPos[0], driftPos[0], f),
          THREE.MathUtils.lerp(sunPos[1], driftPos[1], f),
          THREE.MathUtils.lerp(sunPos[2], driftPos[2], f),
        );
        desiredLook.current.set(
          THREE.MathUtils.lerp(sunLook[0], driftLook[0], f),
          THREE.MathUtils.lerp(sunLook[1], driftLook[1], f),
          THREE.MathUtils.lerp(sunLook[2], driftLook[2], f),
        );
      } else if (t <= 0.92) {
        // Dive: steep fall into the open book interior
        const f = smoothstep(0.75, 0.92, t);
        desiredPos.current.set(
          THREE.MathUtils.lerp(driftPos[0], divePos[0], f),
          THREE.MathUtils.lerp(driftPos[1], divePos[1], f),
          THREE.MathUtils.lerp(driftPos[2], divePos[2], f),
        );
        desiredLook.current.set(
          THREE.MathUtils.lerp(driftLook[0], diveLook[0], f),
          THREE.MathUtils.lerp(driftLook[1], diveLook[1], f),
          THREE.MathUtils.lerp(driftLook[2], diveLook[2], f),
        );
      } else {
        // Entry: last push before black overlay
        const f = smoothstep(0.92, 1.00, t);
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

      // Parallax fades out t 0.45→0.75 (during drift/cover-open) so it doesn't fight the dive.
      const parallaxScale = t <= 0.45
        ? 1.0
        : THREE.MathUtils.clamp(1.0 - (t - 0.45) / 0.30, 0, 1);
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
