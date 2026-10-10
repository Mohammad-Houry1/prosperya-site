import { expect, test } from "@playwright/test";
import { mockCms, caseStudy } from "./cmsFixtures.js";

const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const types = ["flowing-lines", "consolidation", "workflow", "network", "insight"];
function authored(locale, index = 0) {
  return { ...caseStudy, id: `work-${index}`, slug: `authored-${index}`, case_study_title: `${locale === "fr" ? "Projet CMS" : "CMS Project"} ${index}`,
    industry_id: `industry-${index % 2}`, industry_record: { id: `industry-${index % 2}`, name: index % 2 ? "Finance CMS" : "Commerce CMS" },
    case_study_animation_type: types[index], case_study_chapeau: "CMS short introduction", case_study_image: { url: pixel, alt: "Authored project image", width: 600, height: 400 },
    case_study_hero_facts: Array.from({ length: 6 }, (_, i) => ({ hero_fact_value: `${i + 1}`, hero_fact_label: `Authored fact ${i + 1}` })),
    content_sections: [{ content_title: "First CMS chapter", content_subtitle: "Authored subtitle", content_description: '<p><strong>Rich CMS narrative</strong></p><script>window.injected=1</script>' },
      { content_title: "Second CMS chapter", content_description: "<p>Additional narrative</p>" }],
    technology_stack: [{ technology_name: "CMS technology", technology_image: { url: pixel, alt: "Authored technology logo" } }],
    case_study_challenge: "<p>Authored challenge</p>", case_study_solution: "<p>Authored solution</p>",
    case_study_before: ["Original CMS system"], case_study_after: ["New CMS system"],
    case_study_metrics: [{ metric_value: "42", metric_label: "Authored result" }],
    sections: [{ section_title: "CMS extra section", section_subtitle: "CMS extra subtitle", section_description: "<p>Extra content</p>" }],
    related_solutions: [{ id: "solution", slug: "selected-solution", solution_title: "Selected solution" }],
  };
}

for (const locale of ["en", "fr"]) {
  test(`Work list and all authored case-study visuals render in ${locale} on desktop and mobile`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await mockCms(page);
    await page.route("**/api/case-studies**", route => {
      const slug = new URL(route.request().url()).pathname.split("/")[3];
      const data = slug ? authored(locale, Number(slug.split("-")[1])) : types.map((_, index) => authored(locale, index));
      return route.fulfill({ json: { data } });
    });
    await page.goto(`/${locale}/work`);
    const grid = page.locator('main [class*="projectGrid"]');
    await expect(grid.getByRole("article")).toHaveCount(5);
    await page.getByRole("button", { name: "Finance CMS", exact: true }).click();
    await expect(grid.getByRole("article")).toHaveCount(2);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../.verification/work-${locale}-mobile.png`, fullPage: true });
    for (const [index, type] of types.entries()) {
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto(`/${locale}/work/authored-${index}`);
      await expect(page.locator('main [data-case-study-animation]')).toHaveAttribute("data-case-study-animation", type);
      await expect(page.getByText("CMS short introduction", { exact: true })).toBeVisible();
      await expect(page.getByText("Authored fact 6", { exact: true })).toBeAttached();
      await expect(page.getByRole("link", { name: /First CMS chapter/ })).toHaveAttribute("href", "#case-content-1");
      await expect(page.getByRole("heading", { name: "First CMS chapter" })).toBeAttached();
      await expect(page.getByAltText("Authored technology logo")).toBeAttached();
      await expect(page.getByText("CMS extra subtitle", { exact: true })).toBeAttached();
      await expect(page.getByRole("link", { name: "Selected solution", exact: true })).toHaveAttribute("href", `/${locale}/solutions/selected-solution`);
      expect(await page.evaluate(() => window.injected)).toBeUndefined();
      if (index === 0) await page.screenshot({ path: `../.verification/work-${locale}-detail.png`, fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test("empty Work and missing case studies show their respective empty states", async ({ page }) => {
  await mockCms(page);
  await page.route("**/api/case-studies?**", route => route.fulfill({ json: { data: [] } }));
  await page.goto("/en/work");
  await expect(page.getByRole("heading", { name: "Nothing to show yet" })).toBeVisible();
  await page.route("**/api/case-studies/missing?**", route => route.fulfill({ status: 404, json: { message: "Missing" } }));
  await page.goto("/en/work/missing");
  await expect(page.getByRole("heading", { name: "Case study not found" })).toBeVisible();
});
