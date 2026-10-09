import { useEffect, useRef } from "react";
import { useAppTheme } from "../../theme/ThemeContext.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import styles from "./ConnectionMesh.module.css";

const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const LABELS = ["NetSuite", "CRM", "Bank", "Commerce", "Treasury", "Analytics", "AP", "Payroll", "Planning"];

/*
  Systems integration: isolated systems connect outward from NetSuite, edge by
  edge, as progress rises; once linked, data packets travel the new routes.
*/
export default function ConnectionMesh({ progressRef, className = "" }) {
  const canvasRef = useRef(null);
  const { theme } = useAppTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const dark = theme === "dark";
    const random = seeded(21);
    // A jittered grid keeps the estate evenly spread; the hub sits at its centre.
    const cells = [];
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 7; col++)
        if (!(row === 2 && col === 3))
          cells.push({
            x: 0.1 + col * 0.135 + (random() - 0.5) * 0.07,
            y: 0.12 + row * 0.19 + (random() - 0.5) * 0.08,
          });
    // Labelled systems take well-separated cells (indices into `cells`).
    const labelled = [9, 3, 26, 14, 30, 1, 21, 33];
    const nodes = [
      { x: 0.505, y: 0.5, hub: true, label: LABELS[0] },
      ...labelled.map((cell, i) => ({ ...cells[cell], label: LABELS[i + 1] })),
      ...cells.filter((_, i) => !labelled.includes(i)).filter((_, i) => i % 3 !== 1),
    ];
    // Connect each node to its nearest neighbours; rank edges by distance from the hub.
    const key = new Set();
    const edges = [];
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => [j, Math.hypot(a.x - b.x, (a.y - b.y) * 0.7)])
        .filter(([j]) => j !== i)
        .sort((m, n) => m[1] - n[1])
        .slice(0, 2)
        .forEach(([j]) => {
          const id = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (key.has(id)) return;
          key.add(id);
          const b = nodes[j];
          const rank = Math.min(
            Math.hypot(a.x - 0.505, a.y - 0.5),
            Math.hypot(b.x - 0.505, b.y - 0.5),
          );
          edges.push({ a: i, b: j, rank, phase: random() });
        });
    });
    nodes.slice(1, 7).forEach((_, i) => edges.push({ a: 0, b: i + 1, rank: 0.02 * i, phase: random() }));
    const maxRank = Math.max(...edges.map((edge) => edge.rank));
    edges.forEach((edge) => (edge.rank /= maxRank));
    const fontFamily = getComputedStyle(canvas).fontFamily;
    const line = dark ? "95, 192, 147" : "31, 122, 80";
    const dot = dark ? "190, 245, 216" : "31, 122, 80";
    const text = dark ? "rgba(163, 175, 176, 0.9)" : "rgba(75, 89, 83, 0.9)";
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let last = 0;
    const draw = (delta) => {
      const p = reduced ? 1 : (progressRef?.current ?? 1);
      context.clearRect(0, 0, width, height);
      const linked = new Set([0]);
      for (const edge of edges) {
        const reach = Math.max(0, Math.min(1, (p * 1.15 - edge.rank) / 0.15));
        if (!reach) continue;
        const a = nodes[edge.a];
        const b = nodes[edge.b];
        context.strokeStyle = `rgba(${line}, ${0.15 + reach * 0.4})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(a.x * width, a.y * height);
        context.lineTo((a.x + (b.x - a.x) * reach) * width, (a.y + (b.y - a.y) * reach) * height);
        context.stroke();
        if (reach === 1) {
          linked.add(edge.a);
          linked.add(edge.b);
          edge.phase = (edge.phase + delta * 0.35) % 1;
          const t = edge.phase;
          context.fillStyle = `rgba(${dot}, 0.9)`;
          context.beginPath();
          context.arc((a.x + (b.x - a.x) * t) * width, (a.y + (b.y - a.y) * t) * height, 1.8, 0, Math.PI * 2);
          context.fill();
        }
      }
      nodes.forEach((node, i) => {
        const on = linked.has(i);
        const r = node.hub ? 7 : on ? 3 : 2.2;
        context.fillStyle = node.hub ? `rgba(${line}, 1)` : on ? `rgba(${dot}, 0.95)` : `rgba(${line}, 0.35)`;
        context.beginPath();
        context.arc(node.x * width, node.y * height, r, 0, Math.PI * 2);
        context.fill();
        if (node.hub || on) {
          context.strokeStyle = `rgba(${line}, ${node.hub ? 0.5 : 0.25})`;
          context.beginPath();
          context.arc(node.x * width, node.y * height, r + (node.hub ? 9 : 5), 0, Math.PI * 2);
          context.stroke();
        }
        if (node.label) {
          const label = node.label.toUpperCase();
          context.fillStyle = on ? text : `rgba(${line}, 0.45)`;
          context.font = `500 ${node.hub ? 12 : 10}px ${fontFamily}`;
          const measure = context.measureText(label).width;
          const right = node.x * width + 12 + measure < width - 6;
          context.fillText(label, right ? node.x * width + 12 : node.x * width - 12 - measure, node.y * height - 10);
        }
      });
    };
    const tick = (now) => {
      frame = 0;
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      draw(delta);
      if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (reduced) draw(0);
      else if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = box.width;
      height = box.height;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(0);
    };
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    viewObserver.observe(canvas);
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, [theme, reduced, progressRef]);
  return <canvas ref={canvasRef} className={`${styles.mesh} ${className}`} aria-hidden="true" />;
}
