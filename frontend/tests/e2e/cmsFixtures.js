import { readFileSync } from "node:fs";
const manifest = JSON.parse(readFileSync(new URL("../../../docs/cms/prosperya-labels.json", import.meta.url), "utf8"));
export const labels = locale => Object.fromEntries(manifest.map(row => [row.key, row.translations[locale] || ""]));
const slugs = ["erp-transformation", "systems-integration", "automation-custom-development", "erp-optimization", "netsuite-implementation", "erp-rescue", "new-cms-expertise"];
export function expertise(slug, locale = "en") {
  return { id: slug, slug, featured: true, expertise_title: `${locale === "fr" ? "Expertise CMS" : "CMS Expertise"}: ${slug}`,
    expertise_summary: "Authored summary", expertise_description: "<p>Authored introduction from CMS.</p>", expertise_capabilities: ["Public capability"], expertise_outcomes: [], expertise_steps: [], metrics: [],
    sections: [{ section_title: "First authored section", section_description: "<p>CMS content with enough reading space.</p>".repeat(10) },
      { section_title: "Second authored section", section_description: "<p>Additional authored content.</p>".repeat(10) }], related_solutions: [], related_case_studies: [], platforms: [] };
}
export const caseStudy = { id: "case", slug: "new-cms-project", featured: true, case_study_title: "CMS Project", case_study_industry: "CMS Industry", industry_id: "cms-industry", case_study_summary: "CMS summary", case_study_description: "<p>CMS project introduction</p>", case_study_metrics: [], related_expertise: [], platforms: [], case_study_testimonial: [], sections: [], implementation_steps: [], case_study_gallery: [], case_study_before: [], case_study_after: [], case_study_deliverables: [], case_study_challenge_points: [] };
export const solution = { id: "solution", slug: "new-cms-solution", solution_title: "CMS Solution", solution_description: "CMS solution description", solution_statement: "CMS statement", solution_lead: "CMS lead", solution_challenges: [], solution_capabilities: [], solution_friction: [], outcomes: [], metrics: [], sections: [], related_expertise: [], related_case_studies: [] };
export function fixtureData(url) {
  const locale = url.searchParams.get("locale") || url.searchParams.get("path")?.split("/")[1] || "en";
  const path = url.pathname.replace("/api/", "");
  if (path === "labels") return labels(locale);
  if (path === "expertise") return slugs.map(slug => expertise(slug, locale));
  if (path.startsWith("expertise/")) return expertise(decodeURIComponent(path.split("/")[1]), locale);
  if (path === "solutions") return [solution];
  if (path.startsWith("solutions/")) return solution;
  if (path === "case-studies") return [caseStudy];
  if (path.startsWith("case-studies/")) return caseStudy;
  if (path === "approaches/our-approach") return { slug: "our-approach", approach_title: "CMS Approach", approach_description: "<p>CMS approach</p>", methodology: [{ methodology_title: "CMS Stage", methodology_buttons: ["Discuss"], methodology_descriptions: ["<p>CMS methodology</p>"] }], how_we_work: [], collaboration_items: [], principles: [] };
  if (path === "corporate-pages/about-prosperya") return { slug: "about-prosperya", name: "About Prosperya", about_title: "CMS About", description: "<p>CMS about</p>", about_users: [], about_facts: [], about_principles: [], about_steps: [], about_focus: [], sections: [] };
  if (path === "pages/home") return { slug: "home", architecture_title: "CMS Architecture", architecture_description: "<p>CMS foundation</p>", architecture_column_1: ["Finance"], architecture_column_2: ["Operations"], architecture_column_3: ["Customer"], architecture_column_4: ["Analytics"] };
  if (path === "seo") { const route = url.searchParams.get("path"); return { path: route, locale, title: "CMS metadata", description: "CMS metadata description", robots: "index, follow", canonical: `http://127.0.0.1:5173${route}`, alternates: [] }; }
  return [];
}
export async function mockCms(page) {
  await page.route("**/api/**", route => {
    const url = new URL(route.request().url());
    return route.fulfill({ json: { data: fixtureData(url), meta: { last_page: 1, current_page: 1 } } });
  });
}
