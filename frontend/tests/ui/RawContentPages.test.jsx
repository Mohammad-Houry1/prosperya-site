import { render } from '../renderWithQueries.jsx';
import { screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { websiteApi } from '../../src/services/websiteApi.js';
import { LocaleContext } from '../../src/i18n/LocaleContext.jsx';
import { cmsLocale } from '../cmsFixtures.js';
import { ThemeProvider } from '../../src/theme/ThemeProvider.jsx';
import SolutionDetailPage from '../../src/pages/SolutionDetail/SolutionDetailPage.jsx';
import ArticlePage from '../../src/pages/Article/ArticlePage.jsx';

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  vi.spyOn(websiteApi, 'seo').mockResolvedValue({ data: null });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const id = '123456789012345678901234';
function show(Page, route) {
  return render(<ThemeProvider><LocaleContext.Provider value={cmsLocale('fr')}><MemoryRouter initialEntries={[`/fr/${route}/raw`]}>
    <Routes><Route path={`/:locale/${route}/:slug`} element={<Page />} /></Routes>
  </MemoryRouter></LocaleContext.Provider></ThemeProvider>);
}
function api(handler) {
  vi.stubGlobal('fetch', vi.fn(async url => ({ ok: true, status: 200, json: async () => ({
    ...handler(new URL(url, 'https://site.test').pathname), context: { locale: 'fr', cms_url: 'https://cms.test' },
  }) })));
}
test('solution page renders raw French fields and selected expertise fetched by ID', async () => {
  api(path => path.includes('/solutions/') ? { data: { id, slug: 'raw', solution_title: { fr: 'Solution brute' },
    solution_description: { fr: '<p>Introduction CMS brute</p><script>bad()</script>' },
    solution_image: { url: '/image.png', alt: { fr: 'Image brute' } }, related_expertise: [id] } }
    : { data: path === '/api/expertise' ? [{ id, slug: 'skill', expertise_title: { fr: 'Expertise liée' } }] : [] });
  const view = show(SolutionDetailPage, 'solutions');
  expect(await screen.findByText('Introduction CMS brute')).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'Expertise liée' })).toBeInTheDocument();
  expect(screen.getByAltText('Image brute')).toHaveAttribute('src', 'https://cms.test/image.png');
  expect(view.container.querySelector('script')).toBeNull();
});
test('article page reads raw article body, title and localized category', async () => {
  api(path => path === '/api/articles/raw' ? { data: { id, slug: 'raw', article_title: { fr: 'Article brut' },
    article_description: { fr: '<p>Corps CMS brut</p>' }, article_category: id } }
    : { data: path === '/api/article-categories' ? [{ id, name: { fr: 'Catégorie brute' } }] : [] });
  show(ArticlePage, 'insights');
  expect(await screen.findByText('Corps CMS brut')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Article brut' })).toBeInTheDocument();
  expect(screen.getAllByText('Catégorie brute').length).toBeGreaterThan(0);
});
