import ResponsiveImage from './ResponsiveImage.jsx';

export default function CmsImage({ media, ...props }) {
  if (!media?.url) return null;
  return <ResponsiveImage src={media.url} alt={media.alt} width={media.width} height={media.height} {...props} />;
}
