import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./AutomationLanes.module.css";

const LANES = [96, 186, 276, 366];
const STATIONS = [150, 280, 410, 540];
const COPY = {
  en: { lanes: ["Orders", "Invoices", "Payments", "Inventory"], stations: ["Capture", "Validate", "Approve", "Post"] },
  fr: { lanes: ["Commandes", "Factures", "Paiements", "Stocks"], stations: ["Saisir", "Valider", "Approuver", "Comptabiliser"] },
};

/*
  Automation: work moves through four lanes of process steps. With progress
  at 0 each packet stops and waits at every station (manual handoffs); as
  progress rises the waiting disappears until the flow is continuous.
*/
export default function AutomationLanes({ progressRef }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { locale } = useLocale();
  const copy = COPY[locale] ?? COPY.en;
  useEffect(() => {
    const root = ref.current;
    const packets = [...root.querySelectorAll("[data-packet]")];
    const stations = [...root.querySelectorAll("[data-station]")];
    const phases = packets.map((_, i) => (i * 0.37) % 1);
    let frame = 0;
    let last = 0;
    let visible = false;
    const render = (now = 0) => {
      const p = reduced ? 1 : (progressRef?.current ?? 1);
      const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const wait = 0.7 * (1 - p);
      packets.forEach((packet, i) => {
        phases[i] = (phases[i] + delta * (0.1 + 0.04 * (i % 2))) % 1;
        const segment = Math.floor(phases[i] * 3);
        const local = phases[i] * 3 - segment;
        const moving = Math.max(0, Math.min(1, (local - wait) / (1 - wait)));
        const eased = moving * moving * (3 - 2 * moving);
        const x = STATIONS[segment] + (STATIONS[segment + 1] - STATIONS[segment]) * eased;
        packet.setAttribute("cx", x.toFixed(1));
      });
      root.dataset.automated = String(p > 0.6);
      stations.forEach((station, i) => {
        station.style.opacity = String(0.55 + 0.45 * Math.min(1, p * 1.4 + (i % 4) * 0.05));
      });
      if (visible && !reduced && !document.hidden) frame = requestAnimationFrame(render);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      last = 0;
      render();
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [progressRef, reduced]);
  return (
    <svg ref={ref} className={styles.lanes} viewBox="0 0 600 410" aria-hidden="true" data-automated="false">
      {copy.stations.map((name, i) => (
        <text key={name} x={STATIONS[i]} y="36" textAnchor="middle" className={styles.heading}>
          {name.toUpperCase()}
        </text>
      ))}
      {LANES.map((y, lane) => (
        <g key={y}>
          <text x="0" y={y} dominantBaseline="central" className={styles.laneName}>
            {copy.lanes[lane]}
          </text>
          <line x1="110" x2="590" y1={y} y2={y} className={styles.track} />
          {STATIONS.map((x) => (
            <rect key={x} data-station x={x - 26} y={y - 16} width="52" height="32" rx="4" className={styles.station} />
          ))}
          <circle data-packet cx={STATIONS[0]} cy={y} r="5" className={styles.packet} />
          <circle data-packet cx={STATIONS[0]} cy={y} r="3.4" className={styles.packet} />
        </g>
      ))}
    </svg>
  );
}
