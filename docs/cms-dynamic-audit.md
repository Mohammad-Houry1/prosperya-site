# CMS integration completion audit

## 2026-10-11 detail completion update

The subsequent page-by-page passes completed Solutions, Work and Expertise details. Their current field mappings and checks are documented in [Solutions](cms/solutions.md), [Work](cms/work.md) and [Expertise detail](cms/expertise-detail.md). Those notes supersede the historical slug-animation and CaseStudy hero-facts limitations below: animations are now CMS-selected, and CaseStudy has its own authored hero-facts repeater. Live deployment and editorial completeness remain unverified.

Verified locally on 2026-10-10. The existing CMS integration has been completed in this checkout. No production deployment or live editorial changes were performed.

## Connected content

- Expertise, Solutions and Case Studies: published lists and arbitrary slug details, localized authored fields, rich sections/media, metrics, steps and selected public relationships.
- Approach (`approach`): methodology, ordered descriptions/buttons/images, work practices, collaboration diagram fields and principles.
- Page (`about`): authored title/description/cover, story, facts, focus, principles, work steps and selected public leaders in CMS order.
- Page (`home`): architecture title/description and four authored columns. Home previews use featured public expertise/case studies and the same Approach methodology.
- Existing articles, categories, corporate pages, FAQs, platforms, testimonials and submissions retain their named endpoints. Corporate section images are exposed. Selected testimonial users resolve through their own public scopes; private snapshots are excluded.

Every page owns its content queries and passes data to presentation components. Shared platforms, labels, SEO and submission components keep their existing ownership. Queries call named `websiteApi` methods directly. Mapping functions only reshape CMS fields; there are no marketing getter/query wrappers, frontend collection loops or demo flags.

## Query and publication rules

Tenant, module, owner, deletion, project, published status, country/language, active and publication-date restrictions remain enforced. Selected relationships resolve against the target's public scope and preserve selection order. The browser never receives internal user fields.

To follow the user's simple one-request query requirement without truncation, authored marketing collections and the labels dictionary return all permitted rows when pagination is omitted. Explicit `page`/`per_page` requests remain paginated: marketing responses cap at 50 and labels at 500. Articles and other existing paginated endpoints retain their established contracts. Larger future collections may need explicit UI pagination; no frontend request loop is introduced.

## Labels and missing content

UI copy comes from CMS Translations. Only the requested locale is used; blank/missing labels display the complete `prosperya.*` key. No bundled dictionary, source-text or cross-locale fallback is imported by production pages. The editable label manifest is `docs/cms/prosperya-labels.json` (531 entries); it is an import artifact, not a runtime fallback.

Missing authored records show the unavailable state. Optional authored sections/media remain absent rather than showing sample claims, illustrative quotes or replacement photography. Scene geometry, routes, slug animation mappings, validation rules, icons and brand marks are implementation constants. Older unused datasets/copy files remain in the repository for existing fixture tests and are absent from production imports/builds.

Loading layouts match the route family during lazy and data loading. Labels loading blocks interactive site chrome; a labels failure provides retry. EN/FR routes, reduced motion and the shared expertise animation/template remain supported.

## SEO

SeoPage serves listing/standalone metadata. Expertise, Solution, CaseStudy and Approach serve their authored routes. API metadata, initial HTML, canonical validation, locale alternates and sitemap use the same fixed source mapping and public scope. Arbitrary valid published slugs work without a build inventory. Missing/unpublished detail records return 404/noindex. The build manifest contains fixed routes only.

## Read-only CMS observation

Before the user's request to keep verification local, the configured key granted the new marketing modules. English list reads returned zero Expertise, Solution and CaseStudy records; `approaches/approach` and `pages/about` returned 404. The labels endpoint returned 521 entries. These observations describe that configured CMS/key at that time, not production completeness. No records, labels, grants or submissions were written.

## Remaining editorial/model requirements

- Publish the required marketing records, About/Home Pages and Approach, and populate both EN/FR fields/media and required labels. Newly added manifest entries were not imported.
- SiteData declares no confirmed public settings field contract; no arbitrary record endpoint was invented.
- CaseStudy has one metrics repeater, not independent hero/glance facts; existing slots use actual public metrics without invented qualifiers.
- Approach methodology exposes ordered descriptions/buttons. There is no separate deliverable field; no guessed content is introduced.
- The separate CMS Approach Images-tab authoring convention remains CMS application work, outside this website checkout.

## Verification

- Frontend: 16 core tests and 75 UI tests passed.
- Backend: 62 tests / 385 assertions passed on an isolated test MongoDB; no CMS database was used for fixtures.
- Browser: 11 tests passed, including EN/FR marketing routes, arbitrary slugs, mobile overflow, expertise motion/navigation, legal routing, form fixtures and recovery.
- Lint: zero errors, two development fast-refresh warnings (PageSkeletons and existing HubDiagram).
- Syntax/import/dependency/CSS checks, production build, touched PHP syntax and API route registration passed. Public artifacts contained no server/fixture secrets.
- Desktop expertise and mobile case-study screenshots were visually inspected. Browser submissions used mocked endpoints only.

Review fixes cover relationship order, scoped testimonial attribution, HTML/media rendering, omission of empty authored sections, metrics notes and arbitrary diagram node counts. Deferred minor cleanup: unused historical fixture datasets/copy files and the two development fast-refresh warnings. Source-only verification cannot confirm unpopulated live editorial content.

## Footer update

The footer Expertise column keeps its fixed overview link, then lists the public CMS Expertise records in CMS order. Solutions lists public CMS Solution records in CMS order. Both use inline queries and the same locale-specific caches as their listing pages. Company/resources links and the header remain fixed routes with CMS labels, as requested.

One remaining display-text exception was found in `NetSuiteCoreDiagram.jsx`: its EN/FR module names and default central NetSuite label are still embedded in code. Other diagrams use CMS text but retain fixed item slots/geometry; the Home hero retains five audience slots and fixed icons. These were identified, not changed as part of the footer request.
