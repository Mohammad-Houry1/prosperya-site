import { caseStudiesData } from "../../data/caseStudies.data.js";
import { caseStudyDetailsData, industries } from "../../data/caseStudyDetails.data.js";
import { companyData } from "../../data/company.data.js";
import { expertiseData } from "../../data/expertise.data.js";
import { localizeEntity } from "../../repositories/localize.js";
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
    queryFn: async () => {
      return localizeEntity(expertiseData, locale);
    },
  });
  const { data: studies = [], isLoading: studiesIsLoading, isError: studiesIsError, refetch: studiesRefetch } = useQuery({
    queryKey: ["case-studies", locale],
    queryFn: async () => {
      return localizeEntity(caseStudiesData, locale).map((study) => {
        const industry = caseStudyDetailsData[study.id]?.industry;
        return industry
          ? { ...study, industry, industryName: industries[industry][locale] ?? industries[industry].en }
          : study;
      });
    },
  });
  const { data: process = [], isPending: processIsPending, isError: processIsError, refetch: processRefetch } = useQuery({
    queryKey: ["process", locale],
    queryFn: async () => {
      return localizeEntity(companyData.process, locale);
    },
  });
  useDocumentMeta({
    title:
      t("pages.home.home-page.prosperya-complexity-orchestrated-2438c7", { en: "Prosperya — Complexity. Orchestrated.", fr: "Prosperya — Complexité. Orchestrée." }),
    description:
      t("pages.home.home-page.enterprise-systems-architecture-and-transformation-in-paris-3825b8", { en: "Enterprise systems architecture and transformation in Paris.", fr: "Architecture et transformation des systèmes d’entreprise à Paris." }),
  });
  return (
    <>
      <HeroSection />
      <ClientCompanies />
      <CapabilitiesSection data={capabilities} isLoading={capabilitiesIsLoading} isError={capabilitiesIsError} refetch={capabilitiesRefetch} />
      <PlatformStorySection />
      <FeaturedWorkSection data={studies} isLoading={studiesIsLoading} isError={studiesIsError} refetch={studiesRefetch} />
      <ApproachPreviewSection data={process} isPending={processIsPending} isError={processIsError} refetch={processRefetch} />
      <FinalCtaSection />
    </>
  );
}
