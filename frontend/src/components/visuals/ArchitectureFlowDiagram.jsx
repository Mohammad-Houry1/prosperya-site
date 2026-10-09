import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import SystemIcon from "../system/SystemIcon.jsx";
import styles from "./ArchitectureFlowDiagram.module.css";

const COPY = {
  en: {
    columns: ["Source systems", "Integration layer", "Enterprise platform", "Outcomes"],
    sources: [["users", "CRM"], ["badge", "HCM"], ["cart", "eCommerce"], ["landmark", "Financials"], ["truck", "Supply chain"], ["database", "Legacy systems"]],
    api: "API management",
    events: "Data & event hub",
    modules: ["Finance", "Operations", "Reporting", "Analytics"],
    outcomes: ["Real-time insights", "Operational agility", "Business growth", "Cost optimization", "Risk reduction"],
    label: "Source systems connect through an integration layer to NetSuite, producing business outcomes",
  },
  fr: {
    columns: ["Systèmes sources", "Couche d’intégration", "Plateforme d’entreprise", "Résultats"],
    sources: [["users", "CRM"], ["badge", "SIRH"], ["cart", "E-commerce"], ["landmark", "Finance"], ["truck", "Supply chain"], ["database", "Systèmes hérités"]],
    api: "Gestion des API",
    events: "Hub données & événements",
    modules: ["Finance", "Opérations", "Reporting", "Analytique"],
    outcomes: ["Pilotage temps réel", "Agilité opérationnelle", "Croissance", "Maîtrise des coûts", "Réduction des risques"],
    label: "Les systèmes sources se connectent à NetSuite via une couche d’intégration, au service des résultats métier",
  },
};
const sourceY = (i) => 60 + i * 46;
const outcomeY = (i) => 64 + i * 52;
// Each source keeps its own lane through the integration rail: a flow, not a Hub.
const laneY = (i) => 116 + i * 24;
const sourcePath = (i) => `M186 ${sourceY(i)} C280 ${sourceY(i)} 316 ${laneY(i)} 404 ${laneY(i)}`;
const RAIL_TO_PLATFORM = "M496 176 L622 176";
const outcomePath = (i) => `M772 176 C808 176 802 ${outcomeY(i)} 838 ${outcomeY(i)}`;

/*
  Architecture approach: the signal travels left to right — sources, the
  Prosperya integration layer, NetSuite, then outcomes. Each stage lights in
  sequence when the diagram enters view; packets run twice along their
  paths once the diagram is in view, fade out, and the diagram holds still.
*/
export default function ArchitectureFlowDiagram() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const copy = COPY[locale] ?? COPY.en;
  return (
    <div className={styles.wrap} data-reveal="fade">
      <svg viewBox="0 0 1000 350" className={styles.diagram} role="img" aria-label={copy.label}>
        {copy.columns.map((title, i) => (
          <text key={title} x={[96, 450, 697, 921][i]} y="16" textAnchor="middle" className={styles.columnTitle}>
            {title.toUpperCase()}
          </text>
        ))}
        <rect x="4" y="34" width="190" height="304" rx="6" className={styles.panel} />
        {copy.sources.map(([icon, name], i) => (
          <g key={name} className={`${styles.stage} ${styles.s1}`} style={{ "--i": i }}>
            <rect x="16" y={sourceY(i) - 16} width="166" height="32" rx="3" className={styles.row} />
            <g transform={`translate(28 ${sourceY(i) - 8})`} className={styles.icon}>
              <SystemIcon name={icon} size={16} />
            </g>
            <text x="56" y={sourceY(i)} dominantBaseline="central" className={styles.rowText}>
              {name.toUpperCase()}
            </text>
          </g>
        ))}
        {copy.sources.map((_, i) => (
          <g key={i} className={styles.flow} style={{ "--i": i, "--d": "250ms" }}>
            <path d={sourcePath(i)} pathLength="1" />
            <circle cx="186" cy={sourceY(i)} r="2.6" />
            {!reduced && (
              <circle
                r="2.2"
                className={styles.packet}
                style={{ offsetPath: `path("${sourcePath(i)}")`, "--dur": `${2 + (i % 3) * 0.35}s` }}
              />
            )}
          </g>
        ))}
        <g className={`${styles.stage} ${styles.s2}`}>
          <rect x="380" y="36" width="140" height="32" rx="3" className={styles.box} />
          <text x="450" y="52" textAnchor="middle" dominantBaseline="central" className={styles.boxText}>
            {copy.api.toUpperCase()}
          </text>
          <rect x="380" y="284" width="140" height="32" rx="3" className={styles.box} />
          <text x="450" y="300" textAnchor="middle" dominantBaseline="central" className={styles.boxText}>
            {copy.events.toUpperCase()}
          </text>
          <path d="M450 68 L450 96 M450 256 L450 284" className={styles.dotted} />
          <rect x="404" y="96" width="92" height="160" rx="6" className={styles.rail} />
          {copy.sources.map((name, i) => (
            <line key={name} x1="404" x2="496" y1={laneY(i)} y2={laneY(i)} className={styles.lane} />
          ))}
        </g>
        <g className={styles.flow} style={{ "--i": 0, "--d": "750ms" }}>
          <path d={RAIL_TO_PLATFORM} pathLength="1" />
          <circle cx="622" cy="176" r="3" />
          {!reduced && (
            <circle r="2.4" className={styles.packet} style={{ offsetPath: `path("${RAIL_TO_PLATFORM}")`, "--dur": "1.6s" }} />
          )}
        </g>
        <g className={`${styles.stage} ${styles.s3}`}>
          <rect x="622" y="34" width="150" height="304" rx="6" className={styles.platform} />
          <text x="697" y="78" textAnchor="middle" className={styles.platformName}>NetSuite</text>
          <line x1="640" x2="754" y1="104" y2="104" className={styles.divider} />
          {copy.modules.map((name, i) => (
            <text key={name} x="642" y={142 + i * 44} className={styles.module}>
              {name.toUpperCase()}
            </text>
          ))}
        </g>
        {copy.outcomes.map((_, i) => (
          <g key={i} className={styles.flow} style={{ "--i": i, "--d": "1050ms" }}>
            <path d={outcomePath(i)} pathLength="1" />
            <circle cx="838" cy={outcomeY(i)} r="2.6" />
          </g>
        ))}
        <rect x="842" y="34" width="158" height="304" rx="6" className={styles.panel} />
        {copy.outcomes.map((name, i) => (
          <text key={name} x="854" y={outcomeY(i)} dominantBaseline="central" className={`${styles.outcome} ${styles.stage} ${styles.s4}`} style={{ "--i": i }}>
            {name.toUpperCase()}
          </text>
        ))}
      </svg>
      <ol className={styles.compact}>
        <li>
          <span>{copy.columns[0]}</span>
          <p>{copy.sources.map(([, name]) => name).join(" · ")}</p>
        </li>
        <li className={styles.compactHub}>
          <span>{copy.columns[1]}</span>
          <p>{copy.api} · {copy.events}</p>
        </li>
        <li>
          <span>{copy.columns[2]}</span>
          <p>NetSuite — {copy.modules.join(" · ")}</p>
        </li>
        <li>
          <span>{copy.columns[3]}</span>
          <p>{copy.outcomes.join(" · ")}</p>
        </li>
      </ol>
    </div>
  );
}
