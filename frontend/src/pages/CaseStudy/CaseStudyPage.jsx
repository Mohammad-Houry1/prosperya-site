import { websiteApi } from "../../services/websiteApi.js";
import { caseStudyDetail } from "../../repositories/caseStudyDetail.js";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import { ArrowRight, Quote, Lock } from "lucide-react";
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

export default function CaseStudyPage() {
  const { slug } = useParams();
  const {locale, t } = useLocale();

  const { data: study = null, isLoading: studyIsLoading, isError: studyIsError, refetch: studyRefetch } = useQuery({
    queryKey: ["case-study", locale, slug],
    queryFn: async ({ signal }) => {
      try { return caseStudyDetail((await websiteApi.caseStudy(slug, locale, signal)).data); }
      catch (error) { if (error.status === 404) return null; throw error; }
    },
    enabled: Boolean(slug),
  });
  const item = study;
  useDocumentMeta({
    title: item ? `${item.name} — Prosperya` : t("pages.case-study.case-study-page.prosperya-work-1636b5", { en: "Prosperya — Work", fr: "Prosperya — Projets" }),
    description: item?.detail?.intro ?? item?.description, model: "CaseStudy",
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
        <EmptyState title={t("pages.case-study.case-study-page.case-study-not-found-c33e56", { en: "Case study not found", fr: "Cas introuvable" })} />
      </Section>
    );
  const detail = item.detail;
  const stack = item.platforms;
  const factLabels = { client: t("work.detail.client", { en: "Client", fr: "Client" }), duration: t("work.detail.duration", { en: "Duration", fr: "Durée" }) };
  const [quote, role, org] = detail.quote;
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: t("pages.case-study.case-study-page.work-2af496", { en: "Work", fr: "Projets" }), to: `/${locale}/work` },
          { label: t("pages.case-study.case-study-page.case-studies-262284", { en: "Case studies", fr: "Cas clients" }), to: `/${locale}/work` },
          { label: item.name },
        ]}
        eyebrow={t("pages.case-study.case-study-page.industry-b26ab6", { en: "Industry", fr: "Secteur" })}
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
            <PrimaryLink to={`/${locale}/contact`}>{t("pages.case-study.case-study-page.discuss-a-similar-project-a96665", { en: "Discuss a similar project", fr: "Discuter d’un projet similaire" })}</PrimaryLink>
            <PrimaryLink to={`/${locale}/work`} variant="ghost">
              {t("pages.case-study.case-study-page.all-case-studies-0baf60", { en: "All case studies", fr: "Tous les cas clients" })}
            </PrimaryLink>
          </>
        }
        extra={detail.metricsNote ? <CmsRichHtml html={detail.metricsNote} className={styles.disclaimer} /> : undefined}
        visual={
          // The case's own cover with its headline facts. The page's one Hub
          // is the "after" state of the architecture morph further down.
          <figure className={styles.heroVisual}>
            <div className={styles.heroMedia} data-reveal="image">
              <CaseVisual study={item} priority sizes="(min-width: 900px) 50vw, 100vw" />
            </div>
            {detail.heroFacts.length > 0 && <dl className={styles.facts}>
              {detail.heroFacts.map(([value, label]) => (
                <div key={`${value}-${label}`}>
                  <dt>{factLabels[label] || label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>}
          </figure>
        }
      />
      {(detail.challenge || detail.challengePoints.length > 0 || detail.glance.length > 0) && (
      <Section>
        <div className={styles.challenge}>
          <div>
            <h2 className={styles.h2}>
              {t("pages.case-study.case-study-page.the-challenge-c39e0a", { en: "The challenge", fr: "Le défi" })}
            </h2>
            <CmsRichHtml className={styles.body} html={detail.challenge} />
            <ul className={styles.bullets}>
              {detail.challengePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          {detail.glance.length > 0 && (<div className={styles.glance} data-reveal="card" style={{ "--i": 2 }}>
            <Eyebrow>{t("pages.case-study.case-study-page.at-a-glance-34f4be", { en: "At a glance", fr: "En un coup d’œil" })}</Eyebrow>
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
          </div>)}
        </div>
      </Section>
      )}
      {(detail.before.length > 0 || detail.after.length > 0) && (<section className={styles.architecture}>
        <PageContainer>
          <h2 className={styles.h2}>
            {t("pages.case-study.case-study-page.the-architecture-8ae880", { en: "The architecture", fr: "L’architecture" })}
          </h2>
          <ArchitectureMorph
            detail={detail}
            labels={{
              before: t("pages.case-study.case-study-page.before-926f48", { en: "Before", fr: "Avant" }),
              transform: t("pages.case-study.case-study-page.transformation-72c396", { en: "Transformation", fr: "Transformation" }),
              after: t("pages.case-study.case-study-page.after-733182", { en: "After", fr: "Après" }),
              core: t("pages.case-study.case-study-page.single-source-037416", { en: "SINGLE SOURCE", fr: "SOCLE UNIQUE" }),
              aria: t("pages.case-study.case-study-page.architecture-before-and-after-the-transformation-f26fa6", { en: "Architecture before and after the transformation", fr: "Architecture avant et après la transformation" }),
            }}
          />
        </PageContainer>
      </section>)}
      {(detail.solutionIntro || detail.features.length > 0 || stack.length > 0) && (
      <Section>
        <div className={styles.solution}>
          <div>
            <h2 className={styles.h2}>
              {t("pages.case-study.case-study-page.the-solution-f395ce", { en: "The solution", fr: "La solution" })}
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
          {stack.length > 0 && (<div className={styles.stack} data-reveal="card" style={{ "--i": 2 }}>
            <Eyebrow>{t("pages.case-study.case-study-page.technology-stack-e21e26", { en: "Technology stack", fr: "Pile technologique" })}</Eyebrow>
            <div className={styles.stackGrid}>
              <div className={styles.stackCore}>
                <strong>{stack[0]?.name}</strong>
                <span>{t("pages.case-study.case-study-page.core-erp-e561c8", { en: "Core ERP", fr: "Socle ERP" })}</span>
              </div>
              <ul>
                {stack.slice(1).map((platform) => (
                  <li key={platform.id}>
                    {platform.name}
                    <span>{platform.category}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className={styles.secure}>
              <Lock size={14} strokeWidth={1.6} aria-hidden="true" />
              {t("pages.case-study.case-study-page.secure-scalable-connected-7ae226", { en: "Secure. Scalable. Connected.", fr: "Sûr. Évolutif. Connecté." })}
            </p>
          </div>)}
        </div>
      </Section>
      )}
      {(detail.outcomeIntro || detail.outcomes.length > 0 || quote) && (
      <Section>
        <div className={styles.outcome}>
          <div>
            <h2 className={styles.h2}>
              {t("pages.case-study.case-study-page.the-outcome-4d35d7", { en: "The outcome", fr: "Le résultat" })}
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
          {quote && (<figure className={styles.quote} data-reveal="card" style={{ "--i": 3 }}>
            <Quote size={34} strokeWidth={1.1} aria-hidden="true" />
            <blockquote>{quote}</blockquote>
            <figcaption>
              <b>— {role}</b>
              {org}
            </figcaption>
          </figure>)}
        </div>
      </Section>
      )}
      {[...detail.sections.map((row) => ({ title: row.section_title, description: row.section_description, image: row.section_image })),
        ...detail.steps.map((row) => ({ title: row.step_title, description: row.step_description, image: row.step_image }))].map((row, index) => (
        <Section key={index}><div className={styles.solution}>
          <div>{row.title && <h2 className={styles.h2}>{row.title}</h2>}<CmsRichHtml html={row.description} className={styles.body} /></div>
          {row.image?.url && <img src={row.image.url} alt={row.image.alt || row.title || ""} loading="lazy" style={{ width: "100%", height: "auto" }} />}
        </div></Section>
      ))}
      {detail.gallery.length > 0 && <Section><div className={styles.gallery}>{detail.gallery.map((image, index) => <img key={index} src={image.url} alt={image.alt || ""} loading="lazy" />)}</div></Section>}
      {/* The Close: the next case, then one line to talk about this one. */}
      {item.next && (<Section>
        {item.next && (
          <Link to={`/${locale}/work/${item.next.slug}`} className={styles.next}>
            <div className={styles.nextMedia} data-reveal="image" aria-hidden="true">
              <CaseVisual study={item.next} />
            </div>
            <div className={styles.nextCopy}>
              <div className={styles.nextWave} aria-hidden="true">
                <SignalWave shape="rise" strands={22} particles={90} />
              </div>
              <Eyebrow>{t("pages.case-study.case-study-page.next-project-eb1dfe", { en: "Next project", fr: "Projet suivant" })}</Eyebrow>
              <h2>{item.next.name}</h2>
              <CmsRichHtml html={item.next.description} />
              <span className={styles.nextCta}>
                {t("pages.case-study.case-study-page.view-case-study-2050cc", { en: "View case study", fr: "Voir le cas client" })}
                <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
              </span>
            </div>
          </Link>
        )}
        {item.next && (
          <p className={styles.contactLine}>
            {t("pages.case-study.case-study-page.have-a-similar-project-in-mind-bbbb01", { en: "Have a similar project in mind?", fr: "Un projet comparable en tête ?" })}
            <Link to={`/${locale}/contact`}>
              {t("pages.case-study.case-study-page.talk-to-an-architect-507d4c", { en: "Talk to an architect", fr: "Parler à un architecte" })}
              <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </p>
        )}
      </Section>)}
      {/* Only case: no next case to show, so the Close is the full band with its Wave. */}
      {!item.next && (
        <CTASection
          variant="card"
          title={t("pages.case-study.case-study-page.have-a-similar-project-in-mind-bbbb01", { en: "Have a similar project in mind?", fr: "Un projet comparable en tête ?" })}
          description={t("pages.case-study.case-study-page.talk-it-through-with-an-architect-d4b031", { en: "Talk it through with an architect.", fr: "Parlez à un architecte de votre contexte." })}
        />
      )}
    </>
  );
}
