import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { websiteApi, contentView } from "../../services/websiteApi.js";
import { adaptExpertise, adaptSolution } from "../../repositories/marketing.repository.js";
import BrandMark from "./BrandMark.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { replaceLocaleInPath } from "../../i18n/locale.js";
import CorporatePageLinks from "../legal/CorporatePageLinks.jsx";
import styles from "./SiteFooter.module.css";
import ShellLabel from "./ShellLabel.jsx";
import Skeleton from "../feedback/Skeleton.jsx";
const sections = (expertise, solutions) => [
  {
    key: "expertise",
    title: "nav.expertise",
    links: [
      ["expertise", null, "footer.expertise_overview"],
      ...expertise.filter(item => item.slug && item.title).map(item => [
        `expertise/${encodeURIComponent(item.slug)}`, item.title,
      ]),
    ],
  },
  {
    key: "solutions",
    title: "nav.solutions",
    links: solutions.filter(item => item.slug && item.title).map(item => [
      `solutions/${encodeURIComponent(item.slug)}`, item.title,
    ]),
  },
  {
    key: "company",
    title: "footer.company",
    links: [
      ["about", null, "footer.about_us"],
      ["approach", null, "footer.our_approach"],
      ["contact", null, "nav.contact"],
    ],
  },
  {
    key: "resources",
    title: "footer.resources",
    links: [
      ["insights", null, "footer.insights"],
      ["work", null, "footer.case_studies"],
    ],
  },
];
export default function SiteFooter() {
  const { locale, t } = useLocale();
  const location = useLocation();
  const { data: expertise = [], isPending: expertisePending } = useQuery({
    queryKey: ["capabilities", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.expertise({ locale }, signal);
      return (contentView(response) || []).map(adaptExpertise);
    },
  });
  const { data: solutions = [], isPending: solutionsPending } = useQuery({
    queryKey: ["solutions", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.solutions({ locale }, signal);
      return (contentView(response) || []).map(adaptSolution);
    },
  });
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.identity}>
            <BrandMark />
            <p><ShellLabel name="footer.statement" width="90%" /></p>
            <span><ShellLabel name="footer.location" /></span>
          </div>
          {sections(expertise, solutions).map((section) => (
            <nav
              key={section.key}
              aria-label={t(section.title)}
              className={styles.column}
            >
              <h2><ShellLabel name={section.title} /></h2>
              {section.links.map(([path, label, labelKey]) => (
                <Link key={path} to={`/${locale}/${path}`}>
                  {labelKey ? <ShellLabel name={labelKey} /> : label}
                </Link>
              ))}
              {((section.key === "expertise" && expertisePending) || (section.key === "solutions" && solutionsPending)) && <div className={styles.pendingLinks} aria-busy="true">{[0, 1, 2].map(index => <Skeleton key={index} width="80%" height={14} />)}</div>}
            </nav>
          ))}
        </div>
        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} <ShellLabel name="site.name" width={72} />. <ShellLabel name="footer.rights" width={120} />
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
