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
  const fr = locale === "fr";
  const detail = study.detail || {};
  const [quote, role, company] = detail.quote || [];
  const hasChallenge = detail.challenge || detail.challengePoints?.length;
  const hasSolution = detail.solutionIntro || detail.features?.length;
  const hasArchitecture = detail.before?.length || detail.after?.length;
  const hasResults = detail.outcomeIntro || detail.outcomes?.length || quote;
  const sections = [
    hasChallenge && ["challenge", fr ? "Le défi" : "The challenge"],
    hasSolution && ["solution", fr ? "La solution" : "The solution"],
    hasArchitecture && [
      "architecture",
      fr ? "L’architecture" : "The architecture",
    ],
    hasResults && ["results", fr ? "Les résultats" : "The results"],
  ].filter(Boolean);
  return (
    <div className={styles.page} data-case-study-template="shared">
      <PageHero
        title={study.name || study.title}
        titleClassName={styles.title}
        eyebrow={detail.industryLabel || study.industryName || study.category}
        breadcrumb={[
          { label: fr ? "Projets" : "Work", to: `/${locale}/work` },
          { label: study.name || study.title },
        ]}
        lead={<p>{detail.intro || study.description}</p>}
        actions={
          <PrimaryLink to={`/${locale}/contact`} variant="text">
            {fr
              ? "Discuter d’un projet similaire"
              : "Discuss a similar project"}
          </PrimaryLink>
        }
        extra={
          <p className={styles.disclaimer}>
            {fr
              ? "Mission illustrative · résultats non vérifiés"
              : "Illustrative engagement · unverified results"}
          </p>
        }
        visual={
          <div className={styles.heroVisual} aria-hidden="true">
            <CaseVisual
              study={study}
              priority
              sizes="(min-width: 900px) 50vw, 100vw"
            />
          </div>
        }
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
              aria-label={fr ? "Dans ce projet" : "In this project"}
            >
              <span>{fr ? "Le projet" : "Project overview"}</span>
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
                  <span>{fr ? "Technologies" : "Technology stack"}</span>
                  <ul>
                    {platforms.map((platform, index) => (
                      <li key={platform.id || platform.slug}>
                        <strong>{platform.name}</strong>
                        {index === 0 && (
                          <small>
                            {fr ? "Plateforme centrale" : "Core platform"}
                          </small>
                        )}
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
                    {fr ? "Le point de départ" : "The starting point"}
                  </span>
                  <h2>{fr ? "Le défi" : "The challenge"}</h2>
                  {detail.challenge && <p>{detail.challenge}</p>}
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
                    {fr ? "Ce qui a changé" : "What changed"}
                  </span>
                  <h2>{fr ? "La solution" : "The solution"}</h2>
                  {detail.solutionIntro && <p>{detail.solutionIntro}</p>}
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
                    {fr ? "Une vue d’ensemble" : "The bigger picture"}
                  </span>
                  <h2>{fr ? "L’architecture" : "The architecture"}</h2>
                  <div className={styles.architecture}>
                    {[
                      [
                        detail.before,
                        fr ? "Avant" : "Before",
                        detail.beforeCaption,
                      ],
                      [
                        detail.after,
                        fr ? "Après" : "After",
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
                    {fr ? "L’impact" : "The impact"}
                  </span>
                  <h2>{fr ? "Les résultats" : "The results"}</h2>
                  {detail.outcomeIntro && <p>{detail.outcomeIntro}</p>}
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
                  {quote && (
                    <figure className={styles.quote}>
                      <blockquote>{quote}</blockquote>
                      <figcaption>
                        {[role, company].filter(Boolean).join(" · ")}
                        <span>
                          {fr ? "Citation illustrative" : "Illustrative quote"}
                        </span>
                      </figcaption>
                    </figure>
                  )}
                </section>
              )}
            </div>
          </div>
        )}
        {study.next && (
          <Link
            to={`/${locale}/work/${study.next.slug}`}
            className={styles.next}
          >
            <div className={styles.nextVisual} aria-hidden="true">
              <CaseVisual study={study.next} />
            </div>
            <div>
              <span>{fr ? "Projet suivant" : "Next project"}</span>
              <h2>{study.next.name || study.next.title}</h2>
              <p>{study.next.description}</p>
            </div>
            <ArrowUpRight size={28} strokeWidth={1.3} aria-hidden="true" />
          </Link>
        )}
        <CTASection
          variant="split"
          title={
            fr ? "Traçons votre parcours ensemble." : "Map your path with us."
          }
          showSecondButton={false}
          description={
            fr
              ? "Partagez vos objectifs : nous construirons une approche sur mesure pour un impact durable."
              : "Share your goals and we’ll craft a tailored approach to deliver lasting impact."
          }
        />
      </PageContainer>
    </div>
  );
}
