import CaseStudyContent from "./CaseStudyContent.jsx";
import { adaptCaseStudy } from "../../repositories/marketing.repository.js";
import { websiteApi } from "../../services/websiteApi.js";
import { useParams } from "react-router-dom";
import Section from "../../components/common/Section.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";

export default function CaseStudyPage() {
  const { slug } = useParams();
  const {locale, t } = useLocale();

  const { data: study = null, isLoading: studyIsLoading, isError: studyIsError, refetch: studyRefetch, error: studyError } = useQuery({
    queryKey: ["case-study", locale, slug],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.caseStudy(slug, locale, signal);
      return response.data ? adaptCaseStudy(response.data) : null;
    },
    enabled: Boolean(slug),
    retry: (count, error) => error?.status !== 404 && error?.status !== 403 && count < 2,
  });
  const { data: studies = [] } = useQuery({
    queryKey: ["case-studies", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.caseStudies({ locale }, signal);
      return (response.data || []).map(adaptCaseStudy);
    },
  });
  const studyIndex = studies.findIndex(row => row.id === study?.id);
  const item = study ? { ...study, next: studies.length > 1 && studyIndex >= 0 ? studies[(studyIndex + 1) % studies.length] : null } : null;
  useDocumentMeta({ model: "CaseStudy",
    title: item ? `${item.name} — Prosperya` : t("pages.case-study.case-study-page.prosperya-work-1636b5"),
    description: item?.chapeau || item?.detail?.intro || item?.description,
  });
  if (studyIsLoading) return <PageLoader />;
  if (studyIsError && studyError?.status === 404) return <Section><EmptyState title={t("pages.case-study.case-study-page.case-study-not-found-c33e56")} /></Section>;
  if (studyIsError)
    return (
      <Section>
        <ErrorState onRetry={() => studyRefetch()} />
      </Section>
    );
  if (!item || !item.detail)
    return (
      <Section>
        <EmptyState title={t("pages.case-study.case-study-page.case-study-not-found-c33e56")} />
      </Section>
    );
  return <CaseStudyContent study={item} platforms={item.platforms || []} locale={locale} />;
}
