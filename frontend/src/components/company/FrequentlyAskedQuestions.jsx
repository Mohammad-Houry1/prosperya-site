import { Accordion } from "@mantine/core";
import Section from "../common/Section.jsx";
import Eyebrow from "../common/Eyebrow.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import CmsRichHtml from "../common/CmsRichHtml.jsx";
import { useFrequentlyAskedQuestions } from "../../queries/useCompanyStories.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import styles from "./FrequentlyAskedQuestions.module.css";

// layout "aside": heading beside one column (Contact). "columns": heading above two columns (Approach).
export default function FrequentlyAskedQuestions({ topic = "general", layout = "aside" }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const query = useFrequentlyAskedQuestions(locale, topic);
  const reduced = useReducedMotion();
  if (query.isError)
    return (
      <Section>
        <ErrorState onRetry={query.refetch} />
      </Section>
    );
  if (!query.data?.length) return null;
  const list = (items) => (
    <Accordion
      transitionDuration={reduced ? 0 : 220}
      classNames={{ item: styles.item, control: styles.control, panel: styles.panel, chevron: styles.chevron }}
    >
      {items.map((item) => (
        <Accordion.Item key={item.id} value={item.id}>
          <Accordion.Control>{item.question}</Accordion.Control>
          <Accordion.Panel><CmsRichHtml html={item.answer} imageAlt={item.question} /></Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
  const half = Math.ceil(query.data.length / 2);
  return (
    <Section>
      <div className={`${styles.layout} ${styles[layout]}`}>
        <div>
          <Eyebrow>{fr ? "Questions fréquentes" : "Frequently asked questions"}</Eyebrow>
          <h2>
            {layout === "columns"
              ? fr
                ? "Vos questions, nos réponses."
                : "Your questions, answered."
              : fr
                ? "Avant de commencer."
                : "Before we begin."}
          </h2>
          {layout !== "columns" && (
            <p>{fr ? "Quelques réponses pour avancer en confiance." : "A few answers to help you move forward with confidence."}</p>
          )}
        </div>
        {layout === "columns" ? (
          <div className={styles.columns}>
            {list(query.data.slice(0, half))}
            {list(query.data.slice(half))}
          </div>
        ) : (
          list(query.data)
        )}
      </div>
    </Section>
  );
}
