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
  const { locale } = useLocale();
  const fr = locale === "fr";
  const updatedDate = lastUpdated ? new Date(lastUpdated) : null;
  const formattedDate = updatedDate && !Number.isNaN(updatedDate.getTime())
    ? new Intl.DateTimeFormat(fr ? "fr-FR" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(updatedDate)
    : null;
  return (
    <article className={styles.page}>
      <PageContainer>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            {fr ? "Informations du site" : "Website information"}
          </p>
          <h1>{title}</h1>
          <CmsRichHtml html={intro} className={styles.intro} imageAlt={title} />
          <p className={styles.meta}>
            {formattedDate
              ? <>{fr ? "Mis à jour le" : "Last updated"} <time dateTime={updatedDate.toISOString()}>{formattedDate}</time></>
              : fr
                ? "Date de publication à confirmer"
                : "Publication date to be confirmed"}
          </p>
        </header>
        <div className={styles.grid}>
          <nav
            className={styles.contents}
            aria-label={fr ? "Pages de l’entreprise" : "Corporate pages"}
          >
            <strong>{fr ? "Pages de l’entreprise" : "Corporate pages"}</strong>
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
