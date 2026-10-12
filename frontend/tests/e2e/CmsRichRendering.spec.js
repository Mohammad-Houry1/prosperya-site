import { expect, test } from "@playwright/test";
import { mockCms } from "./cmsFixtures.js";

test("Approach renders CMS HTML and keeps imageless practice text in the full card", async ({ page }) => {
  await mockCms(page);
  await page.route("**/api/approaches/our-approach?**", route => route.fulfill({ json: { data: {
    slug: "our-approach", approach_title: "CMS Approach", methodology: [],
    how_we_work: [{ work_title: "Governance", work_description: "<p>Clear governance keeps alignment, transparency and risk management across the program.</p><ol><li>Steering committees</li><li>Decision frameworks</li></ol>", work_points: ["<p>Joint <strong>ownership</strong></p>"], work_image: null }],
    collaboration_title: "Partners", collaboration_items: ["<p>Transparent <em>communication</em></p>"],
    diagram_client_title: "Client", diagram_client_description: "<p>Vision &amp; <strong>decisions</strong></p>",
    diagram_shared_title: "Shared", diagram_shared_description: "<p>Shared outcomes</p>",
    diagram_company_title: "Company", diagram_company_description: "<p>Expertise &amp; execution</p>",
    diagram_value_title: "Value", diagram_value_description: "<p>Measure &amp; improve</p>", principles: [],
  } } }));
  await page.goto("/en/approach");
  const card = page.locator("article").filter({ has: page.getByRole("heading", { name: "Governance", exact: false }) });
  const paragraph = card.getByText("Clear governance keeps alignment, transparency and risk management across the program.");
  await expect(paragraph).toBeAttached();
  expect(await paragraph.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(200);
  await expect(card.locator("strong", { hasText: "ownership" })).toBeAttached();
  await expect(page.locator("figure strong", { hasText: "decisions" })).toBeAttached();
  await expect(page.getByText("Measure & improve", { exact: true })).toBeAttached();
  await expect(page.locator("main")).not.toContainText("<p>");
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "../.verification/rich-approach-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await card.scrollIntoViewIfNeeded();
  expect(await paragraph.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "../.verification/rich-approach-mobile.png" });
});

for (const locale of ["en", "fr"]) {
  test(`CMS formatting renders across Home, Expertise, Articles, About and Legal in ${locale}`, async ({ page }) => {
    await mockCms(page);
    const skill = { id: "skill", slug: "cms-skill", expertise_title: "CMS Skill", expertise_summary: "<p>Build <strong>connected systems</strong> &amp; simplify operations.</p>",
      expertise_description: "<p>Detailed <strong>connected systems</strong>.</p>", expertise_capabilities: ["<p>Public <em>capability</em></p>"], expertise_outcomes: ["<p>Real <strong>outcome</strong></p>"],
      sections: [], expertise_steps: [], metrics: [], related_solutions: [], related_case_studies: [], platforms: [] };
    const story = { id: "story", slug: "cms-story", title: "CMS Story", excerpt: "<p>Read <strong>practical insight</strong> &amp; context.</p>", body: "<p>Article <strong>body</strong>.</p>", cover_image: null };
    await page.route("**/api/expertise**", route => route.fulfill({ json: { data: new URL(route.request().url()).pathname === "/api/expertise" ? [skill] : skill } }));
    await page.route("**/api/articles**", route => route.fulfill({ json: { data: new URL(route.request().url()).pathname === "/api/articles" ? [story] : story, meta: { last_page: 1, total: 1 } } }));
    await page.route("**/api/corporate-pages/about-prosperya?**", route => route.fulfill({ json: { data: { slug: "about-prosperya", about_title: "CMS About",
      description: "<p>About <strong>our team</strong>.</p>", content: "<p>Our <em>story</em>.</p>", about_users: [], about_facts: [], about_focus: [], about_steps: [], about_principles: [] } } }));
    await page.route("**/api/corporate-pages/privacy-policy?**", route => route.fulfill({ json: { data: { id: "legal", slug: "privacy-policy", title: "Privacy",
      description: "<p>Privacy <strong>introduction</strong>.</p>", sections: [{ title: "Data", description: "<p>Data <em>handling</em>.</p>" }] } } }));
    for (const [path, formatted] of [
      ["", "connected systems"], ["expertise", "connected systems"], ["expertise/cms-skill", "connected systems"],
      ["insights", "practical insight"], ["insights/cms-story", "practical insight"], ["about", "our team"], ["privacy-policy", "introduction"],
    ]) {
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.goto(`/${locale}/${path}`);
      const main = page.locator("main");
      await expect(main.locator("strong", { hasText: formatted }).first()).toBeAttached();
      await expect(main).not.toContainText("<p>");
      await expect(main).not.toContainText("&amp;");
      if (path === "expertise") {
        await main.locator("strong", { hasText: formatted }).last().scrollIntoViewIfNeeded();
        await page.screenshot({ path: `../.verification/rich-expertise-${locale}-desktop.png` });
      }
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
