import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { stagingContent } from "../../services/stagingContent.js";
import { corporatePagePath } from "../../i18n/legalRoutes.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import SectionSkeleton from "../feedback/SectionSkeleton.jsx";

export default function CorporatePageLinks({ inline = false }) {
  const { locale } = useLocale();
  const { pathname } = useLocation();
  const { data: pages = [], isPending, isError } = useQuery({
    queryKey: ["corporate-pages", locale, "corporate"],
    queryFn: async ({ signal }) => {
      const response = await stagingContent.corporatePages({ locale, category: "corporate" }, signal);
      return response.data || [];
    },
  });
  if (isPending) return <SectionSkeleton rows={4} compact inline={inline} label={locale === "fr" ? "Chargement des pages" : "Loading pages"} />;
  if (isError) return null;
  return pages.filter((page) => page.slug).map((page) => {
    const path = corporatePagePath(locale, page.slug);
    return <Link key={page.id || page.slug} to={path} aria-current={pathname === path ? "page" : undefined}>{page.title}</Link>;
  });
}
