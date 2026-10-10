import manifest from "../../docs/cms/prosperya-labels.json";
import { createTranslator } from "../src/i18n/labels.js";
export const cmsLabels = locale => Object.fromEntries(manifest.map(row => [row.key, row.translations[locale] || ""]));
export const cmsLocale = (locale = "en") => ({ locale, t: createTranslator(locale, cmsLabels(locale)), labelsLoading: false, labelsError: false });
