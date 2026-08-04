"use client";

// The R3F scene: the fixed, full-screen canvas that lives behind the HTML
// overlay. Holds the camera rig, lighting, the four chapter groups, optional
// atmosphere, and post-processing. Rendered only on the client (see
// canvas-root) because WebGL cannot run during SSR.

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Backdrop } from "./backdrop";
import { Character } from "./character";
import { BookIntro } from "./book";
import { CameraRig } from "./camera-rig";
import { PostFX } from "./post-processing";
import { Chapter01Tangle } from "./chapters/chapter-01-tangle";
import { Chapter02Pedestal } from "./chapters/chapter-02-pedestal";
import { Chapter03Toolkit } from "./chapters/chapter-03-toolkit";
import { Chapter04Horizon } from "./chapters/chapter-04-horizon";
import { EndScene } from "./end-scene";
import type { CapabilityTier } from "@/hooks/use-device-capability";

export default function Scene({ tier }: { tier: CapabilityTier }) {
  const isFull = tier === "full";

  return (
    <Canvas
      dpr={isFull ? [1, 2] : [1, 1.5]}
      gl={{
        antialias: isFull,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0.4, 9] }}
      frameloop="always"
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.localClippingEnabled = true;
        scene.fog = new THREE.FogExp2("#0a0e17", 0.06);
      }}
    >
      <Backdrop />

      <ambientLight intensity={0.35} />
      <pointLight position={[6, 5, 6]} intensity={40} color="#6fd8ff" />
      <pointLight position={[-6, -3, 4]} intensity={22} color="#3a86ff" />
      <pointLight position={[0, 4, -6]} intensity={18} color="#ffffff" />

      <Character tier={tier} />

      <BookIntro />

      <CameraRig />

      <Chapter01Tangle tier={tier} />
      <Chapter02Pedestal tier={tier} />
      <Chapter03Toolkit />
      <Chapter04Horizon />
      <EndScene />

      <PostFX tier={tier} />
    </Canvas>
  );
}
