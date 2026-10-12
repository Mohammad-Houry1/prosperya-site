import { screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { websiteApi } from "../../src/services/websiteApi.js";
import SiteFooter from "../../src/components/layout/SiteFooter.jsx";
beforeEach(() => {
  vi.spyOn(websiteApi, "corporatePages").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "expertise").mockImplementation(async ({ locale }) => ({ data: [
    { id: "second", slug: "new-expertise", expertise_title: locale === "fr" ? "Expertise du CMS" : "CMS expertise" },
    { id: "first", slug: "another-expertise", expertise_title: "Another CMS expertise" },
  ] }));
  vi.spyOn(websiteApi, "solutions").mockImplementation(async ({ locale }) => ({ data: [
    { id: "solution", slug: "new-solution", solution_title: locale === "fr" ? "Solution du CMS" : "CMS solution" },
  ] }));
});
afterEach(() => vi.restoreAllMocks());
function show(locale) {
  return render(<MemoryRouter><LocaleContext.Provider value={cmsLocale(locale)}><SiteFooter /></LocaleContext.Provider></MemoryRouter>);
}
test.each(["en", "fr"])("footer keeps expertise overview and uses CMS detail lists in %s", async locale => {
  show(locale);
  const expertiseNav = screen.getByRole("navigation", { name: "Expertise" });
  const solutionsNav = screen.getByRole("navigation", { name: "Solutions" });
  const expertiseName = locale === "fr" ? "Expertise du CMS" : "CMS expertise";
  const solutionName = locale === "fr" ? "Solution du CMS" : "CMS solution";
  expect(await within(expertiseNav).findByRole("link", { name: expertiseName })).toHaveAttribute("href", `/${locale}/expertise/new-expertise`);
  expect(within(expertiseNav).getAllByRole("link").map(link => link.getAttribute("href"))).toEqual([
    `/${locale}/expertise`, `/${locale}/expertise/new-expertise`, `/${locale}/expertise/another-expertise`,
  ]);
  expect(await within(solutionsNav).findByRole("link", { name: solutionName })).toHaveAttribute("href", `/${locale}/solutions/new-solution`);
  expect(within(solutionsNav).getAllByRole("link")).toHaveLength(1);
  expect(screen.queryByRole("link", { name: "ERP rescue" })).not.toBeInTheDocument();
  expect(websiteApi.expertise).toHaveBeenCalledWith({ locale }, expect.any(AbortSignal));
  expect(websiteApi.solutions).toHaveBeenCalledWith({ locale }, expect.any(AbortSignal));
  expect(document.querySelector(`a[href="/${locale}/about"]`)).not.toBeNull();
});
test("empty collections keep the overview and omit fixed detail links", () => {
  websiteApi.expertise.mockResolvedValue({ data: [] });
  websiteApi.solutions.mockResolvedValue({ data: [] });
  show("en");
  expect(within(screen.getByRole("navigation", { name: "Expertise" })).getAllByRole("link")).toHaveLength(1);
  expect(within(screen.getByRole("navigation", { name: "Solutions" })).queryAllByRole("link")).toHaveLength(0);
});

test("all five corporate footer links use the CMS names even when page titles are empty", async () => {
  websiteApi.corporatePages.mockResolvedValue({ data: [
    { id: "cookies", slug: "cookie-policy", name: "Cookie Policy", title: "Cookie heading" },
    { id: "about", slug: "about-prosperya", name: "About Prosperya", title: "High-Performance Transformed Enterprise Systems" },
    { id: "privacy", slug: "privacy-policy", name: "Privacy policy", title: "" },
    { id: "terms", slug: "terms-of-use", name: "Terms of use", title: "" },
    { id: "accessibility", slug: "accessibility", name: "Accessibility", title: "" },
  ] });
  show("en");
  const legal = screen.getByRole("navigation", { name: "Legal information" });
  await within(legal).findByRole("link", { name: "Privacy policy" });
  expect(within(legal).getAllByRole("link").map(link => link.textContent)).toEqual([
    "Cookie Policy", "About Prosperya", "Privacy policy", "Terms of use", "Accessibility",
  ]);
  expect(within(legal).getByRole("link", { name: "Terms of use" })).toHaveAttribute("href", "/en/terms-of-use");
  expect(within(legal).queryByText("High-Performance Transformed Enterprise Systems")).not.toBeInTheDocument();
});
