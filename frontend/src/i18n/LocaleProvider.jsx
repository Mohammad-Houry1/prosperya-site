import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { messages } from "./messages.js";
import { normalizeLocale } from "./locale.js";
import { LocaleContext } from "./LocaleContext.jsx";
import { websiteApi } from "../services/websiteApi.js";
function getByPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}
export function LocaleProvider({ children }) {
  const { locale: routeLocale } = useParams();
  const locale = normalizeLocale(routeLocale);
  const { data: labels = {}, isPending: labelsLoading, isError: labelsError, refetch: retryLabels } = useQuery({
    queryKey: ["labels", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.labels({ locale }, signal);
      return response.data || {};
    },
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
      t(key) {
        const label = labels[key];
        if (typeof label === "string" && label.trim() !== "") return label;
        return (
          getByPath(messages[locale], key) ?? getByPath(messages.en, key) ?? key
        );
      },
    }),
    [locale, labels, labelsLoading, labelsError, retryLabels],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
