import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useLocale } from "../i18n/LocaleContext.jsx";
import SystemIcon from "../components/system/SystemIcon.jsx";
import { scenePosition, sceneState } from "./sceneGeometry.js";
import { SYSTEM_NODES } from "./systemScene.data.js";
import styles from "./SystemNode3D.module.css";

const LABEL_GAP = 0.5;

// A system: bright endpoint plus a label that sits just outside it, facing away from the core.
export default function SystemNode3D({ node, progressRef }) {
  const { locale } = useLocale();
  const group = useRef();
  const label = useRef();
  const chip = useRef();
  const index = SYSTEM_NODES.indexOf(node);
  useFrame(({ clock }) => {
    const s = progressRef.current;
    const [x, y, z] = scenePosition(node, s, clock.elapsedTime);
    group.current.position.set(x, y, z);
    const length = Math.hypot(x, y) || 1;
    label.current.position.set((x / length) * LABEL_GAP, (y / length) * LABEL_GAP * 0.7, 0);
    const { links } = sceneState(s);
    const linked = links * 1.6 - index * 0.075 > 0.92;
    if (chip.current && chip.current.dataset.linked !== String(linked))
      chip.current.dataset.linked = String(linked);
  });
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#8fe0b8" />
      </mesh>
      <group ref={label}>
        <Html center distanceFactor={9} zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}>
          <div ref={chip} className={styles.label} data-linked="false">
            <SystemIcon name={node.icon} />
            <span>{node.label[locale] ?? node.label.en}</span>
          </div>
        </Html>
      </group>
    </group>
  );
}
