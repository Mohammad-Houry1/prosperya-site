# CMS integration and remaining dynamic pages

Updated on 2026-10-09. The website layout and existing routes remain in place. A connected section needs its module granted to the website key and published content in the CMS before it appears live.

## Implemented

| Content | Backend endpoints | Frontend connection |
| --- | --- | --- |
| Articles and categories | `/api/articles`, `/api/articles/{slug}`, `/api/article-categories` | Insights list, filters, pagination and article details |
| Testimonials | `/api/testimonials` | About and Work testimonials |
| FAQs and categories | `/api/faqs`, `/api/faq-categories` | Approach and Contact accordions; topic is the category slug |
| Platforms | `/api/platforms` | Home/About client logo strips, About platform names and platform labels used by Work/case-study layouts |
| Public users | `/api/users`, `/api/users/{slug}` | About leadership reads the Users selected on its Page, in selection order |
| Static Pages | `/api/pages/{slug}` | About intro/story, facts, focus, principles, work steps and hero image from published Page slug `about` |
| Corporate pages and categories | `/api/corporate-pages?category=corporate`, `/api/corporate-pages/{slug}`, `/api/corporate-page-categories` | Shared footer/sidebar category links and translated detail pages by slug |
| Contact choices and submissions | `/api/contact/options`, `/api/contact` | CMS project types/stages, validation errors and accepted-submission feedback |
| Newsletter | `/api/newsletter` | Insights signup with validation, duplicate handling and rate-limit feedback |
| Shared translations | `/api/labels` | Fixed website UI copy, captions, navigation, forms, buttons and diagrams; paginated dictionary with EN/FR fallbacks |
| SEO | `/api/seo`, initial HTML, `/sitemap.xml`, `/robots.txt` | Canonical, metadata, language alternates, indexing rules and social sharing |

All browser API calls go directly to the named routes in the table above. Reads use GET and show their query parameters in the URL; submissions use POST with JSON. Each has its own status/error response and cancellation signal. Existing rate limits and key checks stay on the individual routes. The batch endpoint and queue were removed to make debugging straightforward.

Controllers use explicit project, status, country and language filters, plus active/schedule conditions for public content. Canonical CMS dictionary rows have Source/Translations and no status; those retain tenant/module/project/locale checks without requiring a content status. Only `prosperya.*` canonical labels may be tenant-wide. Legacy content-style labels still require published status. `forWebsite()` validates the key; tenant/module/deletion/owner safeguards remain automatic. No public controller returns whole CMS records.

FAQ questions may store their answer in `content` or link to separate answer records through `question`. Both formats are supported without per-question database queries; only public linked answers are returned. FAQ/corporate rich HTML uses the existing sanitizer. Testimonial user snapshots expose only public name/company attribution; there is no query of CMS-internal users. For records using an existing user, the CMS must store those public attribution fields or a public snapshot.

The Platform model currently supplies name and logo, not categories or descriptions. These fields are not invented in the response. Home and About client strips display CMS logos with lazy loading and localized brand alt text; records without a logo retain the name fallback. Home keeps its scrolling animation. Its stable identity uses a stored slug or a slug derived from the default-language name so current static platform references can match it.

## Remaining pages and sections to make dynamic
User detail supports `/api/users/{slug}?locale=en`. Lists support `role=<role-slug>`, `role_id=<id>`, or `roles[]=team&roles[]=author` (any matching role), with `page` and `per_page` capped at 50. The website key must grant the users module. Profiles expose only ID, slug, name, position, bio and avatar; email, credentials, permissions and internal user data are excluded. Role membership accepts legacy role values, role IDs and embedded snapshots.

Corporate detail uses `/api/corporate-pages/{slug}?locale=en`, including translated sections and SEO. Footer and detail sidebar share a paginated `category=corporate` list and use CMS titles/order. New slugs work at `/en/corporate/{slug}` and `/fr/corporate/{slug}`. Existing translated legal URLs remain available; terms now reads CMS slug `terms-of-use`. Last-updated dates use localized readable dates. About Prosperya's corporate document at `/corporate/about-prosperya` is separate from the existing marketing page `/about`.

Contact selects show label/control skeletons while choices load. Failed choices hide those fields without an options error or retry control; submission remains disabled so required CMS option validation is preserved.

Loading states share one skeleton style across page/Suspense loaders, corporate navigation, contact selects, testimonials, FAQs and client logos. Motion is disabled for reduced-motion preferences. Future loading states should reuse `Skeleton` or `SectionSkeleton` instead of visible loading text/spinners.

Both EN and FR versions have the same remaining scope.

| Page or section | Already connected | Still static |
| --- | --- | --- |
| Home `/en`, `/fr` | CMS client logos, labels and SEO | Capability/work/process record data |
| About `/about` | Page content, selected Users, testimonials, platforms, labels and SEO | No hardcoded profile/content fallback; publish Page slug `about` |
| Approach `/approach` | FAQs, fixed presentation labels | Process records still need the existing Approach CMS module connection |
| Expertise `/expertise` and `/expertise/:slug` | Fixed labels and SEO | Capability/detail records, outcomes, relationships and related work |
| Solutions `/solutions` and `/solutions/:slug` | Fixed labels and SEO | Solution list/detail records, outcomes and related work |
| Work `/work` and `/work/:slug` | Testimonials, platform names, labels and SEO | Case studies, industries, metrics, images, detail records and relationships |
| Contact `/contact` | Choices, submissions, FAQs and fixed labels | Form structure/validation limits remain implementation |
| Insights `/insights`, `/insights/:slug` | Articles, categories, SEO, newsletter and labels | No additional content module needed for fixed UI copy |
| Legal and `/corporate/:slug` routes | Corporate body, navigation, SEO and labels | Route/layout structure remains implementation |
| Global layout | Fixed translated navigation, footer and CTA labels | Navigation structure remains implementation |

Key remaining record sources: `frontend/src/data/expertise.data.js`, `expertiseDetails.data.js`, `solutions.data.js`, `caseStudies.data.js`, `caseStudyDetails.data.js` and the process records in `company.data.js`. Contact's `projectInquiry.data.js` remains the form schema; it is not a list of CMS records. Hardcoded leadership and unused About copy have been removed. See [About and labels setup](cms/about-and-labels.md) for CMS tabs, website-key grants, import commands and remaining modules.

## Live CMS setup still required

The live key check succeeds. Latest checks confirm platforms and corporate detail are accessible; `/api/corporate-pages/about-prosperya?locale=en` returns 200. The category-filtered list currently returns 404 because `corporate_page_categories` is not granted; users were also denied in the previous check. Module availability can change when the key is updated.

Check that the key grants the modules required by each feature: `pages`, `translations`, `testimonials`, `faqs`, `faq_categories`, `platforms`, `corporate_pages`, `corporate_page_categories`, `users`, `project_types`, `project_stages`, and `newsletters`. Enable `seo_pages` and publish SeoPage records for normal-route SEO. The site's code does not bypass denied modules. Contact's `contact_forms` grant alone does not grant its type/stage choices.

Publish EN/FR content with the correct project/country/language/status assignments. Use FAQ category slugs `approach` and `contact`. Assign footer/sidebar documents to category slug `corporate`; unassigned pages (such as the pictured Cookie Policy) are excluded from those lists but can still be opened directly. Legal storage slugs are `privacy-policy`, `terms-of-use`, `cookie-policy`, and `accessibility`; frontend French paths remain translated. Use the statuses marked published by the CMS; no status slug is hardcoded.

Newsletter/contact writes have been verified in throwaway databases and browser fixtures. Those API tests created no live submissions, key grants or statuses. This release separately adds the user-requested missing Prosperya labels through an insert-only CMS migration. Additional corporate pages use the existing detail template automatically, with SEO route parsing and sitemap support.

The CMS key endpoint was observed returning a valid answer after approximately five seconds. The total request timeout is now ten seconds, with a three-second connection timeout and the existing short cache; key rejection/unavailability still fails closed.

## Verification

- Backend feature tests cover the real delayed HTTP key check, throwaway database writes, linked FAQ answers and scoped content. The obsolete batch-specific tests were removed alongside that endpoint.
- Direct-request verification: 17 frontend core tests, 54 UI tests and 6 Chromium browser tests. Each read/write flow uses its own endpoint in these tests.
- Live audit of 56 EN/FR URLs: no rendering or module-import failures. Denied modules and missing legal pages were reported separately as CMS setup responses.
- Build, lint, syntax/import/dependency/CSS and public-credential checks passed. The existing Fast Refresh warning and Three.js chunk-size advisory remain.
- Copied CMS models remain unchanged. Requested styling updates cover consistent client-logo sizing and contact-option skeletons; User is a new site-owned read-only model, not the CMS authentication model.
- User API verification: five focused backend tests cover public-field serialization, validation, module access and compiled reference queries. Live successful user queries remain pending the users module grant; the current key returns an explicit module-denied 404. No live CMS records were changed.
- Corporate routing verification: three backend tests check arbitrary detail slugs, existing translated legal URLs and invalid paths. English/French browser tests check shared category navigation, slug-based details, active links and mobile overflow. Live corporate detail and its SEO resolve successfully; live category lists still require the category-module grant.
