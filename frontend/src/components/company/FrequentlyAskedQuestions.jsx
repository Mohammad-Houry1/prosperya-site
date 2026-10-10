import { Accordion } from "@mantine/core";
import Section from "../common/Section.jsx";
import Eyebrow from "../common/Eyebrow.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import SectionSkeleton from "../feedback/SectionSkeleton.jsx";
import CmsRichHtml from "../common/CmsRichHtml.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import styles from "./FrequentlyAskedQuestions.module.css";

// layout "aside": heading beside one column (Contact). "columns": heading above two columns (Approach).
export default function FrequentlyAskedQuestions({ layout = "aside", data = [], isError, isPending, refetch }) {
  const { t } = useLocale();

  const reduced = useReducedMotion();
  if (isError)
    return (
      <Section>
        <ErrorState onRetry={refetch} />
      </Section>
    );
  if (isPending) return <Section><SectionSkeleton rows={3} label={t("components.company.frequently-asked-questions.loading-questions-e854d3")} /></Section>;
  if (!data?.length) return null;
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
  const half = Math.ceil(data.length / 2);
  return (
    <Section>
      <div className={`${styles.layout} ${styles[layout]}`}>
        <div>
          <Eyebrow>{t("components.company.frequently-asked-questions.frequently-asked-questions-3cbfaa")}</Eyebrow>
          <h2>
            {layout === "columns"
              ? t("components.company.frequently-asked-questions.your-questions-answered-36e33a")
              : t("components.company.frequently-asked-questions.before-we-begin-fc07af")}
          </h2>
          {layout !== "columns" && (
            <p>{t("components.company.frequently-asked-questions.a-few-answers-to-help-you-move-841b14")}</p>
          )}
        </div>
        {layout === "columns" ? (
          <div className={styles.columns}>
            {list(data.slice(0, half))}
            {list(data.slice(half))}
          </div>
        ) : (
          list(data)
        )}
      </div>
    </Section>
  );
}
