import { useEffect, useState } from "react";
import PageContainer from "../common/PageContainer.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./LegalPageLayout.module.css";
import CmsRichHtml from "../common/CmsRichHtml.jsx";

export default function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  sections,
}) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [current, setCurrent] = useState(sections[0]?.id);
  // Highlight the section being read in the contents list.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setCurrent(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);
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
            {lastUpdated
              ? `${fr ? "Mis à jour le" : "Last updated"} ${lastUpdated}`
              : fr
                ? "Date de publication à confirmer"
                : "Publication date to be confirmed"}
          </p>
        </header>
        <div className={styles.grid}>
          <nav
            className={styles.contents}
            aria-label={fr ? "Sommaire" : "On this page"}
          >
            <strong>{fr ? "Sommaire" : "On this page"}</strong>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={current === section.id ? "location" : undefined}
              >
                {section.title}
              </a>
            ))}
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
