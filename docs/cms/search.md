# Website search

The header Search button opens an accessible panel on desktop and mobile. Search is submitted explicitly, not on every keystroke. Results link to published Expertise, Solutions, Work and Insights pages in the selected language. Escape, close and result navigation dismiss the panel; the modal handles focus trapping and restoration.

`GET /api/search?q=...&locale=en|fr&page=1&per_page=20` searches the public title/summary fields of `Expertise`, `Solution`, `CaseStudy` and `Article`. Optional `type` restricts one of `expertise`, `solutions`, `work`, `insights`. Terms are trimmed, require 2–100 characters and are escaped as literal case-insensitive substrings; user input is never executable regex. Results expose only ID, slug, type, public title, plain-text summary and local page link.

The existing website-key middleware, tenant, module/owner, deletion, project, country/language, active, published-status and publication-date scopes apply. Ungranted modules are skipped. Effective field matching follows the same locale-code sidecar, language-ID sidecar and field locale-map precedence as public content; blank overrides do not leak fallback matches. Records without a public title or slug are omitted.

Results are ordered by content family (Expertise, Solutions, Work, Insights), then CMS order and record ID. Pagination covers the combined result set and returns total/current/last-page metadata, capped at 20 records per request. Database counts and paginated projections keep response payloads small; relationships and full records are not loaded for search. Summary snippets are plain text, capped at 220 display columns. This first version searches titles and summaries, not complete article/section bodies, and does not provide semantic ranking or accent folding.

Literal substring matching can scan the permitted collections; no claim of index-backed full-text performance is made. Measure the real catalogue and traffic before introducing a dedicated search index. No database indexes or live content were modified in this task.

## Labels

Import the nine `prosperya.search.*` records added to `docs/cms/prosperya-labels.json` into CMS Translations for both English and French. They are an authoring artifact, not a bundled runtime fallback. The website continues to show full keys for missing labels. Existing loading/failure text uses existing CMS labels.

Verification covers literal matching, locale overrides, forbidden/draft/future/deleted records, cross-family pagination, missing grants, empty states, retry, keyboard focus, result navigation and English/French desktop/mobile rendering. Browser tests use mocked public responses; backend tests query only the isolated temporary test database.
