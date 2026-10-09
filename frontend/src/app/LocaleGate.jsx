import { Navigate, Outlet, useParams } from "react-router-dom";
import { LocaleProvider } from "../i18n/LocaleProvider.jsx";
import { DEFAULT_LOCALE, isSupportedLocale } from "../i18n/locale.js";

export default function LocaleGate() {
  const { locale } = useParams();
  if (!isSupportedLocale(locale)) {
    return <Navigate to={`/${DEFAULT_LOCALE}`} replace />;
  }
  return (
    <LocaleProvider>
      <Outlet />
    </LocaleProvider>
  );
}
