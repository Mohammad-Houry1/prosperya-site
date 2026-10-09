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
import { useCaseStudy, usePlatforms } from "../../queries/useContentQueries.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import styles from "./CaseStudyPage.module.css";

export default function CaseStudyPage() {
  const { slug } = useParams();
  const { locale } = useLocale();
  const fr = locale === "fr";
  const study = useCaseStudy(locale, slug);
  const platforms = usePlatforms(locale);
  const item = study.data;
  useDocumentMeta({
    title: item ? `${item.name} — Prosperya` : fr ? "Prosperya — Projets" : "Prosperya — Work",
    description: item?.detail?.intro ?? item?.description,
  });
  if (study.isLoading) return <PageLoader />;
  if (study.isError)
    return (
      <Section>
        <ErrorState onRetry={() => study.refetch()} />
      </Section>
    );
  if (!item || !item.detail)
    return (
      <Section>
        <EmptyState title={fr ? "Cas introuvable" : "Case study not found"} />
      </Section>
    );
  const detail = item.detail;
  const stack = (platforms.data ?? []).filter((p) => item.platformIds.includes(p.id) && p.id !== "netsuite");
  const [quote, role, org] = detail.quote;
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: fr ? "Projets" : "Work", to: `/${locale}/work` },
          { label: fr ? "Cas clients" : "Case studies", to: `/${locale}/work` },
          { label: item.name },
        ]}
        eyebrow={fr ? "Secteur" : "Industry"}
        title={item.name}
        titleClassName={styles.title}
        lead={
          <>
            <p className={styles.industry}>{detail.industryLabel}</p>
            <p>{detail.intro}</p>
          </>
        }
        actions={
          <>
            <PrimaryLink to={`/${locale}/contact`}>{fr ? "Discuter d’un projet similaire" : "Discuss a similar project"}</PrimaryLink>
            <PrimaryLink to={`/${locale}/work`} variant="ghost">
              {fr ? "Tous les cas clients" : "All case studies"}
            </PrimaryLink>
          </>
        }
        extra={<p className={styles.disclaimer}>{fr ? "Mission illustrative · résultats non vérifiés" : "Illustrative engagement · unverified results"}</p>}
        visual={
          // The case's own cover with its headline facts. The page's one Hub
          // is the "after" state of the architecture morph further down.
          <figure className={styles.heroVisual}>
            <div className={styles.heroMedia} data-reveal="image">
              <CaseVisual study={item} priority sizes="(min-width: 900px) 50vw, 100vw" />
            </div>
            <dl className={styles.facts}>
              {detail.heroFacts.map(([value, label]) => (
                <div key={`${value}-${label}`}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </figure>
        }
      />
      <Section>
        <div className={styles.challenge}>
          <div>
            <h2 className={styles.h2}>
              {fr ? "Le défi" : "The challenge"}
            </h2>
            <p className={styles.body}>{detail.challenge}</p>
            <ul className={styles.bullets}>
              {detail.challengePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div className={styles.glance} data-reveal="card" style={{ "--i": 2 }}>
            <Eyebrow>{fr ? "En un coup d’œil" : "At a glance"}</Eyebrow>
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
      <section className={styles.architecture}>
        <PageContainer>
          <h2 className={styles.h2}>
            {fr ? "L’architecture" : "The architecture"}
          </h2>
          <ArchitectureMorph
            detail={detail}
            labels={{
              before: fr ? "Avant" : "Before",
              transform: fr ? "Transformation" : "Transformation",
              after: fr ? "Après" : "After",
              core: fr ? "SOCLE UNIQUE" : "SINGLE SOURCE",
              aria: fr ? "Architecture avant et après la transformation" : "Architecture before and after the transformation",
            }}
          />
        </PageContainer>
      </section>
      <Section>
        <div className={styles.solution}>
          <div>
            <h2 className={styles.h2}>
              {fr ? "La solution" : "The solution"}
            </h2>
            <p className={styles.body}>{detail.solutionIntro}</p>
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
            <Eyebrow>{fr ? "Pile technologique" : "Technology stack"}</Eyebrow>
            <div className={styles.stackGrid}>
              <div className={styles.stackCore}>
                <strong>NetSuite</strong>
                <span>{fr ? "Socle ERP" : "Core ERP"}</span>
              </div>
              <ul>
                {stack.map((platform) => (
                  <li key={platform.id}>
                    {platform.name}
                    <span>{platform.category}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className={styles.secure}>
              <Lock size={14} strokeWidth={1.6} aria-hidden="true" />
              {fr ? "Sûr. Évolutif. Connecté." : "Secure. Scalable. Connected."}
            </p>
          </div>
        </div>
      </Section>
      <Section>
        <div className={styles.outcome}>
          <div>
            <h2 className={styles.h2}>
              {fr ? "Le résultat" : "The outcome"}
            </h2>
            <p className={styles.body}>{detail.outcomeIntro}</p>
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
          <figure className={styles.quote} data-reveal="card" style={{ "--i": 3 }}>
            <Quote size={34} strokeWidth={1.1} aria-hidden="true" />
            <blockquote>{quote}</blockquote>
            <figcaption>
              <b>— {role}</b>
              {org}
              <em>{fr ? "Citation illustrative" : "Illustrative quote"}</em>
            </figcaption>
          </figure>
        </div>
      </Section>
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
              <Eyebrow>{fr ? "Projet suivant" : "Next project"}</Eyebrow>
              <h2>{item.next.name}</h2>
              <p>{item.next.description}</p>
              <span className={styles.nextCta}>
                {fr ? "Voir le cas client" : "View case study"}
                <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
              </span>
            </div>
          </Link>
        )}
        {item.next && (
          <p className={styles.contactLine}>
            {fr ? "Un projet comparable en tête ?" : "Have a similar project in mind?"}
            <Link to={`/${locale}/contact`}>
              {fr ? "Parler à un architecte" : "Talk to an architect"}
              <ArrowRight size={15} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </p>
        )}
      </Section>
      {/* Only case: no next case to show, so the Close is the full band with its Wave. */}
      {!item.next && (
        <CTASection
          variant="card"
          title={fr ? "Un projet comparable en tête ?" : "Have a similar project in mind?"}
          description={fr ? "Parlez à un architecte de votre contexte." : "Talk it through with an architect."}
        />
      )}
    </>
  );
}
