import { Navigate } from "react-router-dom";
export default function RootRedirect() {
  const preferred =
    typeof navigator !== "undefined" &&
    navigator.language?.toLowerCase().startsWith("fr")
      ? "fr"
      : "en";
  return <Navigate to={`/${preferred}`} replace />;
}
