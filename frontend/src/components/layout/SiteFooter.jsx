import { Link, useLocation } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { replaceLocaleInPath } from "../../i18n/locale.js";
import CorporatePageLinks from "../legal/CorporatePageLinks.jsx";
import styles from "./SiteFooter.module.css";
const sections = (t) => [
  {
    key: "expertise",
    title: t("nav.expertise"),
    links: [
      ["expertise", t("footer.expertise_overview", { en: "Overview", fr: "Vue d’ensemble" })],
      [
        "expertise/erp-transformation",
        t("footer.erp_transformation", { en: "ERP transformation", fr: "Transformation ERP" }),
      ],
      [
        "expertise/netsuite-implementation",
        t("footer.netsuite_implementation", { en: "NetSuite implementation", fr: "Implémentation NetSuite" }),
      ],
      [
        "expertise/systems-integration",
        t("footer.systems_integration", { en: "Systems integration", fr: "Intégration des systèmes" }),
      ],
      ["expertise/erp-rescue", t("footer.erp_rescue", { en: "ERP rescue", fr: "Sauvetage ERP" })],
    ],
  },
  {
    key: "solutions",
    title: t("nav.solutions"),
    links: [
      ["solutions/finance", t("footer.finance", { en: "Finance", fr: "Finance" })],
      ["solutions/operations", t("footer.operations", { en: "Operations", fr: "Opérations" })],
      ["solutions/supply-chain", t("footer.supply_chain", { en: "Supply chain", fr: "Chaîne logistique" })],
      ["solutions/data-analytics", t("footer.data_analytics", { en: "Data & analytics", fr: "Données et analytique" })],
    ],
  },
  {
    key: "company",
    title: t("footer.company", { en: "Company", fr: "Entreprise" }),
    links: [
      ["about", t("footer.about_us", { en: "About us", fr: "À propos" })],
      ["approach", t("footer.our_approach", { en: "Our approach", fr: "Notre approche" })],
      ["contact", t("nav.contact")],
    ],
  },
  {
    key: "resources",
    title: t("footer.resources", { en: "Resources", fr: "Ressources" }),
    links: [
      ["insights", t("footer.insights", { en: "Insights", fr: "Perspectives" })],
      ["work", t("footer.case_studies", { en: "Case studies", fr: "Études de cas" })],
    ],
  },
];
export default function SiteFooter() {
  const { locale, t } = useLocale();
  const location = useLocation();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.identity}>
            <BrandMark />
            <p>{t("footer.statement")}</p>
            <span>{t("footer.location")}</span>
          </div>
          {sections(t).map((section) => (
            <nav
              key={section.key}
              aria-label={section.title}
              className={styles.column}
            >
              <h2>{section.title}</h2>
              {section.links.map(([path, label]) => (
                <Link key={path} to={`/${locale}/${path}`}>
                  {label}
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
            aria-label={t("components.layout.site-footer.language-cff648", { en: "Language", fr: "Langue" })}
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
            aria-label={t("components.layout.site-footer.legal-information-823929", { en: "Legal information", fr: "Informations légales" })}
          >
            <CorporatePageLinks inline />
          </nav>
        </div>
      </div>
    </footer>
  );
}
