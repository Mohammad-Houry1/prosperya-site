import { Link, useLocation } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { replaceLocaleInPath } from "../../i18n/locale.js";
import { LEGAL_ROUTES } from "../../i18n/legalRoutes.js";
import styles from "./SiteFooter.module.css";
const sections = [
  {
    en: "Expertise",
    fr: "Expertise",
    links: [
      ["expertise", "Overview", "Vue d’ensemble"],
      [
        "expertise/erp-transformation",
        "ERP transformation",
        "Transformation ERP",
      ],
      [
        "expertise/netsuite-implementation",
        "NetSuite implementation",
        "Implémentation NetSuite",
      ],
      [
        "expertise/systems-integration",
        "Systems integration",
        "Intégration des systèmes",
      ],
      ["expertise/erp-rescue", "ERP rescue", "Sauvetage ERP"],
    ],
  },
  {
    en: "Solutions",
    fr: "Solutions",
    links: [
      ["solutions/finance", "Finance", "Finance"],
      ["solutions/operations", "Operations", "Opérations"],
      ["solutions/supply-chain", "Supply chain", "Chaîne logistique"],
      ["solutions/data-analytics", "Data & analytics", "Données et analytique"],
    ],
  },
  {
    en: "Company",
    fr: "Entreprise",
    links: [
      ["about", "About us", "À propos"],
      ["approach", "Our approach", "Notre approche"],
      ["contact", "Start a project", "Démarrer un projet"],
    ],
  },
  {
    en: "Resources",
    fr: "Ressources",
    links: [
      ["insights", "Insights", "Perspectives"],
      ["work", "Case studies", "Études de cas"],
    ],
  },
];
const legalLabels = {
  privacy: ["Privacy policy", "Confidentialité"],
  terms: ["Terms of use", "Conditions d’utilisation"],
  cookies: ["Cookie policy", "Politique des cookies"],
  accessibility: ["Accessibility", "Accessibilité"],
};
export default function SiteFooter() {
  const { locale, t } = useLocale();
  const location = useLocation();
  const fr = locale === "fr";
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.identity}>
            <BrandMark />
            <p>{t("footer.statement")}</p>
            <span>{t("footer.location")}</span>
          </div>
          {sections.map((section) => (
            <nav
              key={section.en}
              aria-label={section[locale]}
              className={styles.column}
            >
              <h2>{section[locale]}</h2>
              {section.links.map(([path, en, frLabel]) => (
                <Link key={path} to={`/${locale}/${path}`}>
                  {fr ? frLabel : en}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} Prosperya. {t("footer.rights")}
          </span>
          <nav
            aria-label={fr ? "Langue" : "Language"}
            className={styles.languages}
          >
            {["en", "fr"].map((lang) => (
              <Link
                key={lang}
                lang={lang}
                aria-current={lang === locale ? "true" : undefined}
                to={
                  replaceLocaleInPath(location.pathname, lang) +
                  location.search +
                  location.hash
                }
              >
                {lang.toUpperCase()}
              </Link>
            ))}
          </nav>
          <nav
            className={styles.legal}
            aria-label={fr ? "Informations légales" : "Legal information"}
          >
            {Object.entries(LEGAL_ROUTES).map(([key, paths]) => (
              <Link key={key} to={`/${locale}/${paths[locale]}`}>
                {legalLabels[key][fr ? 1 : 0]}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
