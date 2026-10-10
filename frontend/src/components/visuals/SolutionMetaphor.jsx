import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
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

const LABELS = {
  en: {
    ledger: "Consolidated ledger", report: "Close ready", entities: ["France", "UK", "Germany", "US", "Singapore"],
    lanes: ["Sales", "Operations", "Finance"], steps: ["Order", "Confirm", "Allocate", "Ship", "Invoice", "Collect"],
    suppliers: ["Supplier A", "Supplier B", "Supplier C"], hubs: ["Warehouse", "Hub"], channels: ["Stores", "Online", "Wholesale"],
    trend: "Signal",
  },
  fr: {
    ledger: "Grand livre consolidé", report: "Clôture prête", entities: ["France", "R.-Uni", "Allemagne", "É.-Unis", "Singapour"],
    lanes: ["Ventes", "Opérations", "Finance"], steps: ["Commande", "Confirmer", "Allouer", "Expédier", "Facturer", "Encaisser"],
    suppliers: ["Fournisseur A", "Fournisseur B", "Fournisseur C"], hubs: ["Entrepôt", "Hub"], channels: ["Magasins", "En ligne", "Grossistes"],
    trend: "Signal",
  },
};

const entityY = (i) => 76 + i * 72;
const streamPath = (i) => `M128 ${entityY(i)} C220 ${entityY(i)} 220 220 300 220`;

const consolidation = {
  render: (copy) => (
    <>
      {copy.entities.map((name, i) => (
        <g key={name}>
          <path className={styles.base} d={streamPath(i)} />
          <path className={styles.live} data-stream d={streamPath(i)} pathLength="1" />
          <circle className={styles.packet} data-packet r="3" />
          <rect x="24" y={entityY(i) - 17} width="104" height="34" rx="3" className={styles.chip} />
          <text x="76" y={entityY(i)} className={styles.chipText}>{name}</text>
        </g>
      ))}
      <rect x="288" y="186" width="166" height="68" rx="4" className={styles.core} data-core />
      <text x="371" y="220" className={styles.coreText}>{copy.ledger}</text>
      <path className={styles.base} d="M454 220 L466 220" />
      <g transform="translate(466 108)">
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
    streams.forEach((path, i) => (path.style.strokeDashoffset = String(1 - band(p, i * 0.05, 0.4))));
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

const STEP_AT = [[150, 110], [270, 110], [270, 220], [400, 220], [400, 330], [530, 330]];
const chain = STEP_AT.map(([x, y], i) => (i ? `L${x} ${y}` : `M${x} ${y}`)).join(" ");
const workflow = {
  render: (copy) => (
    <>
      {copy.lanes.map((lane, i) => (
        <g key={lane}>
          <rect x="16" y={70 + i * 110} width="568" height="80" rx="4" className={styles.lane} />
          <text x="34" y={110 + i * 110} className={styles.laneText}>{lane}</text>
        </g>
      ))}
      <path className={styles.base} d={chain} />
      <path className={styles.live} data-chain d={chain} pathLength="1" />
      {STEP_AT.map(([x, y], i) => (
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
    root.querySelectorAll("[data-step]").forEach((step, i) => (step.dataset.on = String(band(p, 0.05, 0.6) >= i / 5 - 0.01)));
    const runner = root.querySelector("[data-runner]");
    const point = path.getPointAtLength(((t * 0.12) % 1) * path.getTotalLength());
    runner.setAttribute("cx", point.x.toFixed(1));
    runner.setAttribute("cy", point.y.toFixed(1));
    runner.style.opacity = String(band(p, 0.7, 0.2));
  },
};

const SUPPLIERS = [[70, 110], [70, 220], [70, 330]];
const HUBS = [[300, 160], [300, 290]];
const CHANNELS = [[530, 110], [530, 220], [530, 330]];
const routes = [
  ...SUPPLIERS.flatMap(([x, y], i) => HUBS.filter((_, h) => h === 0 || i === 2 || i === 1).map(([hx, hy]) => `M${x + 50} ${y} C${x + 130} ${y} ${hx - 110} ${hy} ${hx - 44} ${hy}`)),
  ...HUBS.flatMap(([x, y]) => CHANNELS.map(([cx, cy]) => `M${x + 44} ${y} C${x + 120} ${y} ${cx - 120} ${cy} ${cx - 50} ${cy}`)),
];
const network = {
  render: (copy) => (
    <>
      {routes.map((d, i) => (
        <g key={i}>
          <path className={styles.base} d={d} />
          <path className={styles.live} data-route d={d} pathLength="1" />
          <circle className={styles.packet} data-truck r="3" />
        </g>
      ))}
      {[...SUPPLIERS.map((at, i) => [at, copy.suppliers[i], 100]), ...HUBS.map((at, i) => [at, copy.hubs[i], 88]), ...CHANNELS.map((at, i) => [at, copy.channels[i], 100])].map(([[x, y], name, w]) => (
        <g key={name} data-site>
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

export default function SolutionMetaphor({ variant, progressRef, label }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { locale } = useLocale();
  const scene = SCENES[variant] ?? insight;
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
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [scene, reduced, progressRef]);
  return (
    <svg ref={ref} className={styles.scene} viewBox="0 0 600 440" role="img" aria-label={label}>
      {scene.render(LABELS[locale] ?? LABELS.en)}
    </svg>
  );
}
