import { useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { websiteApi } from "../services/websiteApi.js";
import { LocaleContext } from "../i18n/LocaleContext.jsx";

function samePath(left, right) {
  const normalize = (path) => path.split("/").map((part) => encodeURIComponent(decodeURIComponent(part))).join("/");
  try {
    return typeof left === "string" && typeof right === "string" && normalize(left) === normalize(right);
  } catch {
    return false;
  }
}

function validMetadata(data, pathname) {
  return samePath(data?.path, pathname) && typeof data.title === "string"
    && typeof data.description === "string" && typeof data.robots === "string"
    && Array.isArray(data.alternates);
}

function bootstrap(pathname) {
  try {
    const data = JSON.parse(document.getElementById("website-seo")?.textContent || "null");
    return validMetadata(data, pathname) ? data : null;
  } catch {
    return null;
  }
}

function absoluteUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

// Page signatures stay unchanged. Published backend SEO takes precedence;
// local strings are only a loading/error fallback and are never indexable.
export function useDocumentMeta({ title, description, ogTitle, ogDescription, ogType = "website", keywords, model = "SeoPage" }) {
  const { pathname } = useLocation();
  const siteName = useContext(LocaleContext)?.t("site.name") ?? "";
  const [initial] = useState(() => bootstrap(pathname));
  const initialPath = useRef(pathname);
  const navigated = useRef(false);
  const { data: metadata = null, isError, isFetching } = useQuery({
    queryKey: ["seo", pathname, model],
    queryFn: async ({ signal }) => {
      const response = await websiteApi.seo(pathname, signal, model);
      return validMetadata(response.data, pathname) ? response.data : null;
    },
    initialData: () => initial && !navigated.current && samePath(initial.path, pathname) ? initial : undefined,
    enabled: !(initial && !navigated.current && samePath(initial.path, pathname)),
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    document.getElementById("website-seo")?.remove();
    if (pathname !== initialPath.current) navigated.current = true;
  }, [pathname]);

  useEffect(() => {
    const data = !isError && !isFetching && samePath(metadata?.path, pathname) ? metadata : null;
    const locale = data?.locale || (pathname.split("/")[1] === "fr" ? "fr" : "en");
    const managed = new Set();
    const tag = (attribute, key, value) => {
      const matches = [...document.head.querySelectorAll(`meta[${attribute}="${key}"]`)];
      const element = matches.shift() || document.createElement("meta");
      matches.forEach((node) => node.remove());
      if (!value) { element.remove(); return; }
      element.setAttribute(attribute, key);
      element.content = value;
      if (!element.isConnected) document.head.append(element);
      managed.add(element);
    };
    document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach((node) => node.remove());
    const link = (rel, url, language) => {
      const href = absoluteUrl(url);
      if (!href) return;
      const element = document.createElement("link");
      element.rel = rel;
      element.href = href;
      if (language) element.hreflang = language;
      document.head.append(element);
      managed.add(element);
    };
    const pageTitle = data?.title ?? (title || siteName);
    const pageDescription = data?.description ?? (description || "");
    document.title = pageTitle;
    document.documentElement.lang = locale;
    tag("name", "description", pageDescription);
    tag("name", "keywords", data ? data.keywords : keywords);
    tag("name", "robots", data?.robots || "noindex, follow");
    tag("property", "og:title", data?.ogTitle ?? (ogTitle || pageTitle));
    tag("property", "og:description", data?.ogDescription ?? (ogDescription || pageDescription));
    tag("property", "og:type", data?.ogType || ogType);
    tag("property", "og:site_name", data?.siteName || siteName);
    tag("property", "og:locale", locale === "fr" ? "fr_FR" : "en_GB");
    tag("property", "og:url", absoluteUrl(data?.canonical));
    tag("property", "og:image", absoluteUrl(data?.ogImage));
    tag("name", "twitter:card", "summary_large_image");
    tag("name", "twitter:title", data?.ogTitle ?? pageTitle);
    tag("name", "twitter:description", data?.ogDescription ?? pageDescription);
    tag("name", "twitter:image", absoluteUrl(data?.ogImage));
    link("canonical", data?.canonical);
    for (const alternate of data?.alternates || []) {
      if (["en", "fr", "x-default"].includes(alternate.locale)) link("alternate", alternate.url, alternate.locale);
    }
    document.getElementById("website-schema")?.remove();
    if (data?.structuredData) {
      const schema = document.createElement("script");
      schema.id = "website-schema";
      schema.type = "application/ld+json";
      schema.textContent = JSON.stringify(data.structuredData);
      document.head.append(schema);
      managed.add(schema);
    }
    return () => managed.forEach((element) => element.remove());
  }, [metadata, isError, isFetching, pathname, title, description, ogTitle, ogDescription, ogType, keywords, siteName]);
}
