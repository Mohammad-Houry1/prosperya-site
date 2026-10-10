import { fixtureData } from "./cmsFixtures.js";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Only the external content boundary is faked; page imports and rendering are real.
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.searchParams.get("path");
    const data = path ? { path, locale: path.split("/")[1], title: "Page title", description: "Page description",
      robots: "index, follow", canonical: `http://127.0.0.1:5173${path}`, alternates: [] }
      : fixtureData(url);
    await route.fulfill({ json: { data, meta: { current_page: 1, last_page: 1 } } });
  });
});

for (const [locale, title, retry, home] of [
  ["en", "One small hiccup.", "Try again", "Back home"],
  ["fr", "Un petit contretemps.", "Réessayer", "Retour à l’accueil"],
]) {
  test(`a failed ${locale} page import recovers with a reload`, async ({ page }) => {
    const failedModule = "**/src/pages/About/AboutPage.jsx*";
    await page.route(failedModule, (route) => route.abort());
    await page.goto(`/${locale}/about`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByRole("link", { name: home, exact: true })).toHaveAttribute("href", `/${locale}`);
    await expect(page.locator("body")).not.toContainText("Unexpected Application Error");
    await expect(page.locator("body")).not.toContainText("AboutPage.jsx");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
    const retryButton = page.getByRole("button", { name: retry, exact: true });
    await retryButton.hover();
    await expect(retryButton).toHaveCSS("transform", "none", { timeout: 1000 });
    await page.unroute(failedModule);
    await retryButton.click();
    await expect(page.getByRole("heading", { name: title })).not.toBeVisible();
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
  });
}
