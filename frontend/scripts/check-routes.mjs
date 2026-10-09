import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { LEGAL_ROUTES } from "../src/i18n/legalRoutes.js";

const origin = process.env.ROUTE_CHECK_URL || "http://127.0.0.1:5173";
const pagePaths = JSON.parse(await readFile(new URL("../dist/site-routes.json", import.meta.url), "utf8"));
const browser = await chromium.launch();
let failures = 0;
let checked = 0;
const unavailable = new Set();
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" });
  const crashes = [];
  const moduleFailures = [];
  let activePath;
  page.on("pageerror", (error) => crashes.push(error.message));
  page.on("requestfailed", (request) => {
    if (["script", "stylesheet"].includes(request.resourceType()) && request.failure()?.errorText !== "net::ERR_ABORTED") {
      moduleFailures.push(new URL(request.url()).pathname);
    }
  });
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.pathname.startsWith("/api/") && response.status() >= 400) unavailable.add(`${activePath}: ${url.pathname} (${response.status()})`);
  });
  for (const locale of ["en", "fr"]) {
    const articlePaths = [];
    let pagination = 1;
    do {
      const response = await page.request.get(`${origin}/api/articles?locale=${locale}&per_page=50&page=${pagination}`);
      if (!response.ok()) break;
      const payload = await response.json();
      for (const article of payload.data || []) if (article.slug) articlePaths.push(`insights/${encodeURIComponent(article.slug)}`);
      if (pagination >= (payload.meta?.last_page || 1)) break;
      pagination++;
    } while (pagination <= 10000);
    const paths = [...new Set([...pagePaths, ...Object.values(LEGAL_ROUTES).map((paths) => paths[locale]), ...articlePaths, "route-check-missing"])];
    for (const suffix of paths) {
      activePath = `/${locale}${suffix ? `/${suffix}` : ""}`;
      crashes.length = 0;
      moduleFailures.length = 0;
      try {
        await page.goto(origin + activePath, { waitUntil: "networkidle", timeout: 30000 });
        await page.locator("main h1, main h2").first().waitFor({ state: "visible", timeout: 15000 });
        const rawError = await page.getByText("Unexpected Application Error!", { exact: true }).count();
        const recoveryScreen = await page.getByRole("heading", { name: /^(One small hiccup\.|Un petit contretemps\.)$/ }).count();
        if (rawError || recoveryScreen || crashes.length || moduleFailures.length) throw new Error([...crashes, ...moduleFailures, rawError ? "Raw crash screen" : "", recoveryScreen ? "Fatal recovery screen" : ""].filter(Boolean).join("; "));
        console.log(`OK ${activePath}`);
      } catch (error) {
        failures++;
        console.error(`FAIL ${activePath}: ${error.message}`);
      }
      checked++;
      // Avoid flooding the live API's per-IP content limit during a full audit.
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }
} finally {
  await browser.close();
}
console.log(`Checked ${checked} routes: ${failures} rendering/import failures.`);
if (unavailable.size) console.log("CMS content/setup responses:\n" + [...unavailable].join("\n"));
process.exitCode = failures ? 1 : 0;
