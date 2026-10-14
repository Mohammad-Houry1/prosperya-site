import { render } from '../renderWithQueries.jsx';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { websiteApi } from '../../src/services/websiteApi.js';
import { LocaleContext } from '../../src/i18n/LocaleContext.jsx';
import { cmsLocale } from '../cmsFixtures.js';
import { ThemeProvider } from '../../src/theme/ThemeProvider.jsx';
import AboutPage from '../../src/pages/About/AboutPage.jsx';

beforeEach(() => {
  vi.spyOn(websiteApi, 'testimonials').mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, 'platforms').mockResolvedValue({ data: [] });
  vi.spyOn(websiteApi, 'seo').mockResolvedValue({ data: null });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function show(locale) {
  return render(<ThemeProvider><MemoryRouter initialEntries={[`/${locale}/about`]}>
    <LocaleContext.Provider value={cmsLocale(locale)}><AboutPage /></LocaleContext.Provider>
  </MemoryRouter></ThemeProvider>);
}
test.each(['en', 'fr'])('About renders Users included in the page response without a users request in %s', async locale => {
  const usersApi = vi.spyOn(websiteApi, 'users').mockResolvedValue({ data: [] });
  const fetcher = vi.fn(async url => {
    expect(new URL(url, 'https://site.test').pathname).toBe('/api/corporate-pages/about-prosperya');
    return { ok: true, status: 200, json: async () => ({
      data: { slug: 'about-prosperya', about_title: 'CMS About', about_users: ['123456789012345678901234'] },
      users: [{ id: 'person', name: { en: 'Public person', fr: 'Personne publique' },
        position: { en: 'Developer', fr: 'Développeur' }, bio: { en: '<p>Public biography</p>', fr: '<p>Biographie publique</p>' },
        avatar: { url: '/portrait.jpg', alt: { [locale]: 'CMS portrait' } } }],
      context: { locale, cms_url: 'https://cms.test' },
    }) };
  });
  vi.stubGlobal('fetch', fetcher);
  show(locale);
  expect(await screen.findByRole('heading', { name: locale === 'fr' ? 'Personne publique' : 'Public person' })).toBeInTheDocument();
  expect(screen.getByText(locale === 'fr' ? 'Développeur' : 'Developer')).toBeInTheDocument();
  expect(screen.getByText(locale === 'fr' ? 'Biographie publique' : 'Public biography')).toBeInTheDocument();
  expect(screen.getByAltText('CMS portrait')).toHaveAttribute('src', 'https://cms.test/portrait.jpg');
  expect(usersApi).not.toHaveBeenCalled();
  expect(fetcher).toHaveBeenCalledTimes(1);
});
