"use client";

import { Suspense, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/components/scroll/scroll-state";
import type { CapabilityTier } from "@/hooks/use-device-capability";

const CHARACTER_POS: [number, number, number][] = [
  [1.4, -0.4, 0.0],
  [0.0, -0.4, 0.0],
  [1.2, -0.4, 0.5],
  [0.0, -0.4, 1.0],
  [0.0, -0.4, 0.0],
  [0.0, -0.4, 0.0],
];
const CHARACTER_ROT_Y: number[] = [-0.35, 0, -0.4, 0, 0, 0];

useGLTF.preload("/character/Chibi_Girl.glb");

const VERT = `
  uniform float uXMin, uXMax, uYMin, uYMax;
  uniform float uUMin, uUMax, uVMin, uVMax;
  varying vec2 vUV;
  varying vec3 vNormal;
  void main() {
    float normX = (position.x - uXMin) / (uXMax - uXMin);
    float normY = (position.y - uYMin) / (uYMax - uYMin);
    vUV = vec2(
      uUMin + normX * (uUMax - uUMin),
      uVMin + normY * (uVMax - uVMin)
    );
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = `
  uniform sampler2D uTex;
  varying vec2 vUV;
  varying vec3 vNormal;
  void main() {
    float light = 0.55 + 0.45 * max(dot(vNormal, normalize(vec3(0.2, 0.8, 1.0))), 0.0);
    if (gl_FrontFacing) {
      vec4 col = texture2D(uTex, vUV);
      if (col.r > 0.93 && col.g > 0.93 && col.b > 0.93) {
        gl_FragColor = vec4(vec3(0.07, 0.10, 0.26) * light, 1.0);
      } else {
        gl_FragColor = vec4(col.rgb * light, 1.0);
      }
    } else {
      gl_FragColor = vec4(vec3(0.07, 0.10, 0.26) * light, 1.0);
    }
  }
`;

function CharacterModel() {
  const { scene } = useGLTF("/character/Chibi_Girl.glb");
  const texture = useTexture("/character/Chibi_Girl_Front.png");

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const box = new THREE.Box3();
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry.attributes.position) {
        const geomBox = new THREE.Box3().setFromBufferAttribute(
          child.geometry.attributes.position as THREE.BufferAttribute,
        );
        box.union(geomBox);
      }
    });

    const modelAspect = (box.max.x - box.min.x) / (box.max.y - box.min.y);
    const zoom   = 0.40;
    const yZoom  = 0.72;
    const shiftX = 0.03;
    const shiftY = 0.00;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTex:  { value: texture },
        uXMin: { value: box.min.x },
        uXMax: { value: box.max.x },
        uYMin: { value: box.min.y },
        uYMax: { value: box.max.y },
        uUMin: { value: (1 - modelAspect * zoom) / 2 + shiftX },
        uUMax: { value: (1 + modelAspect * zoom) / 2 + shiftX },
        uVMin: { value: (1 - yZoom) / 2 + shiftY },
        uVMax: { value: (1 + yZoom) / 2 + shiftY },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.DoubleSide,
    });

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) child.material = mat;
    });
  }, [scene, texture]);

  return <primitive object={scene} scale={[0.5, 0.5, 0.5]} />;
}

export function Character({ tier: _tier }: { tier: CapabilityTier }) {
  const outer = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!outer.current) return;

    const sections = CHARACTER_POS.length;
    const scaled = scrollState.progress * sections - 0.5;
    const i = THREE.MathUtils.clamp(Math.floor(scaled), 0, sections - 2);
    const t = THREE.MathUtils.clamp(scaled - i, 0, 1);
    const posA = CHARACTER_POS[i];
    const posB = CHARACTER_POS[i + 1];
    const rotA = CHARACTER_ROT_Y[i];
    const rotB = CHARACTER_ROT_Y[i + 1];

    outer.current.position.x = THREE.MathUtils.damp(
      outer.current.position.x,
      THREE.MathUtils.lerp(posA[0], posB[0], t),
      4, delta,
    );
    outer.current.position.y = THREE.MathUtils.damp(
      outer.current.position.y,
      THREE.MathUtils.lerp(posA[1], posB[1], t),
      4, delta,
    );
    outer.current.position.z = THREE.MathUtils.damp(
      outer.current.position.z,
      THREE.MathUtils.lerp(posA[2], posB[2], t),
      4, delta,
    );
    outer.current.rotation.y = THREE.MathUtils.damp(
      outer.current.rotation.y,
      THREE.MathUtils.lerp(rotA, rotB, t),
      4, delta,
    );
  });

  return (
    <group ref={outer}>
      <Float speed={0.7} rotationIntensity={0.15} floatIntensity={0.35}>
        <Suspense fallback={null}>
          <CharacterModel />
        </Suspense>
      </Float>
    </group>
  );
}
