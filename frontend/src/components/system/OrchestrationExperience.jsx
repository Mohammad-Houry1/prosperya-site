import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { useWebGLSupport } from "../../hooks/useWebGLSupport.js";
import SystemNetworkFallback from "./SystemNetworkFallback.jsx";
import CanvasErrorBoundary from "./CanvasErrorBoundary.jsx";
import styles from "./OrchestrationExperience.module.css";
import Skeleton from "../feedback/Skeleton.jsx";
const OrchestrationCanvas = lazy(
  () => import("../../three/OrchestrationCanvas.jsx"),
);

/*
  Chooses the renderer for the orchestration story: lazy WebGL on capable
  desktops, the shared-geometry SVG elsewhere. Rendering pauses whenever the
  stage is off-screen or the tab is hidden.
*/
export default function OrchestrationExperience({
  progressRef,
  viewRef,
  layoutRef,
  scene,
}) {
  const reduced = useReducedMotion();
  const small = useMediaQuery("(max-width: 980px)");
  const phone = useMediaQuery("(max-width: 640px)");
  const webgl = useWebGLSupport();
  const ref = useRef(null);
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    if (typeof IntersectionObserver === "undefined") return () => document.removeEventListener("visibilitychange", update);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const active = inView && visible;
  const fallback = (
    <SystemNetworkFallback
      progressRef={progressRef}
      scene={scene}
      active={active}
      reduced={reduced}
      compact={phone}
    />
  );
  return (
    <div ref={ref} className={styles.wrap}>
      {webgl && !reduced && !small ? (
        <CanvasErrorBoundary fallback={fallback}>
          <Suspense fallback={<Skeleton height="100%" />}>
            <OrchestrationCanvas
              progressRef={progressRef}
              viewRef={viewRef}
              layoutRef={layoutRef}
              scene={scene}
              active={active}
            />
          </Suspense>
        </CanvasErrorBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
