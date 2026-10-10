import { mockCms, fixtureData } from "./cmsFixtures.js";
import { expect, test } from "@playwright/test";

const scenes = {
  "authored-flow": "flowing-lines", "authored-consolidation": "consolidation",
  "authored-workflow": "workflow", "netsuite-implementation": "network", "authored-insight": "insight",
};

async function mockExpertise(page) {
  await mockCms(page);
  await page.route("**/api/expertise/**", route => {
    const url = new URL(route.request().url());
    const slug = url.pathname.split("/").at(-1);
    const data = { ...fixtureData(url), expertise_animation_type: scenes[slug] || "workflow", expertise_tagline: "Authored tagline",
      expertise_capabilities: ["Authored capability"], expertise_outcomes: ["Authored outcome"],
      expertise_steps: [{ step_title: "Authored step", step_description: "<p>Authored step body</p>" }],
      metrics: [{ metric_value: "12", metric_label: "Authored teams" }], expertise_metrics_note: "<p>Authored qualification</p>",
      platforms: [{ id: "p", name: "Authored platform", logo_image: { url: "/favicon.svg", alt: "Authored platform logo" } }],
      related_solutions: [{ id: "s", slug: "selected-solution", solution_title: "Selected solution" }],
      related_case_studies: [{ id: "c", slug: "selected-case", case_study_title: "Selected case" }] };
    return route.fulfill({ json: { data } });
  });
}
test("all expertise routes share the template on desktop and mobile", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockExpertise(page);
  for (const locale of ["en", "fr"]) {
    for (const [slug, scene] of Object.entries(scenes)) {
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto(`/${locale}/expertise/${slug}`);
      await expect(page.locator("main h1")).toBeVisible();
      const animation = page.locator("main [data-animation]");
      await expect(animation).toHaveAttribute("data-animation", scene);
      await expect(page.getByText("Authored tagline", { exact: true })).toBeVisible();
      await expect(page.getByText("Authored capability", { exact: true })).toBeAttached();
      await expect(page.getByText("Authored outcome", { exact: true })).toBeAttached();
      await expect(page.getByText("Authored step body", { exact: true })).toBeAttached();
      await expect(page.getByText("Authored qualification", { exact: true })).toBeAttached();
      await expect(page.getByAltText("Authored platform logo")).toBeAttached();
      await expect(page.getByRole("link", { name: "Selected case", exact: true })).toHaveAttribute("href", `/${locale}/work/selected-case`);
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

test("explicit legal routes fetch their CMS slug in both languages", async ({ page }) => {
  const requested = [];
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    let data = fixtureData(new URL(route.request().url()));
    if (path.startsWith("/api/corporate-pages/")) {
      const slug = path.split("/").at(-1);
      requested.push(slug);
      data = { slug, title: `CMS ${slug}`, description: "<p>Legal body</p>", sections: [] };
    } else if (path === "/api/corporate-pages") data = [];
    return route.fulfill({ json: { data, meta: { last_page: 1 } } });
  });
  for (const locale of ["en", "fr"]) for (const slug of ["privacy-policy", "terms-of-use", "cookie-policy", "accessibility"]) {
    await page.goto(`/${locale}/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: `CMS ${slug}` })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/${locale}/${slug}$`));
  }
  expect(new Set(requested)).toEqual(new Set(["privacy-policy", "terms-of-use", "cookie-policy", "accessibility"]));
});

test("expertise reveals its visual and section navigation tracks reading progress", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockExpertise(page);
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

test("Expertise with no authored animation and a missing record stay usable", async ({ page }) => {
  await mockCms(page);
  await page.route("**/api/expertise/minimal?**", route => route.fulfill({ json: { data: { slug: "minimal", expertise_title: "Minimal expertise", sections: [{}] } } }));
  await page.goto("/en/expertise/minimal");
  await expect(page.getByRole("heading", { name: "Minimal expertise" })).toBeVisible();
  await expect(page.locator("main [data-animation]")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "On this page" })).toHaveCount(0);
  await page.route("**/api/expertise/missing?**", route => route.fulfill({ status: 404, json: { message: "Missing" } }));
  await page.goto("/en/expertise/missing");
  await expect(page.getByRole("heading", { name: "Expertise not found" })).toBeVisible();
});
