import PageContainer from "../common/PageContainer.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./LegalPageLayout.module.css";
import CmsRichHtml from "../common/CmsRichHtml.jsx";
import CorporatePageLinks from "./CorporatePageLinks.jsx";

export default function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  sections,
}) {
  const {locale, t } = useLocale();

  const updatedDate = lastUpdated ? new Date(lastUpdated) : null;
  const formattedDate = updatedDate && !Number.isNaN(updatedDate.getTime())
    ? new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(updatedDate)
    : null;
  return (
    <article className={styles.page}>
      <PageContainer>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            {t("components.legal.legal-page-layout.website-information-fd3a15")}
          </p>
          <h1>{title}</h1>
          <CmsRichHtml html={intro} className={styles.intro} imageAlt={title} />
          <p className={styles.meta}>
            {formattedDate
              ? <>{t("components.legal.legal-page-layout.last-updated-095290")} <time dateTime={updatedDate.toISOString()}>{formattedDate}</time></>
              : t("components.legal.legal-page-layout.publication-date-to-be-confirmed-eb48b8")}
          </p>
        </header>
        <div className={styles.grid}>
          <nav
            className={styles.contents}
            aria-label={t("components.legal.legal-page-layout.corporate-pages-fefb9b")}
          >
            <strong>{t("components.legal.legal-page-layout.corporate-pages-fefb9b")}</strong>
            <CorporatePageLinks />
          </nav>
          <div className={styles.body}>
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2>{section.title}</h2>
                <CmsRichHtml html={section.body} imageAlt={section.title || title} />
              </section>
            ))}
          </div>
        </div>
      </PageContainer>
    </article>
  );
}
