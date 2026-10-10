import { useLocale } from "../../i18n/LocaleContext.jsx";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import ContentLinks from "../../components/sections/ContentLinks.jsx";
import MarketingSections from "../../components/sections/MarketingSections.jsx";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import CaseVisual from "../../components/case-study/CaseVisual.jsx";
import styles from "./CaseStudyPage.module.css";
import CTASection from "../../components/common/CTASection.jsx";
// One template for every Case Study record; optional content controls section visibility.
export default function CaseStudyContent({ study, platforms = [], locale }) {
  const { t } = useLocale();
  const detail = study.detail || {};
  const [quote, role, company] = detail.quote || [];
  const hasChallenge = Boolean(detail.challenge || detail.challengePoints?.length);
  const hasSolution = Boolean(detail.solutionIntro || detail.features?.length);
  const hasArchitecture = Boolean(detail.before?.length || detail.after?.length);
  const hasResults = Boolean(detail.outcomeIntro || detail.outcomes?.length || detail.metricsNote || quote);
  const sections = [
    hasChallenge && ["challenge", t("pages.case-study.case-study-page.the-challenge-c39e0a")],
    hasSolution && ["solution", t("pages.case-study.case-study-page.the-solution-f395ce")],
    hasArchitecture && [
      "architecture",
      t("pages.case-study.case-study-page.the-architecture-8ae880"),
    ],
    hasResults && ["results", t("pages.case-study.case-study-page.the-outcome-4d35d7")],
  ].filter(Boolean);
  return (
    <div className={styles.page} data-case-study-template="shared">
      <PageHero
        title={study.name || study.title}
        titleClassName={styles.title}
        eyebrow={detail.industryLabel || study.industryName || study.category}
        breadcrumb={[
          { label: t("pages.case-study.case-study-page.work-2af496"), to: `/${locale}/work` },
          { label: study.name || study.title },
        ]}
        lead={<CmsRichHtml html={detail.intro || study.description} />}
        actions={
          <PrimaryLink to={`/${locale}/contact`} variant="text">
            {t("pages.case-study.case-study-page.discuss-a-similar-project-a96665")}
          </PrimaryLink>
        }
        visual={study.image && (
          <div className={styles.heroVisual} aria-hidden="true">
            <CaseVisual
              study={study}
              priority
              sizes="(min-width: 900px) 50vw, 100vw"
            />
          </div>
        )}
      />
      <PageContainer>
        {detail.heroFacts?.length > 0 && (
          <dl className={styles.facts}>
            {detail.heroFacts.map(([value, label], index) => (
              <div key={index}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {(sections.length > 0 || platforms.length > 0) && (
          <div className={styles.story}>
            <nav
              className={styles.navigation}
              aria-label={t("pages.expertise-detail.expertise-page-content.on-this-page-765502")}
            >
              <span>{t("pages.case-study.case-study-page.at-a-glance-34f4be")}</span>
              <ol>
                {sections.map(([id, title], index) => (
                  <li key={id}>
                    <a href={`#case-${id}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {title}
                    </a>
                  </li>
                ))}
              </ol>
              {platforms.length > 0 && (
                <div className={styles.platforms}>
                  <span>{t("pages.case-study.case-study-page.technology-stack-e21e26")}</span>
                  <ul>
                    {platforms.map((platform) => (
                      <li key={platform.id || platform.slug}>
                        <strong>{platform.name}</strong>

                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </nav>
            <div className={styles.narrative}>
              {hasChallenge && (
                <section id="case-challenge" className={styles.section}>
                  <span className={styles.sectionLabel}>
                    {t("pages.case-study.case-study-page.the-challenge-c39e0a")}
                  </span>
                  <h2>{t("pages.case-study.case-study-page.the-challenge-c39e0a")}</h2>
                  {detail.challenge && <CmsRichHtml className={styles.body} html={detail.challenge} />}
                  {detail.challengePoints?.length > 0 && (
                    <ul className={styles.points}>
                      {detail.challengePoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
              {hasSolution && (
                <section id="case-solution" className={styles.section}>
                  <span className={styles.sectionLabel}>
                    {t("pages.case-study.case-study-page.the-solution-f395ce")}
                  </span>
                  <h2>{t("pages.case-study.case-study-page.the-solution-f395ce")}</h2>
                  {detail.solutionIntro && <CmsRichHtml className={styles.body} html={detail.solutionIntro} />}
                  {detail.features?.length > 0 && (
                    <ul className={styles.deliverables}>
                      {detail.features.map((feature, i) => (
                        <li key={i}>
                          <span>{String(i + 1).padStart(2, "0")}</span>
                          {Array.isArray(feature) ? feature[1] : feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
              {hasArchitecture && (
                <section id="case-architecture" className={styles.section}>
                  <span className={styles.sectionLabel}>
                    {t("pages.case-study.case-study-page.the-architecture-8ae880")}
                  </span>
                  <h2>{t("pages.case-study.case-study-page.the-architecture-8ae880")}</h2>
                  <div className={styles.architecture}>
                    {[
                      [
                        detail.before,
                        t("pages.case-study.case-study-page.before-926f48"),
                        detail.beforeCaption,
                      ],
                      [
                        detail.after,
                        t("pages.case-study.case-study-page.after-733182"),
                        detail.afterCaption,
                      ],
                    ].map(
                      ([systems, title, caption]) =>
                        systems?.length > 0 && (
                          <div key={title}>
                            <h3>
                              {title}
                              <span>
                                {String(systems.length).padStart(2, "0")}
                              </span>
                            </h3>
                            {caption && <p>{caption}</p>}
                            <ul>
                              {systems.map((system, i) => (
                                <li key={i}>{system}</li>
                              ))}
                            </ul>
                          </div>
                        ),
                    )}
                  </div>
                </section>
              )}
              {hasResults && (
                <section id="case-results" className={styles.section}>
                  <span className={styles.sectionLabel}>
                    {t("pages.case-study.case-study-page.the-outcome-4d35d7")}
                  </span>
                  <h2>{t("pages.case-study.case-study-page.the-outcome-4d35d7")}</h2>
                  {detail.outcomeIntro && <CmsRichHtml className={styles.body} html={detail.outcomeIntro} />}
                  {detail.outcomes?.length > 0 && (
                    <dl className={styles.results}>
                      {detail.outcomes.map(([value, label], i) => (
                        <div key={i}>
                          <dd>{value}</dd>
                          <dt>{label}</dt>
                        </div>
                      ))}
                    </dl>
                  )}
                  {detail.metricsNote && <CmsRichHtml className={styles.body} html={detail.metricsNote} />}
                  {quote && (
                    <figure className={styles.quote}>
                      <blockquote>{quote}</blockquote>
                      <figcaption>
                        {[role, company].filter(Boolean).join(" · ")}

                      </figcaption>
                    </figure>
                  )}
                </section>
              )}
            </div>
          </div>
        )}
      </PageContainer>
      <ContentLinks title={t("nav.expertise")} items={study.related_expertise} field="expertise_title" route="expertise" />
      <ContentLinks title={t("nav.solutions")} items={study.related_solutions} field="solution_title" route="solutions" />
      <MarketingSections sections={study.sections} steps={study.implementation_steps} gallery={study.case_study_gallery} />
      <PageContainer>
        {study.next && (
          <Link
            to={`/${locale}/work/${study.next.slug}`}
            className={styles.next}
          >
            <div className={styles.nextVisual} aria-hidden="true">
              <CaseVisual study={study.next} />
            </div>
            <div>
              <span>{t("pages.case-study.case-study-page.next-project-eb1dfe")}</span>
              <h2>{study.next.name || study.next.title}</h2>
              <p>{study.next.description}</p>
            </div>
            <ArrowUpRight size={28} strokeWidth={1.3} aria-hidden="true" />
          </Link>
        )}
        <CTASection
          variant="split"
          title={
            t("pages.case-study.case-study-page.have-a-similar-project-in-mind-bbbb01")
          }
          showSecondButton={false}
          description={
            t("pages.case-study.case-study-page.talk-it-through-with-an-architect-d4b031")
          }
        />
      </PageContainer>
    </div>
  );
}
