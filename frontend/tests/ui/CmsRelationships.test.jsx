import { render } from "../renderWithQueries.jsx";
import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { websiteApi } from "../../src/services/websiteApi.js";
import SolutionDetailPage from "../../src/pages/SolutionDetail/SolutionDetailPage.jsx";
import CaseStudyPage from "../../src/pages/CaseStudy/CaseStudyPage.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
beforeEach(() => vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function show(Page, route) { vi.spyOn(websiteApi, "seo").mockResolvedValue({data:null}); return render(<ThemeProvider><MemoryRouter initialEntries={[`/en/${route}/cms-slug`]}><Routes><Route path={`/:locale/${route}/:slug`} element={<Page/>}/></Routes></MemoryRouter></ThemeProvider>); }
test("solution renders authored HTML/media and keeps selected expertise order without a second list", async () => {
  vi.spyOn(websiteApi, "solution").mockResolvedValue({ data: { slug: "cms-slug", solution_title: "CMS Solution", solution_description: "<p>Rich CMS introduction</p><script>window.injected=1</script>", solution_image: {url:"https://media.example.test/solution.png",alt:"CMS cover"}, related_expertise: [{id:"b",slug:"beta",expertise_title:"Beta"},{id:"a",slug:"alpha",expertise_title:"Alpha"}] } });
  const expertise = vi.spyOn(websiteApi, "expertise").mockResolvedValue({data:[]});
  vi.spyOn(websiteApi, "caseStudies").mockResolvedValue({data:[]});
  const view = show(SolutionDetailPage,"solutions");
  expect(await screen.findByText("Rich CMS introduction")).toBeInTheDocument();
  expect(screen.getByAltText("CMS cover")).toHaveAttribute("src","https://media.example.test/solution.png");
  expect(screen.getByRole("heading", {name:"Beta"}).compareDocumentPosition(screen.getByRole("heading", {name:"Alpha"})) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(expertise).not.toHaveBeenCalled();
  expect(view.container.querySelector("script")).toBeNull();
});
test("case study displays selected platforms and its CMS metrics note even without global platform rows", async () => {
  vi.spyOn(websiteApi, "caseStudy").mockResolvedValue({data:{id:"cms",slug:"cms-slug",case_study_title:"CMS Project",case_study_metrics_note:"<p>Authored qualification</p>",case_study_metrics:[{metric_value:"42",metric_label:"CMS units"}],platforms:[{id:"b",name:"Beta Platform"},{id:"a",name:"Alpha Platform"}]}});
  vi.spyOn(websiteApi, "caseStudies").mockResolvedValue({data:[]});
  vi.spyOn(websiteApi, "platforms").mockResolvedValue({data:[]});
  show(CaseStudyPage,"work");
  expect(await screen.findByText("Beta Platform")).toBeInTheDocument();
  expect(screen.getByText("Beta Platform").compareDocumentPosition(screen.getByText("Alpha Platform")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getByText("Authored qualification")).toBeInTheDocument();
  expect(screen.queryByText("NetSuite")).not.toBeInTheDocument();
  expect(document.querySelector('[class*="heroMedia"]')).toBeNull();
});
