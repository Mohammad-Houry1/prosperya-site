import { useEffect, useRef } from "react";
import { useGsapContext } from "../../motion/hooks/useGsapContext.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import styles from "./ArchitectureMorph.module.css";

const CORE = [500, 235];
const BEFORE_AT = [[200, 90], [500, 80], [800, 90], [150, 235], [500, 250], [850, 235], [500, 390]];
const TANGLE = [[0, 1], [1, 2], [0, 3], [0, 4], [1, 4], [2, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 6], [5, 6], [0, 5]];
const clamp = (v) => Math.max(0, Math.min(1, v));
const band = (p, from, span) => {
  const t = clamp((p - from) / span);
  return t * t * (3 - 2 * t);
};
const afterAt = (i, count) => {
  const angle = -Math.PI / 2 + (i * Math.PI * 2) / count + Math.PI / count;
  return [CORE[0] + Math.cos(angle) * 360, CORE[1] + Math.sin(angle) * 158];
};
const mix = (a, b, t) => a + (b - a) * t;

/*
  The whole transformation in one frame, scrubbed by scroll:
  0.0–0.2  before: siloed systems, tangled manual links
  0.2–0.5  the tangle dissolves; old systems consolidate into the core
  0.5–0.8  the connected architecture radiates out; spokes draw
  0.8–1.0  data flows. Everything is derived from one progress value.
*/
function frame(p, afterCount) {
  const collapse = band(p, 0.22, 0.26);
  return {
    tangle: 1 - band(p, 0.12, 0.2),
    before: BEFORE_AT.map(([x, y]) => ({
      x: mix(x, CORE[0], collapse),
      y: mix(y, CORE[1], collapse),
      s: mix(1, 0.4, collapse),
      o: 1 - band(p, 0.36, 0.14),
    })),
    core: band(p, 0.3, 0.2),
    after: Array.from({ length: afterCount }, (_, i) => {
      const t = band(p, 0.48 + i * 0.018, 0.2);
      const [x, y] = afterAt(i, afterCount);
      return { x: mix(CORE[0], x, t), y: mix(CORE[1], y, t), s: mix(0.5, 1, t), o: t, line: band(p, 0.58 + i * 0.015, 0.16) };
    }),
    flow: band(p, 0.8, 0.1),
    phase: p < 0.3 ? 0 : p < 0.72 ? 1 : 2,
  };
}

function Diagram({ before, after, progress, svgRef, labels }) {
  const f = frame(progress, after.length);
  return (
    <svg ref={svgRef} viewBox="0 0 1000 470" className={styles.svg} role="img" aria-label={labels.aria}>
      <g data-tangle style={{ opacity: f.tangle }}>
        {TANGLE.map(([a, b], i) => (
          <line key={i} x1={BEFORE_AT[a][0]} y1={BEFORE_AT[a][1]} x2={BEFORE_AT[b][0]} y2={BEFORE_AT[b][1]} className={styles.tangle} />
        ))}
      </g>
      {after.map((_, i) => {
        const [x, y] = afterAt(i, after.length);
        return (
          <g key={i}>
            <line data-spoke x1={CORE[0]} y1={CORE[1]} x2={x} y2={y} pathLength="1" className={styles.spoke} style={{ strokeDashoffset: 1 - f.after[i].line }} />
            <circle data-flow r="3" className={styles.packet} cx={mix(CORE[0], x, 0.5)} cy={mix(CORE[1], y, 0.5)} style={{ opacity: f.flow }} />
          </g>
        );
      })}
      <g data-core style={{ opacity: f.core }}>
        <circle cx={CORE[0]} cy={CORE[1]} r="96" className={styles.halo} />
        <circle cx={CORE[0]} cy={CORE[1]} r="68" className={styles.core} />
        <text x={CORE[0]} y={CORE[1] - 6} className={styles.coreName}>NetSuite</text>
        <text x={CORE[0]} y={CORE[1] + 18} className={styles.coreSub}>{labels.core}</text>
      </g>
      {before.map((name, i) => {
        const n = f.before[i];
        return (
          <g key={name} data-before style={{ transform: `translate(${n.x}px, ${n.y}px) scale(${n.s})`, opacity: n.o }}>
            <rect x="-82" y="-20" width="164" height="40" rx="3" className={styles.oldNode} />
            <text className={styles.nodeText}>{name}</text>
          </g>
        );
      })}
      {after.map((name, i) => {
        const n = f.after[i];
        return (
          <g key={name} data-after style={{ transform: `translate(${n.x}px, ${n.y}px) scale(${n.s})`, opacity: n.o }}>
            <rect x="-66" y="-19" width="132" height="38" rx="3" className={styles.newNode} />
            <text className={styles.nodeText}>{name}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ArchitectureMorph({ detail, labels }) {
  const reduced = useReducedMotion();
  const compact = useMediaQuery("(max-width: 900px)");
  const staticMode = reduced || compact;
  const section = useRef(null);
  const svg = useRef(null);
  const status = useRef(null);
  const progress = useRef(0);
  useGsapContext(
    section,
    ({ gsap }) => {
      if (staticMode) return;
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top+=64", end: "bottom bottom", scrub: 0.7 },
      });
    },
    [staticMode],
  );
  // Apply each frame directly to the SVG while the stage is on screen.
  useEffect(() => {
    if (staticMode) return undefined;
    let raf = 0;
    let last = -1;
    const loop = () => {
      const p = progress.current;
      if (p !== last && svg.current) {
        last = p;
        const f = frame(p, detail.after.length);
        const root = svg.current;
        root.querySelector("[data-tangle]").style.opacity = f.tangle;
        root.querySelector("[data-core]").style.opacity = f.core;
        root.querySelectorAll("[data-before]").forEach((node, i) => {
          const n = f.before[i];
          node.style.transform = `translate(${n.x}px, ${n.y}px) scale(${n.s})`;
          node.style.opacity = n.o;
        });
        root.querySelectorAll("[data-after]").forEach((node, i) => {
          const n = f.after[i];
          node.style.transform = `translate(${n.x}px, ${n.y}px) scale(${n.s})`;
          node.style.opacity = n.o;
        });
        root.querySelectorAll("[data-spoke]").forEach((line, i) => (line.style.strokeDashoffset = 1 - f.after[i].line));
        root.querySelectorAll("[data-flow]").forEach((dot) => (dot.style.opacity = f.flow));
        if (status.current) status.current.dataset.phase = f.phase;
      }
      // Once connected, packets travel out along every spoke.
      if (p > 0.8 && svg.current) {
        const t = performance.now() / 1000;
        svg.current.querySelectorAll("[data-flow]").forEach((dot, i) => {
          const [x, y] = afterAt(i, detail.after.length);
          const along = (t * 0.35 + i * 0.13) % 1;
          dot.setAttribute("cx", mix(CORE[0] + (x - CORE[0]) * 0.2, x, along).toFixed(1));
          dot.setAttribute("cy", mix(CORE[1] + (y - CORE[1]) * 0.2, y, along).toFixed(1));
        });
      }
      raf = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(loop);
    });
    observer.observe(section.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [staticMode, detail.after.length]);

  if (staticMode)
    return (
      <div className={styles.static}>
        {[
          [labels.before, detail.beforeCaption, 0],
          [labels.after, detail.afterCaption, 1],
        ].map(([title, caption, p]) => (
          <figure key={title} className={styles.panel} data-reveal="card">
            <figcaption>
              <span>{title}</span>
              {caption}
            </figcaption>
            {compact ? (
              <ul className={`${styles.chips} ${p ? styles.chipsAfter : ""}`}>
                {p ? <li className={styles.chipCore}>NetSuite</li> : null}
                {(p ? detail.after : detail.before).map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            ) : (
              <Diagram before={detail.before} after={detail.after} progress={p} labels={labels} />
            )}
          </figure>
        ))}
      </div>
    );
  return (
    <div ref={section} className={styles.track}>
      <div className={styles.stage}>
        <div ref={status} className={styles.status} data-phase="0">
          <ol aria-hidden="true">
            <li>{labels.before}</li>
            <li>{labels.transform}</li>
            <li>{labels.after}</li>
          </ol>
          <p className={styles.captionBefore}>{detail.beforeCaption}</p>
          <p className={styles.captionAfter}>{detail.afterCaption}</p>
        </div>
        <Diagram before={detail.before} after={detail.after} progress={0} svgRef={svg} labels={labels} />
      </div>
    </div>
  );
}
