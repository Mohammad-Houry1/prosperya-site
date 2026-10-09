import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import styles from "./AnimatedCounter.module.css";

// One number, optional prefix/suffix ("−42%", "250+", "99,9 %"). Anything else is shown as authored.
const pattern = /^([^\d]*?)(\d+(?:[.,]\d+)?)([^\d]*)$/;

function parse(value) {
  const match = String(value).match(pattern);
  if (!match) return null;
  const [, prefix, raw, suffix] = match;
  const separator = raw.includes(",") ? "," : ".";
  const number = Number(raw.replace(",", "."));
  if (!Number.isFinite(number) || number < 10) return null;
  const decimals = raw.split(separator)[1]?.length ?? 0;
  return { prefix, suffix, number, decimals, separator };
}
const format = ({ prefix, suffix, decimals, separator }, number) =>
  `${prefix}${number.toFixed(decimals).replace(".", separator)}${suffix}`;

/*
  Metrics settle into place once when they enter view. The authored value is
  always in the DOM for assistive tech and reserves the final width, so the
  count never shifts layout.
*/
export default function AnimatedCounter({ value }) {
  const live = useRef(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const element = live.current;
    const parts = parse(value);
    element.textContent = value;
    if (reduced || !parts || typeof IntersectionObserver === "undefined")
      return undefined;
    let frame = 0;
    element.textContent = format(parts, 0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / 1400);
          element.textContent = format(parts, parts.number * (1 - (1 - t) ** 4));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, reduced]);
  return (
    <span className={styles.counter}>
      <span className={styles.sizer} aria-hidden="true">
        {value}
      </span>
      <span ref={live} className={styles.live} aria-hidden="true" />
      <span className="visuallyHidden">{value}</span>
    </span>
  );
}
