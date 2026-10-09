import { solutionsData } from "../data/solutions.data.js";
import { bySlug, localizeEntity } from "./localize.js";

export async function getSolutions(locale) {
  return localizeEntity(solutionsData, locale);
}

export async function getSolutionBySlug(locale, slug) {
  return bySlug(await getSolutions(locale), slug);
}
