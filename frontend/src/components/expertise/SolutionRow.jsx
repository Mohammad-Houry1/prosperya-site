import { useLocale } from "../../i18n/LocaleContext.jsx";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./SolutionRow.module.css";
import CmsImage from "../common/CmsImage.jsx";
import CmsRichHtml from "../common/CmsRichHtml.jsx";

// One business function as an editorial row: identity, friction, capabilities, outcomes.
export default function SolutionRow({ solution, locale, index = 0 }) {
  const { t } = useLocale();

  const to = `/${locale}/solutions/${solution.slug}`;
  return (
    <article className={styles.row} data-reveal="card" style={{ "--i": index }}>
      <div className={styles.identity}>
        <div className={styles.cover} aria-hidden="true">
          <CmsImage media={solution.image} />
        </div>
        <span className={styles.icon}>
          <CmsImage media={solution.image} />
        </span>
        <h3>{solution.title}</h3>
        <p>{solution.tagline}</p>
        <Link to={to} className={styles.more}>
          {t("components.expertise.solution-row.learn-more-f2ab41")}
          <span className="visuallyHidden"> : {solution.title}</span>
          <ArrowRight size={14} strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.column}>
        <span className={styles.label}>{t("components.expertise.solution-row.pains-f524cc")}</span>
        <ul className={styles.pains}>
          {solution.pains.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.column}>
        <span className={styles.label}>{t("components.expertise.solution-row.capabilities-912c87")}</span>
        <ul className={styles.checks}>
          {solution.capabilities.map((item) => (
            <li key={item}>
              <CircleCheck size={15} strokeWidth={1.5} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.column}>
        <span className={styles.label}>{t("components.expertise.solution-row.outcomes-28c664")}</span>
        <ul className={styles.outcomes}>
          {solution.outcomes.map(([image, text, description], outcomeIndex) => (
            <li key={outcomeIndex}>
              <span>
                <CmsImage media={image} />
              </span>
              {text}
              <CmsRichHtml html={description} />
            </li>
          ))}
        </ul>
      </div>
      <Link to={to} className={styles.arrow} aria-label={`${t("components.expertise.solution-row.explore-82bb18")} ${solution.title}`}>
        <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </article>
  );
}
