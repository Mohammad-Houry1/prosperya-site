import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  normalizeLocale,
  replaceLocaleInPath,
} from "../../src/i18n/locale.js";

test("normalizes unsupported locale to the default locale", () => {
  assert.equal(normalizeLocale("de"), DEFAULT_LOCALE);
  assert.equal(normalizeLocale(undefined), DEFAULT_LOCALE);
});

test("recognizes supported locales", () => {
  assert.equal(isSupportedLocale("en"), true);
  assert.equal(isSupportedLocale("fr"), true);
  assert.equal(isSupportedLocale("de"), false);
});

test("replaces only the leading locale segment", () => {
  assert.equal(
    replaceLocaleInPath("/en/expertise/netsuite", "fr"),
    "/fr/expertise/netsuite",
  );
  assert.equal(replaceLocaleInPath("/fr", "en"), "/en");
  assert.equal(replaceLocaleInPath("/contact", "fr"), "/fr/contact");
});

test("switches each translated legal route in both directions", () => {
  const pairs = [
    ["privacy-policy", "politique-de-confidentialite"],
    ["terms", "conditions-utilisation"],
    ["cookie-policy", "politique-cookies"],
    ["accessibility", "accessibilite"],
  ];
  for (const [en, fr] of pairs) {
    assert.equal(replaceLocaleInPath(`/en/${en}`, "fr"), `/fr/${fr}`);
    assert.equal(replaceLocaleInPath(`/fr/${fr}`, "en"), `/en/${en}`);
  }
});
test("preserves case study slugs when switching locale", () => {
  assert.equal(
    replaceLocaleInPath("/en/work/global-retailer-transformation", "fr"),
    "/fr/work/global-retailer-transformation",
  );
});
