import SystemIcon from "../system/SystemIcon.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./LayeredArchitecture.module.css";

const COPY = {
  en: [
    ["Experience layer", [["users", "Employees"], ["share", "Partners"], ["badge", "Customers"], ["truck", "Suppliers"]]],
    ["Solution layer", [[null, "Finance"], [null, "Operations"], [null, "Supply chain"], [null, "Data & analytics"]]],
    ["Platform layer", [[null, "NetSuite"]]],
    ["Foundation layer", [[null, "Integration & APIs"], [null, "Security & compliance"], [null, "Data management"], [null, "Cloud infrastructure"]]],
  ],
  fr: [
    ["Couche expérience", [["users", "Collaborateurs"], ["share", "Partenaires"], ["badge", "Clients"], ["truck", "Fournisseurs"]]],
    ["Couche solutions", [[null, "Finance"], [null, "Opérations"], [null, "Chaîne logistique"], [null, "Données & analyses"]]],
    ["Couche plateforme", [[null, "NetSuite"]]],
    ["Couche socle", [[null, "Intégration & API"], [null, "Sécurité & conformité"], [null, "Gestion des données"], [null, "Infrastructure cloud"]]],
  ],
};

/*
  The architecture assembles from the ground up: the foundation arrives first,
  then the platform, the solutions and finally the people who use them —
  each layer plugged into the one below.
*/
export default function LayeredArchitecture() {
  const { locale } = useLocale();
  const layers = COPY[locale] ?? COPY.en;
  return (
    <div className={styles.stack}>
      {layers.map(([name, items], index) => (
        <div
          key={name}
          className={`${styles.layer} ${index === 2 ? styles.platform : ""}`}
          data-reveal="card"
          style={{ "--i": (layers.length - 1 - index) * 2 }}
        >
          <span className={styles.name}>{name}</span>
          <ul className={items.length === 1 ? styles.single : undefined}>
            {items.map(([icon, label]) => (
              <li key={label}>
                {icon && <SystemIcon name={icon} size={15} strokeWidth={1.5} />}
                {label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
