import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./LayeredArchitecture.module.css";


/*
  The architecture assembles from the ground up: the foundation arrives first,
  then the platform, the solutions and finally the people who use them —
  each layer plugged into the one below.
*/
export default function LayeredArchitecture({ columns = [] }) {
  const { t } = useLocale();
  const names = ["experience-layer-e650a1", "solution-layer-c353e3", "platform-layer-5724d1", "foundation-layer-ce83ed"].map(key => t("components.visuals.layered-architecture.copy." + key));
  const layers = columns.map((items, index) => [names[index], items, index]).filter(([, items]) => items.length > 0);
  return (
    <div className={styles.stack}>
      {layers.map(([name, items, layerIndex], index) => (
        <div
          key={name}
          className={`${styles.layer} ${layerIndex === 2 ? styles.platform : ""}`}
          data-reveal="card"
          style={{ "--i": (layers.length - 1 - index) * 2 }}
        >
          <span className={styles.name}>{name}</span>
          <ul className={items.length === 1 ? styles.single : undefined}>
            {items.map((label, itemIndex) => (
              <li key={itemIndex}>
                {label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
