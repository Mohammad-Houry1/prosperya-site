import { Suspense, useRef } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import ErrorState from "../components/feedback/ErrorState.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import PageLoader from "../components/feedback/PageLoader.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { useRevealObserver } from "../motion/useRevealObserver.js";
export default function SiteLayout() {
  const { t, labelsLoading, labelsError, retryLabels } = useLocale();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useRevealObserver(mainRef);
  return (
    <>
      <a className="skipLink" href="#main-content">
        {t("common.skip_content")}
      </a>
      {!labelsLoading && !labelsError && <SiteHeader />}
      <main id="main-content" ref={mainRef}>
        <Suspense fallback={<PageLoader />}>
          {/* Keyed so every route (and locale) mounts fresh: scroll scenes, splits and reveals restart cleanly. */}
          <div key={pathname} className="page-enter">
            {labelsLoading ? <PageLoader /> : labelsError ? <ErrorState onRetry={retryLabels} /> : <Outlet />}
          </div>
        </Suspense>
      </main>
      {!labelsLoading && !labelsError && <SiteFooter />}
      <ScrollRestoration />
    </>
  );
}
