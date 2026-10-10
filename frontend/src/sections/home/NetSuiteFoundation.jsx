import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./NetSuiteFoundation.module.css";


/*
  Home only. "NetSuite at the core" told without a Hub (the Hub appears once
  per page, in the Hero): every module stands on one foundation, grouped by
  family, so the columns read as a skyline built on a single base. Tiles rise
  into place once when the section enters view, then stay still.
*/
export default function NetSuiteFoundation({ columns = [] }) {
  const { t } = useLocale();

  const families = columns.map((items,index)=>[String(index + 1).padStart(2, "0"),items]);
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
        <strong>{t('sections.home.net-suite-foundation.copy.platform-33364a')}</strong>
        <span>{t("sections.home.net-suite-foundation.one-foundation-one-data-model-912a1a")}</span>
      </figcaption>
    </figure>
  );
}
