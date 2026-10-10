import { expect, test } from "@playwright/test";

const scenes = {
  "erp-transformation": "structure", "systems-integration": "connect",
  "automation-custom-development": "automate", "erp-optimization": "audit",
  "netsuite-implementation": "netsuite", "erp-rescue": "rescue",
};
test("all expertise routes share the template on desktop and mobile", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/**", (route) => route.fulfill({ json: { data: route.request().url().includes("corporate-pages") ? [] : {}, meta: { last_page: 1 } } }));
  for (const locale of ["en", "fr"]) {
    for (const [slug, scene] of Object.entries(scenes)) {
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto(`/${locale}/expertise/${slug}`);
      await expect(page.locator("main h1")).toBeVisible();
      const animation = page.locator("main [data-animation]");
      await expect(animation).toHaveAttribute("data-animation", scene);
      const title = await page.locator("main h1").boundingBox();
      const visual = await animation.boundingBox();
      expect(visual.x).toBeGreaterThan(title.x + title.width);
      expect(visual.height).toBeGreaterThan(300);
      await page.screenshot({ path: `../.verification/expertise-${locale}-${slug}.png` });
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator("main h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test("expertise reveals its visual and section navigation tracks reading progress", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/**", (route) => route.fulfill({ json: { data: route.request().url().includes("corporate-pages") ? [] : {}, meta: { last_page: 1 } } }));
  await page.goto("/en/expertise/erp-transformation");
  const visual = page.locator("main [data-animation]");
  await expect(visual).toHaveAttribute("data-inview", "");
  await expect(visual).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "../.verification/expertise-animated-hero.png" });
  const navigation = page.getByRole("navigation", { name: "On this page" });
  const second = navigation.getByRole("link").nth(1);
  await second.click();
  await expect(second).toHaveAttribute("aria-current", "location");
  await expect(page.locator("#expertise-section-2")).toBeInViewport();
  await expect(page.locator('#expertise-section-2 [data-reveal="line"]')).toHaveCSS("transform", "none");
  await expect.poll(() => page.locator('[class*="readingFill"]').evaluate((node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).a)).toBeGreaterThan(0);
  await page.screenshot({ path: "../.verification/expertise-animated-section.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('[class*="readingTrack"]')).toBeHidden();
  await page.screenshot({ path: "../.verification/expertise-animated-mobile.png" });
  expect(errors).toEqual([]);
});
