import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { websiteApi } from "../../services/websiteApi.js";
import { adaptExpertise, adaptSolution } from "../../repositories/marketing.repository.js";
import BrandMark from "./BrandMark.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { replaceLocaleInPath } from "../../i18n/locale.js";
import CorporatePageLinks from "../legal/CorporatePageLinks.jsx";
import styles from "./SiteFooter.module.css";
const sections = (t, expertise, solutions) => [
  {
    key: "expertise",
    title: t("nav.expertise"),
    links: [
      ["expertise", t("footer.expertise_overview")],
      ...expertise.filter(item => item.slug && item.title).map(item => [
        `expertise/${encodeURIComponent(item.slug)}`, item.title,
      ]),
    ],
  },
  {
    key: "solutions",
    title: t("nav.solutions"),
    links: solutions.filter(item => item.slug && item.title).map(item => [
      `solutions/${encodeURIComponent(item.slug)}`, item.title,
    ]),
  },
  {
    key: "company",
    title: t("footer.company"),
    links: [
      ["about", t("footer.about_us")],
      ["approach", t("footer.our_approach")],
      ["contact", t("nav.contact")],
    ],
  },
  {
    key: "resources",
    title: t("footer.resources"),
    links: [
      ["insights", t("footer.insights")],
      ["work", t("footer.case_studies")],
    ],
  },
];
export default function SiteFooter() {
  const { locale, t } = useLocale();
  const location = useLocation();
  const { data: expertise = [] } = useQuery({
    queryKey: ["capabilities", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.expertise({ locale }, signal);
      return (response.data || []).map(adaptExpertise);
    },
  });
  const { data: solutions = [] } = useQuery({
    queryKey: ["solutions", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.solutions({ locale }, signal);
      return (response.data || []).map(adaptSolution);
    },
  });
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.identity}>
            <BrandMark />
            <p>{t("footer.statement")}</p>
            <span>{t("footer.location")}</span>
          </div>
          {sections(t, expertise, solutions).map((section) => (
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
            aria-label={t("components.layout.site-footer.language-cff648")}
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
            aria-label={t("components.layout.site-footer.legal-information-823929")}
          >
            <CorporatePageLinks inline />
          </nav>
        </div>
      </div>
    </footer>
  );
}
