import { expect, test } from "@playwright/test";
import { mockCms } from "./cmsFixtures.js";

const pages = [
  { id: "cookies", slug: "cookie-policy", name: "Cookie Policy", title: "Cookie heading" },
  { id: "about", slug: "about-prosperya", name: "About Prosperya", title: "Our company" },
  { id: "privacy", slug: "privacy-policy", name: "Privacy policy", title: "" },
  { id: "terms", slug: "terms-of-use", name: "Terms of use", title: "" },
  { id: "accessibility", slug: "accessibility", name: "Accessibility", title: "" },
];
const about = { ...pages[1], description: "<p><strong>Company introduction</strong></p>",
  sections: [{ title: "Our story", description: "<p>A <em>connected team</em>.</p>" }],
  about_users: [{ id: "leader", name: "CMS leader", position: "CMS role", bio: "<p>Authored leader biography.</p>" }],
  about_focus: ["<p>Connected <strong>systems</strong></p>"], about_principles: [], about_facts: [], about_steps: [] };

for (const locale of ["en", "fr"]) {
  test(`About reads Corporate Pages and all five footer links have CMS names in ${locale}`, async ({ page }) => {
    const requests = [];
    page.on("request", request => { if (request.url().includes("/api/")) requests.push(new URL(request.url()).pathname); });
    await mockCms(page);
    await page.route("**/api/corporate-pages?**", route => route.fulfill({ json: { data: pages, meta: { last_page: 1 } } }));
    await page.route("**/api/corporate-pages/*?**", route => {
      const slug = new URL(route.request().url()).pathname.split("/").at(-1);
      return route.fulfill({ json: { data: slug === "about-prosperya" ? about : { ...pages.find(row => row.slug === slug), sections: [] } } });
    });
    await page.goto(`/${locale}/about`);
    await expect(page.locator("main h1")).toHaveText("Our company");
    await expect(page.locator("main strong", { hasText: "Company introduction" })).toBeAttached();
    await expect(page.locator("main em", { hasText: "connected team" })).toBeAttached();
    await expect(page.getByRole("heading", { name: "CMS leader" })).toBeAttached();
    await expect(page.locator("main")).not.toContainText("<p>");
    const footer = page.locator("footer").getByRole("navigation", { name: locale === "fr" ? "Informations légales" : "Legal information" });
    await expect(footer.getByRole("link")).toHaveCount(5);
    await expect(footer.getByRole("link")).toHaveText(pages.map(row => row.name));
    expect(requests).toContain("/api/corporate-pages/about-prosperya");
    expect(requests).not.toContain("/api/pages/about-prosperya");
    await page.screenshot({ path: `../.verification/about-corporate-${locale}-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../.verification/about-corporate-${locale}-mobile.png`, fullPage: true });
    await footer.getByRole("link", { name: "Privacy policy" }).click();
    await expect(page.locator("main h1")).toHaveText("Privacy policy");
  });
}

test("About uses Mantine skeletons while its record is loading and respects reduced motion", async ({ page }) => {
  await mockCms(page);
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route("**/api/corporate-pages/about-prosperya?**", async route => {
    await pending;
    await route.fulfill({ json: { data: about } });
  });
  await page.goto("/en/about", { waitUntil: "domcontentloaded" });
  const loader = page.locator('main [role="status"][data-skeleton="about"]');
  await expect(loader).toHaveAttribute("aria-busy", "true");
  const skeleton = loader.locator(".mantine-Skeleton-root").first();
  await expect(skeleton).toBeVisible();
  await expect(skeleton).not.toHaveAttribute("data-animate", "true");
  expect(await skeleton.evaluate(element => getComputedStyle(element, "::after").animationName)).toBe("none");
  await page.screenshot({ path: "../.verification/about-mantine-loading.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  release();
  await expect(page.locator("main h1")).toHaveText("Our company");
  await expect(loader).toHaveCount(0);
});
