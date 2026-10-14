import { cmsLocale } from "../cmsFixtures.js";
import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import AboutPage from "../../src/pages/About/AboutPage.jsx";
import WorkPage from "../../src/pages/Work/WorkPage.jsx";
import InsightsPage from "../../src/pages/Insights/InsightsPage.jsx";
import ArticlePage from "../../src/pages/Article/ArticlePage.jsx";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";

beforeEach(() => {
  vi.spyOn(websiteApi, "page").mockRejectedValue(new WebsiteApiError("Missing static page", 404));
  vi.spyOn(websiteApi, "corporatePage").mockResolvedValue({ data: { slug: "about-prosperya", title: "CMS About", about_users: [] } });
  vi.spyOn(websiteApi, "caseStudies").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "users").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "expertise").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: {} });
  vi.spyOn(websiteApi, "testimonials").mockImplementation(async ({ locale }) => ({ data: [{
    id: "testimonial", quote: locale === "fr" ? "Nos équipes travaillent ensemble." : "Our teams work together.",
    name: "Alex", role: "Operations", company: "Example",
  }] }));
  vi.spyOn(websiteApi, "platforms").mockResolvedValue({ data: [{ id: "cms-platform", slug: "netsuite", name: "CMS platform" }] });
});
afterEach(() => vi.restoreAllMocks());

function renderPage(page, locale = "en", route = "/*", pathname = `/${locale}`) {
  return render(<ThemeProvider><MemoryRouter initialEntries={[pathname]}>
    <LocaleContext.Provider value={cmsLocale(locale)}>
      <Routes><Route path={route} element={page} /></Routes>
    </LocaleContext.Provider>
  </MemoryRouter></ThemeProvider>);
}

test.each([
  ["about", "en", AboutPage], ["about", "fr", AboutPage],
  ["work", "en", WorkPage], ["work", "fr", WorkPage],
])("%s renders CMS testimonials in %s", async (_name, locale, Page) => {
  renderPage(<Page />, locale);
  await screen.findByText(locale === "fr" ? /Nos équipes travaillent ensemble/ : /Our teams work together/);
  expect(websiteApi.testimonials).toHaveBeenCalledWith({ locale }, expect.any(AbortSignal));
  if (_name === "about") {
    expect(websiteApi.corporatePage).toHaveBeenCalledWith("about-prosperya", locale, expect.any(AbortSignal));
    expect(websiteApi.page).not.toHaveBeenCalled();
    expect(websiteApi.platforms).toHaveBeenCalledWith({ locale, category: "good-company" }, expect.any(AbortSignal));
  } else {
    expect(websiteApi.platforms).not.toHaveBeenCalled();
  }
});

test("About uses Corporate Page fields, rich sections and public Users", async () => {
  websiteApi.corporatePage.mockResolvedValue({ data: { slug: "about-prosperya", name: "About Prosperya", title: "Our company",
    description: "<p><strong>Company introduction</strong></p>",
    sections: [{ title: "Corporate chapter", description: "<p><em>Corporate story</em></p>" }],
    about_focus: ["<p><strong>Enterprise systems</strong></p>"],
    about_users: [{ id: "leader", name: "Selected leader", bio: "<p>Leader biography</p>" }] } });
  renderPage(<AboutPage />);
  await screen.findByRole("heading", { name: "Our company", level: 1 });
  expect(screen.getByText("Company introduction").tagName).toBe("STRONG");
  expect(screen.getByRole("heading", { name: "Corporate chapter" })).toBeInTheDocument();
  expect(screen.getByText("Corporate story").tagName).toBe("EM");
  expect(screen.getByText("Enterprise systems").tagName).toBe("STRONG");
  expect(await screen.findByRole("heading", { name: "Selected leader" })).toBeInTheDocument();
  expect(screen.getByText("Leader biography")).toBeInTheDocument();
});

test("insights renders API articles with their category and pagination", async () => {
  vi.spyOn(websiteApi, "articles").mockResolvedValue({ data: [{ id: "article", slug: "cms-article", title: "CMS article", excerpt: "CMS summary", category_id: "finance" }], meta: { total: 1, last_page: 1 } });
  vi.spyOn(websiteApi, "categories").mockResolvedValue({ data: [{ id: "finance", slug: "finance", name: "Finance" }] });
  renderPage(<InsightsPage />);
  await screen.findByRole("heading", { name: "CMS article" });
  expect(screen.getByText("1 article")).toBeInTheDocument();
  expect(websiteApi.articles).toHaveBeenCalledWith({ locale: "en", page: 1, per_page: 12, category: undefined }, expect.any(AbortSignal));
  expect(websiteApi.categories).toHaveBeenCalledWith({ locale: "en" }, expect.any(AbortSignal));
});

test("a missing API article shows the absent-content state", async () => {
  vi.spyOn(websiteApi, "article").mockRejectedValue(new WebsiteApiError("Missing", 404));
  vi.spyOn(websiteApi, "articles").mockResolvedValue({ data: [], meta: { total: 0, last_page: 1 } });
  vi.spyOn(websiteApi, "categories").mockResolvedValue({ data: [] });
  renderPage(<ArticlePage />, "en", "/:locale/insights/:slug", "/en/insights/missing");
  await screen.findByText("Insight not found");
  expect(websiteApi.article).toHaveBeenCalledWith("missing", "en", expect.any(AbortSignal));
});
