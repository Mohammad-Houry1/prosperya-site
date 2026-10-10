# Website SEO integration

Laravel serves initial HTML metadata and `/api/seo` through one source map:

| Route | CMS source |
| --- | --- |
| Home and fixed listings/standalone pages | SeoPage |
| insights/:slug | Article |
| corporate/:slug and explicit legal slugs | CorporatePage |
| expertise/:slug | Expertise |
| solutions/:slug | Solution |
| work/:slug | CaseStudy |
| approach | Approach |

Source classes are allowlisted; a requested model must match the route. Public tenant/module/owner/deletion and publication filters apply to every lookup. Valid arbitrary detail slugs are resolved against CMS records at request time rather than sample data or a build inventory.

Metadata API, initial HTML, canonical validation, locale alternates and sitemap publication use the same records. Missing/unpublished detail records return 404/noindex. Fixed listing pages remain available with noindex when their metadata is unavailable. Authored metadata uses the requested locale without choosing a different content field/language.

The browser uses the matching model per authored detail route and clears old canonical/alternate/schema tags during navigation. Build output includes fixed routes only, and emits no static sitemap/robots files. HTML escaping and JSON bootstrap protections remain in place.

Database tests verify new CMS slugs in EN/FR API metadata, HTML titles, canonicals, alternates and sitemap without rebuilds; draft details remain hidden. See [cms-dynamic-audit.md](cms-dynamic-audit.md) for complete verification and editorial requirements. No production deployment was performed.
