import { expect, test } from "@playwright/test";
import { caseStudiesData } from "../../src/data/caseStudies.data.js";

test("work spotlight automatically loops and pauses on hover", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.goto("/en/work");
  const selectors = page.getByRole("group", { name: "Choose a project" }).getByRole("button");
  await expect(selectors).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(selectors.nth(i)).toHaveAttribute("aria-pressed", "true");
    await page.clock.fastForward(5000);
  }
  await expect(selectors.first()).toHaveAttribute("aria-pressed", "true");
  await selectors.last().hover();
  await page.clock.fastForward(5000);
  await expect(selectors.first()).toHaveAttribute("aria-pressed", "true");
  await selectors.last().click();
  await page.mouse.move(0, 0);
  await selectors.last().blur();
  await page.clock.fastForward(5000);
  await expect(selectors.first()).toHaveAttribute("aria-pressed", "true");
});

for (const locale of ["en", "fr"]) {
  test(`every work detail follows one template in ${locale}`, async ({ page }) => {
    const requests = [];
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route("**/api/**", route => { requests.push(route.request().url()); return route.abort(); });
    let headings;
    for (const study of caseStudiesData) {
      await page.goto(`/${locale}/work/${study.slug}`);
      await expect(page.locator('[data-case-study-template="shared"]')).toBeVisible();
      await expect(page.locator("main h1")).toHaveText(study.copy[locale].name);
      const titles = await page.locator('[id^="case-"] > h2').allTextContents();
      if (headings) expect(titles).toEqual(headings);
      headings = titles;
      await expect(page.getByRole("navigation", { name: locale === "fr" ? "Dans ce projet" : "In this project" })).toBeVisible();
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.setViewportSize({ width: 1366, height: 900 });
    }
    await page.goto(`/${locale}/work/global-retail-core`);
    await expect(page.locator('[data-case-study-template="shared"]')).toBeVisible();
    await expect(page.locator("#case-results")).toBeVisible();
    await page.screenshot({ path: `../.verification/work-detail-redesign-${locale}.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `../.verification/work-detail-redesign-${locale}-mobile.png`, fullPage: true });
    await page.goto(`/${locale}/work`);
    await expect(page.getByRole("group", { name: locale === "fr" ? "Choisir un projet" : "Choose a project" })).toBeVisible();
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.screenshot({ path: `../.verification/work-index-redesign-${locale}.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `../.verification/work-index-redesign-${locale}-mobile.png`, fullPage: true });
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
  });
}
