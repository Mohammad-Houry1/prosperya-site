import { expertiseData } from "../data/expertise.data.js";
import { expertiseDetailsData } from "../data/expertiseDetails.data.js";
import { bySlug, localizeEntity } from "./localize.js";

export async function getCapabilities(locale) {
  return localizeEntity(expertiseData, locale);
}

// Detail pages receive the capability plus its localized page content (`detail`).
export async function getCapabilityBySlug(locale, slug) {
  const capability = bySlug(await getCapabilities(locale), slug);
  if (!capability) return null;
  const detail = expertiseDetailsData[capability.id];
  return detail ? { ...capability, detail: localizeEntity(detail, locale) } : capability;
}
