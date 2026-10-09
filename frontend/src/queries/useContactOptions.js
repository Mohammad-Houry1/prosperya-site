import { useQuery } from "@tanstack/react-query";
import { websiteApi } from "../services/websiteApi.js";

export function useContactOptions(locale, enabled = true) {
  return useQuery({
    queryKey: ["contact-options", locale],
    queryFn: async ({ signal }) => (await websiteApi.contactOptions(locale, signal)).data,
    staleTime: 0,
    enabled,
  });
}
