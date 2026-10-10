/** Missing editorial labels remain visible as their full CMS key. */
export function createTranslator(locale, labels = {}) {
  return (key, values = {}) => {
    const fullKey = key.startsWith('prosperya.') ? key : `prosperya.${key}`;
    const value = labels[fullKey];
    if (typeof value !== 'string' || value.trim() === '') return fullKey;
    return value.replace(/\{(\w+)\}/g, (token, name) =>
      Object.hasOwn(values, name) ? String(values[name]) : token);
  };
}
