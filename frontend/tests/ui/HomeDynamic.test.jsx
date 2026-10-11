import { fireEvent, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render } from "../renderWithQueries.jsx";
import { cmsLocale } from "../cmsFixtures.js";
import { LocaleContext } from "../../src/i18n/LocaleContext.jsx";
import { ThemeProvider } from "../../src/theme/ThemeProvider.jsx";
import HomePage from "../../src/pages/Home/HomePage.jsx";

const calls = [];
let articleFailure = false;
let emptyContent = false;

beforeEach(() => {
  calls.length = 0;
  articleFailure = false;
  emptyContent = false;
  vi.stubGlobal("fetch", vi.fn(async (path) => {
    const url = new URL(path, "https://site.example.test");
    calls.push(url);
    const locale = url.searchParams.get("locale") || "en";
    let data = [];
    if (url.pathname === "/api/expertise" && !emptyContent) {
      const ids = url.searchParams.get("sort") === "latest" ? [5, 4, 3, 2] : [1, 2, 3, 4, 5];
      data = ids.map(id => ({ id: String(id), slug: `skill-${id}`, featured: false,
        expertise_title: `${locale} Skill ${id}`, expertise_summary: "Authored expertise summary" }));
    }
    if (url.pathname === "/api/articles") {
      if (articleFailure) return { ok: false, status: 503, json: async () => ({ message: "Unavailable" }) };
      if (!emptyContent) data = [3, 2, 1].map(id => ({ id: `article-${id}`, slug: `story-${id}`,
        title: `${locale} Story ${id}`, excerpt: "Authored article summary", featured: false,
        published_at: `2026-01-0${id}T12:00:00Z`, cover_image: { url: `/story-${id}.jpg` } }));
    }
    if (url.pathname === "/api/approaches/our-approach") data = { methodology: [{ methodology_title: `${locale} Discovery` }] };
    if (url.pathname === "/api/platforms" && url.searchParams.get("category") === "clients") data = [{ id: "client", name: `${locale} Client`, logo_image: null }];
    if (url.pathname === "/api/pages/home") data = { architecture_title: "Old architecture section" };
    if (url.pathname === "/api/seo") data = null;
    return { ok: true, status: 200, json: async () => ({ data, meta: { last_page: 1 } }) };
  }));
});
afterEach(() => vi.unstubAllGlobals());

function show(locale = "en") {
  return render(<ThemeProvider><MemoryRouter initialEntries={[`/${locale}`]}>
    <LocaleContext.Provider value={cmsLocale(locale)}><HomePage /></LocaleContext.Provider>
  </MemoryRouter></ThemeProvider>);
}

test.each(["en", "fr"])("Home renders newest non-featured expertise and articles with CMS links in %s", async locale => {
  show(locale);
  await screen.findByRole("heading", { name: `${locale} Skill 5` });
  await screen.findByRole("heading", { name: `${locale} Story 3` });
  const expertise = screen.getAllByRole("heading", { level: 3 }).filter(node => node.textContent.includes("Skill"));
  const articles = screen.getAllByRole("heading", { level: 3 }).filter(node => node.textContent.includes("Story"));
  expect(expertise.map(node => node.textContent)).toEqual([`${locale} Skill 5`, `${locale} Skill 4`, `${locale} Skill 3`, `${locale} Skill 2`]);
  expect(articles.map(node => node.textContent)).toEqual([`${locale} Story 3`, `${locale} Story 2`, `${locale} Story 1`]);
  expect(screen.getByRole("link", { name: `${locale} Story 3` })).toHaveAttribute("href", `/${locale}/insights/story-3`);
  expect(screen.getByRole("link", { name: new RegExp(`${locale} Skill 5`) })).toHaveAttribute("href", `/${locale}/expertise/skill-5`);
  expect(screen.getByRole("link", { name: locale === "fr" ? "Toutes les analyses" : "All insights" })).toHaveAttribute("href", `/${locale}/insights`);
  expect(screen.getByRole("heading", { name: `${locale} Discovery` })).toBeInTheDocument();
  expect(screen.getAllByText(`${locale} Client`).length).toBeGreaterThan(0);
  expect(screen.queryByText("Old architecture section")).not.toBeInTheDocument();
  expect(calls.some(url => url.pathname === "/api/pages/home" || url.pathname === "/api/case-studies")).toBe(false);
  const expertiseRequest = calls.find(url => url.pathname === "/api/expertise");
  expect(Object.fromEntries(expertiseRequest.searchParams)).toEqual({ locale, page: "1", per_page: "4", sort: "latest" });
  const articleRequest = calls.find(url => url.pathname === "/api/articles");
  expect(Object.fromEntries(articleRequest.searchParams)).toEqual({ locale, page: "1", per_page: "3" });
});

test("Home retries a failed article request without replacing the loaded expertise", async () => {
  articleFailure = true;
  show();
  await screen.findByRole("heading", { name: "en Skill 5" });
  const alert = await screen.findByRole("alert");
  articleFailure = false;
  fireEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  await screen.findByRole("heading", { name: "en Story 3" });
  expect(screen.getByRole("heading", { name: "en Skill 5" })).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("Home keeps empty CMS collections empty and shows section feedback", async () => {
  emptyContent = true;
  show();
  expect(await screen.findAllByRole("heading", { name: "Nothing to show yet" })).toHaveLength(2);
  expect(screen.queryAllByRole("heading", { level: 3 }).filter(node => /Skill|Story/.test(node.textContent))).toHaveLength(0);
});
