import { screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test, vi, beforeEach } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { createTranslator } from "../../src/i18n/labels.js";
import { websiteApi } from "../../src/services/websiteApi.js";
import ExpertisePage from "../../src/pages/Expertise/ExpertisePage.jsx";
import WorkPage from "../../src/pages/Work/WorkPage.jsx";
import { loadMarketingList } from "../../src/repositories/marketingListings.js";

vi.mock("../../src/services/websiteApi.js", () => ({ websiteApi: {
  caseStudies: vi.fn(), expertise: vi.fn(), testimonials: vi.fn(), seo: vi.fn(),
} }));
beforeEach(() => {
  vi.resetAllMocks();
  websiteApi.testimonials.mockResolvedValue({ data: [] });
  websiteApi.seo.mockResolvedValue({ data: null });
});
function show(Page) {
  return render(<ThemeProvider><MemoryRouter><LocaleContext.Provider value={{ locale: "fr", t: createTranslator("fr") }}>
    <Page />
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
