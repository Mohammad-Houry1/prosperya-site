import { expect, test } from "@playwright/test";
import { mockCms } from "./cmsFixtures.js";

for (const locale of ["en", "fr"]) {
  test(`header search finds CMS content, pages and closes on navigation in ${locale}`, async ({ page }) => {
    const errors = [];
    const requests = [];
    page.on("pageerror", error => errors.push(error.message));
    await mockCms(page);
    await page.route("**/api/search?**", route => {
      const url = new URL(route.request().url());
      requests.push(Object.fromEntries(url.searchParams));
      const current = Number(url.searchParams.get("page"));
      const empty = url.searchParams.get("q") === "missing";
      return route.fulfill({ json: { data: empty ? [] : [{ id: `page-${current}`, type: "expertise", title: `CMS search result ${current}`, summary: "Authored CMS summary", href: `/${locale}/expertise/new-cms-expertise` }],
        meta: { total: empty ? 0 : 21, current_page: current, last_page: empty ? 1 : 2 } } });
    });
    await page.goto(`/${locale}`);
    const trigger = page.getByRole("button", { name: locale === "en" ? "Search" : "Rechercher", exact: true });
    await trigger.click();
    const panel = page.getByRole("dialog");
    const input = panel.getByRole("searchbox");
    await expect(input).toBeFocused();
    await input.fill("  ERP  ");
    await input.press("Enter");
    await expect(panel.getByRole("link", { name: /CMS search result 1/ })).toBeVisible();
    expect(requests[0]).toMatchObject({ q: "ERP", locale, page: "1" });
    await panel.getByRole("button", { name: locale === "en" ? "Next results" : "Résultats suivants" }).click();
    await expect(panel.getByRole("link", { name: /CMS search result 2/ })).toBeVisible();
    await page.screenshot({ path: `../.verification/search-${locale}-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../.verification/search-${locale}-mobile.png` });
    await input.fill("missing");
    await input.press("Enter");
    await expect(panel.getByText(locale === "en" ? "No matching results. Try another search." : "Aucun résultat. Essayez une autre recherche.")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await input.fill("ERP");
    await input.press("Enter");
    await panel.getByRole("link", { name: /CMS search result 1/ }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/expertise/new-cms-expertise$`));
    await expect(panel).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("search recovers after a failed request", async ({ page }) => {
  await mockCms(page);
  let failed = true;
  await page.route("**/api/search?**", route => {
    if (failed) { failed = false; return route.fulfill({ status: 503, json: { message: "Unavailable" } }); }
    return route.fulfill({ json: { data: [], meta: { total: 0, last_page: 1 } } });
  });
  await page.goto("/en");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByRole("searchbox").fill("ERP");
  await page.getByRole("searchbox").press("Enter");
  await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("No matching results. Try another search.")).toBeVisible();
});
