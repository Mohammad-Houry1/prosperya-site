import { normalizeLocale } from "../i18n/locale.js";

export function localizeEntity(value, locale) {
  const activeLocale = normalizeLocale(locale);

  if (Array.isArray(value)) {
    return value.map((item) => localizeEntity(item, activeLocale));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const { copy, ...base } = value;
  const localizedCopy = copy?.[activeLocale] ?? copy?.en ?? {};
  const merged = { ...base, ...localizedCopy };

  return Object.fromEntries(
    Object.entries(merged).map(([key, nestedValue]) => [
      key,
      localizeEntity(nestedValue, activeLocale),
    ]),
  );
}

export function bySlug(items, slug) {
  return items.find((item) => item.slug === slug) ?? null;
}
