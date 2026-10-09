import { LEGAL_ROUTES } from "./legalRoutes.js";

export const SUPPORTED_LOCALES = Object.freeze(["en", "fr"]);
export const DEFAULT_LOCALE = "en";

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

export function normalizeLocale(locale) {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function replaceLocaleInPath(pathname, nextLocale) {
  const locale = normalizeLocale(nextLocale);
  const normalizedPath = pathname?.startsWith("/")
    ? pathname
    : `/${pathname ?? ""}`;
  const segments = normalizedPath.split("/").filter(Boolean);

  if (isSupportedLocale(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  if (segments.length === 2) {
    const legal = Object.values(LEGAL_ROUTES).find((paths) =>
      Object.values(paths).includes(segments[1]),
    );
    if (legal) segments[1] = legal[locale];
  }
  return `/${segments.join("/")}`;
}
