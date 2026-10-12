import { expect, test } from "@playwright/test";
import { fixtureData } from "./cmsFixtures.js";

test("keeps the shell while labels load and replaces the entire pending form with skeletons", async ({ page }) => {
  let releaseLabels;
  let releaseOptions;
  const labelsReady = new Promise(resolve => { releaseLabels = resolve; });
  const optionsReady = new Promise(resolve => { releaseOptions = resolve; });
  const calls = [];
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url());
    calls.push(url);
    let data = fixtureData(url);
    if (url.pathname === "/api/labels") await labelsReady;
    if (url.pathname === "/api/contact/options") {
      await optionsReady;
      data = { project_types: [], project_stages: [], captcha: { site_key: "" } };
    }
    if (url.pathname === "/api/corporate-pages/contact-form") data = { title: "Unwanted title", description: "<p>CMS contact explanation <strong>with formatting</strong>.</p>" };
    await route.fulfill({ json: { data } });
  });
  await page.goto("/en/contact");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeAttached();
  await expect(page.locator('header a[href="/en/work"]')).toBeAttached();
  releaseLabels();
  await expect(page.getByRole("status", { name: "Loading options" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send project brief" })).toHaveCount(0);
  await expect(page.getByText("with formatting", { exact: true })).toBeVisible();
  await expect(page.getByText("Unwanted title")).toHaveCount(0);
  const contactCall = calls.find(url => url.pathname === "/api/corporate-pages/contact-form");
  expect(contactCall.searchParams.has("category")).toBe(false);
  releaseOptions();
  await expect(page.getByRole("textbox", { name: "Name", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send project brief" })).toBeDisabled();
});
