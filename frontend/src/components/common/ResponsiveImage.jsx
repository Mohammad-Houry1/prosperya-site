export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes,
  srcSet,
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      srcSet={srcSet}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
