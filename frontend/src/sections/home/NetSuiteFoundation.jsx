import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./NetSuiteFoundation.module.css";

const FAMILIES = (t) => ([[t("sections.home.net-suite-foundation.copy.finance-9bee15", { en: "Finance", fr: "Finance" }), [t("sections.home.net-suite-foundation.copy.finance-9bee15", { en: "Finance", fr: "Finance" }), t("sections.home.net-suite-foundation.copy.procurement-1b7b09", { en: "Procurement", fr: "Achats" }), t("sections.home.net-suite-foundation.copy.projects-c08fd9", { en: "Projects", fr: "Projets" })]], [t("sections.home.net-suite-foundation.copy.operations-b5b127", { en: "Operations", fr: "Opérations" }), [t("sections.home.net-suite-foundation.copy.manufacturing-608c6f", { en: "Manufacturing", fr: "Production" }), t("sections.home.net-suite-foundation.copy.warehouse-b277cf", { en: "Warehouse", fr: "Entrepôt" }), t("sections.home.net-suite-foundation.copy.inventory-bec5e3", { en: "Inventory", fr: "Stocks" }), t("sections.home.net-suite-foundation.copy.field-service-b78af5", { en: "Field service", fr: "Services terrain" })]], [t("sections.home.net-suite-foundation.copy.customers-288584", { en: "Customers", fr: "Clients" }), [t("sections.home.net-suite-foundation.copy.crm-39069d", { en: "CRM", fr: "CRM" }), t("sections.home.net-suite-foundation.copy.ecommerce-f95c01", { en: "Ecommerce", fr: "E-commerce" })]], [t("sections.home.net-suite-foundation.copy.platform-33364a", { en: "Platform", fr: "Plateforme" }), [t("sections.home.net-suite-foundation.copy.automation-a3a1ce", { en: "Automation", fr: "Automatisation" }), t("sections.home.net-suite-foundation.copy.integrations-32d796", { en: "Integrations", fr: "Intégrations" }), t("sections.home.net-suite-foundation.copy.analytics-c0af1a", { en: "Analytics", fr: "Analytique" })]]]);

/*
  Home only. "NetSuite at the core" told without a Hub (the Hub appears once
  per page, in the Hero): every module stands on one foundation, grouped by
  family, so the columns read as a skyline built on a single base. Tiles rise
  into place once when the section enters view, then stay still.
*/
export default function NetSuiteFoundation() {
  const { t } = useLocale();

  const families = FAMILIES(t);
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
        <span>{t("sections.home.net-suite-foundation.one-foundation-one-data-model-912a1a", { en: "One foundation, one data model", fr: "Un socle, un modèle de données" })}</span>
      </figcaption>
    </figure>
  );
}
