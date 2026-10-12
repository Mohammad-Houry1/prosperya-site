import { Suspense, useRef } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import ErrorState from "../components/feedback/ErrorState.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import PageLoader from "../components/feedback/PageLoader.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { useRevealObserver } from "../motion/useRevealObserver.js";
import ShellLabel from "../components/layout/ShellLabel.jsx";
export default function SiteLayout() {
  const { labelsLoading, labelsError, retryLabels } = useLocale();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useRevealObserver(mainRef);
  return (
    <>
      <a className="skipLink" href="#main-content">
        <ShellLabel name="common.skip_content" width={120} />
      </a>
      <SiteHeader />
      <main id="main-content" ref={mainRef}>
        <Suspense fallback={<PageLoader />}>
          {/* Keyed so every route (and locale) mounts fresh: scroll scenes, splits and reveals restart cleanly. */}
          <div key={pathname} className="page-enter">
            {labelsLoading ? <PageLoader /> : labelsError ? <ErrorState onRetry={retryLabels} /> : <Outlet />}
          </div>
        </Suspense>
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </>
  );
}
