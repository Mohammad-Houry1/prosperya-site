import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, CanvasTexture, NormalBlending, SRGBColorSpace } from "three";
import { getDotTexture } from "./dotTexture.js";
import { sceneState } from "./sceneGeometry.js";
import styles from "./SystemNode3D.module.css";

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(59,155,113,0.9)");
  gradient.addColorStop(0.35, "rgba(59,155,113,0.28)");
  gradient.addColorStop(1, "rgba(59,155,113,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// Prosperya as the orchestration layer: dim at first, then present and luminous.
export default function OrchestrationCore({ progressRef, dark }) {
  const group = useRef();
  const ring = useRef();
  const halo = useRef();
  const dots = useRef();
  const mark = useRef();
  const glow = useMemo(glowTexture, []);
  const dotPositions = useMemo(() => {
    const values = new Float32Array(56 * 3);
    for (let i = 0; i < 56; i++) {
      const angle = (i / 56) * Math.PI * 2;
      values.set([Math.cos(angle) * 0.84, Math.sin(angle) * 0.84, 0.05], i * 3);
    }
    return values;
  }, []);
  useFrame(({ clock }) => {
    const { core, flow } = sceneState(progressRef.current);
    const breathe = 1 + Math.sin(clock.elapsedTime * 1.2) * 0.015 * flow;
    group.current.scale.setScalar((0.82 + core * 0.18) * breathe);
    ring.current.material.opacity = 0.35 + core * 0.65;
    halo.current.material.opacity = core * (dark ? 0.55 : 0.3);
    dots.current.material.opacity = core * 0.8;
    dots.current.rotation.z = -clock.elapsedTime * 0.05;
    if (mark.current) mark.current.style.opacity = String(0.55 + core * 0.45);
  });
  return (
    <group ref={group}>
      <mesh ref={halo} position={[0, 0, -0.05]}>
        <planeGeometry args={[3.6, 3.6]} />
        <meshBasicMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={dark ? AdditiveBlending : NormalBlending}
        />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[0.66, 64]} />
        <meshBasicMaterial color={dark ? "#071116" : "#f6f7f5"} />
      </mesh>
      <mesh ref={ring} position={[0, 0, 0.04]}>
        <torusGeometry args={[0.67, 0.012, 8, 96]} />
        <meshBasicMaterial color="#3b9b71" transparent />
      </mesh>
      <points ref={dots}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dotPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={getDotTexture()}
          size={0.05}
          color={dark ? "#8fdcb5" : "#2a7e57"}
          transparent
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      <Html center position={[0, 0, 0.1]} zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}>
        <svg ref={mark} className={styles.coreMark} viewBox="0 0 50 50" aria-hidden="true">
          <path d="M3 5 47 18 21 24 8 46 13 22ZM23 25 47 18 23 40Z" />
        </svg>
      </Html>
    </group>
  );
}
