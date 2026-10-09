import { useEffect, useState } from "react";

// Synchronous first value (client-only app) so layouts never flash the wrong mode.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && Boolean(window.matchMedia?.(query).matches),
  );
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return undefined;
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}
