import { useQuery } from "@tanstack/react-query";
import {
  getCapabilities,
  getCapabilityBySlug,
} from "../repositories/expertise.repository.js";
import {
  getSolutions,
  getSolutionBySlug,
} from "../repositories/solutions.repository.js";
import {
  getCaseStudies,
  getCaseStudyBySlug,
} from "../repositories/caseStudies.repository.js";
import { getPlatforms } from "../repositories/platforms.repository.js";
import {
  getInsights,
  getInsightBySlug,
  getInsightCategories,
} from "../repositories/insights.repository.js";
import {
  getLeadership,
  getProcess,
} from "../repositories/company.repository.js";
import { queryKeys } from "./queryKeys.js";

export const useCapabilities = (locale) =>
  useQuery({
    queryKey: queryKeys.capabilities(locale),
    queryFn: () => getCapabilities(locale),
  });
export const useCapability = (locale, slug) =>
  useQuery({
    queryKey: queryKeys.capability(locale, slug),
    queryFn: () => getCapabilityBySlug(locale, slug),
    enabled: Boolean(slug),
  });
export const useSolutions = (locale) =>
  useQuery({
    queryKey: queryKeys.solutions(locale),
    queryFn: () => getSolutions(locale),
  });
export const useSolution = (locale, slug) =>
  useQuery({
    queryKey: queryKeys.solution(locale, slug),
    queryFn: () => getSolutionBySlug(locale, slug),
    enabled: Boolean(slug),
  });
export const useCaseStudies = (locale) =>
  useQuery({
    queryKey: queryKeys.caseStudies(locale),
    queryFn: () => getCaseStudies(locale),
  });
export const useCaseStudy = (locale, slug) =>
  useQuery({
    queryKey: queryKeys.caseStudy(locale, slug),
    queryFn: () => getCaseStudyBySlug(locale, slug),
    enabled: Boolean(slug),
  });
export const usePlatforms = (locale) =>
  useQuery({
    queryKey: queryKeys.platforms(locale),
    queryFn: ({ signal }) => getPlatforms(locale, signal),
  });
export const useInsights = (locale, page = 1, categoryId = "") =>
  useQuery({
    queryKey: queryKeys.insights(locale, page, categoryId),
    queryFn: ({ signal }) => getInsights(locale, { page, categoryId }, signal),
    staleTime: 0,
  });
export const useInsight = (locale, slug) =>
  useQuery({
    queryKey: queryKeys.insight(locale, slug),
    queryFn: ({ signal }) => getInsightBySlug(locale, slug, signal),
    enabled: Boolean(slug),
    staleTime: 0,
  });
export const useInsightCategories = (locale) =>
  useQuery({
    queryKey: queryKeys.insightCategories(locale),
    queryFn: ({ signal }) => getInsightCategories(locale, signal),
    staleTime: 0,
  });
export const useProcess = (locale) =>
  useQuery({
    queryKey: queryKeys.process(locale),
    queryFn: () => getProcess(locale),
  });
export const useLeadership = (locale) =>
  useQuery({
    queryKey: queryKeys.leadership(locale),
    queryFn: () => getLeadership(locale),
  });
