import { messages } from "./messages.js";

/** Existing message keys remain part of the CMS dictionary, including dynamic nav keys. */
export function messageLabels() {
  const labels = [];
  function visit(en, fr, prefix = "") {
    for (const [name, value] of Object.entries(en)) {
      const key = prefix ? `${prefix}.${name}` : name;
      if (typeof value === "string") {
        labels.push({ key: `prosperya.${key}`, group: "ui", source: value,
          translations: { en: value, fr: fr?.[name] ?? value } });
      } else visit(value, fr?.[name], key);
    }
  }
  visit(messages.en, messages.fr);
  return labels;
}
