import FrequentlyAskedQuestions from "../../components/company/FrequentlyAskedQuestions.jsx";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleCheck, ShieldCheck } from "lucide-react";
import RevealText from "../../motion/components/RevealText.jsx";
import Section from "../../components/common/Section.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import { inquiryFields } from "../../data/projectInquiry.data.js";
import {
  normalizeProjectInquiry,
  validateProjectInquiry,
} from "../../repositories/projectInquiry.repository.js";
import { useProjectInquiry } from "../../queries/useProjectInquiry.js";
import { useContactOptions } from "../../queries/useContactOptions.js";
import styles from "./ContactPage.module.css";

export default function ContactPage() {
  const submissionsEnabled = import.meta.env?.VITE_CMS_SUBMISSIONS_ENABLED === "true";
  const { locale } = useLocale();
  const fr = locale === "fr";
  const formRef = useRef(null);
  const submitLock = useRef(false);
  const [errors, setErrors] = useState({});
  const submission = useProjectInquiry();
  const optionsQuery = useContactOptions(locale, submissionsEnabled);
  useEffect(() => {
    if (!optionsQuery.data || !formRef.current) return;
    for (const [name, choices] of [["project_type", optionsQuery.data.project_types], ["project_stage", optionsQuery.data.project_stages]]) {
      const select = formRef.current.elements.namedItem(name);
      if (select?.value && !choices.some((choice) => choice.id === select.value)) select.value = "";
    }
  }, [optionsQuery.data]);
  useDocumentMeta({
    title: `${fr ? "Démarrer un projet" : "Start a project"} — Prosperya`,
    description: fr
      ? "Préparez votre projet de transformation ERP, d’intégration ou d’automatisation avec Prosperya."
      : "Outline your ERP transformation, integration or automation project with Prosperya.",
  });
  const errorCopy = fr
    ? {
        required: "Ce champ est obligatoire.",
        invalid_email: "Saisissez une adresse email valide.",
        invalid_option: "Choisissez une option de la liste.",
        too_long: "Le texte dépasse la longueur autorisée.",
      }
    : {
        required: "This field is required.",
        invalid_email: "Enter a valid email address.",
        invalid_option: "Choose an option from the list.",
        too_long: "The text exceeds the allowed length.",
      };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!submissionsEnabled || submitLock.current || optionsQuery.isPending || optionsQuery.isError) return;
    const payload = normalizeProjectInquiry(
      Object.fromEntries(new FormData(event.currentTarget)),
      locale,
    );
    const nextErrors = validateProjectInquiry(payload, optionsQuery.data);
    setErrors(nextErrors);
    submission.reset();
    if (Object.keys(nextErrors).length) {
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    submitLock.current = true;
    submission.mutate(payload, {
      onSuccess: () => formRef.current?.reset(),
      onError: (error) => {
        if (error.status === 422) setErrors(Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])));
      },
      onSettled: () => { submitLock.current = false; },
    });
  };
  const renderField = (field) => {
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
          {field.label[locale] ?? field.label.en}
        </label>
        {field.options ? (
          <select {...attributes} key={locale} defaultValue="" disabled={optionsQuery.isPending || optionsQuery.isError}>
            <option value="" disabled>
              {fr ? "Sélectionnez" : "Select one"}
            </option>
            {(field.name === "project_type" ? optionsQuery.data?.project_types : optionsQuery.data?.project_stages)?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
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
    [fr ? "Vous" : "About you", inquiryFields.slice(0, split)],
    [fr ? "Votre projet" : "Your project", inquiryFields.slice(split)],
  ];
  const steps = fr
    ? [
        ["Votre brief", "Contexte, objectifs, contraintes — en quelques minutes."],
        ["Une première conversation", "Avec un architecte, pas un commercial."],
        ["Une suite claire", "Ce qui mérite d’être changé, et dans quel ordre."],
      ]
    : [
        ["Your brief", "Context, goals and constraints — in a few minutes."],
        ["A first conversation", "With an architect, not a sales script."],
        ["A clear next step", "What is worth changing, and in what order."],
      ];
  return (
    <>
      <Section className={styles.contactSection}>
        <div className={styles.layout}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              {fr ? "Démarrer un projet" : "Start a project"}
            </p>
            <RevealText as="h1" onLoad key={locale}>
              {fr ? "Architecturons la suite." : "Let’s architect what comes next."}
            </RevealText>
            <p className={styles.lead}>
              {fr
                ? "Dites-nous où vous en êtes, ce que vous voulez atteindre et les contraintes qui comptent."
                : "Tell us where you are today, what you want to achieve and the constraints that matter."}
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
                ? (fr ? "Votre demande sera transmise à Prosperya." : "Your project brief will be sent to Prosperya.")
                : (fr ? "L’envoi de demandes est temporairement indisponible." : "Project enquiries are temporarily unavailable.")}
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
            {submissionsEnabled && optionsQuery.isPending && <p role="status">{fr ? "Chargement des options…" : "Loading form options…"}</p>}
            {submissionsEnabled && optionsQuery.isError && <div role="alert"><p>{fr ? "Les options du formulaire sont indisponibles." : "Form options could not be loaded."}</p><button type="button" onClick={() => optionsQuery.refetch()}>{fr ? "Réessayer" : "Try again"}</button></div>}
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
              <button type="submit" className={styles.submit} disabled={!submissionsEnabled || submission.isPending || optionsQuery.isPending || optionsQuery.isError}>
                {submission.isPending
                  ? fr
                    ? "Envoi…"
                    : "Sending…"
                  : fr
                    ? "Envoyer mon brief"
                    : "Send project brief"}
                <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
              </button>
              <span>{fr ? "Environ 3 minutes" : "About 3 minutes"}</span>
            </div>
            {submission.isSuccess && (
              <p className={styles.success} role="status">
                <CircleCheck size={18} strokeWidth={1.5} aria-hidden="true" />
                {fr
                  ? "Merci, votre demande a été reçue."
                  : "Thank you, your project brief was received."}
              </p>
            )}
            {submission.isError && (
              <p className={styles.error} role="alert">
                {fr
                  ? submission.error?.status === 429 ? "Trop de demandes. Réessayez dans un moment." : "Votre demande n’a pas pu être envoyée. Vos informations restent dans le formulaire."
                  : submission.error?.status === 429 ? "Too many requests. Please wait before trying again." : "Your brief could not be sent. Your information remains in the form; please try again."}
              </p>
            )}
          </form>
        </div>
      </Section>
      <FrequentlyAskedQuestions topic="contact" />
    </>
  );
}
