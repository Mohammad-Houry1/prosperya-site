import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { messages } from "./messages.js";
import { normalizeLocale } from "./locale.js";
import { LocaleContext } from "./LocaleContext.jsx";
import { loadWebsiteLabels } from "../services/loadWebsiteLabels.js";
function getByPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}
export function LocaleProvider({ children }) {
  const { locale: routeLocale } = useParams();
  const locale = normalizeLocale(routeLocale);
  const [labelState, setLabelState] = useState({ locale, labels: {}, loading: true, error: false });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    const controller = new AbortController();
    setLabelState({ locale, labels: {}, loading: true, error: false });
    loadWebsiteLabels(locale, controller.signal)
      .then((labels) => { if (!controller.signal.aborted) setLabelState({ locale, labels, loading: false, error: false }); })
      .catch(() => { if (!controller.signal.aborted) setLabelState({ locale, labels: {}, loading: false, error: true }); });
    return () => controller.abort();
  }, [locale, retry]);
  const value = useMemo(
    () => ({
      locale,
      messages: messages[locale],
      labelsLoading: labelState.locale === locale && labelState.loading,
      labelsError: labelState.locale === locale && labelState.error,
      retryLabels: () => setRetry((value) => value + 1),
      t(key) {
        const label = labelState.locale === locale ? labelState.labels[key] : undefined;
        if (typeof label === "string" && label.trim() !== "") return label;
        return (
          getByPath(messages[locale], key) ?? getByPath(messages.en, key) ?? key
        );
      },
    }),
    [locale, labelState],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
