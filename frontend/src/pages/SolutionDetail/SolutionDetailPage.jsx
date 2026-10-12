import { websiteApi } from "../../services/websiteApi.js";
import {
  adaptExpertise,
  adaptSolution,
  adaptCaseStudy,
} from "../../repositories/marketing.repository.js";
import { useRef } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHero from "../../components/common/PageHero.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import Section from "../../components/common/Section.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import CapabilityCard from "../../components/expertise/CapabilityCard.jsx";
import CaseVisual from "../../components/case-study/CaseVisual.jsx";
import SolutionMetaphor from "../../components/visuals/SolutionMetaphor.jsx";
import AnimatedCounter from "../../motion/components/AnimatedCounter.jsx";
import ContentLinks from "../../components/sections/ContentLinks.jsx";
import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import { useQuery } from "@tanstack/react-query";
import { useHeroProgress } from "../../motion/hooks/useHeroProgress.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./SolutionDetailPage.module.css";
import CmsImage from "../../components/common/CmsImage.jsx";
import CmsRichHtml from "../../components/common/CmsRichHtml.jsx";
import MarketingSections from "../../components/sections/MarketingSections.jsx";

function SolutionHero({ item, locale }) {
  const { t } = useLocale();

  const ref = useRef(null);
  const progress = useHeroProgress(ref, { intro: 0.7 });
  return (
    <div ref={ref}>
      <PageHero
        breadcrumb={[
          {
            label: t("pages.solution-detail.solution-detail-page.home-ded702"),
            to: `/${locale}`,
          },
          { label: t("nav.solutions"), to: `/${locale}/solutions` },
          { label: item.title },
        ]}
        title={item.title}
        titleClassName={styles.title}
        lead={
          <>
            {item.tagline && (
              <CmsRichHtml className={styles.tagline} html={item.tagline} />
            )}
            <CmsRichHtml html={item.description} />
          </>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/contact`}>
              {t(
                "pages.solution-detail.solution-detail-page.start-a-conversation-345cd0",
              )}
            </PrimaryLink>
            <PrimaryLink to={`/${locale}/solutions`} variant="ghost">
              {t(
                "pages.solution-detail.solution-detail-page.all-solutions-731f69",
              )}
            </PrimaryLink>
          </>
        }
        visual={
          item.animation.type ? (
            <SolutionMetaphor
              animation={item.animation}
              progressRef={progress}
              label={item.title}
            />
          ) : null
        }
      />
    </div>
  );
}

export default function SolutionDetailPage() {
  const { slug } = useParams();
  const { locale, t } = useLocale();
  const {
    data: solution = null,
    isLoading: solutionIsLoading,
    isError: solutionIsError,
    refetch: solutionRefetch,
    error: solutionError,
  } = useQuery({
    queryKey: ["solution", locale, slug],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.solution(slug, locale, signal);
      return response.data ? adaptSolution(response.data) : null;
    },
    enabled: Boolean(slug),
    retry: (count, error) =>
      error?.status !== 404 && error?.status !== 403 && count < 2,
  });
  useDocumentMeta({
    model: "Solution",
    title: solution ? `${solution.title} — Prosperya` : "Prosperya — Solutions",
    description: solution?.description,
  });
  if (solutionIsLoading) return <PageLoader />;
  if (solutionIsError && solutionError?.status === 404)
    return (
      <Section>
        <EmptyState
          title={t(
            "pages.solution-detail.solution-detail-page.solution-not-found-0f1206",
          )}
        />
      </Section>
    );
  if (solutionIsError)
    return (
      <Section>
        <ErrorState onRetry={() => solutionRefetch()} />
      </Section>
    );
  if (!solution)
    return (
      <Section>
        <EmptyState
          title={t(
            "pages.solution-detail.solution-detail-page.solution-not-found-0f1206",
          )}
        />
      </Section>
    );
  const item = solution;
  const story = item.story;
  const related = (item.related_expertise || []).map(adaptExpertise);
  const proofs = (item.related_case_studies || []).map(adaptCaseStudy);
  return (
    <>
      <SolutionHero item={item} locale={locale} />
      {item.image?.url && (
        <Section>
          <CmsImage media={item.image} />
        </Section>
      )}
      {(story.statement || story.lead) && (
        <section className={styles.statement}>
          <PageContainer>
            <Eyebrow>{item.title}</Eyebrow>
            {story.statement && (
              <h2 className={styles.statementTitle}>{story.statement}</h2>
            )}
            <CmsRichHtml html={story.lead} />
          </PageContainer>
        </section>
      )}
      {(story.frictionTitle || story.friction.length > 0) && (
        <Section>
          <div className={styles.friction}>
            <h2>{story.frictionTitle}</h2>
            <ol>
              {story.friction.map((line, index) => (
                <li key={line}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <CmsRichHtml inline html={line} />
                </li>
              ))}
            </ol>
          </div>
        </Section>
      )}
      {(item.capabilities.length > 0 || item.outcomes.length > 0) && (
        <Section className={styles.change}>
          <SectionHeader
            eyebrow={t(
              "pages.solution-detail.solution-detail-page.what-changes-dd20b5",
            )}
            title={t(
              "pages.solution-detail.solution-detail-page.concrete-capabilities-visible-outcomes-72f078",
            )}
          />
          <div
            className={
              styles.changeGrid +
              (!item.capabilities.length || !item.outcomes.length
                ? " " + styles.singleColumn
                : "")
            }
          >
            {item.capabilities.length > 0 && (
              <div className={styles.changeColumn} data-reveal="card">
                <span>
                  {t(
                    "pages.solution-detail.solution-detail-page.what-we-put-in-place-370fb3",
                  )}
                </span>
                <ul className={styles.checks}>
                  {item.capabilities.map((capability) => (
                    <li key={capability}>
                      <CircleCheck
                        size={18}
                        strokeWidth={1.4}
                        aria-hidden="true"
                      />
                      <CmsRichHtml inline html={capability} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.outcomes.length > 0 && (
              <div
                className={styles.changeColumn}
                data-reveal="card"
                style={{ "--i": 2 }}
              >
                <span>
                  {t(
                    "pages.solution-detail.solution-detail-page.what-you-can-expect-508821",
                  )}
                </span>
                <ul className={styles.outcomes}>
                  {item.outcomes.map(([image, text, description], index) => (
                    <li key={index} data-has-image={Boolean(image?.url)}>
                      {image?.url && (
                        <i>
                          <CmsImage media={image} />
                        </i>
                      )}
                      <div className={styles.outcomeCopy}>
                        {text && <CmsRichHtml inline html={text} />}
                        {description && (
                          <CmsRichHtml
                            className={styles.outcomeDescription}
                            html={description}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}
      {proofs.map((proof) => (
        <Section key={proof.id}>
          <article
            className={
              styles.proof + (!proof.image ? " " + styles.singleColumn : "")
            }
          >
            {proof.image && (
              <div
                className={styles.proofMedia}
                data-reveal="image"
                aria-hidden="true"
              >
                <CaseVisual study={proof} />
              </div>
            )}
            <div className={styles.proofCopy}>
              <Eyebrow>
                {t(
                  "pages.solution-detail.solution-detail-page.in-practice-bf2d3c",
                )}
              </Eyebrow>
              <h2>{proof.name}</h2>
              {proof.description && (
                <CmsRichHtml
                  className={styles.proofSummary}
                  html={proof.description}
                />
              )}
              <dl className={styles.proofMetrics}>
                {proof.metrics.map(({ value, label }) => (
                  <div key={label}>
                    <dd>
                      <AnimatedCounter value={value} />
                    </dd>
                    <dt>{label}</dt>
                  </div>
                ))}
              </dl>
              <CmsRichHtml
                className={styles.note}
                html={proof.detail.metricsNote}
              />
              <Link
                className={styles.proofLink}
                to={`/${locale}/work/${proof.slug}`}
              >
                {t(
                  "pages.solution-detail.solution-detail-page.read-the-case-study-c265da",
                )}
                <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </Section>
      ))}
      {related.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow={t(
              "pages.solution-detail.solution-detail-page.capabilities-behind-the-solution-a492e7",
            )}
            title={t(
              "pages.solution-detail.solution-detail-page.what-makes-it-work-f49d2d",
            )}
          />
          <div className={styles.cards}>
            {related.map((cap, index) => (
              <CapabilityCard
                key={cap.id}
                capability={cap}
                locale={locale}
                index={index}
                heading="detail"
              />
            ))}
          </div>
        </Section>
      )}
      <MarketingSections
        sections={item.sections}
        metrics={story.metrics.map(([value, label]) => ({ value, label }))}
        note={story.metricsNote}
      />
      <ContentLinks
        title={t("nav.insights")}
        items={item.related_articles}
        field="title"
        route="insights"
      />
      <CTASection
        variant="band"
        title={t("solutions.detail_cta_title", {
          solution: item.title.toLowerCase(),
        })}
        description={t(
          "pages.solution-detail.solution-detail-page.start-with-the-friction-that-costs-you-df2223",
        )}
        secondary={{
          path: "solutions",
          label: t(
            "pages.solution-detail.solution-detail-page.all-solutions-731f69",
          ),
        }}
      />
    </>
  );
}
