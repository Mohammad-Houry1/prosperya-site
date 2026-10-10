import { useEffect, useMemo, useRef } from "react";
import { FRAGMENT_LINKS, SYSTEM_NODES } from "../../three/systemScene.data.js";
import {
  clampProgress,
  createField,
  scenePosition,
  sceneState,
} from "../../three/sceneGeometry.js";
import { projectFallback as project } from "./fallbackProjection.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import SystemIcon from "./SystemIcon.jsx";
import styles from "./SystemNetworkFallback.module.css";

const STARS = 170;

/*
  Lightweight 2D telling of the orchestration story for phones, reduced
  motion and browsers without WebGL. Geometry is shared with the 3D scene.
  compact: icon-only systems and a tighter crop, legible at phone widths.
*/
export default function SystemNetworkFallback({
  progressRef,
  active = true,
  reduced = false,
  compact = false,
}) {
  const { locale } = useLocale();
  const svg = useRef();
  const field = useMemo(() => createField(STARS, 5), []);
  const initial = reduced ? 1 : clampProgress(progressRef?.current ?? 0);
  useEffect(() => {
    const root = svg.current;
    const nodes = root.querySelectorAll("[data-node]");
    const hubs = root.querySelectorAll("[data-hub]");
    const fragments = root.querySelectorAll("[data-fragment]");
    const packets = root.querySelectorAll("[data-packet]");
    const stars = root.querySelectorAll("[data-star]");
    const core = root.querySelector("[data-core]");
    let frame = 0;
    let previous = -1;
    let points = [];
    let phase = 0;
    let last = 0;
    const render = (now = 0) => {
      const p = reduced ? 1 : clampProgress(progressRef?.current ?? initial);
      const state = sceneState(p);
      if (p !== previous) {
        points = SYSTEM_NODES.map((node) => project(scenePosition(node, p)));
        nodes.forEach((element, index) => {
          element.setAttribute("transform", `translate(${points[index].join(" ")})`);
          const linked = state.links * 1.6 - index * 0.075 > 0.92;
          element.dataset.linked = String(linked);
        });
        hubs.forEach((element, index) => {
          const own = Math.max(0, Math.min(1, state.links * 1.6 - index * 0.075));
          const [x, y] = points[index];
          element.setAttribute("d", `M300 220 L${300 + (x - 300) * own} ${220 + (y - 220) * own}`);
          element.style.opacity = String(own * 0.7);
        });
        fragments.forEach((element, index) => {
          const [a, b] = FRAGMENT_LINKS[index];
          element.setAttribute("d", `M${points[a].join(" ")} L${points[b].join(" ")}`);
          element.style.opacity = String(state.noise * 0.45);
        });
        stars.forEach((element, index) => {
          const i = index * 3;
          const x = field.chaos[i] + (field.order[i] - field.chaos[i]) * state.order;
          const y = field.chaos[i + 1] + (field.order[i + 1] - field.chaos[i + 1]) * state.order;
          const [px, py] = project([x, y]);
          element.setAttribute("cx", px.toFixed(1));
          element.setAttribute("cy", py.toFixed(1));
        });
        core.style.opacity = String(0.55 + state.core * 0.45);
        previous = p;
      }
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      phase = (phase + delta * 0.25) % 1;
      packets.forEach((element, index) => {
        const node = Math.floor(index / 2);
        const along = index % 2 ? 1 - ((phase + node * 0.13) % 1) : (phase + node * 0.13) % 1;
        const [x, y] = points[node];
        element.setAttribute("cx", (300 + (x - 300) * along).toFixed(1));
        element.setAttribute("cy", (220 + (y - 220) * along).toFixed(1));
        element.style.opacity = String(reduced ? 0 : state.flow);
      });
      if (active && !reduced) frame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frame);
  }, [progressRef, active, reduced, initial, field]);
  const initialPoints = SYSTEM_NODES.map((node) => project(scenePosition(node, initial)));
  return (
    <svg
      ref={svg}
      className={styles.network}
      viewBox={compact ? "68 18 464 404" : "0 0 600 440"}
      aria-hidden="true"
      focusable="false"
    >
      {Array.from({ length: STARS }, (_, index) => (
        <circle
          key={index}
          data-star
          className={index % 7 ? styles.star : styles.brightStar}
          r={index % 7 ? 1 : 1.6}
        />
      ))}
      {FRAGMENT_LINKS.map((_, index) => (
        <path key={index} data-fragment className={styles.fragment} />
      ))}
      {SYSTEM_NODES.map((node) => (
        <path key={node.id} data-hub className={styles.connection} />
      ))}
      {SYSTEM_NODES.flatMap((node) => [
        <circle key={`${node.id}-out`} data-packet r="2.4" className={styles.packet} />,
        <circle key={`${node.id}-in`} data-packet r="1.7" className={styles.packet} />,
      ])}
      <g data-core>
        <circle className={styles.halo} cx="300" cy="220" r="70" />
        <circle className={styles.core} cx="300" cy="220" r="42" />
        <path
          className={styles.mark}
          transform="translate(282 202) scale(0.72)"
          d="M3 5 47 18 21 24 8 46 13 22ZM23 25 47 18 23 40Z"
        />
      </g>
      {SYSTEM_NODES.map((node, index) => (
        <g
          key={node.id}
          data-node
          data-linked="false"
          className={styles.node}
          transform={`translate(${initialPoints[index].join(" ")})`}
        >
          {compact ? (
            <>
              <rect x="-19" y="-19" width="38" height="38" rx="9" />
              <g transform="translate(-10 -10)" className={styles.icon}>
                <SystemIcon name={node.icon} size={20} />
              </g>
            </>
          ) : (
            <>
              <rect x="-56" y="-15" width="112" height="30" rx="3" />
              <g transform="translate(-47 -7)" className={styles.icon}>
                <SystemIcon name={node.icon} size={14} />
              </g>
              <text x="-27" y="0" dominantBaseline="central">
                {(node.label[locale] ?? node.label.en).toUpperCase()}
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
