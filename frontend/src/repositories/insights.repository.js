
function image(media) {
  return media?.url ? { src: media.url, alt: media.alt || "", width: media.width || undefined, height: media.height || undefined } : null;
}

export function mapInsight(article) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body || "",
    categoryId: article.category_id,
    featured: article.featured,
    publishedAt: article.published_at,
    image: image(article.cover_image),
    metaImage: image(article.meta_image),
    seo: article.seo,
  };
}
