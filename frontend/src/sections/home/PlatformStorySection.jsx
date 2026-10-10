import Section from "../../components/common/Section.jsx";
import Eyebrow from "../../components/common/Eyebrow.jsx";
import PrimaryLink from "../../components/common/PrimaryLink.jsx";
import NetSuiteFoundation from "./NetSuiteFoundation.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./HomeSections.module.css";
export default function PlatformStorySection() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  return (
    <Section>
      <div className={styles.platform}>
        <div className={styles.platformCopy}>
          <Eyebrow>{fr ? "NetSuite au cœur" : "NetSuite at the core"}</Eyebrow>
          <h2>
            {fr ? "Construit autour de NetSuite." : "Built around NetSuite."}
            <span>{fr ? "Pensé pour la suite." : "Built for what’s next."}</span>
          </h2>
          <p>
            {fr
              ? "Nous concevons, déployons et étendons NetSuite pour faire fonctionner tout l’écosystème de l’entreprise autour d’un même socle."
              : "We design, implement and extend NetSuite so your entire business ecosystem runs on one foundation."}
          </p>
          <PrimaryLink to={`/${locale}/expertise/netsuite-implementation`} variant="ghost">
            {fr ? "Notre expertise NetSuite" : "Explore NetSuite expertise"}
          </PrimaryLink>
        </div>
        <NetSuiteFoundation />
      </div>
    </Section>
  );
}
