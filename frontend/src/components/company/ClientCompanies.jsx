import { useState } from "react";
import { Pause, Play } from "lucide-react";
import Section from "../common/Section.jsx";
import Eyebrow from "../common/Eyebrow.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import { useCompanyStories } from "../../queries/useCompanyStories.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./CompanyStories.module.css";

/*
  The client marks. By default they form the Marquee (Home only): one endless
  strip drifting left to right, with a pause control (WCAG 2.2.2). Each half
  of the track holds the list twice so it outruns the viewport; the loop is
  seamless at -50%. Hover does not stop it; only the button does. `still`
  lays the same marks out in a static row (About).
*/
export default function ClientCompanies({ still = false }) {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const query = useCompanyStories(locale);
  const [paused, setPaused] = useState(false);
  if (query.isError) return <Section><ErrorState onRetry={query.refetch} /></Section>;
  if (query.isLoading) return <Section><div className={styles.placeholder} aria-busy="true" aria-label={fr ? "Chargement des entreprises" : "Loading companies"} /></Section>;
  const clients = query.data?.clients ?? [];
  if (!clients.length) return null;
  const mark = (client, key) => (
    <li key={key} className={styles.mark} data-mark={client.id}>
      <span className={styles.monogram} aria-hidden="true">
        {client.name.replace(/[^A-Za-z]/g, "")[0]}
      </span>
      {client.name}
    </li>
  );
  const half = (copy) => <ul>{[0, 1].flatMap((round) => clients.map((client) => mark(client, `${copy}-${round}-${client.id}`)))}</ul>;
  return (
    <Section className={styles.clients}>
      <div className={styles.intro}>
        <Eyebrow>{fr ? "À leurs côtés" : "In good company"}</Eyebrow>
        {query.data.isDemo && <p>{fr ? "Entreprises fictives · Aperçu de présentation" : "Fictional companies · Layout preview"}</p>}
        {!still && (
          <button
            type="button"
            className={styles.pause}
            onClick={() => setPaused(!paused)}
            aria-label={
              paused
                ? fr ? "Relancer les logos clients" : "Play client logos"
                : fr ? "Mettre en pause les logos clients" : "Pause client logos"
            }
          >
            {paused ? <Play size={14} strokeWidth={1.6} aria-hidden="true" /> : <Pause size={14} strokeWidth={1.6} aria-hidden="true" />}
            {paused ? (fr ? "Relancer" : "Play") : "Pause"}
          </button>
        )}
      </div>
      {still ? (
        <ul className={styles.stillRow}>{clients.map((client) => mark(client, client.id))}</ul>
      ) : (
        <>
          <ul className="visuallyHidden">
            {clients.map((client) => (
              <li key={client.id}>{client.name}</li>
            ))}
          </ul>
          <div className={styles.marquee} data-paused={paused || undefined} aria-hidden="true">
            <div className={styles.marqueeTrack}>
              {half("a")}
              {half("b")}
            </div>
          </div>
        </>
      )}
    </Section>
  );
}
