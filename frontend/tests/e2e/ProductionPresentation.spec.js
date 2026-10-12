import { expect, test } from "@playwright/test";
import { mockCms, caseStudy } from "./cmsFixtures.js";

for (const locale of ["en", "fr"]) {
  test(`promoted layouts keep authored CMS content on desktop and mobile in ${locale}`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await mockCms(page);
    const records = ["alpha", "beta", "gamma"].map((id, index) => ({
      ...caseStudy, id, slug: `authored-${id}`, case_study_title: `CMS ${id}`,
      industry_id: index === 0 ? "retail" : "finance", case_study_industry: index === 0 ? "Retail" : "Finance",
      case_study_image: { url: "/favicon.svg", alt: "CMS cover" },
      case_study_challenge: "<p>Authored <strong>challenge</strong></p>",
      case_study_solution: "<p>Authored solution</p>",
      case_study_before: ["Separate systems"], case_study_after: ["Connected operations"],
      case_study_results: "<p>Authored results</p>",
      case_study_metrics: [{ metric_value: "42", metric_label: "CMS units" }],
      case_study_metrics_note: "<p>Authored qualification</p>",
      platforms: [{ id: "selected", name: "Selected CMS platform" }],
    }));
    await page.route("**/api/case-studies**", route => {
      const slug = new URL(route.request().url()).pathname.split("/")[3];
      return route.fulfill({ json: { data: slug ? records.find(row => row.slug === slug) : records } });
    });
    await page.goto(`/${locale}/work`);
    const grid = page.locator('main [class*="projectGrid"]');
    await expect(grid.locator("article")).toHaveCount(3);
    const industry = page.getByRole("group", { name: locale === "fr" ? "Filtrer par secteur" : "Filter by industry" });
    await industry.getByRole("button", { name: "Finance", exact: true }).click();
    await expect(grid.locator("article")).toHaveCount(2);
    const selector = page.getByRole("group", { name: locale === "fr" ? "Tous les cas clients" : "All case studies" });
    await selector.getByRole("button", { name: "CMS gamma", exact: true }).click();
    await expect(page.locator('main a[data-active="true"]')).toHaveAttribute("href", `/${locale}/work/authored-gamma`);
    await page.screenshot({ path: `../.verification/promoted-work-${locale}.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.goto(`/${locale}/work/authored-alpha`);
    await expect(page.locator('[data-case-study-template="shared"]')).toBeVisible();
    await expect(page.getByText("Selected CMS platform", { exact: true })).toBeVisible();
    await expect(page.getByText("Authored qualification", { exact: true })).toBeAttached();
    await expect(page.locator('#case-challenge p')).toHaveCSS("line-height", "28.8px");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../.verification/promoted-case-${locale}-mobile.png`, fullPage: true });
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.screenshot({ path: `../.verification/promoted-case-${locale}-desktop.png`, fullPage: true });

    await page.goto(`/${locale}/expertise`);
    await expect(page.locator('main [class*="rows"] > li')).toHaveCount(7);
    await expect(page.getByText("Public capability", { exact: true })).toHaveCount(7);
    await page.screenshot({ path: `../.verification/promoted-expertise-${locale}.png` });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      const primary = page.locator('main [class*="splitSide"] a').first();
      await expect(primary).toHaveCount(1);
      expect(await primary.evaluate(link => {
        const probe = document.createElement("span");
        probe.style.background = "var(--brand-action)";
        link.append(probe);
        const expected = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return getComputedStyle(link).backgroundColor === expected;
      })).toBe(true);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
