import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, NormalBlending } from "three";
import { getDotTexture } from "./dotTexture.js";
import { createField, sceneState } from "./sceneGeometry.js";

const COUNT = 720;

// Noise migrates onto calm orbits as the architecture resolves.
export default function StarField({ progressRef, dark }) {
  const points = useRef();
  const field = useMemo(() => createField(COUNT), []);
  const positions = useMemo(() => new Float32Array(field.chaos), [field]);
  const colors = useMemo(() => {
    const values = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const bright = i % 9 === 0 ? 1 : 0.35 + ((i * 37) % 100) / 180;
      const tone = dark ? [0.45, 0.95, 0.72] : [0.12, 0.48, 0.31];
      values.set(tone.map((channel) => channel * bright), i * 3);
    }
    return values;
  }, [dark]);
  useFrame(({ clock }) => {
    const { order } = sceneState(progressRef.current);
    const t = clock.elapsedTime;
    for (let i = 0; i < COUNT * 3; i += 3) {
      const wobble = (1 - order) * 0.05;
      positions[i] = field.chaos[i] + (field.order[i] - field.chaos[i]) * order + Math.sin(t * 0.5 + i) * wobble;
      positions[i + 1] = field.chaos[i + 1] + (field.order[i + 1] - field.chaos[i + 1]) * order + Math.cos(t * 0.4 + i) * wobble;
      positions[i + 2] = field.chaos[i + 2] + (field.order[i + 2] - field.chaos[i + 2]) * order;
    }
    const geometry = points.current.geometry;
    geometry.attributes.position.needsUpdate = true;
    points.current.rotation.z = t * 0.012 * (0.4 + order);
  });
  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
          map={getDotTexture()}
        size={dark ? 0.07 : 0.055}
        vertexColors
        transparent
        opacity={dark ? 0.9 : 0.75}
        depthWrite={false}
        blending={dark ? AdditiveBlending : NormalBlending}
        sizeAttenuation
      />
    </points>
  );
}
