# Search API

The website's search button and panel have been removed from desktop and mobile. The unused frontend component, styles, API method and search UI/browser tests have also been removed. The existing backend endpoint remains available; its contract is documented below.

`GET /api/search?q=...&locale=en|fr&page=1&per_page=20` searches the public title/summary fields of `Expertise`, `Solution`, `CaseStudy` and `Article`. Optional `type` restricts one of `expertise`, `solutions`, `work`, `insights`. Terms are trimmed, require 2–100 characters and are escaped as literal case-insensitive substrings; user input is never executable regex. Results expose only ID, slug, type, public title, plain-text summary and local page link.

The existing website-key middleware, tenant, module/owner, deletion, project, country/language, active, published-status and publication-date scopes apply. Ungranted modules are skipped. Effective field matching follows the same locale-code sidecar, language-ID sidecar and field locale-map precedence as public content; blank overrides do not leak fallback matches. Records without a public title or slug are omitted.

Results are ordered by content family (Expertise, Solutions, Work, Insights), then CMS order and record ID. Pagination covers the combined result set and returns total/current/last-page metadata, capped at 20 records per request. Database counts and paginated projections keep response payloads small; relationships and full records are not loaded for search. Summary snippets are plain text, capped at 220 display columns. This first version searches titles and summaries, not complete article/section bodies, and does not provide semantic ranking or accent folding.

Literal substring matching can scan the permitted collections; no claim of index-backed full-text performance is made. Measure the real catalogue and traffic before introducing a dedicated search index. No database indexes or live content were modified in this task.

## Labels

The historical `prosperya.search.*` label entries remain in the import manifest but are no longer used by the website interface.

Backend coverage retains literal matching, locale overrides, forbidden/draft/future/deleted records, cross-family pagination and missing grants. Backend tests query only the isolated temporary test database.
