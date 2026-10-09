// Route availability only. SEO and sitemap publication belong to Laravel.
import { writeFileSync } from "node:fs";
import { expertiseData } from "../src/data/expertise.data.js";
import { solutionsData } from "../src/data/solutions.data.js";
import { caseStudiesData } from "../src/data/caseStudies.data.js";

const routes = ["", "expertise", "solutions", "work", "approach", "about", "insights", "contact",
  ...expertiseData.map(({ slug }) => `expertise/${slug}`),
  ...solutionsData.map(({ slug }) => `solutions/${slug}`),
  ...caseStudiesData.map(({ slug }) => `work/${slug}`)];
writeFileSync("dist/site-routes.json", JSON.stringify(routes));
