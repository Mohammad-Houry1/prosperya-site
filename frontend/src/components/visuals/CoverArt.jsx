import { useMemo } from "react";
import styles from "./CoverArt.module.css";

/*
  Generative editorial covers for content without photography. Each variant
  is a small architectural metaphor drawn in fine luminous lines; the same
  seed always produces the same image.
*/
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function ledger(random) {
  // Many ledgers converge into one consolidated line of truth.
  const lines = Array.from({ length: 26 }, (_, i) => {
    const y = 26 + i * 8.4 + (random() - 0.5) * 3;
    return `M-10 ${y.toFixed(1)} C150 ${y.toFixed(1)} 210 ${(130 + (y - 130) * 0.08).toFixed(1)} 290 130 L410 130`;
  });
  const bars = Array.from({ length: 7 }, (_, i) => [300 + i * 14, 40 + random() * 60]);
  return { lines, bars, dots: lines.map((_, i) => [4, 26 + i * 8.4]) };
}
function flow(random) {
  // Demand to delivery: braided bands with waypoints.
  const lines = Array.from({ length: 30 }, (_, i) => {
    const band = i % 3;
    const base = 70 + band * 60 + (random() - 0.5) * 16;
    const lift = (random() - 0.5) * 40;
    return `M-10 ${base.toFixed(1)} C90 ${(base + lift).toFixed(1)} 170 ${(210 - base * 0.6).toFixed(1)} 250 ${(130 + (base - 130) * 0.4).toFixed(1)} S360 ${(base - lift).toFixed(1)} 410 ${(base * 0.9 + 12).toFixed(1)}`;
  });
  const dots = [[60, 76], [128, 150], [196, 110], [250, 128], [318, 150], [372, 96]];
  return { lines, dots };
}
function stabilize(random) {
  // Noise on the left settles into one clean signal on the right.
  const lines = Array.from({ length: 12 }, (_, i) => {
    let d = `M-10 ${130 + (random() - 0.5) * 20}`;
    for (let x = 0; x <= 410; x += 10) {
      const calm = Math.min(1, Math.max(0, (x - 150) / 140));
      const noise = (random() - 0.5) * 120 * (1 - calm) ** 1.6;
      d += ` L${x} ${(130 + noise + (i - 6) * 2.2 * calm).toFixed(1)}`;
    }
    return d;
  });
  return { lines, dots: [[300, 130], [340, 130], [380, 130]] };
}
function network(random) {
  // Connected estate: nodes wired into a central platform.
  const nodes = Array.from({ length: 22 }, () => [30 + random() * 340, 24 + random() * 212]);
  const lines = nodes.map(([x, y]) => `M200 130 L${x.toFixed(1)} ${y.toFixed(1)}`);
  return { lines, dots: nodes, hub: true };
}
function grid(random) {
  // Store network: a perspective floor of locations reporting to one core.
  const dots = [];
  for (let row = 0; row < 7; row++)
    for (let col = 0; col < 13; col++) {
      const depth = 0.35 + row * 0.11;
      dots.push([200 + (col - 6) * 30 * depth, 118 + row * row * 3.2 + row * 6 + (random() - 0.5)]);
    }
  const lines = dots
    .filter((_, i) => i % 5 === 0)
    .map(([x, y]) => `M200 70 L${x.toFixed(1)} ${y.toFixed(1)}`);
  return { lines, dots, hub: true, hubY: 70 };
}
function bars(random) {
  // Performance over time: a row of bars under a rising signal.
  const heights = Array.from({ length: 14 }, (_, i) => 30 + i * 8 + random() * 34);
  const lines = [
    heights.map((h, i) => `${i ? "L" : "M"}${40 + i * 24} ${(214 - h - 18).toFixed(1)}`).join(" "),
    ...Array.from({ length: 6 }, (_, i) => `M0 ${60 + i * 30} L400 ${60 + i * 30}`),
  ];
  return { lines, bars: heights.map((h, i) => [36 + i * 24, h]), dots: heights.map((h, i) => [40 + i * 24, 214 - h - 18]) };
}
const variants = { ledger, flow, stabilize, network, grid, bars };

export default function CoverArt({ variant = "network", seed = 3, className = "" }) {
  const art = useMemo(() => (variants[variant] ?? network)(seeded(seed)), [variant, seed]);
  return (
    <svg
      className={`${styles.art} ${className}`}
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-reveal-media
    >
      <defs>
        <radialGradient id={`cover-glow-${variant}-${seed}`} cx="62%" cy="48%" r="60%">
          <stop offset="0" stopColor="#3b9b71" stopOpacity="0.32" />
          <stop offset="1" stopColor="#3b9b71" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" className={styles.base} />
      <rect width="400" height="260" fill={`url(#cover-glow-${variant}-${seed})`} />
      <g className={styles.lines}>
        {art.lines.map((d, i) => (
          <path key={i} d={d} className={i % 6 === 0 ? styles.bright : undefined} />
        ))}
      </g>
      {art.bars && (
        <g className={styles.bars}>
          {art.bars.map(([x, h], i) => (
            <rect key={i} x={x} y={230 - h} width="7" height={h} />
          ))}
        </g>
      )}
      <g className={styles.dots}>
        {art.dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 2.2 : 1.3} />
        ))}
      </g>
      {art.hub && (
        <g className={styles.hub}>
          <circle cx="200" cy={art.hubY ?? 130} r="16" />
          <circle cx="200" cy={art.hubY ?? 130} r="26" />
        </g>
      )}
    </svg>
  );
}
