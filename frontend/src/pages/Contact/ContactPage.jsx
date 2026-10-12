import { useQuery, useMutation } from "@tanstack/react-query";
import FrequentlyAskedQuestions from "../../components/company/FrequentlyAskedQuestions.jsx";
import { useEffect, useRef, useState } from "react";
import { Select } from "@mantine/core";
import { ArrowRight, ChevronDown, CircleCheck, ShieldCheck } from "lucide-react";
import RevealText from "../../motion/components/RevealText.jsx";
import Section from "../../components/common/Section.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import { inquiryFields } from "../../data/projectInquiry.data.js";
import {
  normalizeProjectInquiry,
  validateProjectInquiry,
} from "../../repositories/projectInquiry.repository.js";
import { websiteApi } from "../../services/websiteApi.js";
import styles from "./ContactPage.module.css";
import Skeleton from "../../components/feedback/Skeleton.jsx";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import GoogleCaptcha from "../../components/forms/GoogleCaptcha.jsx";

export default function ContactPage() {
  const submissionsEnabled = import.meta.env?.VITE_CMS_SUBMISSIONS_ENABLED === "true";
  const {locale, t } = useLocale();
  const fieldLabels = {
    name: t("contact.fields.name"),
    company_name: t("contact.fields.company"),
    work_email: t("contact.fields.email"),
    contact_phone: t("contact.fields.phone"),
    contact_country: t("contact.fields.country"),
    current_erp: t("contact.fields.erp"),
    project_type: t("contact.fields.type"),
    project_stage: t("contact.fields.stage"),
    project_brief: t("contact.fields.brief"),
  };
  const contactCopy = useQuery({
    queryKey: ["corporate-page", locale, "contact-form"],
    queryFn: async ({ signal }) => (await websiteApi.corporatePage("contact-form", locale, signal)).data,
  });

  const { data: faqs = [], isPending: faqsIsPending, isError: faqsIsError, refetch: faqsRefetch } = useQuery({
    queryKey: ["faq", locale, "contact"],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.faqs({ locale, category: "contact" }, signal);
      return response.data || [];
    },
  });
  const formRef = useRef(null);
  const submitLock = useRef(false);
  const [errors, setErrors] = useState({});
  const [selections, setSelections] = useState({});
  const [openSelect, setOpenSelect] = useState(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  useEffect(() => { setCaptchaToken(""); setCaptchaReset(value => value + 1); }, [locale]);
  const submission = useMutation({
    mutationFn: async (inquiry) => {
      const response = await websiteApi.contact(inquiry);
      if (!response.data.accepted) throw new Error("The CMS did not accept the project brief.");
      return response.data;
    },
    retry: false,
    gcTime: 0,
  });
  const { isPending: optionsPending, isError: optionsError, data: options = {} } = useQuery({
    queryKey: ["contact-options", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.contactOptions(locale, signal);
      return response.data;
    },
    staleTime: 0,
    enabled: submissionsEnabled,
  });
  useDocumentMeta({
    title: `${t("pages.contact.contact-page.start-a-project-908ad4")} — Prosperya`,
    description: t("pages.contact.contact-page.outline-your-erp-transformation-integration-or-automation-be5fb5"),
  });
  const errorCopy = { required: t("pages.contact.contact-page.this-field-is-required-b64844"), invalid_email: t("pages.contact.contact-page.enter-a-valid-email-address-e89bf5"), invalid_option: t("pages.contact.contact-page.choose-an-option-from-the-list-f37800"), too_long: t("pages.contact.contact-page.the-text-exceeds-the-allowed-length-47d0c5") };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!submissionsEnabled || submitLock.current || optionsPending || optionsError || !options.captcha?.site_key || !captchaToken) return;
    const payload = normalizeProjectInquiry(
      Object.fromEntries(new FormData(event.currentTarget)),
      locale,
    );
    payload.captcha_token = captchaToken;
    const nextErrors = validateProjectInquiry(payload, options);
    setErrors(nextErrors);
    submission.reset();
    if (Object.keys(nextErrors).length) {
      formRef.current.querySelector(`[id="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    submitLock.current = true;
    submission.mutate(payload, {
      onSuccess: () => {
        formRef.current?.reset();
        setSelections({});
      },
      onError: (error) => {
        if (error.status === 422) setErrors(Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])));
      },
      onSettled: () => {
        submitLock.current = false;
        setCaptchaToken("");
        setCaptchaReset(value => value + 1);
      },
    });
  };
  const renderField = (field) => {
    const choices = field.name === "project_type" ? options?.project_types : options?.project_stages;
    const selected = selections[locale]?.[field.name];
    if (field.options && (!submissionsEnabled || optionsError)) return null;
    const attributes = {
      id: field.name,
      name: field.name,
      required: field.required,
      autoComplete: field.autoComplete,
      maxLength: field.maxLength,
      "aria-invalid": Boolean(errors[field.name]),
      "aria-describedby": errors[field.name] ? `${field.name}-error` : undefined,
    };
    return (
      <div
        className={`${styles.field} ${field.multiline ? styles.wide : ""}`}
        key={field.name}
      >
        <label htmlFor={field.name}>
          {fieldLabels[field.name]}
        </label>
        {field.options ? (
          <Select
            {...attributes}
            key={locale}
            role="combobox"
            error={Boolean(errors[field.name])}
            attributes={{ input: { "aria-expanded": openSelect === field.name, "aria-describedby": attributes["aria-describedby"] } }}
            onDropdownOpen={() => setOpenSelect(field.name)}
            onDropdownClose={() => setOpenSelect((current) => current === field.name ? null : current)}
            data={(choices ?? []).map((option) => ({ value: option.id, label: option.name }))}
            value={choices?.some((option) => option.id === selected) ? selected : null}
            onChange={(value) => {
              setSelections((current) => ({ ...current, [locale]: { ...current[locale], [field.name]: value } }));
              if (submission.isSuccess || submission.isError) submission.reset();
            }}
            placeholder={t("pages.contact.contact-page.select-one-7658c9")}
            nothingFoundMessage={t("pages.contact.contact-page.no-options-available-39ed06")}
            allowDeselect={false}
            checkIconPosition="right"
            rightSection={<ChevronDown size={16} strokeWidth={1.6} aria-hidden="true" />}
            rightSectionPointerEvents="none"
            maxDropdownHeight={240}
            withScrollArea={false}
            comboboxProps={{ offset: 6, position: "bottom-start" }}
            classNames={{ input: styles.selectInput, dropdown: styles.selectDropdown, option: styles.selectOption, section: styles.selectSection, empty: styles.selectEmpty }}
          />
        ) : field.multiline ? (
          <textarea {...attributes} rows={5} />
        ) : (
          <input {...attributes} type={field.type ?? "text"} />
        )}
        {errors[field.name] && (
          <p className={styles.error} id={`${field.name}-error`}>
            {errorCopy[errors[field.name]] || errors[field.name]}
          </p>
        )}
      </div>
    );
  };
  // Two parts to the brief: who you are, then what needs to change.
  const split = inquiryFields.findIndex((field) => field.name === "current_erp");
  const groups = [
    [t("pages.contact.contact-page.about-you-d40b5d"), inquiryFields.slice(0, split)],
    [t("pages.contact.contact-page.your-project-fb792b"), inquiryFields.slice(split)],
  ];
  return (
    <>
      <Section className={styles.contactSection}>
        <div className={styles.layout}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              {t("pages.contact.contact-page.start-a-project-908ad4")}
            </p>
            <RevealText as="h1" onLoad key={locale}>
              {t("pages.contact.contact-page.let-s-architect-what-comes-next-7eed29")}
            </RevealText>
            {contactCopy.isPending ? <div className={styles.lead} aria-busy="true"><Skeleton height={18} /><Skeleton width="85%" height={18} /><Skeleton width="65%" height={18} /></div> : contactCopy.isError ? <button type="button" onClick={() => contactCopy.refetch()}>{t("components.feedback.error-state.copy.try-again-170551")}</button> : <CmsRichHtml className={styles.lead} html={contactCopy.data?.description} />}
            <p className={styles.notice}>
              <ShieldCheck size={16} strokeWidth={1.5} aria-hidden="true" />
              {submissionsEnabled
                ? (t("pages.contact.contact-page.your-project-brief-will-be-sent-to-5b9461"))
                : (t("pages.contact.contact-page.project-enquiries-are-temporarily-unavailable-6ce5fa"))}
            </p>
          </div>
          {submissionsEnabled && optionsPending ? <div className={`${styles.form} ${styles.formSkeleton}`} role="status" aria-label={t("pages.contact.contact-page.loading-options-725b1f")} aria-busy="true">
            <Skeleton width="45%" height={24} />
            <div className={styles.fields}>{Array.from({ length: 8 }, (_, index) => <div className={styles.field} key={index}><Skeleton width="45%" height={14} /><Skeleton height={48} /></div>)}</div>
            <Skeleton height={130} /><Skeleton width={164} height={144} /><Skeleton width="50%" height={48} />
          </div> : <form
            ref={formRef}
            className={styles.form}
            noValidate
            onSubmit={handleSubmit}
            onChange={() => {
              if (submission.isSuccess || submission.isError) submission.reset();
            }}
            aria-busy={submission.isPending}
            data-reveal="scale"
          >
            {groups.map(([legend, fields], groupIndex) => (
              <fieldset key={legend} className={styles.group} disabled={!submissionsEnabled}>
                <legend>
                  <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                  {legend}
                </legend>
                <div className={styles.fields}>{fields.map(renderField)}</div>
              </fieldset>
            ))}
            {submissionsEnabled && options.captcha?.site_key && <div className={styles.captcha}>
              <GoogleCaptcha key={locale} siteKey={options.captcha.site_key} onChange={token => {
                setCaptchaToken(token);
                if (token) setErrors(current => {
                  const next = { ...current };
                  delete next.captcha_token;
                  return next;
                });
              }} resetKey={captchaReset}
                errorText={t("components.feedback.error-state.copy.the-content-could-not-be-loaded-c44d0a")} retryText={t("components.feedback.error-state.copy.try-again-170551")} />
              {errors.captcha_token && <p className={styles.error} role="alert">{errors.captcha_token}</p>}
            </div>}
            {submissionsEnabled && (optionsError || !options.captcha?.site_key) && <p className={styles.notice} role="status">{t("pages.contact.contact-page.project-enquiries-are-temporarily-unavailable-6ce5fa")}</p>}
            <div className={styles.actions}>
              <button type="submit" className={styles.submit} disabled={!submissionsEnabled || submission.isPending || optionsPending || optionsError || !options.captcha?.site_key || !captchaToken}>
                {submission.isPending
                  ? t("pages.contact.contact-page.sending-b7af8e")
                  : t("pages.contact.contact-page.send-project-brief-816a21")}
                <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <span>{t("pages.contact.contact-page.about-3-minutes-fc8196")}</span>
            </div>
            {submission.isSuccess && (
              <p className={styles.success} role="status">
                <CircleCheck size={18} strokeWidth={1.5} aria-hidden="true" />
                {t("pages.contact.contact-page.thank-you-your-project-brief-was-received-4a736f")}
              </p>
            )}
            {submission.isError && (
              <p className={styles.error} role="alert">
                {submission.error?.status === 429 ? t("pages.contact.contact-page.too-many-requests-please-wait-before-trying-a64b07") : t("pages.contact.contact-page.your-brief-could-not-be-sent-your-c7d07a")}
              </p>
            )}
          </form>}
        </div>
      </Section>
      <FrequentlyAskedQuestions data={faqs} isPending={faqsIsPending} isError={faqsIsError} refetch={faqsRefetch} />
    </>
  );
}
