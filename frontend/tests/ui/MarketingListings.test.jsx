import { screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { expect, test, vi, beforeEach } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { createTranslator } from "../../src/i18n/labels.js";
import { websiteApi } from "../../src/services/websiteApi.js";
import ExpertisePage from "../../src/pages/Expertise/ExpertisePage.jsx";
import WorkPage from "../../src/pages/Work/WorkPage.jsx";
import ExpertiseDetailPage from "../../src/pages/ExpertiseDetail/ExpertiseDetailPage.jsx";
import CaseStudyPage from "../../src/pages/CaseStudy/CaseStudyPage.jsx";
import { loadMarketingList } from "../../src/repositories/marketingListings.js";

vi.mock("../../src/services/websiteApi.js", () => ({ websiteApi: {
  caseStudies: vi.fn(), expertise: vi.fn(), testimonials: vi.fn(), seo: vi.fn(),
  caseStudy: vi.fn(), expertiseDetail: vi.fn(),
} }));
beforeEach(() => {
  vi.resetAllMocks();
  websiteApi.testimonials.mockResolvedValue({ data: [] });
  websiteApi.seo.mockResolvedValue({ data: null });
});
function show(Page, path = "/fr", route = "*") {
  return render(<ThemeProvider><MemoryRouter initialEntries={[path]}><LocaleContext.Provider value={{ locale: "fr", t: createTranslator("fr") }}>
    <Routes><Route path={route} element={<Page />} /></Routes>
  </LocaleContext.Provider></MemoryRouter></ThemeProvider>);
}
test("expertise renders more than four CMS records and sanitizes summaries", async () => {
  websiteApi.expertise.mockResolvedValue({ data: Array.from({ length: 5 }, (_, index) => ({
    id: String(index), slug: `cms-${index}`, title: `Expertise ${index}`, summary: "<p>Résumé du CMS</p><script>bad()</script>",
    capabilities: ["Connecter les systèmes"],
  })) });
  const view = show(ExpertisePage);
  expect(await screen.findByRole("heading", { name: "Expertise 4" })).toBeInTheDocument();
  expect(screen.getAllByText("Connecter les systèmes")).toHaveLength(5);
  expect(view.container.querySelector("script")).toBeNull();
  expect(view.container.querySelector("img")).toBeNull();
  expect(screen.getByRole("link", { name: "Explorer Expertise 4" })).toHaveAttribute("href", "/fr/expertise/cms-4");
});
test("work filters use CMS industry and expertise relationships without requiring metrics", async () => {
  websiteApi.caseStudies.mockResolvedValue({ data: [
    { id: "a", slug: "a", title: "Premier projet", industry: "Industrie", expertise_ids: ["erp"] },
    { id: "b", slug: "b", title: "Deuxième projet", industry: "Distribution", expertise_ids: [] },
  ] });
  websiteApi.expertise.mockResolvedValue({ data: [{ id: "erp", title: "ERP du CMS" }] });
  show(WorkPage);
  expect(await screen.findByRole("heading", { name: "Deuxième projet" })).toBeInTheDocument();
  fireEvent.change(await screen.findByLabelText("Filtrer par expertise"), { target: { value: "erp" } });
  expect(screen.queryByRole("heading", { name: "Deuxième projet" })).toBeNull();
  expect(screen.getByRole("heading", { name: "Premier projet" })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Filtrer par expertise"), { target: { value: "" } });
  fireEvent.change(screen.getByLabelText("Filtrer par secteur"), { target: { value: "Distribution" } });
  expect(screen.queryByRole("heading", { name: "Premier projet" })).toBeNull();
});
test("list loading follows pagination and forwards cancellation", async () => {
  const signal = new AbortController().signal;
  websiteApi.expertise.mockResolvedValueOnce({ data: [{ id: "first" }], meta: { last_page: 2 } })
    .mockResolvedValueOnce({ data: [{ id: "second" }], meta: { last_page: 2 } });
  expect(await loadMarketingList("expertise", "fr", signal)).toEqual([{ id: "first" }, { id: "second" }]);
  expect(websiteApi.expertise).toHaveBeenLastCalledWith({ locale: "fr", page: 2, per_page: 50 }, signal);
});

test("a new CMS Expertise slug renders the existing detail template and section media", async () => {
  websiteApi.expertise.mockResolvedValue({ data: [] });
  websiteApi.expertiseDetail.mockResolvedValue({ data: { slug: "nouvelle", title: "Nouvelle expertise",
    description: "<p>Introduction CMS</p>", sections: [{ title: "Section CMS", description: "<p>Texte CMS</p><script>bad()</script>", image: { url: "https://media.example.test/section.svg", alt: "Diagramme CMS" } }] } });
  const view = show(ExpertiseDetailPage, "/fr/expertise/nouvelle", "/fr/expertise/:slug");
  expect(await screen.findByRole("heading", { name: "Nouvelle expertise", level: 1 })).toBeInTheDocument();
  expect(screen.getByText("Texte CMS")).toBeInTheDocument();
  expect(screen.getByAltText("Diagramme CMS")).toBeInTheDocument();
  expect(view.container.querySelector("script")).toBeNull();
  expect(websiteApi.expertiseDetail).toHaveBeenCalledWith("nouvelle", "fr", expect.any(AbortSignal));
});
test("a new CMS Work slug renders rich content and long architecture lists without invented metrics", async () => {
  websiteApi.caseStudy.mockResolvedValue({ data: { id: "new", slug: "nouveau", title: "Projet CMS",
    description: "<p>Introduction du projet</p>", challenge: "<p>Défi CMS</p><script>bad()</script>",
    before: Array.from({ length: 9 }, (_, index) => `Source ${index}`), after: ["Cible CMS"],
    sections: [], platforms: [], metrics: [], gallery: [], implementation_steps: [] } });
  const view = show(CaseStudyPage, "/fr/work/nouveau", "/fr/work/:slug");
  expect(await screen.findByRole("heading", { name: "Projet CMS", level: 1 })).toBeInTheDocument();
  expect(screen.getByText("Défi CMS")).toBeInTheDocument();
  expect(screen.getByText("Source 8")).toBeInTheDocument();
  expect(screen.queryByText("NetSuite")).toBeNull();
  expect(view.container.querySelector("blockquote")).toBeNull();
  expect(view.container.querySelector("script")).toBeNull();
  expect(websiteApi.caseStudy).toHaveBeenCalledWith("nouveau", "fr", expect.any(AbortSignal));
});
