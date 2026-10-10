export const inquiryFields = [
  {
    name: "name",
    autoComplete: "name",
    required: true,
    maxLength: 255,
  },
  {
    name: "company_name",
    autoComplete: "organization",
    required: true,
    maxLength: 255,
  },
  {
    name: "work_email",
    type: "email",
    autoComplete: "email",
    required: true,
    maxLength: 254,
  },
  {
    name: "contact_phone",
    type: "tel",
    autoComplete: "tel",
    maxLength: 60,
  },
  {
    name: "contact_country",
    autoComplete: "country-name",
    required: true,
    maxLength: 255,
  },
  {
    name: "current_erp",
    maxLength: 255,
  },
  {
    name: "project_type",
    options: true,
    required: true,
    maxLength: 100,
  },
  {
    name: "project_stage",
    options: true,
    required: true,
    maxLength: 100,
  },
  {
    name: "project_brief",
    multiline: true,
    required: true,
    maxLength: 10000,
  },
];
