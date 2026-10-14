// Display adapters only. API response.data remains the original CMS document.
export const referenceId = value => typeof value === 'string' ? value
  : Array.isArray(value) ? (value.length === 1 ? referenceId(value[0]) : '')
    : value?._id?.$oid || value?._id || value?.id || '';
const list = value => Array.isArray(value) ? value : value ? [value] : [];
const string = value => typeof value === 'string' ? value : '';

export function localize(value, context) {
  if (Array.isArray(value)) return value.map(item => localize(item, context)).filter(item => item !== '' && item !== null);
  if (!value || typeof value !== 'object') return value;
  const { locale = 'en', language_id: languageId } = context;
  if (Object.hasOwn(value, 'en') || Object.hasOwn(value, 'fr') || Object.hasOwn(value, locale)) {
    return localize(value[locale] ?? '', context);
  }
  const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localize(item, context)]));
  const override = value.translations?.[locale] ?? value.translations?.[languageId];
  if (override && typeof override === 'object') {
    for (const [key, item] of Object.entries(override)) result[key] = localize(item, context);
  }
  if (value.id || value._id) result.id = referenceId(value);
  if (typeof result.url === 'string') {
    let url = result.url;
    if (url.startsWith('/') && !url.startsWith('//')) url = (context.cms_url || '').replace(/\/$/, '') + url;
    try {
      if (!['http:', 'https:'].includes(new URL(url).protocol)) return null;
    } catch { return null; }
    result.url = url;
  }
  for (const [key, item] of Object.entries(result)) {
    if ((key.endsWith('_image') || key === 'avatar') && typeof item === 'string') {
      result[key] = localize({ url: item }, context);
    }
    if (key.endsWith('_gallery') && Array.isArray(item)) {
      result[key] = item.map(media => localize(typeof media === 'string' ? { url: media } : media, context)).filter(Boolean);
    }
  }
  return result;
}

function plainText(value) {
  if (typeof document === 'undefined') return string(value).replace(/<[^>]*>/g, '');
  const element = document.createElement('div');
  element.innerHTML = string(value);
  return element.textContent || '';
}

export function displayRecord(raw, kind, context = {}) {
  const row = localize(raw, context);
  if (!row || typeof row !== 'object') return row;
  // Preserve every authored field; add only aliases consumed by existing layouts.
  row.seo ??= { title: string(row.meta_title), description: string(row.meta_description), keywords: string(row.meta_keywords),
    url: string(row.meta_url), type: string(row.meta_type), robots: row.noindex ? 'noindex, follow' : 'index, follow' };
  if (kind === 'articles') Object.assign(row, { title: row.article_title ?? row.title ?? '',
    excerpt: row.article_small_description ?? row.excerpt ?? '', body: row.article_description ?? row.body ?? '',
    category_id: referenceId(raw.article_category) || row.category_id });
  if (kind === 'corporate-pages') {
    row.sections = list(row.sections).map(section => ({ ...section, image: section.section_image ?? section.image }));
  }
  if (kind === 'platforms' && row.logo_image && !row.logo_image.alt) row.logo_image.alt = row.name || '';
  if (kind === 'testimonials' && Object.hasOwn(raw, 'testimonial_description')) {
    row.subject = row.testimonial_subject || '';
    row.quote = plainText(row.testimonial_description);
    row.name = raw.use_existing_user ? '' : row.user_name || '';
    row.company = raw.use_existing_user ? '' : row.user_company || '';
  }
  if (kind === 'case-studies') {
    row.industry_id = referenceId(raw.industry) || string(localize(raw.case_study_industry, { ...context, locale: context.default_locale || 'en' }));
  }
  for (const field of ['expertise_animation_type', 'solution_animation_type', 'case_study_animation_type']) {
    if (Object.hasOwn(row, field) && !['network', 'workflow', 'insight', 'consolidation', 'flowing-lines'].includes(row[field])) row[field] = '';
  }
  return row;
}

export function displayLabels(records, context) {
  if (!Array.isArray(records)) return records; // Existing in-memory dictionaries also remain usable.
  return Object.fromEntries(records.filter(row => typeof row.key === 'string' && row.key).map(row => [row.key,
    typeof row.source === 'string' ? string(row.translations?.[context.locale]) : string(localize(row, context).value)]));
}

const relations = {
  expertise: { related_solutions: 'solutions', related_case_studies: 'case-studies', platforms: 'platforms' },
  solutions: { related_expertise: 'expertise', related_case_studies: 'case-studies', related_articles: 'articles' },
  'case-studies': { related_expertise: 'expertise', related_solutions: 'solutions', platforms: 'platforms', case_study_testimonial: 'testimonials', industry: 'industries' },
  pages: { about_users: 'users' }, 'corporate-pages': { about_users: 'users' },
  testimonials: { user: 'users' },
};

export async function displayResponse(payload, kind, context, lookup, signal, resolveRelations = true) {
  if (kind === 'search') {
    const sources = { expertise: ['expertise_detail_title', 'expertise_title', 'expertise_summary'],
      solutions: ['solution_title', 'solution_description'], work: ['case_study_title', 'case_study_summary'],
      insights: ['article_title', 'article_small_description'] };
    return { ...payload, view: payload.data.map(({ type, record }) => {
      const row = localize(record, context);
      const fields = sources[type] || [];
      return { ...row, type, title: fields.slice(0, -1).map(field => string(row[field])).find(value => value.trim()) || '',
        summary: plainText(row[fields.at(-1)]).replace(/\s+/g, ' ').trim().slice(0, 220),
        href: `/${context.locale}/${type}/${encodeURIComponent(row.slug)}` };
    }) };
  }
  if (kind === 'labels') return { ...payload, view: displayLabels(payload.data, context) };
  if (kind === 'contact/options') {
    return { ...payload, view: localize(payload.data, context) };
  }
  const records = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
  const views = records.map(row => displayRecord(row, kind, context));
  if (kind === 'corporate-pages' && Object.hasOwn(payload, 'users') && views[0]) {
    views[0].about_users = (payload.users || []).map(user => displayRecord(user, 'users', context));
  }
  if (kind === 'faqs') {
    for (let i = 0; i < views.length; i++) {
      const row = views[i];
      const linked = (payload.answers || []).filter(answer => referenceId(answer.question) === row.id)
        .map(answer => string(localize(answer, context).content)).filter(value => value.trim()).join('\n');
      if (!Object.hasOwn(records[i], 'answer')) {
        row.question = records[i].is_question === true ? row.content || row.name || '' : row.name || '';
        row.answer = records[i].is_question === true ? linked : row.content || linked;
      }
      row.category_id ??= referenceId(records[i].faq_category);
    }
  }
  if (resolveRelations) await Promise.all(Object.entries(relations[kind] || {}).map(async ([field, target]) => {
    if (field === 'about_users' && Object.hasOwn(payload, 'users')) return;
    const ids = [...new Set(records.flatMap(row => list(row[field]).map(referenceId)).filter(id => /^[a-f0-9]{24}$/i.test(id)))];
    if (!ids.length) return;
    const responses = [];
    for (let start = 0; start < ids.length; start += 50) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      try { responses.push(await lookup(target, ids.slice(start, start + 50), context, signal)); }
      catch (error) { if (![403, 404].includes(error.status)) throw error; }
    }
    const found = new Map(responses.flatMap(response => response.view || []).map(row => [row.id, row]));
    for (let i = 0; i < views.length; i++) {
      const selected = list(records[i][field]).map(referenceId).map(id => found.get(id)).filter(Boolean);
      if (field === 'industry') {
        if (!referenceId(records[i].industry)) continue;
        views[i].industry_record = selected[0] || null;
        views[i].industry_id = selected[0]?.id || '';
        views[i].case_study_industry = selected[0]?.name || '';
      } else if (kind === 'testimonials' && field === 'user') {
        if (records[i].use_existing_user) {
          views[i].name = selected[0]?.name || '';
          views[i].company = selected[0]?.company_name || '';
        }
      } else views[i][field] = selected;
    }
  }));
  return { ...payload, view: Array.isArray(payload.data) ? views : views[0] ?? null };
}

export const contentView = response => response.view ?? response.data;
