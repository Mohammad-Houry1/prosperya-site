import { screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";
import SolutionsPage from "../../src/pages/Solutions/SolutionsPage.jsx";
import SolutionDetailPage from "../../src/pages/SolutionDetail/SolutionDetailPage.jsx";
import SolutionMetaphor from "../../src/components/visuals/SolutionMetaphor.jsx";

beforeEach(() => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
  // jsdom does not implement SVG path geometry; browser tests use the real APIs.
  Object.defineProperty(SVGElement.prototype, "getTotalLength", { configurable: true, value: () => 100 });
  Object.defineProperty(SVGElement.prototype, "getPointAtLength", { configurable: true, value: () => ({ x: 0, y: 0 }) });
});
afterEach(() => {
  vi.restoreAllMocks(); vi.unstubAllGlobals();
  delete SVGElement.prototype.getTotalLength;
  delete SVGElement.prototype.getPointAtLength;
});
const show = (Page, path = "solutions") => render(<ThemeProvider><MemoryRouter initialEntries={[`/en/${path}`]}><Routes><Route path="/:locale/solutions" element={<Page />} /><Route path="/:locale/solutions/:slug" element={<Page />} /></Routes></MemoryRouter></ThemeProvider>);

test("solution detail renders statement, friction and capabilities when authored, including all selected case studies", async () => {
  vi.spyOn(websiteApi, "solution").mockResolvedValue({ data: { slug: "cms", solution_title: "CMS Solution", solution_statement: "CMS statement", solution_friction_title: "CMS friction", solution_capabilities: ["CMS capability"],
    related_articles: [{ id: "article", slug: "cms-article", title: "Selected CMS article" }],
    related_case_studies: [{ id: "a", slug: "case-a", case_study_title: "Case A", case_study_summary: "Case summary A", case_study_metrics: [{ metric_value: "42", metric_label: "Case units" }] }, { id: "b", slug: "case-b", case_study_title: "Case B" }], metrics: [{ metric_value: "7", metric_label: "Solution units" }], solution_metrics_note: "<p>Solution qualification</p>" } });
  const view = show(SolutionDetailPage, "solutions/cms");
  await screen.findByRole("heading", { name: "CMS Solution" });
  expect(screen.getByRole("heading", { name: "CMS statement" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "CMS friction" })).toBeInTheDocument();
  expect(screen.getByText("CMS capability")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Case B" })).toBeInTheDocument();
  expect(screen.getByText("Case summary A")).toBeInTheDocument();
  expect(screen.getByText("Case units")).toBeInTheDocument();
  expect(screen.getByText("Solution units")).toBeInTheDocument();
  expect(screen.getByText("Solution qualification")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Selected CMS article" })).toHaveAttribute("href", "/en/insights/cms-article");
  expect(view.container.querySelector('[data-solution-animation]')).toBeNull();
});

test("listing uses selected proof and authored architecture without another case study collection request", async () => {
  vi.spyOn(websiteApi, "solutions").mockResolvedValue({ data: [{ id: "solution", slug: "cms", solution_title: "CMS Solution", related_case_studies: [{ id: "case", slug: "public-case", case_study_title: "Selected proof" }] }] });
  vi.spyOn(websiteApi, "page").mockResolvedValue({ data: { architecture_title: "CMS architecture", architecture_description: "<p>CMS architecture description</p>", architecture_column_1: ["CMS audience"], architecture_column_2: ["CMS function"], architecture_column_3: ["CMS platform"], architecture_column_4: ["CMS foundation"] } });
  const cases = vi.spyOn(websiteApi, "caseStudies").mockResolvedValue({ data: [] });
  const view = show(SolutionsPage);
  await screen.findByRole("heading", { name: "CMS Solution" });
  expect(screen.getByRole("heading", { name: "Selected proof" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "CMS architecture" })).toBeInTheDocument();
  expect(screen.getByText("CMS foundation")).toBeInTheDocument();
  expect(cases).not.toHaveBeenCalled();
  expect(view.container.querySelector('[data-solution-animation]')).toBeNull();
});

test.each(["workflow", "network", "consolidation"])("%s diagram renders every authored item, without reference labels", type => {
  const animation = { type, centreLabel: "CMS centre", resultLabel: "CMS result", signalLabel: "CMS signal", sources: ["Source one"], lanes: ["Lane one"], steps: Array.from({ length: 9 }, (_, i) => `Step ${i}`), suppliers: ["Supplier one"], hubs: ["Hub one"], channels: ["Channel one"] };
  const view = render(<SolutionMetaphor animation={animation} label="CMS diagram" />);
  const diagram = screen.getByRole("img", { name: "CMS diagram" });
  expect(view.container.querySelector('[data-solution-animation]')).toHaveAttribute("data-solution-animation", type);
  if (type === "workflow") expect(within(diagram).getByText("Step 8")).toBeInTheDocument();
  if (type === "network") expect(within(diagram).getByText("Supplier one")).toBeInTheDocument();
  if (type === "consolidation") expect(within(diagram).getByText("Source one")).toBeInTheDocument();
  expect(screen.queryByText("France")).not.toBeInTheDocument();
});

test("missing solution displays a missing-content state", async () => {
  vi.spyOn(websiteApi, "solution").mockRejectedValue(new WebsiteApiError("Missing", 404));
  show(SolutionDetailPage, "solutions/missing");
  await screen.findByText("Solution not found");
  expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
});
