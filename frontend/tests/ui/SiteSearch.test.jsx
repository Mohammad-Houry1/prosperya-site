import { screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import SiteSearch from "../../src/components/layout/SiteSearch.jsx";
import { websiteApi } from "../../src/services/websiteApi.js";

beforeEach(() => vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function show(locale = "en") {
  render(<MantineProvider><MemoryRouter><LocaleContext.Provider value={cmsLocale(locale)}><SiteSearch /></LocaleContext.Provider></MemoryRouter></MantineProvider>);
}
test.each(["en", "fr"])("site search submits trimmed queries and links CMS results in %s", async locale => {
  vi.spyOn(websiteApi, "search").mockResolvedValue({ data: [{ id: "cms", type: "expertise", title: "CMS result", summary: "CMS summary", href: `/${locale}/expertise/cms` }], meta: { total: 21, current_page: 1, last_page: 2 } });
  show(locale);
  fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Search" : "Rechercher", exact: true }));
  const input = await screen.findByRole("searchbox");
  fireEvent.change(input, { target: { value: "  ERP  " } });
  fireEvent.submit(input.closest("form"));
  expect(await screen.findByRole("link", { name: /CMS result/ })).toHaveAttribute("href", `/${locale}/expertise/cms`);
  expect(websiteApi.search).toHaveBeenCalledWith({ q: "ERP", locale, page: 1, per_page: 20 }, expect.any(AbortSignal));
  fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Next results" : "Résultats suivants" }));
  await screen.findByText("CMS summary");
  expect(websiteApi.search).toHaveBeenCalledWith({ q: "ERP", locale, page: 2, per_page: 20 }, expect.any(AbortSignal));
});
test("short search terms do not request the API and empty searches show feedback", async () => {
  vi.spyOn(websiteApi, "search").mockResolvedValue({ data: [], meta: { total: 0, last_page: 1 } });
  show();
  fireEvent.click(screen.getByRole("button", { name: "Search", exact: true }));
  const input = await screen.findByRole("searchbox");
  fireEvent.change(input, { target: { value: "x" } });
  fireEvent.submit(input.closest("form"));
  expect(screen.getByText("Enter at least two characters.")).toBeInTheDocument();
  expect(websiteApi.search).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "missing" } });
  fireEvent.submit(input.closest("form"));
  expect(await screen.findByText("No matching results. Try another search.")).toBeInTheDocument();
});
