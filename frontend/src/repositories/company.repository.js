import { companyData } from "../data/company.data.js";
import { localizeEntity } from "./localize.js";

export async function getLeadership(locale) {
  return localizeEntity(companyData.leadership, locale);
}

export async function getProcess(locale) {
  return localizeEntity(companyData.process, locale);
}
