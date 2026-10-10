import { expect, test } from "@playwright/test";
import { expertiseData } from "../../src/data/expertise.data.js";
import { solutionsData } from "../../src/data/solutions.data.js";
import { caseStudiesData } from "../../src/data/caseStudies.data.js";

for (const locale of ["en", "fr"]) {
  test(`every reference route renders offline in ${locale}`, async ({ page }) => {
    test.setTimeout(120000);
    const requests = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/**", (route) => { requests.push(route.request().url()); return route.abort(); });
    const routes = ["", "about", "approach", "expertise", "solutions", "work", "insights", "contact", "privacy-policy", "terms-of-use", "cookie-policy", "accessibility",
      ...expertiseData.map((row) => `expertise/${row.slug}`),
      ...solutionsData.map((row) => `solutions/${row.slug}`),
      ...caseStudiesData.map((row) => `work/${row.slug}`),
      ...expertiseData.slice(0, 3).map((row) => `insights/${row.slug}`)];
    for (const route of routes) {
      await page.goto(`/${locale}${route ? `/${route}` : ""}`);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.locator("main")).not.toContainText("undefined");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
      expect(await page.locator('main a[href*="undefined"]').count()).toBe(0);
    }
    for (const row of expertiseData) {
      await expect(page.locator(`footer a[href="/${locale}/expertise/${row.slug}"]`)).toHaveCount(1);
    }
    await page.goto(`/${locale}/about`);
    await expect(page.getByRole("heading", { name: "Walid Houry" })).toBeVisible();
    await page.screenshot({ path: `../.verification/staging-about-${locale}.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await expect(page.locator("main h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
  });
}
