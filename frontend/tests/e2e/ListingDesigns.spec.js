import { expect, test } from "@playwright/test";
import { expertiseData } from "../../src/data/expertise.data.js";
import { caseStudiesData } from "../../src/data/caseStudies.data.js";

for (const locale of ["en", "fr"]) {
  test(`simplified listings preserve heroes and filters in ${locale}`, async ({ page }) => {
    const requests = [];
    await page.route("**/api/**", (route) => { requests.push(route.request().url()); return route.abort(); });
    await page.goto(`/${locale}/expertise`);
    const rows = page.getByRole("list", { name: locale === "fr" ? "Toutes les expertises" : "All expertise", exact: true });
    await expect(rows.locator(":scope > li")).toHaveCount(expertiseData.length);
    await expect(rows.getByRole("heading", { level: 2 })).toHaveCount(expertiseData.length);
    await expect(page.locator('main h2')).not.toContainText(["Four moves", "quatre gestes"]);
    await expect(page.locator('main a[href*="/expertise/erp-rescue"]').first()).toBeVisible();
    await page.screenshot({ path: `../.verification/listing-expertise-${locale}.png`, fullPage: true });
    await page.goto(`/${locale}/work`);
    const grid = page.locator('[aria-label="Projects"], [aria-label="Projets"]').filter({ has: page.locator("article") });
    await expect(grid.locator("article")).toHaveCount(caseStudiesData.length);
    const boxes = await grid.locator("article").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().x));
    expect(new Set(boxes).size).toBe(2);
    await page.getByRole("button", { name: "Retail", exact: true }).click();
    await expect(grid.locator("article")).toHaveCount(1);
    await page.getByRole("button", { name: locale === "fr" ? "Audit et optimisation ERP" : "ERP Audit & Optimization", exact: true }).click();
    await expect(grid.locator("article")).toHaveCount(0);
    await page.getByRole("button", { name: locale === "fr" ? "Tous les secteurs" : "All industries", exact: true }).click();
    await expect(grid.locator("article")).toHaveCount(1);
    await page.getByRole("button", { name: locale === "fr" ? "Toutes les expertises" : "All capabilities", exact: true }).click();
    await expect(grid.locator("article")).toHaveCount(caseStudiesData.length);
    await expect(grid.locator("dl")).toHaveCount(0);
    await page.screenshot({ path: `../.verification/listing-work-${locale}.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileBoxes = await grid.locator("article").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().x));
    expect(new Set(mobileBoxes).size).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../.verification/listing-work-${locale}-mobile.png`, fullPage: true });
    await page.goto(`/${locale}/expertise`);
    await expect(rows.locator(":scope > li")).toHaveCount(expertiseData.length);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../.verification/listing-expertise-${locale}-mobile.png`, fullPage: true });
    expect(requests).toEqual([]);
  });
}
