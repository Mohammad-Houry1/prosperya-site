# Dynamic website content

The website now reads its authored pages from CMS endpoints, with simple React Query calls in the owning page. Expertise, Solutions, Work/Case Studies, About, Approach and Home previews are connected, along with articles, legal/corporate content, testimonials, platforms, FAQs and form options/submissions. Home now shows four newest Expertise records and three latest Articles, with no NetSuite/core section or Home Page request; see [Home](cms/home.md).

Interface copy uses locale-specific `prosperya.*` CMS labels. Missing/blank values show the full key. No demo flags, sample records, bundled display-copy fallbacks or frontend pagination loaders are used by production pages. Pure adapters reshape CMS field names for existing views.

Public relationships preserve CMS selection order and exclude unavailable/private records. Uploaded media and authored HTML use the existing safe renderers. Page-specific skeletons cover lazy/data loading; the shared expertise template keeps slug-selected animations.

Dynamic detail slugs share server metadata, initial HTML, canonical/alternate validation and sitemap publication; they no longer depend on build-time sample records.

See [cms-dynamic-audit.md](cms-dynamic-audit.md) for verified checks, precise pagination behavior, the read-only CMS observation and remaining editorial/model work. Content population and production deployment are separate from the completed local implementation.
