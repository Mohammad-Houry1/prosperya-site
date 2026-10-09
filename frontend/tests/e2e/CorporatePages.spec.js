import { expect, test } from "@playwright/test";

for (const locale of ["en", "fr"]) {
  test(`corporate footer and sidebar use the same category list in ${locale}`, async ({ page }) => {
    const lists = [];
    const details = [];
    const rows = [{ id: "about", slug: "about-prosperya", title: "About CMS" },
      { id: "terms", slug: "terms-of-use", title: "Terms CMS" }];
    await page.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      let data = [];
      if (url.pathname === "/api/corporate-pages") {
        lists.push(Object.fromEntries(url.searchParams));
        expect(url.searchParams.get("category")).toBe("corporate");
        data = rows;
      } else if (url.pathname.startsWith("/api/corporate-pages/")) {
        const slug = decodeURIComponent(url.pathname.split("/").at(-1));
        details.push(slug);
        data = { ...rows.find((row) => row.slug === slug), description: "<p>CMS introduction</p>",
          sections: [{ title: "CMS section", description: "<p>CMS detail body</p>" }], seo: {} };
      } else if (url.pathname === "/api/seo") {
        expect(url.searchParams.get("model")).toBe("CorporatePage");
        const path = url.searchParams.get("path");
        data = { path, locale, title: "CMS metadata", robots: "index, follow", canonical: `http://127.0.0.1:5173${path}`, alternates: [] };
      } else if (url.pathname === "/api/labels") data = {};
      await route.fulfill({ json: { data, meta: { last_page: 1 } } });
    });
    await page.goto(`/${locale}/corporate/about-prosperya`);
    await expect(page.getByRole("heading", { name: "About CMS", level: 1 })).toBeVisible();
    const sidebar = page.getByRole("navigation", { name: locale === "fr" ? "Pages de l’entreprise" : "Corporate pages" });
    const footer = page.getByRole("navigation", { name: locale === "fr" ? "Informations légales" : "Legal information" });
    for (const nav of [sidebar, footer]) {
      await expect(nav.getByRole("link", { name: "About CMS" })).toHaveAttribute("href", `/${locale}/corporate/about-prosperya`);
      await expect(nav.getByRole("link", { name: "About CMS" })).toHaveAttribute("aria-current", "page");
      await expect(nav.getByRole("link")).toHaveCount(2);
    }
    const initialListRequests = lists.length;
    await sidebar.getByRole("link", { name: "Terms CMS" }).click();
    await expect(page.getByRole("heading", { name: "Terms CMS", level: 1 })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Terms CMS" })).toHaveAttribute("aria-current", "page");
    // Development StrictMode may abort and restart a detail request on mount.
    expect([...new Set(details)]).toEqual(["about-prosperya", "terms-of-use"]);
    expect(initialListRequests).toBeGreaterThan(0);
    expect(lists).toHaveLength(initialListRequests);
    expect(lists[0]).toMatchObject({ locale, category: "corporate" });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
