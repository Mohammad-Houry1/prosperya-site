import { expect, test } from "@playwright/test";
import { mockCms, expertise } from "./cmsFixtures.js";

for (const locale of ["en", "fr"]) {
  test(`Expertise listing renders localized CMS headings and preserves order in ${locale}`, async ({ page }) => {
    await mockCms(page);
    const fullTitle = locale === "fr" ? "Intégration des systèmes" : "Systems Integration";
    const record = {
      ...expertise("arbitrary-cms-slug", locale), expertise_title: "Connect", expertise_detail_title: fullTitle,
      expertise_tagline: "CMS tagline", expertise_summary: "CMS summary",
      expertise_image: { url: "/favicon.svg", alt: "Authored expertise image" },
    };
    await page.route("**/api/expertise**", route => {
      const slug = new URL(route.request().url()).pathname.split("/")[3];
      return route.fulfill({ json: { data: slug ? record : [record, { ...expertise("legacy", locale), expertise_title: "Legacy title" }] } });
    });
    await page.goto(`/${locale}/expertise`);
    const listing = page.locator('main [class*="rows"]');
    await expect(listing.locator("h2")).toHaveText([fullTitle, "Legacy title"]);
    await expect(page.getByAltText("Authored expertise image")).toBeVisible();
    await expect(page.locator('main [class*="index"] strong').first()).toHaveText(fullTitle);
    await page.screenshot({ path: `../.verification/dynamic-expertise-${locale}-desktop.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../.verification/dynamic-expertise-${locale}-mobile.png`, fullPage: true });
    await listing.getByRole("link", { name: fullTitle, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/expertise/arbitrary-cms-slug$`));
    await expect(page.locator("main h1")).toHaveText(fullTitle);
  });
}

test("empty Expertise list shows the translated empty state and hides the hero index", async ({ page }) => {
  await mockCms(page);
  await page.route("**/api/expertise?**", route => route.fulfill({ json: { data: [] } }));
  await page.goto("/en/expertise");
  await expect(page.getByRole("heading", { name: "Nothing to show yet" })).toBeVisible();
  await expect(page.locator('main [class*="index"]')).toHaveCount(0);
  await expect(page.locator("main h1")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
