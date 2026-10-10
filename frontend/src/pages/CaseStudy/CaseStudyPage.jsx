import { adaptCaseStudy } from "../../repositories/marketing.repository.js";
import { websiteApi } from "../../services/websiteApi.js";
import { ArrowRight, Quote } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import CaseVisual from "../../components/case-study/CaseVisual.jsx";
import ArchitectureMorph from "../../components/case-study/ArchitectureMorph.jsx";
import SignalWave from "../../components/visuals/SignalWave.jsx";
import SystemIcon from "../../components/system/SystemIcon.jsx";
import AnimatedCounter from "../../motion/components/AnimatedCounter.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./CaseStudyPage.module.css";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import ContentLinks from "../../components/sections/ContentLinks.jsx";
import MarketingSections from "../../components/sections/MarketingSections.jsx";
import CmsImage from "../../components/common/CmsImage.jsx";

export default function CaseStudyPage() {
  const { slug } = useParams();
  const {locale, t } = useLocale();

  const { data: study = null, isLoading: studyIsLoading, isError: studyIsError, refetch: studyRefetch } = useQuery({
    queryKey: ["case-study", locale, slug],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.caseStudy(slug, locale, signal);
      return response.data ? adaptCaseStudy(response.data) : null;
    },
    enabled: Boolean(slug),
  });
  const { data: studies = [] } = useQuery({
    queryKey: ["case-studies", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.caseStudies({ locale }, signal);
      return (response.data || []).map(adaptCaseStudy);
    },
  });
  const studyIndex = studies.findIndex(row => row.id === study?.id);
  const item = study ? { ...study, next: studies.length > 1 && studyIndex >= 0 ? studies[(studyIndex + 1) % studies.length] : null } : null;
  useDocumentMeta({ model: "CaseStudy",
    title: item ? `${item.name} — Prosperya` : t("pages.case-study.case-study-page.prosperya-work-1636b5"),
    description: item?.detail?.intro ?? item?.description,
  });
  if (studyIsLoading) return <PageLoader />;
  if (studyIsError)
    return (
      <Section>
        <ErrorState onRetry={() => studyRefetch()} />
      </Section>
    );
  if (!item || !item.detail)
    return (
      <Section>
        <EmptyState title={t("pages.case-study.case-study-page.case-study-not-found-c33e56")} />
      </Section>
    );
  const detail = item.detail;
  const stack = item.platforms || [];
  const [quote, role, org] = detail.quote;
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: t("pages.case-study.case-study-page.work-2af496"), to: `/${locale}/work` },
          { label: t("pages.case-study.case-study-page.case-studies-262284"), to: `/${locale}/work` },
          { label: item.name },
        ]}
        eyebrow={t("pages.case-study.case-study-page.industry-b26ab6")}
        title={item.name}
        titleClassName={styles.title}
        lead={
          <>
            <p className={styles.industry}>{detail.industryLabel}</p>
            <CmsRichHtml html={detail.intro} />
          </>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/contact`}>{t("pages.case-study.case-study-page.discuss-a-similar-project-a96665")}</PrimaryLink>
            <PrimaryLink to={`/${locale}/work`} variant="ghost">
              {t("pages.case-study.case-study-page.all-case-studies-0baf60")}
            </PrimaryLink>
          </>
        }
        visual={(item.image || detail.heroFacts.length > 0) && (
          // The case's own cover with its headline facts. The page's one Hub
          // is the "after" state of the architecture morph further down.
          <figure className={styles.heroVisual}>
            {item.image && <div className={styles.heroMedia} data-reveal="image">
              <CaseVisual study={item} priority sizes="(min-width: 900px) 50vw, 100vw" />
            </div>}
            <dl className={styles.facts}>
              {detail.heroFacts.map(([value, label]) => (
                <div key={`${value}-${label}`}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </figure>
        )}
      />
{detail.challenge || detail.challengePoints.length > 0 || detail.glance.length > 0 && (
      <Section>
        <div className={styles.challenge}>
          <div>
            <h2 className={styles.h2}>
              {t("pages.case-study.case-study-page.the-challenge-c39e0a")}
            </h2>
            <CmsRichHtml className={styles.body} html={detail.challenge} />
            <ul className={styles.bullets}>
              {detail.challengePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div className={styles.glance} data-reveal="card" style={{ "--i": 2 }}>
            <Eyebrow>{t("pages.case-study.case-study-page.at-a-glance-34f4be")}</Eyebrow>
            <ul>
              {detail.glance.map(([icon, value, label, note]) => (
                <li key={label}>
                  <SystemIcon name={icon} size={24} strokeWidth={1.2} />
                  <strong>
                    <AnimatedCounter value={value} />
                  </strong>
                  <b>{label}</b>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      )}
{detail.before.length > 0 || detail.after.length > 0 && (
      <section className={styles.architecture}>
        <PageContainer>
          <h2 className={styles.h2}>
            {t("pages.case-study.case-study-page.the-architecture-8ae880")}
          </h2>
          <ArchitectureMorph
            detail={detail}
            labels={{
              before: t("pages.case-study.case-study-page.before-926f48"),
              transform: t("pages.case-study.case-study-page.transformation-72c396"),
              after: t("pages.case-study.case-study-page.after-733182"),
              coreName: stack.map(platform => platform.name).join(" · "),
              core: t("pages.case-study.case-study-page.single-source-037416"),
              aria: t("pages.case-study.case-study-page.architecture-before-and-after-the-transformation-f26fa6"),
            }}
          />
        </PageContainer>
      </section>
      )}
{detail.solutionIntro || detail.features.length > 0 || stack.length > 0 && (
      <Section>
        <div className={styles.solution}>
          <div>
            <h2 className={styles.h2}>
              {t("pages.case-study.case-study-page.the-solution-f395ce")}
            </h2>
            <CmsRichHtml className={styles.body} html={detail.solutionIntro} />
            <ul className={styles.features}>
              {detail.features.map(([icon, text]) => (
                <li key={text}>
                  <SystemIcon name={icon} size={22} strokeWidth={1.3} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.stack} data-reveal="card" style={{ "--i": 2 }}>
            <Eyebrow>{t("pages.case-study.case-study-page.technology-stack-e21e26")}</Eyebrow>
            <div className={styles.stackGrid}>
              <ul>
                {stack.map((platform) => (
                  <li key={platform.id}>
                    {platform.name}
                    <span>{platform.category}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </Section>
      )}
{detail.outcomeIntro || detail.outcomes.length > 0 || quote && (
      <Section>
        <div className={styles.outcome}>
          <div>
            <h2 className={styles.h2}>
              {t("pages.case-study.case-study-page.the-outcome-4d35d7")}
            </h2>
            <CmsRichHtml className={styles.body} html={detail.outcomeIntro} />
            <ul className={styles.outcomes}>
              {detail.outcomes.map(([value, label]) => (
                <li key={label}>
                  <strong>
                    <AnimatedCounter value={value} />
                  </strong>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          {quote && <figure className={styles.quote} data-reveal="card" style={{ "--i": 3 }}>
            <Quote size={34} strokeWidth={1.1} aria-hidden="true" />
            <blockquote>{quote}</blockquote>
            <figcaption>
              <b>— {role}</b>
              {org}

            </figcaption>
          </figure>}
        </div>
      </Section>
      )}
      <ContentLinks title={t("nav.expertise")} items={item.related_expertise} field="expertise_title" route="expertise" />
      <ContentLinks title={t("nav.solutions")} items={item.related_solutions} field="solution_title" route="solutions" />
      <MarketingSections sections={item.sections} steps={item.implementation_steps} note={detail.metricsNote} />
      {item.case_study_gallery?.length > 0 && <Section><div className={styles.stackGrid}>{item.case_study_gallery.map((media, index) => <CmsImage key={index} media={media} />)}</div></Section>}
      {/* The Close: the next case, then one line to talk about this one. */}
      <Section>
        {item.next && (
          <Link to={`/${locale}/work/${item.next.slug}`} className={styles.next}>
            <div className={styles.nextMedia} data-reveal="image" aria-hidden="true">
              <CaseVisual study={item.next} />
            </div>
            <div className={styles.nextCopy}>
              <div className={styles.nextWave} aria-hidden="true">
                <SignalWave shape="rise" strands={22} particles={90} />
              </div>
              <Eyebrow>{t("pages.case-study.case-study-page.next-project-eb1dfe")}</Eyebrow>
              <h2>{item.next.name}</h2>
              <p>{item.next.description}</p>
              <span className={styles.nextCta}>
                {t("pages.case-study.case-study-page.view-case-study-2050cc")}
                <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
              </span>
            </div>
          </Link>
        )}
        {item.next && (
          <p className={styles.contactLine}>
            {t("pages.case-study.case-study-page.have-a-similar-project-in-mind-bbbb01")}
            <Link to={`/${locale}/contact`}>
              {t("pages.case-study.case-study-page.talk-to-an-architect-507d4c")}
              <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </p>
        )}
      </Section>
      {/* Only case: no next case to show, so the Close is the full band with its Wave. */}
      {!item.next && (
        <CTASection
          variant="card"
          title={t("pages.case-study.case-study-page.have-a-similar-project-in-mind-bbbb01")}
          description={t("pages.case-study.case-study-page.talk-it-through-with-an-architect-d4b031")}
        />
      )}
    </>
  );
}
