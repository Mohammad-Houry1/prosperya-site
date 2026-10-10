import { screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { websiteApi } from "../../src/services/websiteApi.js";
import WorkPage from "../../src/pages/Work/WorkPage.jsx";
import ExpertisePage from "../../src/pages/Expertise/ExpertisePage.jsx";
import CaseStudyPage from "../../src/pages/CaseStudy/CaseStudyPage.jsx";

beforeEach(() => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
  vi.spyOn(websiteApi, "testimonials").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "expertise").mockResolvedValue({ data: [{ id: "custom", slug: "custom-expertise", expertise_title: "CMS capability", expertise_tagline: "CMS tagline", expertise_summary: "CMS summary", expertise_capabilities: ["Authored service"], expertise_image: { url: "/cms-image.png", alt: "Authored visual" } }] });
  vi.spyOn(websiteApi, "caseStudies").mockResolvedValue({ data: [
    { id: "alpha", slug: "custom-alpha", case_study_title: "CMS Alpha", industry_id: "retail", case_study_industry: "Retail", related_expertise: [{ id: "custom" }] },
    { id: "beta", slug: "custom-beta", case_study_title: "CMS Beta", industry_id: "finance", case_study_industry: "Finance", related_expertise: [] },
  ] });
});
afterEach(() => vi.restoreAllMocks());

function show(Page, path, locale = "en") {
  return render(<ThemeProvider><MemoryRouter initialEntries={[`/${locale}/${path}`]}><LocaleContext.Provider value={cmsLocale(locale)}><Routes><Route path="/:locale/*" element={<Page />} /></Routes></LocaleContext.Provider></MemoryRouter></ThemeProvider>);
}

test("Work grid filters arbitrary CMS records without affecting the spotlight", async () => {
  const view = show(WorkPage, "work");
  await screen.findByRole("heading", { name: "CMS Alpha" });
  const grid = view.container.querySelector('[class*="projectGrid"]');
  expect(within(grid).getAllByRole("article")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Finance", exact: true }));
  expect(within(grid).getAllByRole("article")).toHaveLength(1);
  expect(within(grid).getByRole("heading", { name: "CMS Beta" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "CMS capability", exact: true }));
  expect(screen.queryByRole("heading", { name: "CMS Beta" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "CMS Alpha", exact: true })).toBeInTheDocument();
  expect(websiteApi.caseStudies).toHaveBeenCalledWith({ locale: "en" }, expect.any(AbortSignal));
});

test.each(["en", "fr"])("Expertise rows use CMS capabilities and uploaded media in %s", async locale => {
  show(ExpertisePage, "expertise", locale);
  await screen.findByRole("heading", { name: "CMS capability" });
  expect(screen.getByText("CMS tagline")).toBeInTheDocument();
  expect(screen.getByText("Authored service")).toBeInTheDocument();
  expect(screen.getByAltText("Authored visual")).toHaveAttribute("src", "/cms-image.png");
  expect(websiteApi.expertise).toHaveBeenCalledWith({ locale }, expect.any(AbortSignal));
});

test("shared case study preserves sanitized rich content, extra sections and selected relationships", async () => {
  vi.spyOn(websiteApi, "caseStudy").mockResolvedValue({ data: {
    id: "alpha", slug: "custom-alpha", case_study_title: "CMS Alpha",
    case_study_challenge: "<p><strong>Rich challenge</strong></p><script>window.injected=1</script>",
    case_study_solution: "<p>Rich solution</p>", case_study_before: ["Authored source"], case_study_after: ["Authored destination"],
    case_study_metrics_note: "<p>Authored qualification</p>",
    platforms: [{ id: "p", name: "Selected platform" }],
    related_expertise: [{ id: "custom", slug: "custom-expertise", expertise_title: "Related CMS expertise" }],
    sections: [{ section_title: "Additional CMS section", section_description: "<p>Additional body</p>" }],
  } });
  const view = render(<ThemeProvider><MemoryRouter initialEntries={["/en/work/custom-alpha"]}><LocaleContext.Provider value={cmsLocale()}><Routes><Route path="/:locale/work/:slug" element={<CaseStudyPage />} /></Routes></LocaleContext.Provider></MemoryRouter></ThemeProvider>);
  await screen.findByRole("heading", { name: "CMS Alpha" });
  expect(view.container.querySelector('[data-case-study-template="shared"]')).toBeInTheDocument();
  expect(screen.getByText("Rich challenge").tagName).toBe("STRONG");
  expect(screen.getByText("Rich solution")).toBeInTheDocument();
  expect(screen.getByText("Authored source")).toBeInTheDocument();
  expect(screen.getByText("Authored qualification")).toBeInTheDocument();
  expect(screen.getByText("Selected platform")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Related CMS expertise" })).toHaveAttribute("href", "/en/expertise/custom-expertise");
  expect(screen.getByText("Additional body")).toBeInTheDocument();
  expect(await screen.findByRole("link", { name: /Next project CMS Beta/ })).toHaveAttribute("href", "/en/work/custom-beta");
  expect(view.container.querySelector("script")).toBeNull();
  expect(view.container.querySelector('[class*="heroVisual"]')).toBeNull();
});
