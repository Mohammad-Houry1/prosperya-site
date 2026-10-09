import { useMutation } from "@tanstack/react-query";
import { submitProjectInquiry } from "../repositories/projectInquiry.repository.js";
export function useProjectInquiry() {
  return useMutation({
    mutationFn: submitProjectInquiry,
    retry: false,
    gcTime: 0,
  });
}
