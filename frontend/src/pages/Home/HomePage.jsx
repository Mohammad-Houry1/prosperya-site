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
  const { locale } = useLocale();
  useDocumentMeta({
    title:
      locale === "fr"
        ? "Prosperya — Complexité. Orchestrée."
        : "Prosperya — Complexity. Orchestrated.",
    description:
      locale === "fr"
        ? "Architecture et transformation des systèmes d’entreprise à Paris."
        : "Enterprise systems architecture and transformation in Paris.",
  });
  return (
    <>
      <HeroSection />
      <ClientCompanies />
      <CapabilitiesSection />
      <PlatformStorySection />
      <FeaturedWorkSection />
      <ApproachPreviewSection />
      <FinalCtaSection />
    </>
  );
}
