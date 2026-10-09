import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { expertiseData } from "../../data/expertise.data.js";
import { expertiseDetailsData } from "../../data/expertiseDetails.data.js";
import { localizeEntity } from "../../repositories/localize.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import Section from "../../components/common/Section.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ExpertisePageContent from "./ExpertisePageContent.jsx";

export default function ExpertiseDetailPage() {
  const { slug } = useParams();
  const {locale, t } = useLocale();
  const { data: page = null, isLoading, isError, refetch } = useQuery({
    queryKey: ["expertise-page", locale, slug],
    queryFn: async () => {
      const content = expertiseDetailsData[slug];
      return content ? { slug, ...localizeEntity(content, locale) } : null;
    },
    enabled: Boolean(slug),
  });
  useDocumentMeta({ title: page ? `${page.title} — Prosperya` : "Prosperya — Expertise" });
  if (isLoading) return <PageLoader />;
  if (isError) return <Section><ErrorState onRetry={refetch} /></Section>;
  if (!page) return <Section><EmptyState title={t("pages.expertise-detail.expertise-detail-page.expertise-not-found-6043fe", { en: "Expertise not found", fr: "Expertise introuvable" })} /></Section>;
  const related = localizeEntity(expertiseData, locale)
    .filter((item) => item.slug !== slug)
    .map((item) => ({ id: item.id, slug: item.slug, title: item.detailTitle || item.title }));
  return <ExpertisePageContent page={page} related={related} locale={locale} />;
}
