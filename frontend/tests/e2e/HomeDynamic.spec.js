import { expect, test } from "@playwright/test";
import { expertise, mockCms } from "./cmsFixtures.js";

for (const locale of ["en", "fr"]) {
  test(`Home uses the latest public content and keeps its mobile layout in ${locale}`, async ({ page }) => {
    await mockCms(page);
    const requests = [];
    page.on("request", request => {
      if (request.url().includes("/api/")) requests.push(new URL(request.url()));
    });
    await page.route("**/api/expertise?**", route => {
      const url = new URL(route.request().url());
      const ids = url.searchParams.get("sort") === "latest" ? [5, 4, 3, 2] : [1, 2, 3, 4, 5];
      return route.fulfill({ json: { data: ids.map(id => ({ ...expertise(`skill-${id}`, locale), featured: false })), meta: { last_page: 2 } } });
    });
    await page.route("**/api/articles?**", route => route.fulfill({ json: { data: [3, 2, 1].map(id => ({
      id: `article-${id}`, slug: `story-${id}`, title: `${locale} Story ${id}`, excerpt: "CMS article summary",
      published_at: `2026-01-0${id}T12:00:00Z`, featured: false,
    })), meta: { last_page: 3 } } }));
    await page.route("**/api/platforms?**", route => route.fulfill({ json: { data: [{ id: "client", name: "CMS Client", logo_image: null }] } }));
    await page.goto(`/${locale}`);
    const main = page.locator("main");
    const skillPrefix = locale === "fr" ? "Expertise CMS" : "CMS Expertise";
    await expect(main.getByRole("heading", { level: 3 }).filter({ hasText: /skill-/ })).toHaveText([5, 4, 3, 2].map(id => `${skillPrefix}: skill-${id}`));
    await expect(main.getByRole("heading", { level: 3 }).filter({ hasText: /Story/ })).toHaveText([`${locale} Story 3`, `${locale} Story 2`, `${locale} Story 1`]);
    await expect(main.getByRole("link", { name: `${locale} Story 3` })).toHaveAttribute("href", `/${locale}/insights/story-3`);
    await expect(main.getByRole("heading", { name: "CMS Stage" })).toBeAttached();
    await expect(main.getByText("CMS Client", { exact: true }).first()).toBeAttached();
    await expect(main.getByRole("heading", { name: "CMS Architecture" })).toHaveCount(0);
    expect(requests.some(url => url.pathname === "/api/pages/home" || url.pathname === "/api/case-studies")).toBe(false);
    expect(requests.find(url => url.pathname === "/api/platforms").searchParams.get("category")).toBe("clients");
    expect(requests.find(url => url.pathname === "/api/articles").searchParams.get("per_page")).toBe("3");
    await main.getByRole("heading", { name: `${locale} Story 3` }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `../.verification/home-${locale}-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await main.getByRole("heading", { name: `${locale} Story 3` }).scrollIntoViewIfNeeded();
    await expect(main.getByRole("heading", { name: `${locale} Story 3` })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../.verification/home-${locale}-mobile.png` });
  });
}
