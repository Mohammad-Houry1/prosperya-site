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
import CmsImage from "../../components/common/CmsImage.jsx";
import CaseStudyAnimation from "../../components/case-study/CaseStudyAnimation.jsx";
import { caseStudyAnimationShape, hasCaseStudyImage } from "../../components/case-study/caseStudyMedia.js";
import DOMPurify from "dompurify";
import styles from "./CaseStudyPage.module.css";
import CTASection from "../../components/common/CTASection.jsx";

const rows = value => Array.isArray(value) ? value : [];
const hasContent = value => {
  if (typeof value !== "string") return false;
  const fragment = DOMPurify.sanitize(value, { USE_PROFILES: { html: true }, RETURN_DOM_FRAGMENT: true });
  return Boolean(fragment.textContent.replace(/\u00a0/g, " ").trim() || fragment.querySelector("img[src]"));
};
// One template for every Case Study record; optional content controls section visibility.
export default function CaseStudyContent({ study, platforms = [], locale }) {
  const { t } = useLocale();
  const detail = study.detail || {};
  const [quote, role, company] = detail.quote || [];
  const hasQuote = typeof quote === "string" && quote.trim() !== "";
  const challengePoints = rows(detail.challengePoints).filter(hasContent);
  const features = rows(detail.features).map(feature => Array.isArray(feature) ? feature[1] : feature).filter(hasContent);
  const before = rows(detail.before).filter(hasContent);
  const after = rows(detail.after).filter(hasContent);
  const outcomes = rows(detail.outcomes).filter(row => Array.isArray(row) && row.some(hasContent));
  const facts = rows(detail.heroFacts).filter(row => Array.isArray(row) && row.some(hasContent));
  const hasChallenge = hasContent(detail.challenge) || challengePoints.length > 0;
  const hasSolution = hasContent(detail.solutionIntro) || features.length > 0;
  const hasArchitecture = before.length > 0 || after.length > 0;
  const hasResults = hasContent(detail.outcomeIntro) || outcomes.length > 0 || hasContent(detail.metricsNote) || hasQuote;
  const contentSections = rows(study.contentSections).filter(row => row && [row.title, row.subtitle, row.description].some(hasContent));
  const authoredTechnologies = rows(study.technologyStack).filter(row => row && (hasContent(row.name) || row.image?.url));
  const technologies = authoredTechnologies.length ? authoredTechnologies : rows(platforms).filter(row => row && (hasContent(row.name) || row.image?.url));
  const hasAnimation = Boolean(caseStudyAnimationShape(study.animationType));
  const hasImage = hasCaseStudyImage(study);
  const hasVisual = hasAnimation || hasImage;
  const hasNarrative = contentSections.length > 0 || hasChallenge || hasSolution || hasArchitecture || hasResults;
  const intro = hasContent(detail.intro) ? detail.intro : study.description;
  const sections = contentSections.filter(row => hasContent(row.title)).map(row => [row.id, row.title]).concat([
    hasChallenge && ["challenge", t("pages.case-study.case-study-page.the-challenge-c39e0a")],
    hasSolution && ["solution", t("pages.case-study.case-study-page.the-solution-f395ce")],
    hasArchitecture && [
      "architecture",
      t("pages.case-study.case-study-page.the-architecture-8ae880"),
    ],
    hasResults && ["results", t("pages.case-study.case-study-page.the-outcome-4d35d7")],
  ].filter(Boolean));
  const hasSidebar = sections.length > 0 || technologies.length > 0;
  const technologyList = technologies.length > 0 && (
    <div className={styles.platforms}>
      <span>{t("pages.case-study.case-study-page.technology-stack-e21e26")}</span>
      <ul>
        {technologies.map((platform, index) => (
          <li key={platform.id || platform.slug || index}>
            <CmsImage media={platform.image} />
            {hasContent(platform.name) && <strong>{platform.name}</strong>}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className={styles.page} data-case-study-template="shared">
      <PageHero
        className={hasVisual ? undefined : styles.textHero}
        title={study.name || study.title}
        titleClassName={styles.title}
        eyebrow={detail.industryLabel || study.industryName || study.category}
        breadcrumb={[
          { label: t("pages.case-study.case-study-page.work-2af496"), to: `/${locale}/work` },
          { label: study.name || study.title },
        ]}
        lead={(hasContent(study.chapeau) || hasContent(intro)) && <>{hasContent(study.chapeau) && <CmsRichHtml html={study.chapeau} />}{hasContent(intro) && <CmsRichHtml html={intro} />}</>}
        actions={
          <PrimaryLink to={`/${locale}/contact`} variant="text">
            {t("pages.case-study.case-study-page.discuss-a-similar-project-a96665")}
          </PrimaryLink>
        }
        visual={hasAnimation ? <div className={`${styles.heroVisual} ${styles.heroAnimation}`}><CaseStudyAnimation type={study.animationType} /></div> : hasImage && (
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
        {hasAnimation && hasImage && <div className={styles.authoredImage}><CaseVisual study={study} alt={study.image.alt || study.title} /></div>}
        {facts.length > 0 && (
          <dl className={styles.facts}>
            {facts.map(([value, label], index) => (
              <div key={index}>
                {hasContent(label) && <dt>{label}</dt>}
                {hasContent(value) && <dd>{value}</dd>}
              </div>
            ))}
          </dl>
        )}
        {hasNarrative && (
          <div className={`${styles.story} ${!hasSidebar ? styles.singleColumn : ""} ${!hasVisual ? styles.compactStory : ""}`}>
            {hasSidebar && <aside className={styles.navigation}>
            {sections.length > 0 && <nav
              className={styles.contents}
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
            </nav>}
            {technologyList}
            </aside>}
            <div className={styles.narrative}>
              {contentSections.map(section => <section key={section.id} id={`case-${section.id}`} className={styles.section}>
                {hasContent(section.title) && <h2>{section.title}</h2>}
                {hasContent(section.subtitle) && <CmsRichHtml className={styles.subtitle} html={section.subtitle} />}
                {hasContent(section.description) && <CmsRichHtml className={styles.body} html={section.description} />}
              </section>)}
              {hasChallenge && (
                <section id="case-challenge" className={styles.section}>
                  <span className={styles.sectionLabel}>
                    {t("pages.case-study.case-study-page.the-challenge-c39e0a")}
                  </span>
                  <h2>{t("pages.case-study.case-study-page.the-challenge-c39e0a")}</h2>
                  {hasContent(detail.challenge) && <CmsRichHtml className={styles.body} html={detail.challenge} />}
                  {challengePoints.length > 0 && (
                    <ul className={styles.points}>
                      {challengePoints.map((point, i) => (
                        <li key={i}><CmsRichHtml html={point} /></li>
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
                  {hasContent(detail.solutionIntro) && <CmsRichHtml className={styles.body} html={detail.solutionIntro} />}
                  {features.length > 0 && (
                    <ul className={styles.deliverables}>
                      {features.map((feature, i) => (
                        <li key={i}>
                          <span>{String(i + 1).padStart(2, "0")}</span>
                          <CmsRichHtml html={feature} />
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
                  <div className={`${styles.architecture} ${!before.length || !after.length ? styles.singleColumn : ""}`}>
                    {[
                      [
                        before,
                        t("pages.case-study.case-study-page.before-926f48"),
                        detail.beforeCaption,
                      ],
                      [
                        after,
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
                            {hasContent(caption) && <CmsRichHtml className={styles.architectureCaption} html={caption} />}
                            <ul>
                              {systems.map((system, i) => (
                                <li key={i}><CmsRichHtml inline html={system} /></li>
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
                  {hasContent(detail.outcomeIntro) && <CmsRichHtml className={styles.body} html={detail.outcomeIntro} />}
                  {outcomes.length > 0 && (
                    <dl className={styles.results}>
                      {outcomes.map(([value, label], i) => (
                        <div key={i}>
                          <dd>{value}</dd>
                          <dt>{label}</dt>
                        </div>
                      ))}
                    </dl>
                  )}
                  {hasContent(detail.metricsNote) && <CmsRichHtml className={styles.body} html={detail.metricsNote} />}
                  {hasQuote && (
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
        {!hasNarrative && technologyList && <div className={styles.standaloneStack}>{technologyList}</div>}
      </PageContainer>
      <ContentLinks title={t("nav.expertise")} items={study.related_expertise} field="expertise_title" route="expertise" />
      <ContentLinks title={t("nav.solutions")} items={study.related_solutions} field="solution_title" route="solutions" />
      <MarketingSections sections={study.sections} steps={study.implementation_steps} gallery={study.case_study_gallery} />
      {study.next && (
        <PageContainer>
          <Link
            to={`/${locale}/work/${study.next.slug}`}
            className={`${styles.next} ${!hasCaseStudyImage(study.next) ? styles.nextText : ""}`}
          >
            {hasCaseStudyImage(study.next) && <div className={styles.nextVisual} aria-hidden="true">
              <CaseVisual study={study.next} />
            </div>}
            <div>
              <span className={styles.nextEyebrow}>{t("pages.case-study.case-study-page.next-project-eb1dfe")}</span>
              <h2>{study.next.name || study.next.title}</h2>
              {hasContent(study.next.description) && <CmsRichHtml inline className={styles.nextSummary} html={study.next.description} />}
            </div>
            <ArrowUpRight size={28} strokeWidth={1.3} aria-hidden="true" />
          </Link>
        </PageContainer>
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
    </div>
  );
}
