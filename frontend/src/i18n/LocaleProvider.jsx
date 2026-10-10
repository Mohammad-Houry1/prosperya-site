import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { messages } from "./messages.js";
import { normalizeLocale } from "./locale.js";
import { LocaleContext } from "./LocaleContext.jsx";
function getByPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}
export function LocaleProvider({ children }) {
  const { locale: routeLocale } = useParams();
  const locale = normalizeLocale(routeLocale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo(
    () => ({
      locale,
      messages: messages[locale],
      labelsLoading: false,
      labelsError: false,
      t(key) {
        return (
          getByPath(messages[locale], key) ?? getByPath(messages.en, key) ?? key
        );
      },
    }),
    [locale],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
