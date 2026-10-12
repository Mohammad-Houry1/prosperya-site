import PageContainer from "./PageContainer.jsx";
import Eyebrow from "./Eyebrow.jsx";
import PrimaryLink from "./PrimaryLink.jsx";
import SignalWave from "../visuals/SignalWave.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./CTASection.module.css";
import CmsRichHtml from "./CmsRichHtml.jsx";

/*
  The Close: the last section of a page. Its Wave moves (owner preference);
  each page writes its own title. Three
  compositions:
  band  — full-bleed luminous panel (Home, Work, integration pages)
  card  — contained panel inside the page grid (Expertise, Approach, details)
  split — quiet two-column close for editorial pages (About, Insights)
*/
export default function CTASection({
  title,
  description,
  eyebrow,
  variant = "band",
  secondary,
  showSecondButton = true,
}) {
  const {locale, t } = useLocale();

  const copy = (
    <>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className={styles.title}>
        {title ??
          (t("components.common.ctasection.ready-to-orchestrate-what-s-possible-ddda7e"))}
      </h2>
    </>
  );
  const text = (
    <CmsRichHtml className={styles.text} html={description ??
      t("components.common.ctasection.partner-with-prosperya-to-turn-complexity-into-83648d")} />
  );
  const actions = (
    <div className={styles.actions}>
      <PrimaryLink to={`/${locale}/contact`}>
        {t("components.common.ctasection.start-a-conversation-607ba9")}
      </PrimaryLink>
      {showSecondButton && <PrimaryLink
        to={`/${locale}/${secondary?.path ?? "expertise"}`}
        variant="ghost"
      >
        {secondary?.label ?? (t("components.common.ctasection.explore-our-services-8dc8aa"))}
      </PrimaryLink>}
    </div>
  );
  if (variant === "split")
    return (
      <section className={`${styles.section} ${styles.split}`}>
        <PageContainer className={styles.splitInner}>
          <div className={styles.splitWave}>
            <SignalWave shape="rise" strands={26} particles={120} />
          </div>
          <div className={styles.splitCopy}>{copy}</div>
          <div className={styles.splitSide}>
            {text}
            {actions}
          </div>
        </PageContainer>
      </section>
    );
  const panel = (
    <div className={`${styles.panel} ${styles[variant]}`}>
      <div className={styles.wave}>
        <SignalWave shape="ribbon" />
      </div>
      <div className={styles.copy}>
        {copy}
        {text}
        {actions}
      </div>
    </div>
  );
  return (
    <section className={`${styles.section} ${styles[`${variant}Section`]}`}>
      {variant === "band" ? (
        <div className={styles.bandBleed}>
          <PageContainer>{panel}</PageContainer>
        </div>
      ) : (
        <PageContainer>{panel}</PageContainer>
      )}
    </section>
  );
}
