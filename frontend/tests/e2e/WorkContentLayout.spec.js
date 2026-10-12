import { expect, test } from "@playwright/test";
import { caseStudy, labels, mockCms } from "./cmsFixtures.js";

const sparse = {
  ...caseStudy, id: "sparse", slug: "sparse", case_study_title: "Sparse project",
  case_study_animation_type: "none", case_study_image: null,
  case_study_summary: "<p><strong>Formatted project summary</strong></p>",
  case_study_chapeau: "<p><em>Authored project lead</em></p>",
  technology_stack: [{ technology_name: "Laravel" }, { technology_name: "React" }],
};

for (const locale of ["en", "fr"]) {
  test(`missing-media projects use compact text and technology layouts in ${locale}`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await mockCms(page);
    await page.route("**/api/case-studies**", route => route.fulfill({ json: { data: new URL(route.request().url()).pathname.split("/")[3] ? sparse : [sparse] } }));
    const copy = labels(locale);
    await page.goto(`/${locale}/work`);
    const projects = page.locator('main [class*="projectGrid"]');
    await expect(projects.locator("strong", { hasText: "Formatted project summary" })).toBeVisible();
    await expect(projects.locator('[class*="projectImage"]')).toHaveCount(0);
    await page.goto(`/${locale}/work/sparse`);
    const detail = page.locator('[data-case-study-template="shared"]');
    await expect(detail.getByRole("heading", { name: "Sparse project" })).toBeVisible();
    await expect(detail.locator("em", { hasText: "Authored project lead" })).toBeVisible();
    await expect(detail.locator('[class*="heroVisual"]')).toHaveCount(0);
    await expect(detail.getByText(copy["prosperya.pages.case-study.case-study-page.at-a-glance-34f4be"], { exact: true })).toHaveCount(0);
    await expect(detail.locator('[class*="narrative"]')).toHaveCount(0);
    const hero = detail.locator("section").first();
    const stack = detail.locator('[class*="standaloneStack"]');
    for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await expect.poll(() => hero.locator(":scope > div").first().evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(1);
      await expect(stack.getByText("Laravel", { exact: true })).toBeVisible();
      const contentBounds = await hero.locator(":scope > div").first().boundingBox();
      const stackBounds = await stack.boundingBox();
      const closingBounds = await detail.locator('[class*="splitInner"]').boundingBox();
      expect(Math.abs(contentBounds.x - stackBounds.x)).toBeLessThan(2);
      expect(Math.abs(contentBounds.x - closingBounds.x)).toBeLessThan(2);
      expect(stackBounds.width).toBeGreaterThan(contentBounds.width * 0.95);
      expect(stackBounds.height).toBeLessThan(240);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `../.verification/work-sparse-${locale}-${viewport.width}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

test("untitled narrative and a one-sided architecture use the available width", async ({ page }) => {
  await mockCms(page);
  const narrative = { ...sparse, technology_stack: [], content_sections: [{ content_description: "<p>Untitled narrative content</p>" }] };
  const architecture = { ...sparse, technology_stack: [], case_study_before: ["Existing application"], case_study_after: [] };
  await page.route("**/api/case-studies**", route => {
    const slug = new URL(route.request().url()).pathname.split("/")[3];
    return route.fulfill({ json: { data: slug === "architecture" ? architecture : slug ? narrative : [narrative] } });
  });
  await page.goto("/en/work/narrative");
  const detail = page.locator('[data-case-study-template="shared"]');
  await expect(detail.getByText("Untitled narrative content", { exact: true })).toBeVisible();
  await expect(detail.getByRole("navigation", { name: "On this page" })).toHaveCount(0);
  await expect.poll(() => detail.locator('[class*="story"]').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(1);
  const lastSection = detail.locator('[class*="narrative"] > section').last();
  expect(await lastSection.evaluate(element => parseFloat(getComputedStyle(element).marginBottom))).toBeLessThanOrEqual(24);
  await page.goto("/en/work/architecture");
  await expect(detail.getByText("Existing application", { exact: true })).toBeVisible();
  await expect.poll(() => detail.locator('[class*="architecture"]').first().evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
