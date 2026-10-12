import DOMPurify from "dompurify";
import styles from "./CmsRichHtml.module.css";

export default function CmsRichHtml({ html = "", className, imageAlt = "Content image", inline = false }) {
  const fragment = DOMPurify.sanitize(html || "", { USE_PROFILES: { html: true }, RETURN_DOM_FRAGMENT: true });
  fragment.querySelectorAll("img").forEach((image) => {
    image.setAttribute("loading", "lazy");
    if (!image.hasAttribute("alt")) image.setAttribute("alt", imageAlt);
  });
  const container = document.createElement("div");
  if (inline) {
    // Compact copy often lives inside a link or list item. Preserve word
    // boundaries while removing block wrappers and embedded interactive links.
    fragment.querySelectorAll("p, div, li, blockquote, pre, h1, h2, h3, h4, h5, h6, tr").forEach(node => node.append(" "));
  }
  container.append(fragment);
  const clean = inline ? DOMPurify.sanitize(container.innerHTML, {
    ALLOWED_TAGS: ["strong", "b", "em", "i", "u", "s", "small", "sub", "sup", "mark", "code", "br", "span"],
    ALLOWED_ATTR: [],
  }).trim() : container.innerHTML;
  const Element = inline ? "span" : "div";
  return <Element className={`${inline ? styles.inline : styles.block}${className ? ` ${className}` : ""}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
