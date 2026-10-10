import { expect, test } from "@playwright/test";
import { mockCms } from "./cmsFixtures.js";
for (const locale of ["en", "fr"]) {
  test(`CMS marketing routes and arbitrary slugs render in ${locale} without mobile overflow`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await mockCms(page);
    for (const path of ["", "about", "approach", "expertise", "expertise/new-cms-expertise", "solutions", "solutions/new-cms-solution", "work", "work/new-cms-project"]) {
      await page.setViewportSize({width:1366,height:900});
      await page.goto(`/${locale}/${path}`);
      await expect(page.locator("main h1")).toBeVisible();
      await page.setViewportSize({width:390,height:844});
      await expect(page.locator("main h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (path === "work/new-cms-project") await page.screenshot({path:`../.verification/cms-case-${locale}-mobile.png`});
    }
    expect(errors).toEqual([]);
  });
}
