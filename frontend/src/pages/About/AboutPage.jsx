import { websiteApi } from "../../services/websiteApi.js";
import ClientCompanies from "../../components/company/ClientCompanies.jsx";
import Testimonials from "../../components/company/Testimonials.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import ResponsiveImage from "../../components/common/ResponsiveImage.jsx";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import RevealText from "../../motion/components/RevealText.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./AboutPage.module.css";

const hasText = (value) => typeof value === "string" && value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() !== "";
const rowsWithContent = (rows, fields) => (Array.isArray(rows) ? rows : []).filter((row) => row && fields.some((field) => hasText(row[field]) || row[field]?.url));

function CmsImage({ media, fallbackAlt = "", ...props }) {
  if (!media?.url) return null;
  return <ResponsiveImage src={media.url} alt={media.alt || fallbackAlt} width={media.width} height={media.height} {...props} />;
}

export default function AboutPage() {
  const { locale, t } = useLocale();
  const pageQuery = useQuery({
    queryKey: ["page", "about", locale],
    queryFn: async ({ signal }) => (await websiteApi.page("about", locale, signal)).data,
    retry: false,
  });
  const page = pageQuery.data;
  const leaders = page?.about_users || [];
  const { data: stories = [], isLoading: storiesIsLoading, isError: storiesIsError, refetch: storiesRefetch } = useQuery({
    queryKey: ["company-stories", locale],
    queryFn: async ({ signal }) => (await websiteApi.testimonials({ locale }, signal)).data || [],
  });
  const { data: platforms = [] } = useQuery({
    queryKey: ["platforms", locale],
    queryFn: async ({ signal }) => (await websiteApi.platforms({ locale }, signal)).data || [],
  });
  useDocumentMeta({ title: `${t("about.page_title")} — Prosperya`, description: "" });

  if (pageQuery.isLoading) return <PageLoader />;
  if (pageQuery.isError || !page) {
    const unavailable = pageQuery.isError ? [403, 404].includes(pageQuery.error?.status) : !page;
    return <Section><ErrorState
      title={unavailable ? t("about.unavailable_title") : undefined}
      description={unavailable ? t("about.unavailable_description") : undefined}
      onRetry={unavailable ? undefined : pageQuery.refetch}
    /></Section>;
  }

  const facts = rowsWithContent(page.about_facts, ["fact_title", "fact_value", "fact_image"]);
  const principles = rowsWithContent(page.about_principles, ["principle_title", "principle_description", "principle_image"]);
  const steps = rowsWithContent(page.about_steps, ["step_title", "step_description", "step_image"]);
  const focus = (Array.isArray(page.about_focus) ? page.about_focus : []).filter(hasText);
  const hasStory = hasText(page.about_story_title) || hasText(page.content);
  const hasWork = hasText(page.about_work_title) || hasText(page.about_work_description);

  return <>
    <section className={styles.hero}>
      <PageContainer className={`${styles.heroGrid} ${!page.cover_image?.url ? styles.singleColumn : ""}`}>
        <div>
          <Eyebrow>{t("about.eyebrow")}</Eyebrow>
          {hasText(page.about_title) && <RevealText as="h1" onLoad className={styles.title}>{page.about_title}</RevealText>}
          {hasText(page.description) && <CmsRichHtml html={page.description} className={styles.lead} />}
          <div className={styles.actions}>
            <PrimaryLink to={`/${locale}/contact`}>{t("about.start_conversation")}</PrimaryLink>
            <PrimaryLink to={`/${locale}/approach`} variant="ghost">{t("about.our_approach")}</PrimaryLink>
          </div>
        </div>
        {page.cover_image?.url && <figure className={styles.photo} data-reveal="image"><CmsImage media={page.cover_image} priority /></figure>}
      </PageContainer>
    </section>
    <ClientCompanies still />
    {(hasStory || facts.length > 0) && <Section>
      <div className={`${styles.story} ${!hasStory || facts.length === 0 ? styles.singleColumn : ""}`}>
        {hasStory && <div>
          <Eyebrow>{t("about.story_eyebrow")}</Eyebrow>
          {hasText(page.about_story_title) && <h2 className={styles.h2}>{page.about_story_title}</h2>}
          {hasText(page.content) && <CmsRichHtml html={page.content} className={styles.paragraph} />}
        </div>}
        {facts.length > 0 && <dl className={styles.facts} data-reveal="card">{facts.map((fact, index) => <div key={index} className={!fact.fact_image?.url ? styles.factText : undefined}>
          <CmsImage media={fact.fact_image} className={styles.factImage} />
          <dt>{fact.fact_title}</dt><dd>{fact.fact_value}</dd>
        </div>)}</dl>}
      </div>
    </Section>}
    {leaders.length > 0 && <Section>
      <Eyebrow>{t("about.leadership_eyebrow")}</Eyebrow>
      {leaders.map((leader) => <div className={styles.leader} key={leader.id}>
        {leader.avatar?.url ? <CmsImage media={leader.avatar} fallbackAlt={leader.name} className={styles.portrait} /> : hasText(leader.name) && <div className={styles.monogram} aria-hidden="true"><span>{leader.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span></div>}
        <div className={styles.leaderCopy}>
          {hasText(leader.name) && <h2>{leader.name}</h2>}
          {hasText(leader.position) && <p className={styles.role}>{leader.position}</p>}
          {hasText(leader.bio) && <CmsRichHtml html={leader.bio} className={styles.paragraph} />}
        </div>
      </div>)}
    </Section>}
    {principles.length > 0 && <Section>
      <Eyebrow>{t("about.principles_eyebrow")}</Eyebrow>
      <ul className={styles.principles}>{principles.map((principle, index) => <li key={index}>
        <CmsImage media={principle.principle_image} className={styles.sectionImage} />
        {hasText(principle.principle_title) && <strong>{principle.principle_title}</strong>}
        {hasText(principle.principle_description) && <CmsRichHtml html={principle.principle_description} className={styles.richSmall} />}
      </li>)}</ul>
    </Section>}
    {(platforms.length > 0 || focus.length > 0) && <Section>
      <div className={`${styles.ecosystem} ${platforms.length === 0 || focus.length === 0 ? styles.singleColumn : ""}`}>
        {platforms.length > 0 && <div>
          <Eyebrow>{t("about.platforms_eyebrow")}</Eyebrow>
          <ul className={styles.wordmarks}>{platforms.map((platform, index) => <li key={platform.id} data-reveal="card" style={{ "--i": index }}>{platform.name}</li>)}</ul>
        </div>}
        {focus.length > 0 && <div>
          <Eyebrow>{t("about.expertise_eyebrow")}</Eyebrow>
          <ul className={styles.tags}>{focus.map((item, index) => <li key={index}>{item}</li>)}</ul>
        </div>}
      </div>
    </Section>}
    {(hasWork || steps.length > 0) && <Section>
      <div className={`${styles.how} ${!hasWork || steps.length === 0 ? styles.singleColumn : ""}`}>
        {hasWork && <div>
          <Eyebrow>{t("about.how_eyebrow")}</Eyebrow>
          {hasText(page.about_work_title) && <h2 className={styles.h2}>{page.about_work_title}</h2>}
          {hasText(page.about_work_description) && <CmsRichHtml html={page.about_work_description} className={styles.paragraph} />}
          <PrimaryLink to={`/${locale}/approach`} variant="text">{t("about.explore_approach")}</PrimaryLink>
        </div>}
        {steps.length > 0 && <ol className={styles.steps}>{steps.map((step, index) => <li key={index}>
          {step.step_image?.url ? <CmsImage media={step.step_image} className={styles.sectionImage} /> : <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>}
          {hasText(step.step_title) && <h3>{step.step_title}</h3>}
          {hasText(step.step_description) && <CmsRichHtml html={step.step_description} className={styles.richSmall} />}
        </li>)}</ol>}
      </div>
    </Section>}
    <Testimonials data={stories} isLoading={storiesIsLoading} isError={storiesIsError} refetch={storiesRefetch} />
    <CTASection variant="split"
      title={t("about.cta_title")}
      description={t("about.cta_description")}
    />
  </>;
}
