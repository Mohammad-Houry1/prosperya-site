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
  const hasText = value => typeof value === "string" && value.trim().length > 0;
  const pains = solution.pains.filter(hasText);
  const capabilities = (solution.overviewCapabilities ?? solution.capabilities).filter(hasText);
  const outcomes = (solution.overviewOutcomes ?? solution.outcomes).filter(([image, title, description]) => image?.url || hasText(title) || hasText(description));
  const columnCount = [pains, capabilities, outcomes].filter(items => items.length > 0).length;
  const hasImage = Boolean(solution.image?.url);
  return (
    <article className={styles.row} data-reveal="card" data-columns={columnCount} style={{ "--i": index, "--content-columns": Math.max(1, columnCount) }}>
      <div className={styles.identity} data-has-image={hasImage}>
        {hasImage && <div className={styles.cover} aria-hidden="true">
          <CmsImage media={solution.image} />
        </div>}
        {hasImage && <span className={styles.icon}>
          <CmsImage media={solution.image} />
        </span>}
        <h3>{solution.title}</h3>
        {solution.tagline && <CmsRichHtml className={styles.tagline} html={solution.tagline} />}
        <Link to={to} className={styles.more}>
          {t("components.expertise.solution-row.learn-more-f2ab41")}
          <span className="visuallyHidden"> : {solution.title}</span>
          <ArrowRight size={14} strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </div>
      {pains.length > 0 && <div className={styles.column}>
        <span className={styles.label}>{t("components.expertise.solution-row.pains-f524cc")}</span>
        <ul className={styles.pains}>
          {pains.map((item, painIndex) => (
            <li key={painIndex}><CmsRichHtml inline html={item} /></li>
          ))}
        </ul>
      </div>}
      {capabilities.length > 0 && <div className={styles.column}>
        <span className={styles.label}>{t("components.expertise.solution-row.capabilities-912c87")}</span>
        <ul className={styles.checks}>
          {capabilities.map((item, capabilityIndex) => (
            <li key={capabilityIndex}>
              <CircleCheck size={15} strokeWidth={1.5} aria-hidden="true" />
              <CmsRichHtml inline html={item} />
            </li>
          ))}
        </ul>
      </div>}
      {outcomes.length > 0 && <div className={styles.column}>
        <span className={styles.label}>{t("components.expertise.solution-row.outcomes-28c664")}</span>
        <ul className={styles.outcomes}>
          {outcomes.map(([image, text, description], outcomeIndex) => (
            <li key={outcomeIndex} data-has-image={Boolean(image?.url)}>
              {image?.url && <span className={styles.outcomeImage}>
                <CmsImage media={image} />
              </span>}
              <div className={styles.outcomeCopy}>
                {text && <CmsRichHtml inline html={text} />}
                {description && <CmsRichHtml className={styles.outcomeDescription} html={description} />}
              </div>
            </li>
          ))}
        </ul>
      </div>}
      <Link to={to} className={styles.arrow} aria-label={`${t("components.expertise.solution-row.explore-82bb18")} ${solution.title}`}>
        <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </article>
  );
}
