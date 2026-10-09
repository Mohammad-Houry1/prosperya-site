import { websiteApi } from "../services/websiteApi.js";

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

export async function getInsights(locale, { page = 1, categoryId = "" } = {}, signal) {
  const response = await websiteApi.articles({ locale, page, per_page: 12, category_id: categoryId || undefined }, signal);
  return { items: response.data.map(mapInsight), meta: response.meta };
}

export async function getInsightBySlug(locale, slug, signal) {
  try {
    const response = await websiteApi.article(slug, locale, signal);
    return mapInsight(response.data);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function getInsightCategories(locale, signal) {
  const categories = [];
  for (let page = 1; page <= 10000; page += 1) {
    const response = await websiteApi.categories({ locale, page, per_page: 50 }, signal);
    categories.push(...response.data);
    const lastPage = response.meta?.last_page;
    if (!Number.isInteger(lastPage) || lastPage < 1) throw new Error("The CMS returned invalid category pagination.");
    if (page >= lastPage) return categories;
  }
  throw new Error("Too many CMS category pages.");
}
