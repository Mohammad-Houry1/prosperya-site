import { expect, test } from "@playwright/test";
import { mockCms } from "./cmsFixtures.js";

for (const locale of ["en", "fr"]) {
  test(`our-approach is a detailed slug page and old links redirect in ${locale}`, async ({ page }) => {
    const requested = [];
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await mockCms(page);
    await page.route("**/api/approaches/**", route => {
      const slug = new URL(route.request().url()).pathname.split("/").at(-1);
      requested.push(slug);
      if (slug === "missing") return route.fulfill({ status: 404, json: { message: "Missing" } });
      return route.fulfill({ json: { data: { slug, approach_title: "CMS detailed approach", approach_description: "<p>CMS introduction</p>",
        methodology: [{ methodology_title: "CMS discovery", methodology_deliverable: "CMS discovery handover", methodology_descriptions: ["<p>CMS discovery body</p>"] },
          { methodology_title: "CMS delivery", methodology_deliverable: "CMS delivery handover", methodology_buttons: ["CMS activity"] }],
        how_we_work: [{ work_title: "CMS practice", work_points: ["CMS practice point"] }],
        collaboration_title: "CMS collaboration", collaboration_items: ["CMS collaboration point"],
        diagram_client_title: "CMS client", diagram_client_description: "Client description", diagram_company_title: "CMS company", diagram_company_description: "Company description",
        diagram_shared_title: "CMS shared", diagram_value_title: "CMS value",
        principles_title: "CMS principles", principles: [{ principle_title: "CMS principle", principle_description: "<p>CMS principle body</p>" }],
        approach_image: { url: "/favicon.svg", alt: "CMS approach image" } } } });
    });
    await page.goto(`/${locale}/approach`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/approach/our-approach$`));
    await expect(page.getByRole("heading", { name: "CMS detailed approach" })).toBeVisible();
    await expect(page.locator('[class*="deliverable"]')).toContainText("CMS discovery handover");
    await page.getByRole("button", { name: locale === "en" ? "Next stage" : "Étape suivante" }).click();
    await expect(page.locator('[class*="deliverable"]')).toContainText("CMS delivery handover");
    await expect(page.getByText("CMS practice point", { exact: true })).toBeAttached();
    await expect(page.getByRole("heading", { name: "CMS collaboration" })).toBeAttached();
    await expect(page.getByText("CMS principle body", { exact: true })).toBeAttached();
    await expect(page.getByAltText("CMS approach image")).toBeAttached();
    await page.screenshot({ path: `../.verification/approach-${locale}-detail.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(requested).toContain("our-approach");
    expect(requested).not.toContain("approach");
    await page.goto(`/${locale}/approach/missing`);
    await expect(page.getByRole("heading", { name: locale === "en" ? "Nothing to show yet" : "Aucun contenu pour le moment" })).toBeVisible();
    await page.goto(`/${locale}`);
    await expect(page.locator("main")).toContainText("CMS discovery");
    expect(requested).not.toContain("approach");
    expect(errors).toEqual([]);
  });
}
