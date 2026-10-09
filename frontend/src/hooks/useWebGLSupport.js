import { useEffect, useState } from "react";

let cachedSupport;

export function useWebGLSupport() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    if (cachedSupport === undefined) {
      let context;
      try {
        context =
          typeof window.WebGL2RenderingContext === "function"
            ? document.createElement("canvas").getContext("webgl2")
            : null;
        cachedSupport = Boolean(context);
      } catch {
        cachedSupport = false;
      } finally {
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      }
    }
    setSupported(cachedSupport);
  }, []);
  return supported;
}
