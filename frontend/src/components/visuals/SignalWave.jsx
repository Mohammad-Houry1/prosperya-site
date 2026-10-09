import { useEffect, useRef } from "react";
import { useAppTheme } from "../../theme/ThemeContext.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import styles from "./SignalWave.module.css";

/*
  Luminous strands with drifting particles — Prosperya's "data in motion".
  Each shape maps x∈[0,1] (and time t, scroll progress p) to a centre line and
  a spread; strands sit at offsets inside that spread, so a spread of 0 makes
  every strand converge. Pages pass a preset name or their own shape.
*/
const WAVE_SHAPES = {
  ribbon: (x, t) => ({
    center:
      0.58 + 0.2 * Math.sin(x * 3.2 + 0.4 + t * 0.22) + 0.05 * Math.sin(x * 8 + t * 0.15),
    spread: 0.3 * Math.sin(x * 4.4 - 1.1 + t * 0.18),
  }),
  rise: (x, t) => ({
    center: 0.9 - 0.7 * x ** 1.4 + 0.04 * Math.sin(x * 5 + t * 0.25),
    spread: 0.04 + 0.2 * x * Math.abs(Math.sin(x * 2.8 + 1.2 + t * 0.14)),
  }),
  arc: (x, t) => ({
    center: 0.72 - 0.42 * Math.sin(x * Math.PI * 0.92) + 0.03 * Math.sin(x * 6 + t * 0.2),
    spread: 0.05 + 0.13 * Math.abs(Math.sin(x * 3.4 + t * 0.16)),
  }),
  // Progress-driven metaphors (p: 0 → 1, o: the strand's own offset).
  // ERP transformation: tangled, independent processes settle into one structured flow.
  structure: (x, t, p, o = 0) => ({
    center:
      0.84 - 0.62 * x ** 1.3 +
      (1 - p) * 0.24 * Math.sin(x * 8 + o * 31 + t * 0.6) * Math.sin(o * 13 + 1),
    spread: 0.04 + 0.2 * x * (0.35 + 0.65 * p),
  }),
  // Audit & optimization: a wide, crossing tangle reduces to a clean bundle.
  audit: (x, t, p, o = 0) => ({
    center:
      0.56 + 0.1 * Math.sin(x * 3 + t * 0.2) +
      (1 - p) * 0.3 * Math.sin(x * 5 + o * 23 + t * 0.35),
    spread: 0.06 + (1 - p) * 0.3,
  }),
  // Rescue: high-frequency noise calms into a steady signal.
  rescue: (x, t, p, o = 0) => {
    const noise = (1 - p) ** 1.4;
    return {
      center:
        0.66 - 0.3 * x +
        noise * 0.11 * Math.sin(x * 38 + o * 17 + t * 2.6) +
        noise * 0.08 * Math.sin(x * 12 + o * 5 + t * 1.4),
      spread: 0.08 + 0.06 * Math.sin(x * 3 + t * 0.2),
    };
  },
};

function makeSprite(color) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  const context = sprite.getContext("2d");
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, `rgba(${color}, 1)`);
  gradient.addColorStop(0.25, `rgba(${color}, 0.55)`);
  gradient.addColorStop(1, `rgba(${color}, 0)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  return sprite;
}

// Deterministic pseudo-random so every render of a page looks identical.
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

export default function SignalWave({
  shape = "ribbon",
  strands = 46,
  particles = 420,
  progressRef,
  className = "",
}) {
  const canvasRef = useRef(null);
  const { theme } = useAppTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = typeof ResizeObserver === "undefined" ? null : canvas.getContext?.("2d");
    if (!context) return undefined; // No canvas support: the field is decorative, skip it.
    const curve = typeof shape === "function" ? shape : WAVE_SHAPES[shape];
    const dark = theme === "dark";
    const small = window.matchMedia("(max-width: 760px)").matches;
    const strandCount = small ? Math.round(strands * 0.6) : strands;
    const random = seeded(7);
    const dots = Array.from({ length: small ? Math.round(particles * 0.45) : particles }, () => ({
      strand: Math.floor(random() * strandCount),
      x: random(),
      jitter: (random() - 0.5) * 0.08,
      // Most particles ride the strands; a few drift around them as dust.
      lift: (random() - 0.5) * (random() < 0.3 ? 70 : 14),
      speed: 0.004 + random() * 0.012,
      size: random() < 0.1 ? 3 + random() * 5 : 0.8 + random() * 1.8,
      alpha: 0.2 + random() * 0.8,
    }));
    const sprite = makeSprite(dark ? "178, 240, 208" : "31, 122, 80");
    const line = dark ? "rgba(74, 176, 128, 0.26)" : "rgba(31, 122, 80, 0.18)";
    const bright = dark ? "rgba(150, 232, 190, 0.6)" : "rgba(31, 122, 80, 0.4)";
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let last = 0;
    let time = 0;
    const steps = small ? 48 : 90;
    const draw = () => {
      const p = progressRef?.current ?? 0;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (let i = 0; i < strandCount; i++) {
        const offset = i / Math.max(1, strandCount - 1) - 0.5;
        context.beginPath();
        for (let s = 0; s <= steps; s++) {
          const x = s / steps;
          const { center, spread } = curve(x, time + i * 0.01, p, offset);
          const y = (center + offset * spread) * height;
          if (s) context.lineTo(x * width, y);
          else context.moveTo(0, y);
        }
        const highlight = i % 6 === 0;
        context.strokeStyle = highlight ? bright : line;
        context.lineWidth = highlight ? 1 : 0.6;
        context.stroke();
      }
      for (const dot of dots) {
        const base = dot.strand / Math.max(1, strandCount - 1) - 0.5;
        const offset = base + dot.jitter;
        const { center, spread } = curve(dot.x, time + dot.strand * 0.01, p, base);
        const y = (center + offset * spread) * height + dot.lift;
        context.globalAlpha = dot.alpha;
        context.drawImage(sprite, dot.x * width - dot.size, y - dot.size, dot.size * 2, dot.size * 2);
      }
      context.globalAlpha = 1;
    };
    const tick = (now) => {
      frame = 0;
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      time += delta;
      for (const dot of dots) dot.x = (dot.x + dot.speed * delta) % 1;
      draw();
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (reduced) draw();
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
      draw();
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
  }, [shape, strands, particles, theme, reduced, progressRef]);
  return (
    <canvas
      ref={canvasRef}
      className={`${styles.wave} ${className}`}
      aria-hidden="true"
    />
  );
}
