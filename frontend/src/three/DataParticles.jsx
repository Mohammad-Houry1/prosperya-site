import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, NormalBlending } from "three";
import { getDotTexture } from "./dotTexture.js";
import { scenePosition, sceneState } from "./sceneGeometry.js";
import { SYSTEM_NODES } from "./systemScene.data.js";

const PER_LINK = 3;

// Data packets travel both ways along every connection once automation begins.
export default function DataParticles({ progressRef, dark }) {
  const points = useRef();
  const count = SYSTEM_NODES.length * PER_LINK;
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const phases = useMemo(
    () => Array.from({ length: count }, (_, i) => (i * 0.618) % 1),
    [count],
  );
  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = progressRef.current;
    const { flow } = sceneState(s);
    points.current.visible = flow > 0.01;
    if (!points.current.visible) return;
    SYSTEM_NODES.forEach((node, n) => {
      const [x, y, z] = scenePosition(node, s, clock.elapsedTime);
      for (let k = 0; k < PER_LINK; k++) {
        const i = n * PER_LINK + k;
        phases[i] = (phases[i] + delta * (0.22 + k * 0.05)) % 1;
        const along = k === 1 ? 1 - phases[i] : phases[i];
        positions.set([x * along, y * along, z * along], i * 3);
      }
    });
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.material.opacity = flow;
  });
  return (
    <points ref={points} frustumCulled={false} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
          map={getDotTexture()}
        size={0.11}
        color={dark ? "#d3fbe7" : "#1f7a50"}
        transparent
        depthWrite={false}
        blending={dark ? AdditiveBlending : NormalBlending}
        sizeAttenuation
      />
    </points>
  );
}
