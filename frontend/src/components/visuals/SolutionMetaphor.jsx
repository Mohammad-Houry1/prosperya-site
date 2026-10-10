import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import SignalWave from "./SignalWave.jsx";
import styles from "./SolutionMetaphor.module.css";

/*
  One metaphor per business function, all driven by the same progress value:
  consolidation (finance) · workflow (operations) · network (supply chain) ·
  insight (data). Each scene renders static SVG once and exposes an update
  that moves only what the story needs.
*/
const clamp = (v) => Math.max(0, Math.min(1, v));
const band = (p, from, span) => clamp((p - from) / span);
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;


const entityY = (i, count, height) => count === 1 ? height / 2 : 70 + i * (height - 140) / Math.max(1, count - 1);
const streamPath = (i, copy) => "M128 " + entityY(i, copy.entities.length, copy.height) + " C220 " + entityY(i, copy.entities.length, copy.height) + " 220 " + copy.height / 2 + " 300 " + copy.height / 2;
const positions = (count, x, height) => Array.from({ length: count }, (_, i) => [x, entityY(i, count, height)]);
const laneHeight = copy => Math.max(80, Math.ceil(Math.ceil(copy.steps.length / Math.max(1, copy.lanes.length)) / 4) * 72);
const stepPositions = copy => {
  const lanes = Math.max(1, copy.lanes.length);
  const perLane = Math.max(1, Math.ceil(copy.steps.length / lanes));
  return copy.steps.map((_, index) => {
    const lane = Math.floor(index / perLane);
    const inLane = Math.min(perLane, copy.steps.length - lane * perLane);
    const offset = index % perLane;
    const row = Math.floor(offset / 4);
    const rowCount = Math.min(4, inLane - row * 4);
    const column = offset % 4;
    const x = rowCount === 1 ? 350 : 160 + (row % 2 ? rowCount - 1 - column : column) * 370 / (rowCount - 1);
    return [x, 70 + lane * laneHeight(copy) + row * 72];
  });
};
const stepPath = copy => stepPositions(copy).map(([x, y], i) => (i ? "L" : "M") + x + " " + y).join(" ");
const networkRoutes = copy => {
  const sources = positions(copy.suppliers.length, 70, copy.height);
  const hubs = positions(copy.hubs.length, 300, copy.height);
  const channels = positions(copy.channels.length, 530, copy.height);
  const connect = (left, right) => left.flatMap(([x,y]) => right.map(([tx,ty]) => "M" + (x + 50) + " " + y + " C" + (x + 130) + " " + y + " " + (tx - 130) + " " + ty + " " + (tx - 50) + " " + ty));
  return hubs.length ? [...connect(sources, hubs), ...connect(hubs, channels)] : connect(sources, channels);
};

const consolidation = {
  render: (copy) => (
    <>
      {copy.entities.map((name, i) => (
        <g key={i}>
          <path className={styles.base} d={streamPath(i, copy)} />
          <path className={styles.live} data-stream d={streamPath(i, copy)} pathLength="1" />
          <circle className={styles.packet} data-packet r="3" />
          <rect x="24" y={entityY(i, copy.entities.length, copy.height) - 17} width="104" height="34" rx="3" className={styles.chip} />
          <text x="76" y={entityY(i, copy.entities.length, copy.height)} className={styles.chipText}>{name}</text>
        </g>
      ))}
      <rect x="288" y={copy.height / 2 - 34} width="166" height="68" rx="4" className={styles.core} data-core />
      <text x="371" y={copy.height / 2} className={styles.coreText}>{copy.ledger}</text>
      <path className={styles.base} d={"M454 " + copy.height / 2 + " L466 " + copy.height / 2} />
      <g transform={"translate(466 " + (copy.height / 2 - 112) + ")"}>
        <rect width="118" height="224" rx="4" className={styles.card} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} data-bar x={16 + i * 19} y="40" width="11" height="140" className={styles.bar} style={{ "--h": [0.45, 0.62, 0.55, 0.78, 0.9][i] }} />
        ))}
        <text x="59" y="206" className={styles.cardText} data-check>✓ {copy.report}</text>
      </g>
    </>
  ),
  update(root, p, t) {
    const streams = root.querySelectorAll("[data-stream]");
    streams.forEach((path, i) => (path.style.strokeDashoffset = String(1 - band(p, i * 0.6 / Math.max(1, streams.length - 1), 0.4))));
    root.querySelectorAll("[data-packet]").forEach((dot, i) => {
      const path = streams[i];
      const along = (t * 0.25 + i * 0.2) % 1;
      const point = path.getPointAtLength(along * path.getTotalLength());
      dot.setAttribute("cx", point.x.toFixed(1));
      dot.setAttribute("cy", point.y.toFixed(1));
      dot.style.opacity = String(band(p, 0.35, 0.15));
    });
    root.querySelector("[data-core]").dataset.on = String(p > 0.42);
    root.querySelectorAll("[data-bar]").forEach((bar, i) => {
      bar.style.transform = `scaleY(${(Number(bar.style.getPropertyValue("--h")) * band(p, 0.5 + i * 0.05, 0.3)).toFixed(3)})`;
    });
    root.querySelector("[data-check]").style.opacity = String(band(p, 0.9, 0.1));
  },
};


const workflow = {
  render: (copy) => (
    <>
      {copy.lanes.map((lane, i) => (
        <g key={lane}>
          <rect x="16" y={30 + i * laneHeight(copy)} width="568" height={laneHeight(copy) - 10} rx="4" className={styles.lane} />
          <text x="34" y={70 + i * laneHeight(copy)} className={styles.laneText}>{lane}</text>
        </g>
      ))}
      <path className={styles.base} d={stepPath(copy)} />
      <path className={styles.live} data-chain d={stepPath(copy)} pathLength="1" />
      {stepPositions(copy).map(([x, y], i) => (
        <g key={i} data-step>
          <rect x={x - 46} y={y - 17} width="92" height="34" rx="3" className={styles.chip} />
          <text x={x} y={y} className={styles.chipText}>{copy.steps[i]}</text>
        </g>
      ))}
      <circle className={styles.packet} data-runner r="5" />
    </>
  ),
  update(root, p, t) {
    const path = root.querySelector("[data-chain]");
    path.style.strokeDashoffset = String(1 - band(p, 0.05, 0.6));
    root.querySelectorAll("[data-step]").forEach((step, i) => (step.dataset.on = String(band(p, 0.05, 0.6) >= i / Math.max(1, root.querySelectorAll("[data-step]").length - 1) - 0.01)));
    const runner = root.querySelector("[data-runner]");
    const length = path.getTotalLength();
    if (!length) { runner.style.opacity = "0"; return; }
    const point = path.getPointAtLength(((t * 0.12) % 1) * length);
    runner.setAttribute("cx", point.x.toFixed(1));
    runner.setAttribute("cy", point.y.toFixed(1));
    runner.style.opacity = String(band(p, 0.7, 0.2));
  },
};


const network = {
  render: (copy) => (
    <>
      {networkRoutes(copy).map((d, i) => (
        <g key={i}>
          <path className={styles.base} d={d} />
          <path className={styles.live} data-route d={d} pathLength="1" />
          <circle className={styles.packet} data-truck r="3" />
        </g>
      ))}
      {[...positions(copy.suppliers.length, 70, copy.height).map((at, i) => [at, copy.suppliers[i], 100]), ...positions(copy.hubs.length, 300, copy.height).map((at, i) => [at, copy.hubs[i], 88]), ...positions(copy.channels.length, 530, copy.height).map((at, i) => [at, copy.channels[i], 100])].map(([[x, y], name, w], index) => (
        <g key={index} data-site>
          <rect x={x - w / 2} y={y - 17} width={w} height="34" rx="3" className={styles.chip} />
          <text x={x} y={y} className={styles.chipText}>{name}</text>
        </g>
      ))}
    </>
  ),
  update(root, p, t) {
    const paths = root.querySelectorAll("[data-route]");
    paths.forEach((path, i) => (path.style.strokeDashoffset = String(1 - band(p, (i % 6) * 0.06 + (i >= 5 ? 0.25 : 0), 0.3))));
    root.querySelectorAll("[data-truck]").forEach((truck, i) => {
      const path = paths[i];
      const point = path.getPointAtLength((((t * 0.18) + i * 0.13) % 1) * path.getTotalLength());
      truck.setAttribute("cx", point.x.toFixed(1));
      truck.setAttribute("cy", point.y.toFixed(1));
      truck.style.opacity = String(band(p, 0.65, 0.2));
    });
    root.querySelectorAll("[data-site]").forEach((site) => (site.dataset.on = String(p > 0.4)));
  },
};

const random = seeded(17);
const POINTS = Array.from({ length: 64 }, (_, i) => {
  const x = 70 + (i / 63) * 480;
  const trend = 340 - 190 * ((i / 63) ** 1.25) - 18 * Math.sin(i / 6);
  return { chaos: [60 + random() * 500, 70 + random() * 300], order: [x, trend + (random() - 0.5) * 16] };
});
const TREND = POINTS.map(({ order: [x] }, i) => `${i ? "L" : "M"}${x.toFixed(1)} ${(340 - 190 * ((i / 63) ** 1.25) - 18 * Math.sin(i / 6)).toFixed(1)}`).join(" ");
const insight = {
  render: (copy) => (
    <>
      <g data-axes className={styles.axes}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="60" x2="560" y1={110 + i * 80} y2={110 + i * 80} />
        ))}
        <line x1="60" x2="60" y1="80" y2="370" />
      </g>
      <path className={styles.live} data-trend d={TREND} pathLength="1" />
      {POINTS.map((_, i) => (
        <circle key={i} data-point r={i % 7 ? 2.4 : 3.4} className={styles.point} />
      ))}
      <text x="552" y="118" className={styles.trendText} data-label>{copy.trend} ↗</text>
    </>
  ),
  update(root, p) {
    const order = band(p, 0.05, 0.6);
    const eased = order * order * (3 - 2 * order);
    root.querySelectorAll("[data-point]").forEach((dot, i) => {
      const { chaos, order: target } = POINTS[i];
      dot.setAttribute("cx", (chaos[0] + (target[0] - chaos[0]) * eased).toFixed(1));
      dot.setAttribute("cy", (chaos[1] + (target[1] - chaos[1]) * eased).toFixed(1));
    });
    root.querySelector("[data-axes]").style.opacity = String(band(p, 0.3, 0.3));
    root.querySelector("[data-trend]").style.strokeDashoffset = String(1 - band(p, 0.6, 0.35));
    root.querySelector("[data-label]").style.opacity = String(band(p, 0.9, 0.1));
  },
};

const SCENES = { consolidation, workflow, network, insight };

function SvgSolutionMetaphor({ animation, progressRef, label }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const scene = SCENES[animation.type];
  const copy = { ledger: animation.centreLabel, report: animation.resultLabel, trend: animation.signalLabel, entities: animation.sources || [], lanes: animation.lanes || [], steps: animation.steps || [], suppliers: animation.suppliers || [], hubs: animation.hubs || [], channels: animation.channels || [] };
  const contentHeight = animation.type === "consolidation" ? copy.entities.length * 60 + 80
    : animation.type === "network" ? Math.max(copy.suppliers.length, copy.hubs.length, copy.channels.length) * 60 + 80
    : animation.type === "workflow" ? Math.max(1, copy.lanes.length) * laneHeight(copy) + 100 : 440;
  copy.height = Math.max(440, contentHeight);
  useEffect(() => {
    const root = ref.current;
    let frame = 0;
    let visible = false;
    const start = performance.now();
    const render = () => {
      const p = reduced ? 1 : (progressRef?.current ?? 1);
      scene.update(root, p, (performance.now() - start) / 1000);
      if (visible && !reduced && !document.hidden) frame = requestAnimationFrame(render);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      render();
    });
    observer.observe(root);
    render();
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden) render();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [scene, reduced, progressRef, animation]);
  return (
    <svg ref={ref} className={styles.scene} viewBox={"0 0 600 " + copy.height} data-solution-animation={animation.type} role="img" aria-label={label}>
      {scene.render(copy)}
    </svg>
  );
}

export default function SolutionMetaphor({ animation, progressRef, label }) {
  if (animation?.type === "flowing-lines") return <div className={styles.scene} data-solution-animation="flowing-lines" role="img" aria-label={label}><SignalWave shape="rise" progressRef={progressRef} /></div>;
  if (!SCENES[animation?.type]) return null;
  return <SvgSolutionMetaphor animation={animation} progressRef={progressRef} label={label} />;
}
