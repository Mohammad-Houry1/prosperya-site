import { websiteApi } from "../../services/websiteApi.js";
import { adaptExpertise, adaptMethodology } from "../../repositories/marketing.repository.js";
import { mapInsight } from "../../repositories/insights.repository.js";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import HeroSection from "../../sections/home/HeroSection.jsx";
import CapabilitiesSection from "../../sections/home/CapabilitiesSection.jsx";
import FeaturedWorkSection from "../../sections/home/FeaturedWorkSection.jsx";
import ApproachPreviewSection from "../../sections/home/ApproachPreviewSection.jsx";
import FinalCtaSection from "../../sections/home/FinalCtaSection.jsx";
import ClientCompanies from "../../components/company/ClientCompanies.jsx";
export default function HomePage() {
  const {locale, t } = useLocale();
  const { data: capabilities = [], isLoading: capabilitiesIsLoading, isError: capabilitiesIsError, refetch: capabilitiesRefetch } = useQuery({
    queryKey: ["capabilities", locale, "latest", 4],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.expertise({ locale, page: 1, per_page: 4, sort: "latest" }, signal);
      return (response.data || []).map(adaptExpertise);
    },
  });
  const { data: articles = [], isLoading: articlesIsLoading, isError: articlesIsError, refetch: articlesRefetch } = useQuery({
    queryKey: ["home-articles", locale, 3],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.articles({ locale, page: 1, per_page: 3 }, signal);
      return (response.data || []).map(mapInsight);
    },
  });
  const { data: process = [], isPending: processIsPending, isError: processIsError, refetch: processRefetch } = useQuery({
    queryKey: ["process", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.approach("our-approach", locale, signal);
      return adaptMethodology(response.data?.methodology);
    },
  });
  useDocumentMeta({
    title:
      t("pages.home.home-page.prosperya-complexity-orchestrated-2438c7"),
    description:
      t("pages.home.home-page.enterprise-systems-architecture-and-transformation-in-paris-3825b8"),
  });
  return (
    <>
      <HeroSection />
      <ClientCompanies category="clients" />
      <CapabilitiesSection data={capabilities} isLoading={capabilitiesIsLoading} isError={capabilitiesIsError} refetch={capabilitiesRefetch} />
      <FeaturedWorkSection data={articles} isLoading={articlesIsLoading} isError={articlesIsError} refetch={articlesRefetch} />
      <ApproachPreviewSection data={process} isPending={processIsPending} isError={processIsError} refetch={processRefetch} />
      <FinalCtaSection />
    </>
  );
}
