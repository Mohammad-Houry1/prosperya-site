# Home content sources

Home uses existing public CMS modules. It does not need a `pages/home` record or architecture fields.

| Section | Source | Selection |
| --- | --- | --- |
| What we do | `GET /api/expertise?locale=en|fr&page=1&per_page=4&sort=latest` | Four newest public records by `created_at` descending, then `_id` descending. No `featured` requirement. |
| Featured work | `GET /api/articles?locale=en|fr&page=1&per_page=3` | Three latest public articles by the existing publication-date order. Article cards link to `/en|fr/insights/{slug}`; the overview link opens Insights. No `featured` requirement. |
| Our approach | `GET /api/approaches/our-approach?locale=en|fr` | The main Approach record's ordered methodology, shared with the detailed Approach page. |
| Client companies | `GET /api/platforms?locale=en|fr&category=clients` | Public platforms linked to the public platform category with slug `clients`. |
| Hero, section labels and final CTA | CMS Translations | Locale-specific `prosperya.*` labels. The hero retains its existing five audience slots and icons. |

The NetSuite/core section and its Home Page request have been removed from Home. Expertise listings and footer links retain CMS display order; only the explicit `sort=latest` request selects newest Expertise. Home's limited queries have separate cache keys from complete collections used elsewhere.

Missing collections show translated empty feedback. Failed collection requests provide retry without replacing successful sections. Loading uses existing section skeletons. Public scope, publication restrictions and locale handling remain unchanged.

Future authored content and interface copy must use CMS fields or translations. Fixed route destinations, rendering limits, icons and decorative geometry remain presentation choices. Do not introduce sample records or bundled display-copy fallbacks.

Verified locally with Home UI tests, EN/FR desktop/mobile browser checks, the marketing browser checks, backend tests, lint, source verification, a production build and the public-artifact secret check. Approach checks use the current fixed main record and verify stage resets when changing cached locales. No live CMS content, grants or submissions were changed, and no deployment was performed.
