import { useLocation } from "react-router-dom";
import FailureScreen from "../components/feedback/FailureScreen.jsx";

// Keep the fallback eager: it must still work when a lazy page cannot load.
export default function RouteErrorBoundary() {
  const { pathname } = useLocation();
  const locale = pathname.split("/")[1] === "fr" ? "fr" : "en";
  return <FailureScreen locale={locale} onRetry={() => window.location.reload()} />;
}
