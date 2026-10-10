import { websiteApi } from "../../services/websiteApi.js";
import { adaptExpertise, adaptCaseStudy, adaptMethodology } from "../../repositories/marketing.repository.js";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import HeroSection from "../../sections/home/HeroSection.jsx";
import CapabilitiesSection from "../../sections/home/CapabilitiesSection.jsx";
import PlatformStorySection from "../../sections/home/PlatformStorySection.jsx";
import FeaturedWorkSection from "../../sections/home/FeaturedWorkSection.jsx";
import ApproachPreviewSection from "../../sections/home/ApproachPreviewSection.jsx";
import FinalCtaSection from "../../sections/home/FinalCtaSection.jsx";
import ClientCompanies from "../../components/company/ClientCompanies.jsx";
export default function HomePage() {
  const {locale, t } = useLocale();
  const { data: capabilities = [], isLoading: capabilitiesIsLoading, isError: capabilitiesIsError, refetch: capabilitiesRefetch } = useQuery({
    queryKey: ["capabilities", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.expertise({ locale }, signal);
      return (response.data || []).map(adaptExpertise);
    },
  });
  const { data: studies = [], isLoading: studiesIsLoading, isError: studiesIsError, refetch: studiesRefetch } = useQuery({
    queryKey: ["case-studies", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.caseStudies({ locale }, signal);
      return (response.data || []).map(adaptCaseStudy);
    },
  });
  const { data: process = [], isPending: processIsPending, isError: processIsError, refetch: processRefetch } = useQuery({
    queryKey: ["process", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.approach("approach", locale, signal);
      return adaptMethodology(response.data?.methodology);
    },
  });
  const { data: home = null, isPending: homeIsPending, isError: homeIsError, refetch: homeRefetch } = useQuery({
    queryKey: ["page", "home", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.page("home", locale, signal);
      return response.data || null;
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
      <ClientCompanies />
      <CapabilitiesSection data={capabilities.filter(row => row.featured)} isLoading={capabilitiesIsLoading} isError={capabilitiesIsError} refetch={capabilitiesRefetch} />
      <PlatformStorySection page={home} isPending={homeIsPending} isError={homeIsError} refetch={homeRefetch} />
      <FeaturedWorkSection data={studies.filter(row => row.featured)} isLoading={studiesIsLoading} isError={studiesIsError} refetch={studiesRefetch} />
      <ApproachPreviewSection data={process} isPending={processIsPending} isError={processIsError} refetch={processRefetch} />
      <FinalCtaSection />
    </>
  );
}
