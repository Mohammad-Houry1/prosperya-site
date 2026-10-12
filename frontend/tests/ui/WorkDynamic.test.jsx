import { screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { websiteApi } from "../../src/services/websiteApi.js";
import CaseStudyPage from "../../src/pages/CaseStudy/CaseStudyPage.jsx";
import WorkPage from "../../src/pages/Work/WorkPage.jsx";

const record = { id: "authored", slug: "authored", case_study_title: "Authored project", industry_id: "stable-industry",
  industry_record: { id: "stable-industry", name: "Commerce FR" }, case_study_chapeau: "CMS introduction",
  case_study_hero_facts: [{ hero_fact_value: "12", hero_fact_label: "CMS teams" }], case_study_client: "Legacy client",
  content_sections: [{ content_title: "CMS chapter", content_subtitle: "CMS subtitle", content_description: '<p><strong>CMS body</strong></p><script>bad()</script>' }],
  technology_stack: [{ technology_name: "CMS technology", technology_image: { url: "/cms-logo.png", alt: "CMS logo" } }],
  sections: [{ section_title: "Extra section", section_subtitle: "Extra subtitle" }], case_study_animation_type: "network" };

beforeEach(() => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
  vi.spyOn(websiteApi, "caseStudy").mockResolvedValue({ data: record });
  vi.spyOn(websiteApi, "caseStudies").mockResolvedValue({ data: [record] });
  vi.spyOn(websiteApi, "expertise").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "testimonials").mockResolvedValue({ data: [] });
});
afterEach(() => vi.restoreAllMocks());
function show(detail = true, locale = "en") {
  return render(<ThemeProvider><MemoryRouter initialEntries={[`/${locale}/work${detail ? "/authored" : ""}`]}><LocaleContext.Provider value={cmsLocale(locale)}><Routes><Route path="/:locale/work/:slug" element={<CaseStudyPage />} /><Route path="/:locale/work" element={<WorkPage />} /></Routes></LocaleContext.Provider></MemoryRouter></ThemeProvider>);
}

test.each(["en", "fr"])("case-study detail renders new authored sections, logos and facts in %s", async locale => {
  const view = show(true, locale);
  await screen.findByRole("heading", { name: "Authored project" });
  expect(screen.getByText("CMS introduction")).toBeInTheDocument();
  expect(screen.getByText("CMS teams")).toBeInTheDocument();
  expect(screen.queryByText("Legacy client")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "CMS chapter" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /CMS chapter/ })).toHaveAttribute("href", "#case-content-1");
  expect(screen.getByText("CMS subtitle")).toBeInTheDocument();
  expect(screen.getByText("CMS body").tagName).toBe("STRONG");
  expect(screen.getByAltText("CMS logo")).toHaveAttribute("src", "/cms-logo.png");
  expect(screen.getByText("Extra subtitle")).toBeInTheDocument();
  expect(view.container.querySelector('[data-case-study-animation="network"]')).toBeInTheDocument();
  expect(view.container.querySelector("script")).toBeNull();
});

test("Work filters by the selected industry record's translated name", async () => {
  vi.mocked(websiteApi.caseStudies).mockResolvedValue({ data: [record, { ...record, id: "finance", slug: "finance", case_study_title: "Finance project", industry_id: "finance-industry", industry_record: { id: "finance-industry", name: "Finance FR" } }] });
  const view = show(false, "fr");
  await screen.findByRole("heading", { name: "Authored project" });
  const grid = view.container.querySelector('[class*="projectGrid"]');
  expect(within(grid).getAllByRole("article")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Commerce FR", exact: true }));
  expect(within(grid).getAllByRole("article")).toHaveLength(1);
  expect(within(grid).queryByRole("heading", { name: "Finance project" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Tous les secteurs", exact: true }));
  expect(within(grid).getAllByRole("article")).toHaveLength(2);
});

test("Work has only the industry filter and does not request capability options", async () => {
  show(false);
  await screen.findByRole("heading", { name: "Authored project" });
  expect(screen.getByRole("group", { name: "Filter by industry" })).toBeInTheDocument();
  expect(screen.queryByRole("group", { name: "Filter by capability" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "All capabilities" })).not.toBeInTheDocument();
  expect(websiteApi.expertise).not.toHaveBeenCalled();
});

test("a missing case study shows the missing-record state", async () => {
  vi.mocked(websiteApi.caseStudy).mockRejectedValue(Object.assign(new Error("Missing"), { status: 404 }));
  show();
  await screen.findByRole("heading", { name: "Case study not found" });
});

test("Work renders authored rich summaries without empty image panels", async () => {
  vi.mocked(websiteApi.caseStudies).mockResolvedValue({ data: [{ ...record, case_study_summary: '<p><strong>Formatted summary</strong></p><script>bad()</script>', case_study_image: null }] });
  const view = show(false);
  await screen.findByRole("heading", { name: "Authored project" });
  const grid = view.container.querySelector('[class*="projectGrid"]');
  expect(within(grid).getByText("Formatted summary").tagName).toBe("STRONG");
  expect(grid.querySelector('[class*="projectImage"]')).toBeNull();
  expect(grid.querySelector("script")).toBeNull();
});
