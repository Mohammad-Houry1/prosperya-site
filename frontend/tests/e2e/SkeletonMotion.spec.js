import { expect, test } from "@playwright/test";
import { fixtureData, mockCms } from "./cmsFixtures.js";

test.use({ reducedMotion: "no-preference" });

test("loading skeletons visibly move and stop for reduced motion", async ({ page }) => {
  await mockCms(page);
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route("**/api/labels?**", async route => {
    await pending;
    await route.fulfill({ json: { data: fixtureData(new URL(route.request().url())) } });
  });
  try {
    await page.goto("/en/about", { waitUntil: "domcontentloaded" });
    const skeleton = page.locator('main [data-skeleton="about"] .mantine-Skeleton-root').first();
    await expect(skeleton).toBeVisible();
    await expect(skeleton).toHaveAttribute("data-animate", "true");
    await page.waitForLoadState("load");
    const motion = await skeleton.evaluate(async element => {
      const first = getComputedStyle(element, "::after").transform;
      await new Promise(resolve => {
        let frames = 0;
        const next = () => ++frames === 12 ? resolve() : requestAnimationFrame(next);
        requestAnimationFrame(next);
      });
      return { first, second: getComputedStyle(element, "::after").transform };
    });
    expect(motion.first).not.toBe("none");
    expect(motion.second).not.toBe(motion.first);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(skeleton).not.toHaveAttribute("data-animate", "true");
    expect(await skeleton.evaluate(element => getComputedStyle(element, "::after").animationName)).toBe("none");
  } finally {
    release();
  }
});
