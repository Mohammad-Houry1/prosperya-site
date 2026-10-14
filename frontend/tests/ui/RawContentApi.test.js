import { afterEach, expect, test, vi } from 'vitest';
import { websiteApi } from '../../src/services/websiteApi.js';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const a = '123456789012345678901234';
const b = '223456789012345678901234';
const hidden = '323456789012345678901234';
function api(handler) {
  vi.stubGlobal('fetch', vi.fn(async url => ({ ok: true, status: 200, json: async () => handler(new URL(url, 'https://site.test')) })));
}
test('preserves full raw data and localizes only the separate frontend view', async () => {
  const record = { id: a, slug: 'raw', expertise_title: { en: 'Title', fr: 'Titre' },
    expertise_steps: [{ step_title: { fr: 'Étape' } }], extra: { nested: 42 }, expertise_image: { url: '/media/a.png', alt: { fr: 'Image' } } };
  api(() => ({ data: record, context: { locale: 'fr', cms_url: 'https://cms.test' } }));
  const response = await websiteApi.expertiseDetail('raw', 'fr');
  expect(response.data).toEqual(record);
  expect(response.view.expertise_title).toBe('Titre');
  expect(response.view.expertise_steps[0].step_title).toBe('Étape');
  expect(response.view.expertise_image).toMatchObject({ url: 'https://cms.test/media/a.png', alt: 'Image' });
  expect(response.view.extra).toEqual({ nested: 42 });
});
test('resolves selected relationships in order using public records rather than embedded snapshots', async () => {
  api(url => url.pathname === '/api/solutions/raw'
    ? { data: { id: a, slug: 'raw', related_expertise: [b, hidden, a] } }
    : { data: [{ id: a, expertise_title: { en: 'First' } }, { id: b, expertise_title: { en: 'Second' } }] });
  const response = await websiteApi.solution('raw', 'en');
  expect(response.data.related_expertise).toEqual([b, hidden, a]);
  expect(response.view.related_expertise.map(row => row.id)).toEqual([b, a]);
  expect(response.view.related_expertise[0].expertise_title).toBe('Second');
});
test('builds the label dictionary from raw translation records without changing them', async () => {
  websiteApi.labels.mockRestore();
  const records = [{ key: 'prosperya.nav.work', source: 'Work', translations: { fr: 'Projets' } }];
  api(() => ({ data: records }));
  const response = await websiteApi.labels({ locale: 'fr' });
  expect(response.data).toEqual(records);
  expect(response.view).toEqual({ 'prosperya.nav.work': 'Projets' });
});

test('applies language-ID sidecars and omits unavailable translated list items in the view', async () => {
  api(() => ({ data: { id: a, name: 'Default', translations: { langFr: { name: 'Nom' } },
    expertise_capabilities: [{ fr: 'Disponible' }, { en: 'English only' }],
    expertise_animation_type: 'unknown' }, context: { language_id: 'langFr' } }));
  const response = await websiteApi.expertiseDetail('raw', 'fr');
  expect(response.view.name).toBe('Nom');
  expect(response.view.expertise_capabilities).toEqual(['Disponible']);
  expect(response.view.expertise_animation_type).toBe('');
  expect(response.data.expertise_capabilities).toHaveLength(2);
});
test('assembles split FAQ answers from the raw answer collection without using question content as an answer', async () => {
  api(() => ({ data: [{ id: a, is_question: true, content: { fr: 'Question ?' } },
    { id: b, is_question: true, content: { fr: 'Sans réponse ?' } }],
    answers: [{ question: a, content: { fr: 'Réponse' } }, { question: a, content: { en: 'English only' } }] }));
  const response = await websiteApi.faqs({ locale: 'fr' });
  expect(response.view.map(row => [row.question, row.answer])).toEqual([['Question ?', 'Réponse'], ['Sans réponse ?', '']]);
});
test('does not use snapshot attribution when users are not publicly accessible', async () => {
  vi.stubGlobal('fetch', vi.fn(async url => url.includes('/testimonials')
    ? { ok: true, json: async () => ({ data: [{ id: a, use_existing_user: true, user: { _id: b, name: 'Stale snapshot' }, testimonial_description: '<p>Quote</p>' }] }) }
    : { ok: false, status: 404, json: async () => ({ message: 'Denied module' }) }));
  const response = await websiteApi.testimonials({ locale: 'en' });
  expect(response.view[0]).toMatchObject({ quote: 'Quote', name: '', company: '' });
});
test('keeps legacy industries when another case study has a selected Industry', async () => {
  api(url => url.pathname === '/api/case-studies' ? { data: [
    { id: a, industry: b }, { id: b, case_study_industry: { en: 'Retail', fr: 'Commerce' } },
  ] } : { data: [{ id: b, name: { fr: 'Industrie liée' } }] });
  const response = await websiteApi.caseStudies({ locale: 'fr' });
  expect(response.view[1]).toMatchObject({ industry_id: 'Retail', case_study_industry: 'Commerce' });
});
test('uses content-style label and FAQ answer translation sidecars', async () => {
  websiteApi.labels.mockRestore();
  api(url => url.pathname === '/api/labels'
    ? { data: [{ key: 'prosperya.test', value: 'Original', translations: { fr: { value: 'Valeur' } } }] }
    : { data: [{ id: a, is_question: true, content: 'Question' }],
      answers: [{ question: a, content: 'Original', translations: { fr: { content: 'Réponse' } } }] });
  expect((await websiteApi.labels({ locale: 'fr' })).view['prosperya.test']).toBe('Valeur');
  expect((await websiteApi.faqs({ locale: 'fr' })).view[0].answer).toBe('Réponse');
});
test('normalizes string gallery media while preserving the original gallery', async () => {
  api(() => ({ data: { id: a, case_study_gallery: ['/gallery.png', 'https://cdn.test/image.jpg', 'javascript:bad()'] }, context: { cms_url: 'https://cms.test' } }));
  const response = await websiteApi.caseStudy('raw', 'en');
  expect(response.view.case_study_gallery.map(media => media.url)).toEqual(['https://cms.test/gallery.png', 'https://cdn.test/image.jpg']);
  expect(response.data.case_study_gallery).toHaveLength(3);
});
test('derives search presentation from the full raw matching record', async () => {
  api(() => ({ data: [{ type: 'insights', record: { id: a, slug: 'raw', article_title: { fr: 'Titre' }, article_small_description: { fr: '<p>Résumé</p>' }, extra: 42 } }] }));
  const response = await websiteApi.search({ q: 'Titre', locale: 'fr' });
  expect(response.data[0].record.extra).toBe(42);
  expect(response.view[0]).toMatchObject({ title: 'Titre', summary: 'Résumé', href: '/fr/insights/raw', extra: 42 });
});
