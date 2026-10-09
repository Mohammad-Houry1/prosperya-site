import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { messages } from "./messages.js";
import { normalizeLocale } from "./locale.js";
import { LocaleContext } from "./LocaleContext.jsx";
import { websiteApi } from "../services/websiteApi.js";
import { createTranslator, loadLabels } from "./labels.js";
export function LocaleProvider({ children }) {
  const { locale: routeLocale } = useParams();
  const locale = normalizeLocale(routeLocale);
  const { data: labels = {}, isPending: labelsLoading, isError: labelsError, refetch: retryLabels } = useQuery({
    queryKey: ["labels", locale],
    queryFn: ({ signal }) => loadLabels(websiteApi, locale, signal),
    retry: false,
  });
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo(
    () => ({
      locale,
      messages: messages[locale],
      labelsLoading,
      labelsError,
      retryLabels,
      t: createTranslator(locale, labels),
    }),
    [locale, labels, labelsLoading, labelsError, retryLabels],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
