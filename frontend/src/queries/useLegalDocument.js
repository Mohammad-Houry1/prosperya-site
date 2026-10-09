import { useQuery } from "@tanstack/react-query";
import { getLegalDocument } from "../repositories/legal.repository.js";

export function useLegalDocument(locale, id) {
  return useQuery({
    queryKey: ["legal", locale, id],
    queryFn: ({ signal }) => getLegalDocument(locale, id, signal),
    staleTime: 0,
  });
}
