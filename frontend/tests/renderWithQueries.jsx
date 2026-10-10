import { render as renderView } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LocaleContext } from "../src/i18n/LocaleContext.jsx";
import { cmsLabels, cmsLocale } from "./cmsFixtures.js";
export function render(ui, options) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false } },
  });
  for (const locale of ["en", "fr"]) client.setQueryData(["labels", locale], cmsLabels(locale));
  return renderView(<LocaleContext.Provider value={cmsLocale()}><QueryClientProvider client={client}>{ui}</QueryClientProvider></LocaleContext.Provider>, options);
}
