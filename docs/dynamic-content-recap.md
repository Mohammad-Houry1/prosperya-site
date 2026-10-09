# CMS integration and remaining dynamic pages

Updated on 2026-10-09. The website layout and existing routes remain in place. A connected section needs its module granted to the website key and published content in the CMS before it appears live.

## Implemented

| Content | Backend endpoints | Frontend connection |
| --- | --- | --- |
| Articles and categories | `/api/articles`, `/api/articles/{slug}`, `/api/article-categories` | Insights list, filters, pagination and article details |
| Testimonials | `/api/testimonials` | About and Work testimonials; Home/About client names come from approved testimonial company names |
| FAQs and categories | `/api/faqs`, `/api/faq-categories` | Approach and Contact accordions; topic is the category slug |
| Platforms | `/api/platforms` | About platform names and platform labels used by Work/case-study layouts |
| Corporate pages and categories | `/api/corporate-pages`, `/api/corporate-pages/{slug}`, `/api/corporate-page-categories` | Privacy, terms, cookies and accessibility layouts |
| Contact choices and submissions | `/api/contact/options`, `/api/contact` | CMS project types/stages, validation errors and accepted-submission feedback |
| Newsletter | `/api/newsletter` | Insights signup with validation, duplicate handling and rate-limit feedback |
| Shared translations | `/api/labels` | Navigation/footer labels, with existing EN/FR fallback for blank or missing translations |
| SEO | `/api/seo`, initial HTML, `/sitemap.xml`, `/robots.txt` | Canonical, metadata, language alternates, indexing rules and social sharing |

All browser API calls go directly to the named routes in the table above. Reads use GET and show their query parameters in the URL; submissions use POST with JSON. Each has its own status/error response and cancellation signal. Existing rate limits and key checks stay on the individual routes. The batch endpoint and queue were removed to make debugging straightforward.

Controllers use explicit `whereIn('project', ...)`, `whereIn('status', ...)`, `whereIn('country', ...)`, and `whereIn('language', ...)`, plus active/schedule conditions for public content. `forWebsite()` only validates the key; tenant/module/deletion/owner safeguards remain automatic. No public controller returns whole CMS records.

FAQ questions may store their answer in `content` or link to separate answer records through `question`. Both formats are supported without per-question database queries; only public linked answers are returned. FAQ/corporate rich HTML uses the existing sanitizer. Testimonial user snapshots expose only public name/company attribution; there is no query of CMS-internal users. For records using an existing user, the CMS must store those public attribution fields or a public snapshot.

The Platform model currently supplies name and logo, not categories or descriptions. These fields are not invented in the response. The existing layout displays platform names. Its stable identity uses a stored slug or a slug derived from the default-language name so current static platform references can match it. Logos are available in the API with localized alt text and a name fallback.

## Remaining pages and sections to make dynamic

Both EN and FR versions have the same remaining scope.

| Page or section | Already connected | Still static |
| --- | --- | --- |
| Home `/en`, `/fr` | Client names, shared labels and backend SEO when configured | Hero copy, capabilities, NetSuite story, featured work, process preview and CTA text |
| About `/about` | Testimonials, client names and platforms | Intro/story copy, leadership/profile, statistics and capability presentation |
| Approach `/approach` | FAQs | Hero, process steps, principles, outcomes and CTA copy |
| Expertise `/expertise` and `/expertise/:slug` | Backend SEO when configured | Capability list, detail sections, diagrams' labels, outcomes, relationships and related work |
| Solutions `/solutions` and `/solutions/:slug` | Backend SEO when configured | Solution lists, details, diagrams' labels, outcomes and related work |
| Work `/work` and `/work/:slug` | Testimonials and platform labels | Case studies, industries, metrics, images, detail sections and expertise/platform relationships |
| Contact `/contact` | Choices, submissions and FAQs | Intro, explanatory steps, field labels and form schema |
| Insights `/insights`, `/insights/:slug` | Articles, categories, article SEO and newsletter submissions | List hero/section copy and signup promotional text |
| Legal routes | Corporate-page body and SEO | Layout headings/fallback interface labels only |
| Global layout | Shared translated navigation/footer labels | Navigation structure, fixed CTA copy and other labels not yet calling the translation lookup |

Key remaining source files: `frontend/src/data/expertise.data.js`, `expertiseDetails.data.js`, `solutions.data.js`, `caseStudies.data.js`, `caseStudyDetails.data.js`, `company.data.js`, page `*.copy.js` files and inline EN/FR presentation copy. Contact's `projectInquiry.data.js` intentionally remains the form schema; it is not a list of CMS records. Obsolete fictional company/testimonial/FAQ and platform data files have been removed.

## Live CMS setup still required

The live key check succeeds. Its currently granted modules are `translations`, `contact_methods`, `articles`, `article_categories`, and `contact_forms`.

Enable these modules for the implemented features: `testimonials`, `faqs`, `faq_categories`, `platforms`, `corporate_pages`, `corporate_page_categories`, `project_types`, `project_stages`, and `newsletters`. Enable `pages` and publish Page records for normal-route SEO. The site's code does not bypass denied modules; they currently return 404. Contact's existing `contact_forms` grant alone does not grant its type/stage choices.

Publish EN/FR content with the correct project/country/language/status assignments. Use FAQ category slugs `approach` and `contact` for the sections already on those pages. Legal storage slugs are `privacy-policy`, `terms`, `cookie-policy`, and `accessibility`; frontend French paths remain translated. Use the statuses marked published by the CMS; no status slug is hardcoded.

Newsletter/contact writes have been verified in throwaway databases and browser fixtures. No real submissions, CMS records, key grants or statuses were created or changed by this work. Corporate pages that are not one of the legal routes have list/detail API support but need a frontend route/template before they can become additional website pages.

The CMS key endpoint was observed returning a valid answer after approximately five seconds. The total request timeout is now ten seconds, with a three-second connection timeout and the existing short cache; key rejection/unavailability still fails closed.

## Verification

- Backend feature tests cover the real delayed HTTP key check, throwaway database writes, linked FAQ answers and scoped content. The obsolete batch-specific tests were removed alongside that endpoint.
- Direct-request verification: 17 frontend core tests, 44 UI tests and 4 Chromium browser tests. Each read/write flow uses its own endpoint in these tests.
- Live audit of 56 EN/FR URLs: no rendering or module-import failures. Denied modules and missing legal pages were reported separately as CMS setup responses.
- Build, lint, syntax/import/dependency/CSS and public-credential checks passed. The existing Fast Refresh warning and Three.js chunk-size advisory remain.
- No stylesheet edits or copied CMS model edits. Temporary runtime/database/test-output files were removed; development previews remain running.
