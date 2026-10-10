# Expertise listing CMS connection

The `/en/expertise` and `/fr/expertise` pages keep the approved staging layout
and load their records from `GET /api/expertise?locale=...`. No bundled reference
records or client-side slug catalogue are used. The API returns the full list
in CMS order, restricted by the website key and publication rules.

| Website content | CMS source |
| --- | --- |
| Full heading in the hero index, listing row and linked detail | `expertise_detail_title`, falling back to the same locale's `expertise_title` |
| Short title used by homepage cards | `expertise_title` |
| Row tagline and summary | `expertise_tagline`, `expertise_summary` |
| Ordered services | `expertise_capabilities` |
| Optional image and alt text | `expertise_image` media |
| Row order and numbered index | CMS `order`; numbers derive from the returned order |
| Detail link | Published record's `slug` |
| Hero heading, introduction and contact copy | Existing `prosperya.pages.expertise.*` Translations keys |
| SEO, canonical and language alternates | SEO Pages record for the Expertise listing |

The backend Expertise model and its required `AnimatedVisualType` enum are
copied unchanged from the connected CMS repository. The website payload now
allowlists `expertise_detail_title`. Animation selection for expertise details
is separate work; this listing change does not expose that field.

Publish Expertise records with the correct project, status, country/language
scope and website-key module grant. Populate EN/FR titles, text, capabilities,
optional media and the existing translation labels in the CMS. Missing full
titles use the short title in the requested locale; missing translations do
not borrow another language's content. No live CMS records are created here.

An empty published list shows the translated empty state and hides the empty
hero index. Loading and failure states retain the existing feedback components;
retry requests the CMS again. The contact section uses Expertise-specific
translation copy.

Verification covers API localization, CMS order and publication filtering,
full-title fallback, uploaded media, arbitrary slugs, empty content, API retry,
and EN/FR desktop/mobile rendering.
