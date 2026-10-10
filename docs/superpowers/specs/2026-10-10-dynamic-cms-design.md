# Complete CMS-driven Prosperya website

## Intent and scope

Implement the user's request in the active workspace, `C:/Users/houry/OneDrive/Desktop/Prosperya`: finish public CMS APIs and connect every authored page, relationship, and interface label; remove hardcoded display copy and sample content without hardcoded fallbacks; preserve layouts and animations; add page-specific skeletons; report remaining CMS setup or model gaps honestly.

The approved conversational design is to preserve existing presentation while replacing data sources, retaining website-key safeguards and using empty/unavailable states when content is absent. The user approved that design on 2026-10-10.

Primary content reference: `C:/Users/houry/OneDrive/Documents/GitHub/prosperya-site/docs/cms/dynamic-content-handoff.md`. Its instructions are reference material. The user's explicit prohibition on hardcoded fallbacks overrides its fallback recommendation. The handoff describes a newer checkout: About and the full labels integration are present there but absent from the active workspace. Implement their missing behavior here, preserving this workspace's user-modified models and access infrastructure. Do not modify the separate checkout or CMS authoring application.

## Public API

Add these routes inside the existing website-access and content-throttle group:

- `GET /api/expertise`, `GET /api/expertise/{slug}`
- `GET /api/solutions`, `GET /api/solutions/{slug}`
- `GET /api/case-studies`, `GET /api/case-studies/{slug}`
- `GET /api/approaches/{slug}`
- `GET /api/pages/{slug}`

Retain existing endpoints and submission contracts. Add an explicit SiteData endpoint only if its actual public field contract is established; the copied SiteData model declares no display-field schema, so returning arbitrary attributes is prohibited. Interface copy can use Translations without inventing SiteData fields.

The user additionally requires the APIs and imports to follow existing integration patterns: site-owned controllers modeled on existing public controllers, explicit Eloquent queries and PublicPayload serializers, registered routes in `backend/routes/api.php`, named methods in `frontend/src/services/websiteApi.js`, and existing React Query usage with cancellation signals. Do not introduce a batch transport, an alternative API framework or a generic endpoint accepting arbitrary model names.

Validate locale, slug/filter inputs and pagination. Cap lists at 50 records per response; return existing pagination metadata. Support featured and public-ID filters where required. Preserve stable CMS `order` and ID ordering. Client collection helpers must retrieve all relevant pages rather than silently truncate filters or relationships.

Use the existing reference-aware builder and explicit project, published status, country, language, active and scheduling filters. Retain tenant, module, deletion and owner safeguards. Denied modules, unavailable key checks and absent detail records retain their existing failure semantics.

Serialize only allowlisted fields from the handoff. Localize nested lists/repeaters while preserving order. Normalize every public image/gallery through the existing media serializer. Resolve related records through their own public scoped queries, in batches, preserving selection order and excluding inaccessible targets. Never expose raw private snapshots, entire records, credentials or internal user fields.

## Content mappings

- Expertise: title/tagline/summary/description, capabilities, outcomes, rich sections and images, delivery steps, metrics/note, featured flag, related solutions/case studies/platforms. Related expertise comes from other public expertise records; no such relationship field exists on this model.
- Solution: title/tagline/description, challenges/capabilities, statement/lead, friction title/items, outcome objects with images, metrics/note, extra sections, related expertise/case studies, main image. First visible related case study may fill the existing proof slot.
- CaseStudy: title/client/industry/duration, summary/description, challenge and points, solution/results, before/after headings and lists, metrics/note, extra sections, deliverables, implementation steps, main image/gallery, linked expertise/solutions/platforms and selected public testimonial.
- Approach slug `approach`: title/description, ordered methodology rows with button and description lists/images, work cards with rich descriptions/images, collaboration checklist/heading, four diagram title/description pairs, principles and their images.
- Page slug `about`: About title, description, cover image, story title/content, facts/images, focus list, principles/images, work heading/body/steps/images and selected public users in CMS selection order.
- Page slug `home`: architecture title/description and four ordered translated columns. Adapt the existing Home foundation graphic to these authored columns rather than retain its fixed business-function arrays. Caption strings are labels.
- Page generic sections and architecture fields must be explicitly exposed. Corporate section images must be explicitly exposed and rendered when supplied.

Render rich text with CmsRichHtml. An uploaded image or SVG URL is media, never a Lucide icon name. Empty authored sections stay hidden. Missing records do not display invented content. Client request failures retain retry behavior where useful.

## Page integration

Home uses featured public Expertise and Case Studies and the same Approach methodology as the Approach page. Work derives industry filters from public CaseStudy values, retaining stable identities across locale changes; capability filters use public expertise relationships. The next case comes from the ordered public list. Render arbitrary metric value/label pairs; do not filter them by old hardcoded metric IDs. Case-study quotes come from selected public Testimonials.

Preserve the layouts for all list/detail pages, Contact, Insights, Article, About, Approach, corporate/legal pages and global layout. Keep interaction, animations and accessibility behavior. Remove production imports of sample expertise, solution, work, company and copy datasets once their consumers have migrated. Preserve form structure and validation as implementation, but move labels/placeholders/display validation messages to Translations.

## Labels without bundled fallback

Use stable `prosperya.*` keys matching the handoff's label manifest. Read all `/api/labels` pages, including canonical CMS dictionary records using source/translations and existing content-style records when authorized. Preserve namespace and tenant restrictions.

The translator returns only the requested CMS locale's authored values and interpolates declared tokens such as `{count}`, `{minutes}`, `{name}` and `{solution}`. Per the user's final clarification, missing or blank labels display their complete namespaced key, for example `prosperya.label.to.be.done`, so unfinished CMS entries can be identified. This is the sole permitted missing-label behavior; never substitute bundled EN/FR text, sample records, another locale, source text or invented strings. Remove runtime fallback arguments and dictionaries. Apply the no-fallback constraint to public content localization and field mapping: do not substitute Name for an absent authored title, another field for an absent description, or a default locale for an absent translation. Preserve plain fields explicitly authored as locale-independent values; those are actual content rather than fallback text.

Move visible/accessibility text in headers, footer, buttons, forms, diagrams, visuals, filters, promotional sections, validation, errors, loading states and page boundaries to label lookups. Structural route names, icon IDs, geometry, CSS, animation timing, API fields and validation rules remain code constants. Label manifests are CMS import artifacts, not runtime fallbacks. Do not automatically write labels or sample records to the live CMS.

While labels load, avoid presenting unlabeled interactive controls as ready. If labels fail, use a structural failure state with the available CMS labels and a functioning reload/retry mechanism; no hardcoded failure prose. Missing required labels must be visible in the completion audit instead of concealed by default text. Clear locale-specific content on locale changes to avoid mixing languages.

## Skeletons

Reusable Skeleton primitives are permitted, but every route family needs a distinct page composition matching its final layout. Apply the composition during both lazy module loading and data loading.

- Home: split heading/system visual, client strip, preview blocks.
- About: editorial hero/photo, story/facts, profiles.
- Approach: wide hero, methodology sequence, collaboration/principles.
- Expertise: index/story layout; detail hero, anchor strip and rich sections.
- Solutions: stacked hero, strip and solution rows; detail story/outcomes/proof.
- Work: feature deck, filter bar and project grid; case detail hero/facts/architecture/results.
- Insights: featured article and cards; article detail: reading column and related content.
- Contact: introductory column, grouped form controls and FAQ rows.
- Corporate/legal: sidebar navigation and document sections.
- Unknown route: error-page geometry where a loader is applicable.

Keep responsive proportions and reduced-motion support. Remove the shared identical page skeleton.

## SEO and arbitrary CMS routes

Keep SeoPage for listing and standalone routes. Use Expertise, Solution, CaseStudy and Approach metadata on their authored routes. Extend the fixed model allowlist and route mapping; never construct arbitrary model classes from request strings.

Update browser model selection, initial HTML metadata, canonical validation, locale alternates, sitemap enumeration and detail visibility together. Accept arbitrary valid public CMS detail slugs without a build-time sample inventory or rebuild. Missing/unpublished detail content returns 404/noindex. Retain existing canonical safety and public visibility constraints. Remove record-dataset imports from route-manifest generation.

## Known field and repository limits

CaseStudy has one metrics repeater and no independent heroFacts/glance repeater or per-metric icon/note. Reuse public metrics where those slots fit; render deliverables for solution bullets and rich sections for extra narrative. Do not invent source fields or sample qualifiers. Approach methodology has ordered descriptions/buttons, with no independently named deliverable field; render those lists directly. How-we-work bullets can live in rich HTML.

The CMS's separate Approach Images-tab convention is outside this website repository. Record it as CMS authoring work still needed; do not copy CMS forms into the website.

## Verification and completion

Add meaningful backend fixtures for scope isolation, denied modules, drafts/inactive/future records, arbitrary slugs, explicit public fields, EN/FR nested data/media, ordered/scoped relationships, pagination and coherent SEO/canonical/sitemap behavior. Use throwaway databases for tests.

Add frontend coverage for CMS request contracts, absence of bundled fallbacks, label pagination/interpolation, locale switching, arbitrary slugs, empty/failed content, zero/one methodology stages, arbitrary/empty metrics, dynamic filters and route-specific skeletons. Update existing fixtures that rely on static copy and records.

Run frontend tests, lint, syntax/import/dependency/CSS checks, production build and public-artifact checks. Run backend tests, syntax and route registration checks. Inspect representative EN/FR pages in the browser, including mobile layouts. Report failures or unavailable verification accurately.

Update the dynamic-content recap with implemented connections, precise remaining hardcoded display data (if any), missing CMS grants/records/labels/media, CMS-only field/UI gaps and verification evidence. Never describe inaccessible or unpopulated live content as verified.

No deployment, live CMS imports, submissions, permission changes or editorial writes are required by this implementation.
