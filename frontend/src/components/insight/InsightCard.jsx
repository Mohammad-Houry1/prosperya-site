import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import ResponsiveImage from "../common/ResponsiveImage.jsx";
import CoverArt from "../visuals/CoverArt.jsx";
import styles from "./InsightCard.module.css";

const date = (value, locale) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));

function Meta({ insight, locale }) {
  if (!insight.publishedAt) return null;
  return (
    <p className={styles.meta}>
      <span>
        <CalendarDays size={14} strokeWidth={1.5} aria-hidden="true" />
        <time dateTime={insight.publishedAt}>{date(insight.publishedAt, locale)}</time>
      </span>
      {insight.readTime && <span>
        <Clock3 size={14} strokeWidth={1.5} aria-hidden="true" />
        {insight.readTime} min {locale === "fr" ? "de lecture" : "read"}
      </span>}
    </p>
  );
}

/*
  featured: the lead story — photograph beside a large headline.
  default: a journal card — words first, a generative cover beneath.
*/
export default function InsightCard({ insight, locale, featured = false, large = false, index = 0 }) {
  const to = `/${locale}/insights/${insight.slug}`;
  const fr = locale === "fr";
  if (featured)
    return (
      <article className={styles.featured}>
        <div className={styles.featuredMedia} data-reveal="image" aria-hidden="true">
          {insight.image ? (
            <ResponsiveImage {...insight.image} alt="" priority />
          ) : (
            <CoverArt variant={insight.cover} seed={7} />
          )}
        </div>
        <div className={styles.featuredCopy}>
          <span className={styles.category}>{insight.category}</span>
          <h3>{insight.title}</h3>
          <p>{insight.excerpt}</p>
          <Link to={to} className={styles.more}>
            {fr ? "Lire l’article" : "Read the full article"}
            <span className="visuallyHidden"> : {insight.title}</span>
            <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
          </Link>
          <Meta insight={insight} locale={locale} />
        </div>
      </article>
    );
  return (
    <article className={`${styles.card} ${large ? styles.large : ""}`} data-reveal="card" style={{ "--i": index }}>
      <div className={styles.art} aria-hidden="true">
        {insight.image ? <ResponsiveImage {...insight.image} alt="" /> : <CoverArt variant={insight.cover || "flow"} seed={insight.id.length * 3 + index} />}
      </div>
      <span className={styles.category}>{insight.category}</span>
      <h3>
        <Link to={to} className={styles.stretch}>
          {insight.title}
        </Link>
      </h3>
      <p>{insight.excerpt}</p>
      <Meta insight={insight} locale={locale} />
    </article>
  );
}
