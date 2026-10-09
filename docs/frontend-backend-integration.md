# Frontend and backend integration

The original React frontend is now active in `frontend/`. Its pages, CSS, animations, theme, routes and interactions were preserved. Public images and icons were recovered from its previous build because the supplied project had no `public/` source folder. The duplicate import folder, unused API stubs, obsolete insight/legal/home sample data and unused query hooks have been removed.

The browser calls this website's `/api` endpoints. Laravel validates the server-only website key with the CMS, then uses the copied models to read the permitted CMS MongoDB records. No CMS key or database connection belongs in frontend configuration.

## What is connected

| Frontend feature | Site endpoint | CMS model/module |
| --- | --- | --- |
| Insights and article pages | `GET /api/articles`, `GET /api/articles/{slug}` | Article / `articles` |
| Insight categories and filters | `GET /api/article-categories` | ArticleCategory / `article_categories` |
| Testimonials and client names | `GET /api/testimonials` | Testimonial / `testimonials` |
| FAQs and category topics | `GET /api/faqs`, `GET /api/faq-categories` | Faq / `faqs`, FaqCategory / `faq_categories` |
| Platform names and logos | `GET /api/platforms` | Platform / `platforms` |
| Corporate page lists and categories | `GET /api/corporate-pages`, `GET /api/corporate-page-categories` | CorporatePage, CorporatePageCategory |
| Legal pages | `GET /api/corporate-pages/{slug}` | CorporatePage / `corporate_pages` |
| Shared translated labels | `GET /api/labels` | Translation / `translations` |
| Contact choices | `GET /api/contact/options` | ProjectType / `project_types`, ProjectStage / `project_stages` |
| Contact submission | `POST /api/contact` | ContactForm / `contact_forms` |
| Newsletter signup | `POST /api/newsletter` | Newsletter / `newsletters` |
| Metadata on navigation | `GET /api/seo?path=/en/about` | Page, Article, CorporatePage |
| Initial HTML, robots and sitemap | Public routes, `/robots.txt`, `/sitemap.xml` | Published backend records |

The browser calls each named endpoint directly: reads use GET with query parameters, and contact/newsletter submissions use POST with JSON. Each request has its own HTTP status, validation errors and cancellation signal, making it directly inspectable in the Network tab. Existing middleware and endpoint rate limits remain in place. There is no batch endpoint or client queue. Frontend testimonial, FAQ and platform repositories use the CMS instead of fictional/local record files. See [dynamic-content-recap.md](dynamic-content-recap.md) for the exact remaining static content and CMS setup.

GET responses use `{data, meta}` (pagination where relevant). Submission responses are `201 {data: {accepted: true}}`. Validation errors remain `422 {message, errors}`. Content reads retain tenant, project, module, publication, country and language restrictions. Unknown routes/details return HTTP 404. CMS grant refusal is 403; an unreachable CMS is 503. The browser retains its existing loading, error, retry and validation flows.

Articles accept `locale`, `page`, `per_page` (maximum 50), `category_id` (a public category ID), and the original `category` slug filter. The frontend does not send field-selection parameters; public response fields are selected by the backend. Category lists are paginated at up to 50 per request; labels at up to 500. Images expose only URL, localized alt text and dimensions. Relative CMS image URLs resolve against `CMS_BASE_URL`; snapshots need a public `url` field.

`ArticleController` has two methods: `getArticles()` handles the list or a detail slug, and `getCategories()` handles categories. The existing three URLs and response envelopes are unchanged. `PublicPayload::article()` formats public article fields, including a scalar `category_id` for embedded CMS categories; snapshot internals are never returned.

Content models inherit reference matching from `WebsiteBuilder`, based on the copied models' `scopeFields` and object field metadata. Controllers can use normal positive equality or membership filters:

```php
Article::forWebsite()->where('project', $projectId)->where('status', $statusId)
    ->where('country', $countryId)->where('language', $languageId)
    ->where('article_category', $category->id)->get();
Article::forWebsite()->whereIn('authors', $authorIds)->get();
```

These match string IDs, arrays of IDs, and embedded records with `_id`; `status` also matches legacy `status_id`. `forWebsite()` checks the key and applies no implicit project/status/country/language/active/schedule filters. Tenant, module, deletion and owner safeguards remain automatic. `PublicContent::filters($locale)` supplies suggested values from the key without applying them. Existing API and SEO queries explicitly apply each filter and their active/schedule conditions, preserving public visibility. Reference `whereIn()` accepts `null` and `[]` for shared records; these never match a snapshot merely because its `_id` is absent. Other operators, null checks, literal equality arrays and raw queries retain MongoDB semantics. Group OR filters inside `where(fn ($query) => ...)`. Category filters still resolve a publicly visible category first.

Labels use `key` plus `value` (plain text or a locale map). Navigation/footer keys match `frontend/src/i18n/messages.js`, for example `nav.work` and `footer.rights`. Empty or whitespace-only CMS labels keep the original localized fallback. The live translation list currently returns no records for either language. These labels override the shared strings that call `t()`; page copy and local content datasets still use their original bilingual frontend files. Scalar name translations support sidecars keyed by locale code or language ID. Corporate sections expose localized `title` and `description` only. Internal model fields are not returned.

Expertise, solutions, work/case studies, company stories, process, platforms and inline page copy still use the original local data. Their specific content modules/contracts have not been added to this backend; this integration does not invent them. Moving those sources to the CMS can happen through the repositories without rewriting the UI.

## CMS setup

Grant the website key the modules in the table, including `pages` for normal page SEO. Keep the allowed languages EN/FR and the key's desired default language. Content must use statuses marked **Records are published on the website**. Contact Forms and Newsletters each need a status marked **Default for new records**.

The backend database user needs `find` on the CMS database and `insert` on `contact_forms` and `newsletters`. Newsletter duplicate handling relies on the CMS-managed unique index on `tenant_id`, `website_project_id`, `email`, with partial filter `{deleted_at: null, website_project_id: {$type: "string"}}`, already declared by the copied Newsletter model. Provision it in the CMS; the website does not create indexes in the live database. Repeated signups acknowledge receipt without disclosing existing subscriptions or changing an existing unsubscribe preference. Signup records interest; it does not send email or implement a mailing campaign.

Set backend `.env`: `CMS_BASE_URL`, `WEBSITE_KEY`, `MONGODB_URI`, `MONGODB_DATABASE`, `WEBSITE_PUBLIC_URL`, and an application key. Never use `VITE_` for server credentials. The approved connection from the local CMS project is configured in the backend, an authenticated database ping succeeded, and the replacement website key is accepted. No live database records were changed by the website integration work.

The website key is valid, but currently grants only `translations`, `contact_methods`, `articles`, `article_categories`, and `contact_forms`. Other implemented modules return 404 until the key grants them and published content is available. Known frontend pages remain usable with `noindex` when their backend SEO is unavailable. Production SEO still requires published Page records and the confirmed production `WEBSITE_PUBLIC_URL`. A slow valid key check was measured at about five seconds; the total timeout is now ten seconds while connection timeout remains three seconds. The cache and fail-closed behavior are preserved.

Frontend `.env.example` documents the two public settings. `VITE_API_BASE_URL` stays empty for same-origin requests. The original contact/newsletter submission flows are enabled by `VITE_CMS_SUBMISSIONS_ENABLED=true`; setting it to false keeps the existing unavailable state. Using another origin requires the corresponding backend CORS setup; same-origin deployment avoids that requirement.

## Backend SEO records

For each existing normal route, create/publish a **Page** with this slug:

| URL without locale | Page slug |
| --- | --- |
| Home | `home` |
| `/about`, `/approach`, `/contact`, `/expertise`, `/solutions`, `/work`, `/insights` | Same path without its leading slash |
| An existing expertise/solution/work detail | `expertise/<slug>`, `solutions/<slug>`, `work/<slug>` |

A stored leading slash on a Page slug is also accepted. Slugs do not include `/en` or `/fr`. Set locale maps for `meta_title`, `meta_description`, `meta_keywords`, and a public `meta_image`. The title/description can fall back to the record's public title/name/description. `meta_url` can specify a canonical path or an absolute URL on `WEBSITE_PUBLIC_URL`, pointing to a published, indexable frontend route in the same language. Unsafe, external, unknown or unpublished destinations fall back to the route's canonical URL. Canonical aliases are omitted from the sitemap; the target appears through its own record, and HTML alternates follow that target. If records contain a boolean `noindex`, it excludes them from indexing and sitemap output; adding an editable noindex field remains a CMS responsibility.

Article detail SEO comes from the Article itself. Legal SEO comes from its CorporatePage, using English storage slugs `privacy-policy`, `terms`, `cookie-policy`, `accessibility`, with the existing French route translations preserved. Publish approved legal content only.

Missing or ungranted backend Page records keep all known React page routes usable with `noindex`, including details listed in the generated route inventory. Missing CMS articles/legal records and unknown routes are 404/noindex. The sitemap contains only published, indexable backend records for routes the frontend supports. It adds alternate languages only when those records are available. It uses actual record modification dates when present. No frontend sample insight URLs, drafts, scheduled records or arbitrary CMS Page paths are published.

Laravel inserts metadata and an escaped JSON bootstrap into the initial HTML. The client uses it on first load and fetches new metadata on navigation. Both paths supply canonical, robots, EN/FR alternates, Open Graph, Twitter and basic structured data. Metadata failures become noindex and clear stale canonicals. Public JSON URLs have `X-Robots-Tag: noindex`; robots does not block API fetching needed to render the pages.

The body still renders in React. This improves initial metadata and sharing without changing the component tree, but is not full body SSR or a guarantee of indexing/ranking. Google's [JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) describes the remaining rendering considerations.

## Run and host

Development: run Laravel on port 8001 and Vite on 5173. Vite proxies `/api`, robots and sitemap to Laravel. Set `WEBSITE_PUBLIC_URL=http://localhost:5173` for that mode. Run a frontend build first if testing local detail-route SEO; it generates `dist/site-routes.json`, a route inventory, not a sample-data sitemap.

After `npm run build`, Laravel can serve the built site and its public assets itself. For a local production preview on port 8001, set `WEBSITE_PUBLIC_URL=http://localhost:8001` and open that address. PHP's development server is for local use.

Production: set `WEBSITE_PUBLIC_URL` to the confirmed HTTPS origin and route HTML, `/api`, `/robots.txt` and `/sitemap.xml` to Laravel. A web server may serve built assets directly. See `docs/hosting/nginx.conf.example`. Do **not** use the old static-host rewrite to `frontend/dist/index.html`; that bypasses the server metadata. Do not deploy stale static robots/sitemap files. The normal build emits neither.

## Verification

Run the complete frontend test suite, lint, static verification, build and `node scripts/verify-public-artifacts.mjs` from the repository root. Backend feature tests use a throwaway MongoDB database and fake the CMS key check. Set `MONGODB_TEST_URI` to an isolated test server; never point it at the CMS database. PHP 8.4+ and MongoDB extension 2.5+ are explicit Composer requirements. The local extension has been upgraded to 2.5.0; normal Composer installation and platform checks pass without bypasses. The lockfile is synchronized without changing locked package versions.

The direct-request frontend verification passes 17 core tests, 44 UI tests and 4 Chromium integration/recovery tests. Backend route registration and PHP syntax are checked; content controllers are unchanged by the transport simplification. Build, import, syntax, CSS and public-credential checks pass. All 209 retained presentation and interaction source files matched the original before its duplicate copy was removed; subsequent changes are limited to the requested error UI and integration handling. One existing Fast Refresh warning and the original lazy Three.js chunk-size advisory remain. The dependency audit also reports existing development-tool advisories in Vitest and its dependencies; resolving all of them requires a separate major Vitest upgrade.

Route crashes use an eager, localized error boundary with a small animated connection illustration, reload and home actions. Reload is intentional: a rejected `React.lazy` import remains cached until the document restarts. The same illustration is used for content-loading errors. Error screens set `noindex`, clear stale page/social metadata, and respect reduced motion.

From `frontend/`, run `npx playwright install chromium --only-shell` once and `npm run test:browser` to check real failed-import recovery. `npm run check:routes` audits the built route inventory, legal routes, published article URLs and unknown-route handling against the running frontend/backend. It reports CMS setup failures separately from rendering/import crashes and only performs reads.
