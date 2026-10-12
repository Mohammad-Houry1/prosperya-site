import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import RootRedirect from "./RootRedirect.jsx";
import LocaleGate from "./LocaleGate.jsx";
import SiteLayout from "./SiteLayout.jsx";
import RouteErrorBoundary from "./RouteErrorBoundary.jsx";

const LegalPage = lazy(() => import("../pages/Legal/LegalPage.jsx"));
const HomePage = lazy(() => import("../pages/Home/HomePage.jsx"));
const ExpertisePage = lazy(
  () => import("../pages/Expertise/ExpertisePage.jsx"),
);
const ExpertiseDetailPage = lazy(
  () => import("../pages/ExpertiseDetail/ExpertiseDetailPage.jsx"),
);
const SolutionsPage = lazy(
  () => import("../pages/Solutions/SolutionsPage.jsx"),
);
const SolutionDetailPage = lazy(
  () => import("../pages/SolutionDetail/SolutionDetailPage.jsx"),
);
const WorkPage = lazy(() => import("../pages/Work/WorkPage.jsx"));
const CaseStudyPage = lazy(
  () => import("../pages/CaseStudy/CaseStudyPage.jsx"),
);
const ApproachPage = lazy(() => import("../pages/Approach/ApproachPage.jsx"));
const AboutPage = lazy(() => import("../pages/About/AboutPage.jsx"));
const InsightsPage = lazy(() => import("../pages/Insights/InsightsPage.jsx"));
const ArticlePage = lazy(() => import("../pages/Article/ArticlePage.jsx"));
const ContactPage = lazy(() => import("../pages/Contact/ContactPage.jsx"));
const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage.jsx"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:locale",
    element: <LocaleGate />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <SiteLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: "expertise",
            element: <ExpertisePage />,
          },
          {
            path: "expertise/:slug",
            element: <ExpertiseDetailPage />,
          },
          {
            path: "solutions",
            element: <SolutionsPage />,
          },
          {
            path: "solutions/:slug",
            element: <SolutionDetailPage />,
          },
          {
            path: "work",
            element: <WorkPage />,
          },
          {
            path: "work/:slug",
            element: <CaseStudyPage />,
          },
          {
            path: "approach",
            element: <ApproachPage />,
          },
          {
            path: "about",
            element: <AboutPage />,
          },
          {
            path: "insights",
            element: <InsightsPage />,
          },
          {
            path: "insights/:slug",
            element: <ArticlePage />,
          },
          {
            path: "contact",
            element: <ContactPage />,
          },
          {
            path: "corporate/:slug",
            element: <LegalPage />,
          },
          {
            path: "privacy-policy",
            element: <LegalPage documentId="privacy" />,
          },
          {
            path: "terms-of-use",
            element: <LegalPage documentId="terms" />,
          },
          {
            path: "cookie-policy",
            element: <LegalPage documentId="cookies" />,
          },
          {
            path: "accessibility",
            element: <LegalPage documentId="accessibility" />,
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/en" replace />,
    errorElement: <RouteErrorBoundary />,
  },
]);
