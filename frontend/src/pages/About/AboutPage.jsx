import { Linkedin } from "lucide-react";
import ClientCompanies from "../../components/company/ClientCompanies.jsx";
import Testimonials from "../../components/company/Testimonials.jsx";
import PageContainer from "../../components/common/PageContainer.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import ResponsiveImage from "../../components/common/ResponsiveImage.jsx";
import CTASection from "../../components/common/CTASection.jsx";
import ProcessPath from "../../components/company/ProcessPath.jsx";
import SystemIcon from "../../components/system/SystemIcon.jsx";
import RevealText from "../../motion/components/RevealText.jsx";
import PageLoader from "../../components/feedback/PageLoader.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import { useCapabilities, useLeadership, usePlatforms } from "../../queries/useContentQueries.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.js";
import { aboutCopy } from "./about.copy.js";
import styles from "./AboutPage.module.css";

/*
  About is the calm room of the site: editorial type, one photograph given
  space, restrained reveals only. No system diagrams here.
*/
export default function AboutPage() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const leadership = useLeadership(locale);
  const capabilities = useCapabilities(locale);
  const platforms = usePlatforms(locale);
  const copy = aboutCopy[locale] ?? aboutCopy.en;
  useDocumentMeta({
    title: `${fr ? "À propos" : "About"} — Prosperya`,
    description: fr
      ? "Architecture d’entreprise, transformation ERP et opérations connectées, depuis Paris."
      : "Enterprise architecture, ERP transformation and connected operations, from Paris.",
  });
  if (leadership.isLoading) return <PageLoader />;
  if (leadership.isError)
    return (
      <Section>
        <ErrorState onRetry={leadership.refetch} />
      </Section>
    );
  const [leader] = leadership.data ?? [];
  return (
    <>
      <section className={styles.hero}>
        <PageContainer className={styles.heroGrid}>
          <div>
            <div>
              <Eyebrow>{copy.eyebrow}</Eyebrow>
            </div>
            <RevealText as="h1" onLoad className={styles.title}>
              {copy.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </RevealText>
            <p className={styles.lead}>
              {copy.lead}
            </p>
            <div className={styles.actions}>
              <PrimaryLink to={`/${locale}/contact`}>{fr ? "Démarrer une conversation" : "Start a conversation"}</PrimaryLink>
              <PrimaryLink to={`/${locale}/approach`} variant="ghost">
                {fr ? "Notre approche" : "Our approach"}
              </PrimaryLink>
            </div>
          </div>
          <figure className={styles.photo} data-reveal="image">
            <ResponsiveImage
              src="/images/paris-editorial.webp"
              width={1200}
              height={800}
              priority
              alt={fr ? "Vue illustrative de Paris au crépuscule" : "Illustrative view of Paris at dusk"}
            />
            <figcaption>
              <strong>{copy.caption[0]}</strong>
              <span>{copy.caption[1]}</span>
            </figcaption>
          </figure>
        </PageContainer>
      </section>
      <ClientCompanies still />
      <Section>
        <div className={styles.story}>
          <div>
            <Eyebrow>{copy.storyEyebrow}</Eyebrow>
            <h2 className={styles.h2}>
              {copy.storyTitle[0]} <br />
              {copy.storyTitle[1]}
            </h2>
            {copy.story.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          <dl className={styles.facts} data-reveal="card" style={{ "--i": 2 }}>
            {copy.facts.map(([icon, label, value]) => (
              <div key={label}>
                <SystemIcon name={icon} size={22} strokeWidth={1.3} />
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
      {leader && (
        <Section>
          <Eyebrow>{copy.leadershipEyebrow}</Eyebrow>
          <div className={styles.leader}>
            <div className={styles.monogram} aria-hidden="true" data-reveal="scale">
              <span>{leader.initials}</span>
            </div>
            <div className={styles.leaderCopy}>
              <h2>{leader.name}</h2>
              <p className={styles.role}>{leader.role}</p>
              <p>{leader.bio}</p>
              {leader.linkedin && (
                <a href={leader.linkedin} target="_blank" rel="noreferrer" className={styles.linkedin}>
                  <Linkedin size={16} aria-hidden="true" />
                  {fr ? "Profil LinkedIn" : "Connect on LinkedIn"}
                </a>
              )}
            </div>
            <div className={styles.focus} data-reveal="card" style={{ "--i": 2 }}>
              <span>{copy.focusTitle}</span>
              <ul>
                {copy.focus.map(([icon, label]) => (
                  <li key={label}>
                    <i>
                      <SystemIcon name={icon} size={20} strokeWidth={1.3} />
                    </i>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      )}
      <Section>
        <Eyebrow>{copy.principlesEyebrow}</Eyebrow>
        <ul className={styles.principles}>
          {copy.principles.map(([icon, title, text]) => (
            <li key={title}>
              <SystemIcon name={icon} size={24} strokeWidth={1.2} />
              <strong>{title}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section>
        <div className={styles.ecosystem}>
          <div>
            <Eyebrow>{copy.platformsEyebrow}</Eyebrow>
            <ul className={styles.wordmarks}>
              {(platforms.data ?? []).map((platform, index) => (
                <li key={platform.id} data-reveal="card" style={{ "--i": index }}>
                  {platform.name}
                  <span>{platform.category}</span>
                </li>
              ))}
            </ul>
            <p className={styles.note}>{copy.platformsNote}</p>
          </div>
          <div>
            <Eyebrow>{copy.expertiseEyebrow}</Eyebrow>
            <ul className={styles.tags}>
              {(capabilities.data ?? []).map((item) => (
                <li key={item.id}>{item.detailTitle}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <Section>
        <div className={styles.how}>
          <div>
            <Eyebrow>{copy.howEyebrow}</Eyebrow>
            <h2 className={styles.h2}>
              {copy.howTitle[0]} <br />
              {copy.howTitle[1]}
            </h2>
            <p className={styles.paragraph}>{copy.howText}</p>
            <PrimaryLink to={`/${locale}/approach`} variant="text">
              {fr ? "Découvrir notre approche" : "Explore our approach"}
            </PrimaryLink>
          </div>
          <ProcessPath steps={copy.how} />
        </div>
      </Section>
      <Testimonials />
      <CTASection
        variant="split"
        title={fr ? "Commençons par une conversation." : "Start with a conversation."}
        description={fr ? "Construisons les systèmes qui porteront votre prochaine étape de croissance." : "Let’s build the systems that power your next level of growth."}
      />
    </>
  );
}
