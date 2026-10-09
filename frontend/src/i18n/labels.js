import { messages } from "./messages.js";

function getByPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

const nonBlank = (value) => typeof value === "string" && value.trim() !== "";

/** A CMS override never replaces useful local copy with a blank string. */
export function createTranslator(locale, labels = {}) {
  return (key, fallback, params = {}) => {
    const scopedKey = key.startsWith("prosperya.") ? key : `prosperya.${key}`;
    const candidates = [labels[scopedKey], labels[key], fallback?.[locale],
      getByPath(messages[locale], key), fallback?.en, getByPath(messages.en, key), key];
    const text = candidates.find(nonBlank);
    return text.replace(/\{([\w]+)\}/g, (match, name) =>
      Object.hasOwn(params, name) ? String(params[name]) : match);
  };
}

/** Collect every dictionary page before rendering labels, including small CMS page sizes. */
export async function loadLabels(api, locale, signal) {
  const labels = {};
  let page = 1;
  let lastPage = 1;
  do {
    const response = await api.labels({ locale, page, per_page: 500 }, signal);
    Object.assign(labels, response.data || {});
    const reported = Number(response.meta?.last_page ?? page);
    if (!Number.isInteger(reported) || reported < page) throw new Error("Invalid label pagination.");
    lastPage = reported;
    page += 1;
  } while (page <= lastPage);
  return labels;
}
