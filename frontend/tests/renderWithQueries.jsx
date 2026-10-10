import { render as renderView } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function render(ui, options) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false } },
  });
  return renderView(<QueryClientProvider client={client}>{ui}</QueryClientProvider>, options);
}
