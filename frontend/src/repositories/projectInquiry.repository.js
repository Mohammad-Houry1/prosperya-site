import { inquiryFields } from "../data/projectInquiry.data.js";
import { websiteApi } from "../services/websiteApi.js";

export function normalizeProjectInquiry(values, locale) {
  return {
    ...Object.fromEntries(
      inquiryFields.map((field) => [
        field.name,
        String(values[field.name] ?? "").trim(),
      ]),
    ),
    contact_phone: values.contact_phone?.trim() || null,
    current_erp: values.current_erp?.trim() || null,
    locale: locale === "fr" ? "fr" : "en",
    website: "",
  };
}

export function validateProjectInquiry(inquiry, options = {}) {
  const errors = {};
  for (const field of inquiryFields) {
    const value = inquiry[field.name] ?? "";
    if (field.required && !String(value).trim()) errors[field.name] = "required";
    else if (field.maxLength && String(value).length > field.maxLength)
      errors[field.name] = "too_long";
    else if (
      field.options &&
      value &&
      !(field.name === "project_type" ? options.project_types : options.project_stages)?.some((option) => option.id === value)
    )
      errors[field.name] = "invalid_option";
  }
  if (inquiry.work_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.work_email))
    errors.work_email = "invalid_email";
  return errors;
}

export async function submitProjectInquiry(inquiry) {
  const { data } = await websiteApi.contact(inquiry);
  if (!data.accepted) throw new Error("The CMS did not accept the project brief.");
  return data;
}
