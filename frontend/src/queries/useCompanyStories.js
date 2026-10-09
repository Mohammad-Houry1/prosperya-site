import { useQuery } from "@tanstack/react-query";
import {
  getCompanyStories,
  getFrequentlyAskedQuestions,
} from "../repositories/companyStories.repository.js";
export function useCompanyStories(locale) {
  return useQuery({
    queryKey: ["company-stories", locale],
    queryFn: ({ signal }) => getCompanyStories(locale, signal),
  });
}
export function useFrequentlyAskedQuestions(locale, topic) {
  return useQuery({
    queryKey: ["faq", locale, topic],
    queryFn: ({ signal }) => getFrequentlyAskedQuestions(locale, topic, signal),
  });
}
