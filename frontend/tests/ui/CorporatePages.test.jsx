import { cmsLocale } from "../cmsFixtures.js";
import { screen, waitFor, within } from "@testing-library/react";
import { render } from "../renderWithMantine.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, Link } from "react-router-dom";
import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import LegalPage from "../../src/pages/Legal/LegalPage.jsx";
import SiteFooter from "../../src/components/layout/SiteFooter.jsx";
import AboutPage from "../../src/pages/About/AboutPage.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import { websiteApi, WebsiteApiError } from "../../src/services/websiteApi.js";

const pages = [{ id: "about", slug: "about-prosperya", title: "About from CMS" },
  { id: "terms", slug: "terms-of-use", title: "Terms from CMS" }];
function renderPage(locale = "en") {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 300000 } } })}>
    <MemoryRouter initialEntries={[`/${locale}/corporate/about-prosperya`]}>
      <LocaleContext.Provider value={cmsLocale(locale)}>
        <Routes><Route path="/:locale/corporate/:slug" element={<LegalPage />} /></Routes><SiteFooter />
      </LocaleContext.Provider>
    </MemoryRouter>
  </QueryClientProvider>);
}
beforeEach(() => {
  vi.spyOn(websiteApi, "expertise").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "solutions").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "users").mockResolvedValue({ data: [{ id: "leader", name: "CMS leader", bio: "<p>Public biography</p>" }] });
  vi.spyOn(websiteApi, "corporatePages").mockResolvedValue({ data: pages, meta: { last_page: 1 } });
  vi.spyOn(websiteApi, "corporatePage").mockResolvedValue({ data: { ...pages[0],
    updated_at: "2026-10-09T08:02:04.596000Z", description: "<p>CMS introduction</p>", sections: [{ title: "CMS section", description: "<p>CMS body</p>" }], seo: {} } });
});
afterEach(() => vi.restoreAllMocks());

test.each(["en", "fr"])("shares the category list between footer and sidebar in %s", async (locale) => {
  renderPage(locale);
  await screen.findByRole("heading", { name: "About from CMS", level: 1 });
  const side = screen.getByRole("navigation", { name: locale === "fr" ? "Pages de l’entreprise" : "Corporate pages" });
  const foot = screen.getByRole("navigation", { name: locale === "fr" ? "Informations légales" : "Legal information" });
  for (const nav of [side, foot]) {
    expect(within(nav).getByRole("link", { name: "About from CMS" })).toHaveAttribute("href", `/${locale}/corporate/about-prosperya`);
    expect(within(nav).getByRole("link", { name: "Terms from CMS" })).toHaveAttribute("href", `/${locale}/terms-of-use`);
    expect(within(nav).getByRole("link", { name: "About from CMS" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).queryByText("Cookie policy")).not.toBeInTheDocument();
  }
  expect(websiteApi.corporatePage).toHaveBeenCalledWith("about-prosperya", locale, expect.any(AbortSignal));
  expect(websiteApi.corporatePages).toHaveBeenCalledTimes(1);
  expect(websiteApi.corporatePages).toHaveBeenCalledWith({ locale, category: "corporate" }, expect.any(AbortSignal));
  expect(screen.getByText("CMS body")).toBeInTheDocument();
  expect(screen.getByText(locale === "fr" ? "9 octobre 2026" : "9 October 2026")).toHaveAttribute("datetime", "2026-10-09T08:02:04.596Z");
  expect(screen.queryByText("2026-10-09T08:02:04.596000Z")).not.toBeInTheDocument();
});

test("shows skeletons while details and the category list load", () => {
  websiteApi.corporatePage.mockReturnValue(new Promise(() => {}));
  websiteApi.corporatePages.mockReturnValue(new Promise(() => {}));
  renderPage();
  expect(screen.getByRole("status", { name: "Loading page" })).toHaveAttribute("aria-busy", "true");
  expect(screen.getByRole("status", { name: "Loading pages" })).toHaveAttribute("aria-busy", "true");
  expect(screen.queryByText("Loading Prosperya")).not.toBeInTheDocument();
});

test("keeps valid details when a category list is unavailable", async () => {
  websiteApi.corporatePages.mockRejectedValue(new WebsiteApiError("Unavailable", 404));
  renderPage();
  await screen.findByRole("heading", { name: "About from CMS", level: 1 });
  await waitFor(() => expect(screen.queryByRole("status", { name: "Loading pages" })).not.toBeInTheDocument());
  const side = screen.getByRole("navigation", { name: "Corporate pages" });
  expect(within(side).queryByRole("link")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
});

test("About and the corporate route share raw content without exchanging presentation shapes", async () => {
  websiteApi.corporatePage.mockResolvedValue({ data: { ...pages[0], title: "Corporate heading", about_title: "About heading",
    description: "<p>Shared introduction</p>", about_users: [{ id: "leader", name: "CMS leader", bio: "<p>Public biography</p>" }],
    sections: [{ title: "Shared section", description: "<p>Shared section body</p>" }] } });
  vi.spyOn(websiteApi, "testimonials").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "platforms").mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, "seo").mockResolvedValue({ data: null });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 300000 } } });
  render(<ThemeProvider><QueryClientProvider client={client}><MemoryRouter initialEntries={["/en/corporate/about-prosperya"]}>
    <LocaleContext.Provider value={cmsLocale()}>
      <Link to="/en/about">Open About</Link><Link to="/en/corporate/about-prosperya">Open corporate</Link>
      <Routes><Route path="/:locale/about" element={<AboutPage />} /><Route path="/:locale/corporate/:slug" element={<LegalPage />} /></Routes>
    </LocaleContext.Provider>
  </MemoryRouter></QueryClientProvider></ThemeProvider>);
  await screen.findByRole("heading", { name: "Corporate heading", level: 1 });
  fireEvent.click(screen.getByRole("link", { name: "Open About" }));
  await screen.findByRole("heading", { name: "About heading", level: 1 });
  expect(screen.getByText("Shared introduction")).toBeInTheDocument();
  expect(screen.getByText("Shared section body")).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: "CMS leader" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Open corporate" }));
  await screen.findByRole("heading", { name: "Corporate heading", level: 1 });
  expect(screen.getByText("Shared section body")).toBeInTheDocument();
});
