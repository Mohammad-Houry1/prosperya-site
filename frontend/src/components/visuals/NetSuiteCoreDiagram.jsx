import { useRef } from "react";
import { useGsapContext } from "../../motion/hooks/useGsapContext.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./NetSuiteCoreDiagram.module.css";

// Modules in activation order (clockwise from the top-left), with connector geometry.
const MODULES = [
  { id: "finance", en: "Finance", fr: "Finance", at: [225, 22], path: "M363 103 L363 76 Q363 62 349 62 L239 62 Q225 62 225 48 L225 39", end: [225, 39] },
  { id: "procurement", en: "Procurement", fr: "Achats", at: [400, 22], path: "M400 91 L400 39", end: [400, 39] },
  { id: "projects", en: "Projects", fr: "Projets", at: [575, 22], path: "M437 103 L437 76 Q437 62 451 62 L561 62 Q575 62 575 48 L575 39", end: [575, 39] },
  { id: "manufacturing", en: "Manufacturing", fr: "Production", at: [728, 85], path: "M459 131 L498 131 Q512 131 512 117 L512 99 Q512 85 526 85 L664 85", end: [664, 85] },
  { id: "warehouse", en: "Warehouse", fr: "Entrepôt", at: [728, 155], path: "M464 155 L664 155", end: [664, 155] },
  { id: "field", en: "Field service", fr: "Services terrain", at: [728, 225], path: "M459 179 L498 179 Q512 179 512 193 L512 211 Q512 225 526 225 L664 225", end: [664, 225] },
  { id: "automation", en: "Automation", fr: "Automatisation", at: [575, 288], path: "M437 207 L437 234 Q437 248 451 248 L561 248 Q575 248 575 262 L575 271", end: [575, 271] },
  { id: "integrations", en: "Integrations", fr: "Intégrations", at: [400, 288], path: "M400 219 L400 271", end: [400, 271] },
  { id: "analytics", en: "Analytics", fr: "Analytique", at: [225, 288], path: "M363 207 L363 234 Q363 248 349 248 L239 248 Q225 248 225 262 L225 271", end: [225, 271] },
  { id: "inventory", en: "Inventory", fr: "Stocks", at: [72, 225], path: "M341 179 L302 179 Q288 179 288 193 L288 211 Q288 225 274 225 L136 225", end: [136, 225] },
  { id: "commerce", en: "Ecommerce", fr: "E-commerce", at: [72, 155], path: "M336 155 L136 155", end: [136, 155] },
  { id: "crm", en: "CRM", fr: "CRM", at: [72, 85], path: "M341 131 L302 131 Q288 131 288 117 L288 99 Q288 85 274 85 L136 85", end: [136, 85] },
];

/*
  "NetSuite at the core": the platform switches on module by module as the
  section scrolls through, so the ecosystem visibly expands around one core.
  Activation is a data attribute; CSS transitions do the drawing, so it is
  reversible and cheap. Reduced motion shows the complete platform.
*/
export default function NetSuiteCoreDiagram({ label = "NetSuite", autoplay = false }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { locale } = useLocale();
  useGsapContext(
    ref,
    ({ gsap, ScrollTrigger }) => {
      const root = ref.current;
      const modules = [...root.querySelectorAll("[data-module]")];
      const core = root.querySelectorAll("[data-core]");
      const apply = (progress) => {
        const count = Math.round(progress * MODULES.length);
        core.forEach((node) => (node.dataset.active = String(progress > 0.02)));
        modules.forEach((node) => {
          node.dataset.active = String(Number(node.dataset.module) < count);
        });
      };
      apply(0);
      if (autoplay) {
        // Hero use: the platform switches on in sequence as the page opens.
        const state = { progress: 0 };
        gsap.to(state, {
          progress: 1,
          duration: 2.8,
          delay: 0.6,
          ease: "none",
          onUpdate: () => apply(state.progress),
        });
        return;
      }
      ScrollTrigger.create({
        trigger: root,
        start: "top 78%",
        end: "bottom 48%",
        onUpdate: (self) => apply(self.progress),
        onLeave: () => apply(1),
      });
    },
    [],
  );
  const initial = String(reduced);
  return (
    <div ref={ref} className={styles.wrap}>
      <svg className={styles.diagram} viewBox="0 0 800 310" role="img" aria-label={locale === "fr" ? "NetSuite au cœur de douze domaines métier" : "NetSuite at the core of twelve business domains"}>
        <rect className={styles.boundary} x="72" y="22" width="656" height="266" rx="44" />
        {MODULES.map((module, index) => (
          <g key={module.id} data-module={index} data-active={initial}>
            <path className={styles.base} d={module.path} />
            <path className={styles.live} d={module.path} pathLength="1" />
            {!reduced && (
              <circle className={styles.packet} r="2.3">
                <animateMotion dur={`${2.2 + (index % 4) * 0.35}s`} repeatCount="indefinite" path={module.path} />
              </circle>
            )}
            <circle className={styles.port} cx={module.end[0]} cy={module.end[1]} r="3" />
            <g transform={`translate(${module.at.join(" ")})`} className={styles.module}>
              <rect x="-64" y="-17" width="128" height="34" rx="3" />
              <text textAnchor="middle" dominantBaseline="central">
                {module[locale] ?? module.en}
              </text>
            </g>
          </g>
        ))}
        <g data-core data-active={initial} className={styles.core}>
          <circle className={styles.orbit} cx="400" cy="155" r="76" />
          <circle className={styles.disc} cx="400" cy="155" r="64" />
          <text x="400" y="150" textAnchor="middle" className={styles.coreLabel}>
            {label}
          </text>
          <text x="400" y="174" textAnchor="middle" className={styles.coreSub}>
            {locale === "fr" ? "SOCLE ERP" : "CORE ERP"}
          </text>
        </g>
      </svg>
      <div className={styles.compact} aria-hidden="true">
        <div className={styles.compactCore} data-core data-active={initial}>
          <strong>{label}</strong>
          <span>{locale === "fr" ? "Socle ERP" : "Core ERP"}</span>
        </div>
        <ul>
          {MODULES.map((module, index) => (
            <li key={module.id} data-module={index} data-active={initial}>
              {module[locale] ?? module.en}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
