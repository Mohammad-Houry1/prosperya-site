import { expect, test } from "@playwright/test";
import { mockCms, solution, caseStudy } from "./cmsFixtures.js";

const types = ["consolidation", "workflow", "network", "insight", "flowing-lines"];
function authored(type, locale) {
  return { ...solution, id: type, slug: `authored-${type}`, solution_title: `${locale === "fr" ? "Solution FR" : "CMS Solution"} ${type}`,
    solution_statement: "CMS statement", solution_lead: "<p>Authored lead</p>", solution_friction_title: "CMS friction", solution_friction: ["Authored friction"],
    solution_capabilities: ["CMS capability"], outcomes: [{ outcome_title: "Authored outcome", outcome_description: "<p>Outcome details</p>" }],
    solution_animation_type: type, solution_animation_centre_label: "CMS centre", solution_animation_result_label: "CMS result", solution_animation_signal_label: "CMS signal",
    solution_animation_sources: Array.from({ length: 20 }, (_, i) => `CMS source ${i}`),
    solution_animation_lanes: ["CMS lane"], solution_animation_steps: Array.from({ length: 9 }, (_, i) => `CMS step ${i}`),
    solution_animation_suppliers: Array.from({ length: 5 }, (_, i) => `CMS supplier ${i}`), solution_animation_hubs: ["CMS hub"], solution_animation_channels: ["CMS channel"],
    metrics: [{ metric_value: "7", metric_label: "Solution units" }], solution_metrics_note: "<p>Solution qualification</p>",
    related_case_studies: [{ ...caseStudy, case_study_title: "Selected case study", case_study_summary: "Selected case summary", case_study_metrics: [{ metric_value: "42", metric_label: "Case units" }] }],
    related_articles: [{ id: "article", slug: "selected-article", title: "Selected article" }],
  };
}

for (const locale of ["en", "fr"]) {
  test(`Solutions list and every CMS animation render in ${locale} on desktop and mobile`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await mockCms(page);
    await page.route("**/api/solutions**", route => {
      const slug = new URL(route.request().url()).pathname.split("/")[3];
      const data = slug ? authored(slug.replace("authored-", ""), locale) : types.map(type => authored(type, locale));
      return route.fulfill({ json: { data } });
    });
    await page.route("**/api/pages/solutions?**", route => route.fulfill({ json: { data: { architecture_title: "CMS architecture", architecture_description: "<p>Authored architecture</p>", architecture_column_1: ["CMS audience"], architecture_column_2: ["CMS function"], architecture_column_3: ["CMS platform"], architecture_column_4: ["CMS foundation"] } } }));
    await page.goto(`/${locale}/solutions`);
    await expect(page.locator('main [class*="strip"] > li')).toHaveCount(5);
    await expect(page.getByRole("heading", { name: "CMS architecture" })).toBeVisible();
    await expect(page.getByText("CMS platform", { exact: true })).toBeVisible();
    await page.screenshot({ path: `../.verification/solutions-${locale}-list.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const type of types) {
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto(`/${locale}/solutions/authored-${type}`);
      const diagram = page.locator('main [data-solution-animation]');
      await expect(diagram).toHaveAttribute("data-solution-animation", type);
      if (type === "workflow") {
        await expect(diagram.getByText("CMS step 8", { exact: true })).toBeVisible();
        await expect(diagram).toHaveAttribute("viewBox", "0 0 600 440");
      }
      if (type === "consolidation") {
        await expect(diagram.getByText("CMS source 19", { exact: true })).toBeVisible();
        await expect.poll(() => diagram.locator("[data-stream]").evaluateAll(paths => paths.every(path => Number(path.style.strokeDashoffset) === 0))).toBe(true);
      }
      if (type === "network") await expect(diagram.getByText("CMS supplier 4", { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "CMS statement" })).toBeAttached();
      await expect(page.getByText("CMS capability", { exact: true })).toBeAttached();
      await expect(page.getByText("Solution units", { exact: true })).toBeAttached();
      await expect(page.getByText("Case units", { exact: true })).toBeAttached();
      await expect(page.getByRole("link", { name: "Selected article", exact: true })).toHaveAttribute("href", `/${locale}/insights/selected-article`);
      await page.screenshot({ path: `../.verification/solutions-${locale}-${type}.png`, fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test("missing optional diagrams, empty lists and missing details stay usable", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await mockCms(page);
  await page.route("**/api/solutions?**", route => route.fulfill({ json: { data: [] } }));
  await page.goto("/en/solutions");
  await expect(page.getByRole("heading", { name: "Nothing to show yet" })).toBeVisible();
  await expect(page.locator('main [class*="strip"]')).toHaveCount(0);
  await page.route("**/api/solutions/missing?**", route => route.fulfill({ status: 404, json: { message: "Missing" } }));
  await page.goto("/en/solutions/missing");
  await expect(page.getByRole("heading", { name: "Solution not found" })).toBeVisible();
  await page.route("**/api/solutions/empty-diagram?**", route => route.fulfill({ json: { data: { ...solution, solution_animation_type: "workflow" } } }));
  await page.goto("/en/solutions/empty-diagram");
  await expect(page.locator("main h1")).toBeVisible();
  expect(errors).toEqual([]);
});

test("one Finance solution has a compact diagram and uses selected expertise content on desktop and mobile", async ({ page }) => {
  await mockCms(page);
  const finance = { ...solution, id: "finance", slug: "finance", solution_title: "Finance",
    solution_tagline: "Modern finance for real-time performance and control.", solution_animation_type: "workflow",
    solution_animation_lanes: ["lane 1", "lane 2", "lane 3"], solution_animation_steps: ["box 1", "box 2"],
    related_expertise: [{ id: "selected", slug: "selected", expertise_title: "Selected expertise", expertise_capabilities: ["Selected capability"], expertise_outcomes: ["Selected outcome"] }] };
  await page.route("**/api/solutions?**", route => route.fulfill({ json: { data: [finance] } }));
  await page.goto("/en/solutions");
  const strip = page.locator('main ul[data-many]');
  const expectDiagramFits = async () => {
    const panel = await strip.locator(":scope > li").boundingBox();
    const diagram = await strip.locator('[data-solution-animation]').boundingBox();
    expect(diagram.x).toBeGreaterThanOrEqual(panel.x);
    expect(diagram.y).toBeGreaterThanOrEqual(panel.y);
    expect(diagram.x + diagram.width).toBeLessThanOrEqual(panel.x + panel.width);
    expect(diagram.y + diagram.height).toBeLessThanOrEqual(panel.y + panel.height);
  };
  await expect(strip.locator("li")).toHaveCount(1);
  expect((await strip.boundingBox()).width).toBeLessThanOrEqual(760);
  await expect(strip.locator('[data-solution-animation]')).toHaveAttribute("data-solution-animation", "workflow");
  await expectDiagramFits();
  const row = page.locator("main article").filter({ has: page.getByRole("heading", { name: "Finance", exact: true }) });
  await expect(row.getByText("Selected capability", { exact: true })).toBeVisible();
  await expect(row.getByText("Selected outcome", { exact: true })).toBeVisible();
  await expect(row.getByText("Pains", { exact: true })).toHaveCount(0);
  await page.screenshot({ path: "../.verification/solutions-finance-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const stripBounds = await strip.boundingBox();
  const panelBounds = await strip.locator(":scope > li").boundingBox();
  expect(panelBounds.width / stripBounds.width).toBeGreaterThan(0.97);
  await expectDiagramFits();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "../.verification/solutions-finance-mobile.png", fullPage: true });
});

test("an empty solution row does not reserve space for missing columns", async ({ page }) => {
  await mockCms(page);
  await page.route("**/api/solutions?**", route => route.fulfill({ json: { data: [{ ...solution, solution_title: "Empty Finance" }] } }));
  await page.goto("/en/solutions");
  const row = page.locator("main article").filter({ has: page.getByRole("heading", { name: "Empty Finance", exact: true }) });
  await expect(row).toBeVisible();
  for (const label of ["Pains", "Capabilities", "Outcomes"]) await expect(row.getByText(label, { exact: true })).toHaveCount(0);
  const rowBounds = await row.boundingBox();
  const identityBounds = await row.locator('[class*="identity"]').boundingBox();
  expect(rowBounds.width - identityBounds.width).toBeLessThan(100);
});

test("outcome images align beside their title and rich description in list and detail layouts", async ({ page }) => {
  await mockCms(page);
  const authoredOutcome = { ...solution, id: "outcome", slug: "outcome", solution_title: "Outcome solution", outcomes: [
    { outcome_title: "Outcome title", outcome_description: "<p>Outcome description</p>", outcome_image: { url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><rect width="30" height="30" fill="green"/></svg>', alt: "Outcome icon" } },
  ] };
  await page.route("**/api/solutions**", route => route.fulfill({ json: { data: new URL(route.request().url()).pathname.endsWith("/outcome") ? authoredOutcome : [authoredOutcome] } }));
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/en/solutions", "/en/solutions/outcome"]) {
      await page.goto(path);
      const description = page.getByText("Outcome description", { exact: true });
      await expect(description).toBeVisible();
      const titleBounds = await page.locator('main li').filter({ hasText: "Outcome title" }).evaluate(element => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (node.textContent.trim() !== "Outcome title") continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          const rect = range.getBoundingClientRect();
          return { x: rect.x, width: rect.width };
        }
        throw new Error("Outcome title text missing");
      });
      const descriptionBounds = await description.boundingBox();
      const imageBounds = await page.getByAltText("Outcome icon", { exact: true }).boundingBox();
      expect(descriptionBounds.x).toBeGreaterThan(imageBounds.x + imageBounds.width);
      expect(Math.abs(titleBounds.x - descriptionBounds.x)).toBeLessThan(2);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
