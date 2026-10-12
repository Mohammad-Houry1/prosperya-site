import { useLocale } from "../../i18n/LocaleContext.jsx";
import Skeleton from "../feedback/Skeleton.jsx";

// The shell stays mounted; only CMS text waits for its dictionary.
export default function ShellLabel({ name, width = 72 }) {
  const { t, labelsLoading, labelsError } = useLocale();
  if (labelsLoading) return <Skeleton width={width} height={14} />;
  if (labelsError) return null;
  return t(name);
}
