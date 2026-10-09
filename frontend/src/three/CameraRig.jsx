import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

// The architecture needs ~8.8 × 6.6 world units once its labels are included.
const SCENE_WIDTH = 8.8;
const SCENE_HEIGHT = 6.6;
const damp = (current, target, delta, speed) =>
  current + (target - current) * (1 - Math.exp(-delta * speed));

/*
  Fits the architecture into the free band beside the copy, then applies the
  story framing (tilt → frontal, gentle dolly) and a light pointer parallax.
  Everything is damped, so scroll scrubbing and pointer input never snap.
*/
export default function CameraRig({ children, viewRef, layoutRef }) {
  const group = useRef();
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    const move = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  useFrame(({ camera, size }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const { left = 0.45, right = 0.97 } = layoutRef?.current ?? {};
    const { tilt = 0, zoom = 0, yaw = 0 } = viewRef?.current ?? {};
    const band = Math.max(0.2, right - left) * size.width;
    const pixelsPerUnit = Math.min(band / SCENE_WIDTH, size.height / SCENE_HEIGHT);
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    const distance = size.height / 2 / (pixelsPerUnit * tan);
    const offset = (((left + right) / 2) * size.width - size.width / 2) / pixelsPerUnit;
    camera.position.z = damp(camera.position.z, distance * (1 - zoom * 0.1), delta, 4);
    camera.lookAt(0, 0, 0);
    const node = group.current;
    node.position.x = damp(node.position.x, offset, delta, 5);
    node.rotation.x = damp(node.rotation.x, tilt + pointer.current.y * 0.05, delta, 3);
    node.rotation.y = damp(node.rotation.y, yaw + pointer.current.x * 0.09, delta, 3);
  });
  return <group ref={group}>{children}</group>;
}
