import ResponsiveImage from "../common/ResponsiveImage.jsx";
import { hasCaseStudyImage } from "./caseStudyMedia.js";

// Only authored media is rendered.
export default function CaseVisual({ study, priority = false, alt = "", sizes }) {
  if (hasCaseStudyImage(study))
    return (
      <ResponsiveImage
        src={study.image.src}
        width={study.image.width}
        height={study.image.height}
        alt={alt}
        priority={priority}
        sizes={sizes}
      />
    );
  return null;
}
