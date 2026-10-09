import { useState } from "react";
import { Pause, Play } from "lucide-react";
import Section from "../common/Section.jsx";
import Eyebrow from "../common/Eyebrow.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import { useQuery } from "@tanstack/react-query";
import { websiteApi } from "../../services/websiteApi.js";
import ResponsiveImage from "../common/ResponsiveImage.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./CompanyStories.module.css";
import SectionSkeleton from "../feedback/SectionSkeleton.jsx";

/*
  The client marks. By default they form the Marquee (Home only): one endless
  strip drifting left to right, with a pause control (WCAG 2.2.2). Each half
  of the track holds the list twice so it outruns the viewport; the loop is
  seamless at -50%. Hover does not stop it; only the button does. `still`
  lays the same marks out in a static row (About).
*/
export default function ClientCompanies({ still = false }) {
  const {locale, t } = useLocale();
  const { data: clients = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["platforms", locale],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.platforms({ locale }, signal);
      return response.data || [];
    },
  });
  const [paused, setPaused] = useState(false);
  if (isError) return <Section><ErrorState onRetry={refetch} /></Section>;
  if (isLoading) return <Section><SectionSkeleton rows={1} label={t("components.company.client-companies.loading-companies-dd40c1", { en: "Loading companies", fr: "Chargement des entreprises" })} /></Section>;
  if (!clients.length) return null;
  const mark = (client, key) => (
    <li key={key} className={styles.mark} data-mark={client.id}>
      {client.logo_image?.url ? (
        <ResponsiveImage src={client.logo_image.url} alt={t("common.company_logo", { en: "{name} logo", fr: "Logo {name}" }, { name: client.name })}
          width={client.logo_image.width || undefined} height={client.logo_image.height || undefined} className={styles.logo} />
      ) : (
        <><span className={styles.monogram} aria-hidden="true">{client.name.replace(/[^A-Za-z]/g, "")[0]}</span>{client.name}</>
      )}
    </li>
  );
  const half = (copy) => <ul>{[0, 1].flatMap((round) => clients.map((client) => mark(client, `${copy}-${round}-${client.id}`)))}</ul>;
  return (
    <Section className={styles.clients}>
      <div className={styles.intro}>
        <Eyebrow>{t("components.company.client-companies.in-good-company-2fa9e0", { en: "In good company", fr: "À leurs côtés" })}</Eyebrow>
        {!still && (
          <button
            type="button"
            className={styles.pause}
            onClick={() => setPaused(!paused)}
            aria-label={
              paused
                ? t("components.company.client-companies.play-client-logos-3af529", { en: "Play client logos", fr: "Relancer les logos clients" })
                : t("components.company.client-companies.pause-client-logos-d08e8b", { en: "Pause client logos", fr: "Mettre en pause les logos clients" })
            }
          >
            {paused ? <Play size={14} strokeWidth={1.6} aria-hidden="true" /> : <Pause size={14} strokeWidth={1.6} aria-hidden="true" />}
            {paused ? t("components.company.client-companies.play-48234e", { en: "Play", fr: "Relancer" }) : t("components.company.client-companies.pause", { en: "Pause", fr: "Pause" })}
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
