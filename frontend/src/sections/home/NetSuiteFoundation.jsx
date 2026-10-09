import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./NetSuiteFoundation.module.css";

const FAMILIES = {
  en: [
    ["Finance", ["Finance", "Procurement", "Projects"]],
    ["Operations", ["Manufacturing", "Warehouse", "Inventory", "Field service"]],
    ["Customers", ["CRM", "Ecommerce"]],
    ["Platform", ["Automation", "Integrations", "Analytics"]],
  ],
  fr: [
    ["Finance", ["Finance", "Achats", "Projets"]],
    ["Opérations", ["Production", "Entrepôt", "Stocks", "Services terrain"]],
    ["Clients", ["CRM", "E-commerce"]],
    ["Plateforme", ["Automatisation", "Intégrations", "Analytique"]],
  ],
};

/*
  Home only. "NetSuite at the core" told without a Hub (the Hub appears once
  per page, in the Hero): every module stands on one foundation, grouped by
  family, so the columns read as a skyline built on a single base. Tiles rise
  into place once when the section enters view, then stay still.
*/
export default function NetSuiteFoundation() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const families = FAMILIES[locale] ?? FAMILIES.en;
  let order = 0;
  return (
    <figure className={styles.foundation}>
      <div className={styles.columns}>
        {families.map(([family, modules]) => (
          <div key={family} className={styles.column}>
            <span className={styles.family}>{family}</span>
            <ul>
              {modules.map((name) => (
                <li key={name} className={styles.tile} data-reveal="card" style={{ "--i": order++ }}>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <figcaption className={styles.slab}>
        <strong>NetSuite</strong>
        <span>{fr ? "Un socle, un modèle de données" : "One foundation, one data model"}</span>
      </figcaption>
    </figure>
  );
}
