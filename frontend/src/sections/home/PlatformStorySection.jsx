import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import NetSuiteFoundation from "./NetSuiteFoundation.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./HomeSections.module.css";
export default function PlatformStorySection() {
  const {locale, t } = useLocale();

  return (
    <Section>
      <div className={styles.platform}>
        <div className={styles.platformCopy}>
          <Eyebrow>{t("sections.home.platform-story-section.netsuite-at-the-core-1ead5e", { en: "NetSuite at the core", fr: "NetSuite au cœur" })}</Eyebrow>
          <h2>
            {t("sections.home.platform-story-section.built-around-netsuite-56c799", { en: "Built around NetSuite.", fr: "Construit autour de NetSuite." })}
            <span>{t("sections.home.platform-story-section.built-for-what-s-next-788213", { en: "Built for what’s next.", fr: "Pensé pour la suite." })}</span>
          </h2>
          <p>
            {t("sections.home.platform-story-section.we-design-implement-and-extend-netsuite-so-ce625b", { en: "We design, implement and extend NetSuite so your entire business ecosystem runs on one foundation.", fr: "Nous concevons, déployons et étendons NetSuite pour faire fonctionner tout l’écosystème de l’entreprise autour d’un même socle." })}
          </p>
          <PrimaryLink to={`/${locale}/expertise/netsuite-implementation`} variant="ghost">
            {t("sections.home.platform-story-section.explore-netsuite-expertise-96a2da", { en: "Explore NetSuite expertise", fr: "Notre expertise NetSuite" })}
          </PrimaryLink>
        </div>
        <NetSuiteFoundation />
      </div>
    </Section>
  );
}
