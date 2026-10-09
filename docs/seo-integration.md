# SEO model selection

The browser passes its source explicitly to the existing SEO API:

| Page | Request |
| --- | --- |
| Insights list | `/api/seo?model=SeoPage&path=/en/insights` |
| Article detail | `/api/seo?model=Article&path=/fr/insights/example` |
| Corporate detail | `/api/seo?model=CorporatePage&path=/en/corporate/about-prosperya` |

`useDocumentMeta` defaults to `model: "SeoPage"`. Article and corporate page components declare their own model. The backend only accepts these three model names, rejects mismatched route/model combinations with HTTP 422, and never constructs a PHP class from arbitrary request input. Path-only requests remain supported for compatibility. Initial HTML, canonical checks and sitemap generation share the same route-to-model mapping because they do not depend on a browser request.

## SeoPage records

The copied `SeoPage` model is unchanged. Static and list pages read `seo_pages`, replacing the previous Page source. Use the route without its language prefix as the record slug:

| Website path | SeoPage slug |
| --- | --- |
| `/en`, `/fr` | `home` |
| `/en/insights`, `/fr/insights` | `insights` |
| `/en/about`, `/fr/about` | `about` |
| `/en/expertise/systems-integration` | `expertise/systems-integration` |

Name can be a descriptive editor label. Populate localized `meta_title`, `meta_description` and `meta_keywords`, plus `meta_url` (optional canonical URL) and `meta_image`. The key must grant `seo_pages`; records must match the site's project, published status, country and language, and be active and not scheduled for the future. An absent normal-page SEO record gives a usable page with `noindex`; an absent article/corporate detail remains 404. Adding an SEO record does not create a frontend route.

The API preserves the existing public response, including canonical, social metadata, language alternates and structured data. Body content remains client-rendered; initial head metadata comes from Laravel when Laravel serves the frontend.

## Category identifiers

Frontend category filters send slugs through `category=...` for articles, FAQs and corporate navigation. Database IDs are resolved internally within the permitted category query; existing `category_id` requests remain backward compatible. A slug is not guessed from a title or section name.

The latest FAQ inspection found category slug `about-us`; the existing Approach and Contact sections request `approach` and `contact`. Publish those categories or choose the intended matching slugs for those sections. Missing or hidden categories continue returning 404 with a readable message, without falling back to unrelated FAQs.

## Verification

Focused backend tests cover allowed model names, route/model mismatch, module-denied behavior, localized SeoPage payloads and corporate route parsing. MongoDB integration fixtures now seed `seo_pages`; that database-backed suite was not rerun in this change. Live checks confirm corporate detail SEO, mismatch rejection and the missing FAQ-category message. Frontend core/UI/browser tests and the production build pass.
