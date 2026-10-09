import DOMPurify from "dompurify";

export default function CmsRichHtml({ html = "", className, imageAlt = "Content image" }) {
  const fragment = DOMPurify.sanitize(html || "", { USE_PROFILES: { html: true }, RETURN_DOM_FRAGMENT: true });
  fragment.querySelectorAll("img").forEach((image) => {
    image.setAttribute("loading", "lazy");
    if (!image.hasAttribute("alt")) image.setAttribute("alt", imageAlt);
  });
  const container = document.createElement("div");
  container.append(fragment);
  const clean = container.innerHTML;
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
