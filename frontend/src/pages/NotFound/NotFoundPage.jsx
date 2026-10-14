import { Link } from "react-router-dom";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import RevealText from "../../motion/components/RevealText.jsx";
import HubDiagram, { hubStyles } from "../../components/visuals/HubDiagram.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./NotFoundPage.module.css";

// A lost connection: the hub still works, so its nodes lead back in.
export default function NotFoundPage() {
  const {locale, t } = useLocale();

  useDocumentMeta({
    title: t("pages.not-found.not-found-page.page-not-found-prosperya-9423d8"),
    description: t("pages.not-found.not-found-page.this-page-is-not-available-646f66"),
    robots: "noindex, follow",
  });
  const routes = [
    ["expertise", t("pages.not-found.not-found-page.expertise-6e9b7a")],
    ["solutions", t("nav.solutions")],
    ["work", t("pages.not-found.not-found-page.work-f8cafc")],
    ["approach", t("pages.not-found.not-found-page.approach-d02268")],
    ["insights", t("pages.not-found.not-found-page.insights-1bdb50")],
    ["about", t("pages.not-found.not-found-page.about-eff879")],
  ];
  return (
    <PageContainer>
      <div className={styles.page}>
        <div className={styles.copy}>
          <p className={styles.code}>
            404
          </p>
          <RevealText as="h1" onLoad>
            {t("pages.not-found.not-found-page.this-connection-leads-nowhere-e06690")}
          </RevealText>
          <p>
            {t("pages.not-found.not-found-page.the-page-may-have-moved-the-rest-43e3da")}
          </p>
          <div>
            <PrimaryLink to={`/${locale}`}>{t("pages.not-found.not-found-page.return-home-2f1301")}</PrimaryLink>
          </div>
        </div>
        <HubDiagram
          seed={404}
          rays={14}
          compactLabels="keep"
          nodes={routes.map(([id, label]) => ({ id, label }))}
          renderNode={(node) => (
            <Link to={`/${locale}/${node.id}`} className={hubStyles.label}>
              {node.label}
            </Link>
          )}
        />
      </div>
    </PageContainer>
  );
}
