import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// The hardcoded reference uses each page's original title and description.
export function useDocumentMeta({ title, description, ogTitle, ogDescription, ogType = "website", keywords }) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.getElementById("website-seo")?.remove();
    document.title = title || "Prosperya";
    const tag = (attribute, key, value) => {
      const nodes = [...document.head.querySelectorAll(`meta[${attribute}="${key}"]`)];
      const node = nodes.shift() || document.createElement("meta");
      nodes.forEach((item) => item.remove());
      node.setAttribute(attribute, key);
      node.content = value || "";
      if (!node.isConnected) document.head.append(node);
    };
    tag("name", "description", description);
    tag("name", "robots", "noindex, nofollow");
    tag("name", "keywords", keywords);
    tag("property", "og:title", ogTitle || title);
    tag("property", "og:description", ogDescription || description);
    tag("property", "og:type", ogType);
    document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach((node) => node.remove());
  }, [pathname, title, description, ogTitle, ogDescription, ogType, keywords]);
}
