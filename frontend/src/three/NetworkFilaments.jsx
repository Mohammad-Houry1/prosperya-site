import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, NormalBlending } from "three";
import { getDotTexture } from "./dotTexture.js";
import { scenePosition, sceneState } from "./sceneGeometry.js";
import { FRAGMENT_LINKS, SYSTEM_NODES } from "./systemScene.data.js";

const RAYS = 18;

/*
  Two layers of "before" and "after" wiring:
  - dashed point-to-point links: manual handoffs that dissolve as order arrives
  - radial rays with bright tips: the orchestration layer's reach
*/
export default function NetworkFilaments({ progressRef, dark }) {
  const fragments = useRef();
  const rays = useRef();
  const tips = useRef();
  const fragmentPositions = useMemo(
    () => new Float32Array(FRAGMENT_LINKS.length * 6),
    [],
  );
  const rayTargets = useMemo(
    () =>
      Array.from({ length: RAYS }, (_, i) => {
        const angle = (i / RAYS) * Math.PI * 2 + 0.17 + (i % 3) * 0.06;
        const reach = 3.1 + ((i * 53) % 10) / 10;
        return [Math.cos(angle) * reach * 1.08, Math.sin(angle) * reach * 0.8, -0.1];
      }),
    [],
  );
  const rayPositions = useMemo(() => new Float32Array(RAYS * 6), []);
  const tipPositions = useMemo(() => new Float32Array(RAYS * 3), []);
  useFrame(({ clock }) => {
    const s = progressRef.current;
    const { noise, links } = sceneState(s);
    const t = clock.elapsedTime;
    FRAGMENT_LINKS.forEach(([a, b], index) => {
      fragmentPositions.set(scenePosition(SYSTEM_NODES[a], s, t), index * 6);
      fragmentPositions.set(scenePosition(SYSTEM_NODES[b], s, t), index * 6 + 3);
    });
    const fragmentLine = fragments.current;
    fragmentLine.geometry.attributes.position.needsUpdate = true;
    fragmentLine.computeLineDistances();
    fragmentLine.material.opacity = noise * (dark ? 0.32 : 0.38);
    fragmentLine.visible = noise > 0.01;
    rayTargets.forEach((target, index) => {
      const reach = links;
      rayPositions.set([0, 0, 0], index * 6);
      rayPositions.set(target.map((value) => value * reach), index * 6 + 3);
      tipPositions.set(target.map((value) => value * reach), index * 3);
    });
    rays.current.geometry.attributes.position.needsUpdate = true;
    rays.current.material.opacity = links * (dark ? 0.18 : 0.2);
    tips.current.geometry.attributes.position.needsUpdate = true;
    tips.current.material.opacity = links;
  });
  const blending = dark ? AdditiveBlending : NormalBlending;
  return (
    <>
      <lineSegments ref={fragments} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[fragmentPositions, 3]} />
        </bufferGeometry>
        <lineDashedMaterial
          color={dark ? "#9aa8a4" : "#5d6b65"}
          dashSize={0.09}
          gapSize={0.08}
          transparent
          depthWrite={false}
        />
      </lineSegments>
      <lineSegments ref={rays} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[rayPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={dark ? "#3b9b71" : "#2a7e57"}
          transparent
          depthWrite={false}
          blending={blending}
        />
      </lineSegments>
      <points ref={tips} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[tipPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={getDotTexture()}
          size={0.075}
          color={dark ? "#c9f5de" : "#1f7a50"}
          transparent
          depthWrite={false}
          blending={blending}
          sizeAttenuation
        />
      </points>
    </>
  );
}
