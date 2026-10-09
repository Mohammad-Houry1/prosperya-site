import { Suspense, useRef } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import PageLoader from "../components/feedback/PageLoader.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { useRevealObserver } from "../motion/useRevealObserver.js";
export default function SiteLayout() {
  const { t, labelsError, retryLabels } = useLocale();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useRevealObserver(mainRef);
  return (
    <>
      <a className="skipLink" href="#main-content">
        {t("common.skip_content", { en: "Skip to content", fr: "Aller au contenu" })}
      </a>
      <SiteHeader />
      {labelsError && <div role="alert" className="cms-label-alert">
        {t("common.labels_unavailable", { en: "Some translations could not be loaded.", fr: "Certaines traductions n’ont pas pu être chargées." })}
        <button type="button" onClick={retryLabels}>{t("common.retry")}</button>
      </div>}
      <main id="main-content" ref={mainRef}>
        <Suspense fallback={<PageLoader />}>
          {/* Keyed so every route (and locale) mounts fresh: scroll scenes, splits and reveals restart cleanly. */}
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  );
}
