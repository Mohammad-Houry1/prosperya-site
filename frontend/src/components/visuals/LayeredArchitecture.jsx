import SystemIcon from "../system/SystemIcon.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./LayeredArchitecture.module.css";

const COPY = (t) => ([[t("components.visuals.layered-architecture.copy.experience-layer-e650a1"), [["users", t("components.visuals.layered-architecture.copy.employees-090c5c")], ["share", t("components.visuals.layered-architecture.copy.partners-2c98b8")], ["badge", t("components.visuals.layered-architecture.copy.customers-288584")], ["truck", t("components.visuals.layered-architecture.copy.suppliers-669453")]]], [t("components.visuals.layered-architecture.copy.solution-layer-c353e3"), [[null, t("components.visuals.layered-architecture.copy.finance-9bee15")], [null, t("components.visuals.layered-architecture.copy.operations-b5b127")], [null, t("components.visuals.layered-architecture.copy.supply-chain-681468")], [null, t("components.visuals.layered-architecture.copy.data-analytics-aaa526")]]], [t("components.visuals.layered-architecture.copy.platform-layer-5724d1"), [[null, t("components.visuals.layered-architecture.copy.netsuite-632fd2")]]], [t("components.visuals.layered-architecture.copy.foundation-layer-ce83ed"), [[null, t("components.visuals.layered-architecture.copy.integration-apis-3ae2a5")], [null, t("components.visuals.layered-architecture.copy.security-compliance-0985e8")], [null, t("components.visuals.layered-architecture.copy.data-management-2cc30c")], [null, t("components.visuals.layered-architecture.copy.cloud-infrastructure-f4cac9")]]]]);

/*
  The architecture assembles from the ground up: the foundation arrives first,
  then the platform, the solutions and finally the people who use them —
  each layer plugged into the one below.
*/
export default function LayeredArchitecture() {
  const { t } = useLocale();
  const layers = COPY(t);
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
