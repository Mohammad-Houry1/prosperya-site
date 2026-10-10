import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import AboutPage from "../../src/pages/About/AboutPage.jsx";
import WorkPage from "../../src/pages/Work/WorkPage.jsx";
import InsightsPage from "../../src/pages/Insights/InsightsPage.jsx";
import ArticlePage from "../../src/pages/Article/ArticlePage.jsx";
import { stagingContent, StagingContentError } from "../../src/services/stagingContent.js";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";

beforeEach(() => {
  vi.spyOn(stagingContent, "testimonials").mockImplementation(async ({ locale }) => ({ data: [{
    id: "testimonial", quote: locale === "fr" ? "Nos équipes travaillent ensemble." : "Our teams work together.",
    name: "Alex", role: "Operations", company: "Example",
  }] }));
  vi.spyOn(stagingContent, "platforms").mockResolvedValue({ data: [{ id: "cms-platform", slug: "netsuite", name: "CMS platform" }] });
});
afterEach(() => vi.restoreAllMocks());

function renderPage(page, locale = "en", route = "/*", pathname = `/${locale}`) {
  return render(<ThemeProvider><MemoryRouter initialEntries={[pathname]}>
    <LocaleContext.Provider value={{ locale, t: (key) => key }}>
      <Routes><Route path={route} element={page} /></Routes>
    </LocaleContext.Provider>
  </MemoryRouter></ThemeProvider>);
}

test.each([
  ["about", "en", AboutPage], ["about", "fr", AboutPage],
  ["work", "en", WorkPage], ["work", "fr", WorkPage],
])("%s renders reference testimonials in %s", async (_name, locale, Page) => {
  renderPage(<Page />, locale);
  await screen.findByText(locale === "fr" ? /Nos équipes travaillent ensemble/ : /Our teams work together/);
  expect(stagingContent.testimonials).toHaveBeenCalledWith({ locale }, expect.any(AbortSignal));
  if (_name === "about") expect(stagingContent.platforms).toHaveBeenCalledWith({ locale }, expect.any(AbortSignal));
});

test("insights renders API articles with their category and pagination", async () => {
  vi.spyOn(stagingContent, "articles").mockResolvedValue({ data: [{ id: "article", slug: "cms-article", title: "CMS article", excerpt: "CMS summary", category_id: "finance" }], meta: { total: 1, last_page: 1 } });
  vi.spyOn(stagingContent, "categories").mockResolvedValue({ data: [{ id: "finance", slug: "finance", name: "Finance" }] });
  renderPage(<InsightsPage />);
  await screen.findByRole("heading", { name: "CMS article" });
  expect(screen.getByText("1 article")).toBeInTheDocument();
  expect(stagingContent.articles).toHaveBeenCalledWith({ locale: "en", page: 1, per_page: 12, category: undefined }, expect.any(AbortSignal));
  expect(stagingContent.categories).toHaveBeenCalledWith({ locale: "en" }, expect.any(AbortSignal));
});

test("a missing API article shows the absent-content state", async () => {
  vi.spyOn(stagingContent, "article").mockRejectedValue(new StagingContentError("Missing", 404));
  vi.spyOn(stagingContent, "articles").mockResolvedValue({ data: [], meta: { total: 0, last_page: 1 } });
  vi.spyOn(stagingContent, "categories").mockResolvedValue({ data: [] });
  renderPage(<ArticlePage />, "en", "/:locale/insights/:slug", "/en/insights/missing");
  await screen.findByText("Insight not found");
  expect(stagingContent.article).toHaveBeenCalledWith("missing", "en", expect.any(AbortSignal));
});
