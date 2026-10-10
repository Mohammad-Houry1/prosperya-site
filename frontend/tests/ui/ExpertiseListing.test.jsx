import { screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";
import ExpertisePage from "../../src/pages/Expertise/ExpertisePage.jsx";

beforeEach(() => {
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
});
afterEach(() => vi.restoreAllMocks());
function show(locale = "en") {
  return render(<ThemeProvider><MemoryRouter initialEntries={[`/${locale}/expertise`]}><LocaleContext.Provider value={cmsLocale(locale)}><ExpertisePage /></LocaleContext.Provider></MemoryRouter></ThemeProvider>);
}

test.each(["en", "fr"])("listing uses authored full headings in API order in %s", async locale => {
  const fullTitle = locale === "fr" ? "Intégration des systèmes" : "Systems Integration";
  const api = vi.spyOn(websiteApi, "expertise").mockResolvedValue({ data: [
    { id: "b", slug: "arbitrary-cms-slug", expertise_title: "Connect", expertise_detail_title: fullTitle, expertise_summary: "CMS summary", expertise_capabilities: ["First service", "Second service"], expertise_image: { url: "/cms.png", alt: "CMS image" } },
    { id: "a", slug: "older-record", expertise_title: "Older title" },
  ] });
  const view = show(locale);
  await screen.findByRole("heading", { name: fullTitle });
  const rows = view.container.querySelector('[class*="rows"]');
  const headings = within(rows).getAllByRole("heading", { level: 2 });
  expect(headings.map(row => row.textContent)).toEqual([fullTitle, "Older title"]);
  expect(screen.getByAltText("CMS image")).toHaveAttribute("src", "/cms.png");
  expect(screen.getByText("First service")).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: new RegExp(fullTitle) })).toHaveLength(2);
  expect(api).toHaveBeenCalledExactlyOnceWith({ locale }, expect.any(AbortSignal));
});

test("empty published list shows an empty state without a blank hero index", async () => {
  vi.spyOn(websiteApi, "expertise").mockResolvedValue({ data: [] });
  const view = show();
  await screen.findByRole("heading", { name: "Nothing to show yet" });
  expect(view.container.querySelector('[class*="index"]')).toBeNull();
  expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
});

test("an unavailable API retries the real list and does not render reference records", async () => {
  const api = vi.spyOn(websiteApi, "expertise").mockRejectedValueOnce(new WebsiteApiError("Unavailable", 503)).mockResolvedValueOnce({ data: [{ id: "one", slug: "new-record", expertise_title: "Recovered CMS title" }] });
  show();
  const retry = await screen.findByRole("button", { name: /retry|try again/i });
  expect(screen.queryByText("ERP Transformation")).not.toBeInTheDocument();
  fireEvent.click(retry);
  expect(await screen.findByRole("heading", { name: "Recovered CMS title" })).toBeInTheDocument();
  expect(api).toHaveBeenCalledTimes(2);
});
