import { useLocale } from "../../i18n/LocaleContext.jsx";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SystemIcon from "../system/SystemIcon.jsx";
import styles from "./CapabilityCard.module.css";
export default function CapabilityCard({ capability, locale, index = 0, heading = "title" }) {
  const { t } = useLocale();

  const name = heading === "detail" ? (capability.detailTitle ?? capability.title) : capability.title;
  return (
    <article
      className={`${styles.card} ${heading === "detail" ? styles.detail : ""}`}
      data-reveal="card"
      style={{ "--i": index }}
    >
      <span className={styles.icon}>
        <SystemIcon name={capability.icon} size={22} strokeWidth={1.4} />
      </span>
      <h3>{name}</h3>
      <p>{capability.summary ?? capability.description}</p>
      <Link className={styles.link} to={`/${locale}/expertise/${capability.slug}`}>
        {t("components.expertise.capability-card.learn-more-f2ab41")}
        <span className="visuallyHidden"> : {name}</span>
        <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
      </Link>
    </article>
  );
}
