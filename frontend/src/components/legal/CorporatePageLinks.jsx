import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { websiteApi, contentView } from "../../services/websiteApi.js";
import { corporatePagePath } from "../../i18n/legalRoutes.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import SectionSkeleton from "../feedback/SectionSkeleton.jsx";

export default function CorporatePageLinks({ inline = false }) {
  const {locale, t } = useLocale();
  const { pathname } = useLocation();
  const { data: pages = [], isPending, isError } = useQuery({
    queryKey: ["corporate-pages", locale, "corporate"],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.corporatePages({ locale, category: "corporate" }, signal);
      return contentView(response) || [];
    },
  });
  if (isPending) return <SectionSkeleton rows={4} compact inline={inline} label={t("components.legal.corporate-page-links.loading-pages-ae76b2")} />;
  if (isError) return null;
  return pages.filter((page) => page.slug).map((page) => {
    const path = corporatePagePath(locale, page.slug);
    return <Link key={page.id || page.slug} to={path} aria-current={pathname === path ? "page" : undefined}>{page.name || page.title}</Link>;
  });
}
