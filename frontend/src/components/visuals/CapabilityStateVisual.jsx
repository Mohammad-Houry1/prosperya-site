import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import SystemIcon from "../system/SystemIcon.jsx";
import styles from "./CapabilityStateVisual.module.css";

// [id, icon, en, fr, scattered [x, y, rotation], structured [x, y], retiredWhenOptimized]
const SYSTEMS = [
  ["crm", "users", "CRM", "CRM", [150, 120, -9], [95, 80]],
  ["commerce", "cart", "Commerce", "Commerce", [330, 70, 6], [95, 160]],
  ["hr", "badge", "HR", "RH", [70, 250, 5], [95, 240]],
  ["sheets", "grid", "Spreadsheets", "Tableurs", [420, 300, -7], [95, 320], true],
  ["erp", "layers", "ERP", "ERP", [250, 330, 8], [465, 80]],
  ["finance", "landmark", "Finance", "Finance", [470, 160, -5], [465, 160]],
  ["warehouse", "warehouse", "Warehouse", "Entrepôt", [120, 390, -4], [465, 240]],
  ["legacy", "database", "Legacy ERP", "ERP historique", [480, 410, 10], [465, 320], true],
  ["analytics", "chart", "Analytics", "Analytique", [300, 200, -12], [280, 400]],
];

// Elbow connector from the core to a structured slot, with soft corners.
function connector([x, y]) {
  if (x === 280) return `M280 256 L280 ${y - 17}`;
  const left = x < 280;
  const start = left ? 224 : 336;
  const bend = left ? 190 : 370;
  const end = left ? x + 68 : x - 68;
  const dir = y > 200 ? 1 : -1;
  const r = Math.min(8, Math.abs(y - 200) / 2);
  if (Math.abs(y - 200) < 1) return `M${start} 200 L${end} 200`;
  const k = left ? -1 : 1;
  return `M${start} 200 L${bend - k * r} 200 Q${bend} 200 ${bend} ${200 + dir * r} L${bend} ${y - dir * r} Q${bend} ${y} ${bend + k * r} ${y} L${end} ${y}`;
}

/*
  One visual, four states (see Expertise capability index):
  0 Transform — systems leave their scattered positions and take structured slots
  1 Connect   — connectors draw from the core to every system
  2 Automate  — data starts moving along the connectors
  3 Optimize  — redundant systems retire; what remains is simpler and brighter
  -1 = before the story begins (scattered).
*/
export default function CapabilityStateVisual({ state = -1, caption }) {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  return (
    <div className={styles.frame} data-state={state}>
      <svg viewBox="0 0 560 460" className={styles.svg} role="img" aria-label={caption}>
        <rect className={styles.grid} x="0" y="0" width="560" height="460" />
        {SYSTEMS.map(([id, , , , , slot, retired], index) => (
          <g key={id} className={styles.link} data-retired={Boolean(retired)} style={{ "--i": index }}>
            <path className={styles.linkBase} d={connector(slot)} pathLength="1" />
            {!reduced && (
              <circle r="2.6" className={styles.packet}>
                <animateMotion dur={`${1.8 + (index % 3) * 0.4}s`} repeatCount="indefinite" path={connector(slot)} keyPoints={index % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear" />
              </circle>
            )}
          </g>
        ))}
        <g className={styles.core}>
          <circle cx="280" cy="200" r="72" className={styles.coreHalo} />
          <circle cx="280" cy="200" r="56" className={styles.coreDisc} />
          <path transform="translate(260 180) scale(0.8)" d="M3 5 47 18 21 24 8 46 13 22ZM23 25 47 18 23 40Z" className={styles.coreMark} />
        </g>
        {SYSTEMS.map(([id, icon, en, fr, scattered, slot, retired], index) => (
          <g
            key={id}
            className={styles.system}
            data-retired={Boolean(retired)}
            style={{
              "--i": index,
              "--scattered": `translate(${scattered[0]}px, ${scattered[1]}px) rotate(${scattered[2]}deg)`,
              "--slot": `translate(${slot[0]}px, ${slot[1]}px) rotate(0deg)`,
            }}
          >
            <rect x="-68" y="-17" width="136" height="34" rx="3" />
            <g transform="translate(-57 -7)">
              <SystemIcon name={icon} size={14} />
            </g>
            <text x="-37" y="0" dominantBaseline="central">
              {(locale === "fr" ? fr : en).toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
      <div className={styles.meter} aria-hidden="true">
        <span>{locale === "fr" ? "Systèmes" : "Systems"}</span>
        <strong className={styles.before}>9</strong>
        <strong className={styles.after}>7</strong>
      </div>
    </div>
  );
}
