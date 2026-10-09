import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useAppTheme } from "../theme/ThemeContext.jsx";
import CameraRig from "./CameraRig.jsx";
import StarField from "./StarField.jsx";
import NetworkFilaments from "./NetworkFilaments.jsx";
import ConnectionLine3D from "./ConnectionLine3D.jsx";
import DataParticles from "./DataParticles.jsx";
import OrchestrationCore from "./OrchestrationCore.jsx";
import SystemNode3D from "./SystemNode3D.jsx";
import { SYSTEM_NODES } from "./systemScene.data.js";

/*
  progressRef.current: story progress (0 fragmented → 1 orchestrated).
  viewRef.current: { tilt, zoom, yaw } framing driven by the story timeline.
  layoutRef.current: { left, right } — the free horizontal band (0–1 of the
  canvas) the architecture must sit in, so copy and system never collide.
*/
export default function OrchestrationCanvas({
  progressRef,
  viewRef,
  layoutRef,
  active = true,
}) {
  const { theme } = useAppTheme();
  const dark = theme === "dark";
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
    >
      <Suspense fallback={null}>
        <CameraRig viewRef={viewRef} layoutRef={layoutRef}>
          <StarField progressRef={progressRef} dark={dark} />
          <NetworkFilaments progressRef={progressRef} dark={dark} />
          <ConnectionLine3D progressRef={progressRef} dark={dark} />
          <DataParticles progressRef={progressRef} dark={dark} />
          <OrchestrationCore progressRef={progressRef} dark={dark} />
          {SYSTEM_NODES.map((node) => (
            <SystemNode3D key={node.id} node={node} progressRef={progressRef} />
          ))}
        </CameraRig>
      </Suspense>
    </Canvas>
  );
}
