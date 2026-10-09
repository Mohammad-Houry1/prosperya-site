import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, NormalBlending } from "three";
import { scenePosition, sceneState } from "./sceneGeometry.js";
import { SYSTEM_NODES } from "./systemScene.data.js";

// Core → system connections draw outward as Prosperya becomes the orchestration layer.
export default function ConnectionLine3D({ progressRef, dark }) {
  const lines = useRef();
  const positions = useMemo(() => new Float32Array(SYSTEM_NODES.length * 6), []);
  useFrame(({ clock }) => {
    const s = progressRef.current;
    const { links, flow } = sceneState(s);
    SYSTEM_NODES.forEach((node, index) => {
      // Stagger each connection so the network assembles system by system.
      const own = Math.max(0, Math.min(1, links * 1.6 - index * 0.075));
      const point = scenePosition(node, s, clock.elapsedTime);
      positions.set([0, 0, 0], index * 6);
      positions.set(point.map((value) => value * own), index * 6 + 3);
    });
    lines.current.geometry.attributes.position.needsUpdate = true;
    lines.current.material.opacity = links * (dark ? 0.5 + flow * 0.25 : 0.55 + flow * 0.2);
  });
  return (
    <lineSegments ref={lines} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={dark ? "#62c596" : "#23764f"}
        transparent
        opacity={0}
        depthWrite={false}
        blending={dark ? AdditiveBlending : NormalBlending}
      />
    </lineSegments>
  );
}
