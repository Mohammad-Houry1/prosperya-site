import { expect, test } from "@playwright/test";

function response(item) {
  const fr = item.query?.locale === "fr";
  let data = [];
  if (item.path === "seo") {
    const path = item.query.path;
    data = { path, locale: path.split("/")[1], title: "CMS title", description: "CMS description", robots: "index, follow", canonical: `http://127.0.0.1:5173${path}`, alternates: [] };
  } else if (item.path === "labels") data = {};
  else if (item.path === "testimonials") data = [{ id: "quote", name: "Approved Person", company: "Approved Company", quote: fr ? "Avis publié du CMS" : "Published CMS testimonial" }];
  else if (item.path === "platforms") data = [{ id: "platform", slug: "cms-platform", name: "CMS Platform",
    logo_image: { url: "/cms-logo.svg", alt: "uploaded-file.svg", width: 100, height: 100 } }];
  else if (item.path === "faqs") data = [{ id: "faq", question: fr ? "Question du CMS ?" : "CMS question?", answer: "<p>Published CMS answer</p><script>window.cmsInjected=true</script>" }];
  else if (item.path === "contact/options") data = { project_types: [{ id: "type", name: "CMS Integration" }], project_stages: [{ id: "stage", name: "CMS Planning" }], countries: [] };
  else if (item.path === "contact" || item.path === "newsletter") data = { accepted: true };
  return { id: item.id, status: item.method === "POST" ? 201 : 200, body: { data, meta: { last_page: 1, current_page: 1, total: Array.isArray(data) ? data.length : 0 } } };
}

for (const locale of ["en", "fr"]) {
  test(`CMS sections load in ${locale} through named endpoints`, async ({ page }) => {
    const calls = [];
    await page.route("**/cms-logo.svg", (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/></svg>' }));
    await page.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      expect(url.pathname).not.toBe("/api/batch");
      expect(route.request().headers()["x-api-key"]).toBeUndefined();
      const item = { path: url.pathname.replace('/api/', ''), method: route.request().method(),
        query: Object.fromEntries(url.searchParams), data: route.request().method() === "POST" ? route.request().postDataJSON() : undefined };
      calls.push(item);
      if (item.path === "seo") expect(item.query.model).toBe("SeoPage");
      const result = response(item);
      await route.fulfill({ status: result.status, json: result.body });
    });
    await page.goto(`/${locale}/about`);
    await expect(page.getByText(locale === "fr" ? "Avis publié du CMS" : "Published CMS testimonial", { exact: false })).toBeVisible();
    await expect(page.getByText("CMS Platform", { exact: true })).toBeVisible();
    const alt = locale === "fr" ? "Logo CMS Platform" : "CMS Platform logo";
    const aboutLogo = page.getByRole("img", { name: alt, exact: true });
    await aboutLogo.scrollIntoViewIfNeeded();
    await expect(aboutLogo).toHaveAttribute("loading", "lazy");
    await expect.poll(() => aboutLogo.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    await page.goto(`/${locale}`);
    const homeLogo = page.locator(`img[alt="${alt}"]`).first();
    await homeLogo.scrollIntoViewIfNeeded();
    await expect.poll(() => homeLogo.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    await page.goto(`/${locale}/approach`);
    await page.getByRole("button", { name: locale === "fr" ? "Question du CMS ?" : "CMS question?" }).click();
    await expect(page.getByText("Published CMS answer", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => window.cmsInjected)).toBeUndefined();
    expect(calls.some((item) => item.path === "faqs" && item.query.category === "approach")).toBe(true);
    if (locale === "en") {
      await page.goto("/en/contact");
      await expect(page.getByRole("combobox", { name: "Project type", exact: true })).toBeVisible();
      for (const [label, value] of [["Name", "Visitor"], ["Company", "Company"], ["Work email", "visitor@example.test"], ["Country", "France"], ["What needs to change?", "Connect our systems"]])
        await page.getByRole('textbox', { name: label, exact: true }).fill(value);
      await page.getByRole("combobox", { name: "Project type", exact: true }).click();
      await expect(page.getByRole("combobox", { name: "Project type", exact: true })).toHaveAttribute("aria-expanded", "true");
      await page.screenshot({ path: "../.verification/contact-dropdown-desktop.png" });
      await page.getByRole("option", { name: "CMS Integration", exact: true }).click();
      await expect(page.getByRole("combobox", { name: "Project type", exact: true })).toHaveAttribute("aria-expanded", "false");
      await page.getByRole("combobox", { name: "Project stage", exact: true }).click();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole("combobox", { name: "Project stage", exact: true }).scrollIntoViewIfNeeded();
      await expect(page.getByRole("option", { name: "CMS Planning", exact: true })).toBeVisible();
      await page.screenshot({ path: "../.verification/contact-dropdown-mobile.png" });
      await page.getByRole("combobox", { name: "Project stage", exact: true }).press("ArrowDown");
      await page.getByRole("combobox", { name: "Project stage", exact: true }).press("Enter");
      await expect(page.getByRole("combobox", { name: "Project stage", exact: true })).toHaveValue("CMS Planning");
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.getByRole("switch", { name: "Dark mode" }).click();
      await page.getByRole("combobox", { name: "Project stage", exact: true }).click();
      await expect(page.getByRole("option", { name: "CMS Planning", exact: true })).toBeVisible();
      await page.screenshot({ path: "../.verification/contact-dropdown-dark.png" });
      await page.getByRole("combobox", { name: "Project stage", exact: true }).press("Escape");
      await page.getByRole("button", { name: "Send project brief" }).click();
      await expect(page.getByText("Thank you, your project brief was received.")).toBeVisible();
      await page.goto("/en/insights");
      await page.getByLabel("Work email", { exact: true }).fill("visitor@example.test");
      await page.getByRole("button", { name: "Subscribe", exact: true }).click();
      await expect(page.getByText("Thank you. Your subscription was received.")).toBeVisible();
      expect(calls.find((item) => item.path === "contact").data).toMatchObject({ project_type: "type", project_stage: "stage", locale: "en" });
      expect(calls.find((item) => item.path === "newsletter").data.email).toBe("visitor@example.test");
    }
  });
}
