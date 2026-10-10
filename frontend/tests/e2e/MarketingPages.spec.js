import { expect, test } from "@playwright/test";
import { mockCms } from "./cmsFixtures.js";
test("Home and About keep their platform categories separate when navigating", async ({ page }) => {
  await mockCms(page);
  const categories = [];
  await page.route("**/api/platforms?**", (route) => {
    const category = new URL(route.request().url()).searchParams.get("category");
    categories.push(category);
    return route.fulfill({ json: { data: [{ id: category, slug: category, name: category === "clients" ? "CMS Client" : "CMS Partner", logo_image: null }] } });
  });
  await page.goto("/en");
  await expect(page.locator('main [data-mark="clients"]').first()).toBeVisible();
  await page.locator("header").getByRole("link", { name: "About", exact: true }).click();
  await expect(page.locator("main h1")).toHaveText("CMS About");
  await expect(page.locator('main [data-mark="we-work-with"]')).toBeVisible();
  await expect(page.locator("main")).not.toContainText("CMS Client");
  expect(categories).toContain("clients");
  expect(categories).toContain("we-work-with");
  expect(categories).not.toContain(null);
});

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

test("footer expertise and solutions follow the CMS lists, including arbitrary new slugs", async ({ page }) => {
  await mockCms(page);
  await page.goto("/en");
  const expertise = page.locator("footer").getByRole("navigation", { name: "Expertise", exact: true });
  const solutions = page.locator("footer").getByRole("navigation", { name: "Solutions", exact: true });
  await expect(expertise.locator('a[href="/en/expertise/new-cms-expertise"]')).toHaveText("CMS Expertise: new-cms-expertise");
  await expect(expertise.getByRole("link").first()).toHaveAttribute("href", "/en/expertise");
  await expect(expertise.getByRole("link")).toHaveCount(8);
  await expect(solutions.getByRole("link", { name: "CMS Solution" })).toHaveAttribute("href", "/en/solutions/new-cms-solution");
  await expect(solutions.getByRole("link")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expertise.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
