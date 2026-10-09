import { useMemo, useState } from "react";
import styles from "./HubDiagram.module.css";

const W = 640;
const H = 460;
const CX = 320;
const CY = 230;
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/*
  Prosperya's hub: one core, luminous spokes, a field of signals — and real
  HTML nodes on top so a page can make them links, filters or plain labels.
  Pages vary it through nodes (angle/radius), renderNode and activeId.
  Spokes draw in on mount; hovering or activating a node lights its spoke.
*/
export default function HubDiagram({
  nodes,
  renderNode,
  activeId,
  rays = 16,
  rx = 248,
  ry = 172,
  seed = 9,
  center,
  orbit = false,
  compactLabels = "hide",
  className = "",
}) {
  const [hover, setHover] = useState(null);
  const focus = hover ?? activeId;
  const placed = nodes.map((node, index) => {
    const degrees = node.angle ?? -90 + (index * 360) / nodes.length;
    const angle = (degrees * Math.PI) / 180;
    const reach = node.radius ?? 1;
    const x = CX + Math.cos(angle) * rx * reach;
    const y = CY + Math.sin(angle) * ry * reach;
    const distance = Math.hypot(x - CX, y - CY) || 1;
    const gap = 26 + 34 * Math.abs(Math.cos(angle));
    const t = Math.max(0.3, 1 - gap / distance);
    return { ...node, x, y, end: [CX + (x - CX) * t, CY + (y - CY) * t] };
  });
  const field = useMemo(() => {
    const random = seeded(seed);
    const stars = Array.from({ length: 150 }, (_, i) => {
      const angle = random() * Math.PI * 2;
      const reach = 60 + random() ** 0.9 * 250;
      return {
        x: CX + Math.cos(angle) * reach * 1.15,
        y: CY + Math.sin(angle) * reach * 0.8,
        r: i % 9 === 0 ? 1.8 : 0.6 + random() * 0.8,
        twinkle: i % 5 === 0,
        delay: -random() * 6,
      };
    });
    const spokes = Array.from({ length: rays }, (_, i) => {
      const angle = (i / rays) * Math.PI * 2 + 0.2 + random() * 0.2;
      const reach = 150 + random() * 80;
      return [CX + Math.cos(angle) * reach * 1.12, CY + Math.sin(angle) * reach * 0.82];
    });
    return { stars, spokes };
  }, [seed, rays]);
  return (
    <div className={`${styles.hub} ${styles[compactLabels] ?? ""} ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className={styles.svg}>
        <g>
          {field.stars.map((star, i) => (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.r}
              className={star.twinkle ? styles.twinkle : styles.star}
              style={star.twinkle ? { animationDelay: `${star.delay}s` } : undefined}
            />
          ))}
        </g>
        {orbit && <ellipse cx={CX} cy={CY} rx={rx} ry={ry} className={styles.orbit} />}
        {field.spokes.map(([x, y], i) => (
          <g key={i} className={styles.ray} style={{ "--i": i }}>
            <line x1={CX} y1={CY} x2={x} y2={y} pathLength="1" />
            <circle cx={x} cy={y} r="2.2" />
          </g>
        ))}
        {placed.map((node, i) => (
          <g
            key={node.id}
            className={styles.spoke}
            data-active={focus === node.id}
            style={{ "--i": i + 2 }}
          >
            <line x1={CX} y1={CY} x2={node.end[0]} y2={node.end[1]} pathLength="1" />
            <circle cx={node.end[0]} cy={node.end[1]} r="3" />
          </g>
        ))}
        <circle cx={CX} cy={CY} r="84" className={styles.halo} />
        <circle cx={CX} cy={CY} r={center ? 62 : 54} className={styles.core} />
        {center ? (
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" className={styles.centerText}>
            {center}
          </text>
        ) : (
          <path
            className={styles.mark}
            transform={`translate(${CX - 20} ${CY - 20}) scale(0.8)`}
            d="M3 5 47 18 21 24 8 46 13 22ZM23 25 47 18 23 40Z"
          />
        )}
      </svg>
      <ul className={styles.nodes}>
        {placed.map((node, i) => (
          <li
            key={node.id}
            className={styles.node}
            data-active={focus === node.id}
            style={{ left: `${(node.x / W) * 100}%`, top: `${(node.y / H) * 100}%`, "--i": i + 3 }}
            onPointerEnter={() => setHover(node.id)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(node.id)}
            onBlur={() => setHover(null)}
          >
            {renderNode ? renderNode(node) : <span className={styles.label}>{node.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const hubStyles = styles;
