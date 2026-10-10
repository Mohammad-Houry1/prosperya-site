import ResponsiveImage from "../common/ResponsiveImage.jsx";
import CoverArt from "../visuals/CoverArt.jsx";

// Photography when a study has it, otherwise its generative cover.
export default function CaseVisual({ study, priority = false, alt = "", sizes }) {
  if (study.image)
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
  return <CoverArt variant={study.cover} seed={study.id.length * 7} />;
}
