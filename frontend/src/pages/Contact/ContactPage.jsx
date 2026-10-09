import { useQuery, useMutation } from "@tanstack/react-query";
import FrequentlyAskedQuestions from "../../components/company/FrequentlyAskedQuestions.jsx";
import { useRef, useState } from "react";
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

export default function ContactPage() {
  const submissionsEnabled = import.meta.env?.VITE_CMS_SUBMISSIONS_ENABLED === "true";
  const {locale, t } = useLocale();
  const fieldLabels = {
    name: t("contact.fields.name", { en: "Name", fr: "Nom" }),
    company_name: t("contact.fields.company", { en: "Company", fr: "Entreprise" }),
    work_email: t("contact.fields.email", { en: "Work email", fr: "Email professionnel" }),
    contact_phone: t("contact.fields.phone", { en: "Phone (optional)", fr: "Téléphone (facultatif)" }),
    contact_country: t("contact.fields.country", { en: "Country", fr: "Pays" }),
    current_erp: t("contact.fields.erp", { en: "Current ERP (optional)", fr: "ERP actuel (facultatif)" }),
    project_type: t("contact.fields.type", { en: "Project type", fr: "Type de projet" }),
    project_stage: t("contact.fields.stage", { en: "Project stage", fr: "Étape du projet" }),
    project_brief: t("contact.fields.brief", { en: "What needs to change?", fr: "Qu’est-ce qui doit changer ?" }),
  };

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
    title: `${t("pages.contact.contact-page.start-a-project-908ad4", { en: "Start a project", fr: "Démarrer un projet" })} — Prosperya`,
    description: t("pages.contact.contact-page.outline-your-erp-transformation-integration-or-automation-be5fb5", { en: "Outline your ERP transformation, integration or automation project with Prosperya.", fr: "Préparez votre projet de transformation ERP, d’intégration ou d’automatisation avec Prosperya." }),
  });
  const errorCopy = { required: t("pages.contact.contact-page.this-field-is-required-b64844", { en: "This field is required.", fr: "Ce champ est obligatoire." }), invalid_email: t("pages.contact.contact-page.enter-a-valid-email-address-e89bf5", { en: "Enter a valid email address.", fr: "Saisissez une adresse email valide." }), invalid_option: t("pages.contact.contact-page.choose-an-option-from-the-list-f37800", { en: "Choose an option from the list.", fr: "Choisissez une option de la liste." }), too_long: t("pages.contact.contact-page.the-text-exceeds-the-allowed-length-47d0c5", { en: "The text exceeds the allowed length.", fr: "Le texte dépasse la longueur autorisée." }) };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!submissionsEnabled || submitLock.current || optionsPending || optionsError) return;
    const payload = normalizeProjectInquiry(
      Object.fromEntries(new FormData(event.currentTarget)),
      locale,
    );
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
      onSettled: () => { submitLock.current = false; },
    });
  };
  const renderField = (field) => {
    const choices = field.name === "project_type" ? options?.project_types : options?.project_stages;
    const selected = selections[locale]?.[field.name];
    if (field.options && (!submissionsEnabled || optionsError)) return null;
    if (field.options && optionsPending) {
      return <div key={field.name} className={styles.field} role="status" aria-label={t("pages.contact.contact-page.loading-options-725b1f", { en: "Loading options", fr: "Chargement des options" })} aria-busy="true">
        <Skeleton width="40%" height={16} />
        <Skeleton height={48} className={styles.skeletonSelect} />
      </div>;
    }
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
            placeholder={t("pages.contact.contact-page.select-one-7658c9", { en: "Select one", fr: "Sélectionnez" })}
            nothingFoundMessage={t("pages.contact.contact-page.no-options-available-39ed06", { en: "No options available", fr: "Aucune option disponible" })}
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
    [t("pages.contact.contact-page.about-you-d40b5d", { en: "About you", fr: "Vous" }), inquiryFields.slice(0, split)],
    [t("pages.contact.contact-page.your-project-fb792b", { en: "Your project", fr: "Votre projet" }), inquiryFields.slice(split)],
  ];
  const steps = [[t("pages.contact.contact-page.your-brief-b39c64", { en: "Your brief", fr: "Votre brief" }), t("pages.contact.contact-page.context-goals-and-constraints-in-a-few-16b819", { en: "Context, goals and constraints — in a few minutes.", fr: "Contexte, objectifs, contraintes — en quelques minutes." })], [t("pages.contact.contact-page.a-first-conversation-f7708b", { en: "A first conversation", fr: "Une première conversation" }), t("pages.contact.contact-page.with-an-architect-not-a-sales-script-df646e", { en: "With an architect, not a sales script.", fr: "Avec un architecte, pas un commercial." })], [t("pages.contact.contact-page.a-clear-next-step-cd6efa", { en: "A clear next step", fr: "Une suite claire" }), t("pages.contact.contact-page.what-is-worth-changing-and-in-what-5f2545", { en: "What is worth changing, and in what order.", fr: "Ce qui mérite d’être changé, et dans quel ordre." })]];
  return (
    <>
      <Section className={styles.contactSection}>
        <div className={styles.layout}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              {t("pages.contact.contact-page.start-a-project-908ad4", { en: "Start a project", fr: "Démarrer un projet" })}
            </p>
            <RevealText as="h1" onLoad key={locale}>
              {t("pages.contact.contact-page.let-s-architect-what-comes-next-7eed29", { en: "Let’s architect what comes next.", fr: "Architecturons la suite." })}
            </RevealText>
            <p className={styles.lead}>
              {t("pages.contact.contact-page.tell-us-where-you-are-today-what-dcc1ed", { en: "Tell us where you are today, what you want to achieve and the constraints that matter.", fr: "Dites-nous où vous en êtes, ce que vous voulez atteindre et les contraintes qui comptent." })}
            </p>
            <ol className={styles.steps}>
              {steps.map(([title, text], index) => (
                <li key={title}>
                  <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className={styles.notice}>
              <ShieldCheck size={16} strokeWidth={1.5} aria-hidden="true" />
              {submissionsEnabled
                ? (t("pages.contact.contact-page.your-project-brief-will-be-sent-to-5b9461", { en: "Your project brief will be sent to Prosperya.", fr: "Votre demande sera transmise à Prosperya." }))
                : (t("pages.contact.contact-page.project-enquiries-are-temporarily-unavailable-6ce5fa", { en: "Project enquiries are temporarily unavailable.", fr: "L’envoi de demandes est temporairement indisponible." }))}
            </p>
          </div>
          <form
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
            <div className={styles.actions}>
              <button type="submit" className={styles.submit} disabled={!submissionsEnabled || submission.isPending || optionsPending || optionsError}>
                {submission.isPending
                  ? t("pages.contact.contact-page.sending-b7af8e", { en: "Sending…", fr: "Envoi…" })
                  : t("pages.contact.contact-page.send-project-brief-816a21", { en: "Send project brief", fr: "Envoyer mon brief" })}
                <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <span>{t("pages.contact.contact-page.about-3-minutes-fc8196", { en: "About 3 minutes", fr: "Environ 3 minutes" })}</span>
            </div>
            {submission.isSuccess && (
              <p className={styles.success} role="status">
                <CircleCheck size={18} strokeWidth={1.5} aria-hidden="true" />
                {t("pages.contact.contact-page.thank-you-your-project-brief-was-received-4a736f", { en: "Thank you, your project brief was received.", fr: "Merci, votre demande a été reçue." })}
              </p>
            )}
            {submission.isError && (
              <p className={styles.error} role="alert">
                {submission.error?.status === 429 ? t("pages.contact.contact-page.too-many-requests-please-wait-before-trying-a64b07", { en: "Too many requests. Please wait before trying again.", fr: "Trop de demandes. Réessayez dans un moment." }) : t("pages.contact.contact-page.your-brief-could-not-be-sent-your-c7d07a", { en: "Your brief could not be sent. Your information remains in the form; please try again.", fr: "Votre demande n’a pas pu être envoyée. Vos informations restent dans le formulaire." })}
              </p>
            )}
          </form>
        </div>
      </Section>
      <FrequentlyAskedQuestions data={faqs} isPending={faqsIsPending} isError={faqsIsError} refetch={faqsRefetch} />
    </>
  );
}
