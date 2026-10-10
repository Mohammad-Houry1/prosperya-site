# Prosperya: CMS content map and remaining website work

Audited against both repositories on 2026-10-10. This is a handoff for the chat
finishing `prosperya-site`, and an editing guide for the CMS owner.

## 1. Actual status

Solutions now has Related Articles and an Animation tab with translated compact
lists for adding/removing diagram boxes and workflow steps. The website still
needs to consume these fields and derive its layout from their counts; see
[the exact animation integration handoff](solutions-animation-handoff.md).
The four shared architecture lists belong to Static Pages → solutions → Architecture.

The CMS has implementations for Solutions, Work / Case Studies, Expertise and
Approach. Creating a Module Management entry activates an implementation; it
does not build a website API or connect a React page automatically.

Work and Expertise listing pages now read the new scoped `/api/case-studies`
and `/api/expertise` endpoints. Their layouts accept any number of records,
use the existing CMS images and summaries, and hide absent optional content.
The website key must grant Case Studies and Expertise. Work filters use each
record's translated industry and published Expertise relationships.

**The website is not fully dynamic yet.** Solutions still uses local records,
and Work/Expertise detail pages retain their existing data sources and designs.
New CMS slugs need detail-page integration before their links can show CMS detail
content; matching an existing slug preserves the current detail destination.
Approach still imports local
methodology records and renders several lists from translated presentation copy.
Home still reads the same local Expertise, Case Study and process datasets.

About, Insights, Contact, corporate/legal content, testimonials, platforms,
labels and normal-route SEO already have website connections. That means code
exists; it does not guarantee every live record, permission or translation has
been configured. This audit did not change or re-check live API key grants.

The remaining work is predominantly website integration and content entry.
No additional major content module is required for the current page structure.
Some existing fields need exposing, and a few detailed presentation slots do
not have a dedicated CMS field; those are identified below rather than hidden.

## 2. Exact Module Management identities

| CMS name | Module slug | Technical Module | Internal URL and List URL |
| --- | --- | --- | --- |
| Solutions | `solutions` | `Solution` | `/solutions` |
| Work / Case Studies | `case_studies` | `CaseStudy` | `/case_studies` |
| Expertise | `expertise` | `Expertise` | `/expertise` |
| Approach | `approaches` | `Approach` | `/approaches` |
| SEO Pages | `seo_pages` | `SeoPage` | `/seo_pages` |
| Static Pages | `pages` | `Page` | `/pages` |
| Platform Categories | `platform_categories` | `PlatformCategory` | `/platform_categories` |

The previous read-only CMS check found Solutions, Expertise, Approach and SEO
Pages already registered. Work / Case Studies was missing then. Check for an
existing `case_studies` entry before adding it; do not duplicate modules.

Use an enabled Module Management status, Visible In CMS on and Parent Module
off. An existing parent grouping is optional. Assign editor permissions and
content workflow statuses separately. Published content statuses must have the
CMS's website-published behavior enabled. Choose Prosperya project and the
intended country/languages on the content records.

No new About, Industries, Clients, Methodology or Delivery Principles module
is needed. Industries and clients currently belong to Case Study fields;
methodology and principles belong to Approach.

Platform Categories has since been restored as a supporting module. Platforms
now stores one optional `platform_category` ID, with a category selector and
list filter in the CMS. The category implementation retains the original
`ref_platform_categories` collection, translated name/description and standard
scopes/status/slug. It was registered live with Active/Inactive statuses on
2026-10-10. For another installation, register it if absent and configure editor permissions and
content statuses. No category records or Platform links were automatically
created. The website's current platform payload still returns name/logo only;
to display categories, copy the updated Platform and PlatformCategory models,
resolve publicly visible categories, expose safe category data explicitly and
grant `platform_categories` to the website key. Preserve this site's access
layers and do not expose a category merely because a Platform references it.

## 3. Where each website page gets its content

Paths below follow `/en/...` and `/fr/...`; Home is `/en` or `/fr`.

| Page | CMS source | Website connection today | Remaining action |
| --- | --- | --- | --- |
| Home | Translations, Platforms, Expertise, Case Studies, Approach; optionally Static Pages Architecture | Labels and client logos connected; authored record lists still local | Fetch real Expertise, featured Case Studies and Approach; connect Architecture if displaying the supplied four-column section |
| About `/about` | Corporate Pages record slug `about-prosperya`, selected Users, Platforms, Testimonials | Connected | Enter/publish content, select public users, check grants |
| Approach `/approach` | Approach record slug `approach` recommended, FAQs category `approach`, Translations | FAQs and labels connected; Approach records unconnected | Add Approach public API and connect every authored section |
| Expertise `/expertise` | Expertise records, Translations | CMS listing connected | Configure API grants and content |
| Expertise `/expertise/:slug` | Same Expertise record, Detail Sections, related content | Records local | Detail API; preserve existing rich-text sections and visual template |
| Solutions `/solutions` | Solutions records, related Expertise/Case Studies, Translations | Records local | List API and UI mapping |
| Solution `/solutions/:slug` | Same Solution record and its story/outcomes/metrics/relations | Records local | Detail API and relationship resolution |
| Work `/work` | Case Studies, Expertise filters, Testimonials, Translations | CMS listing connected | Configure API grants and content |
| Case Study `/work/:slug` | Same Case Study, its Platforms and selected Testimonial | Main record local | Detail API, images, architecture, metrics and selected public quote |
| Insights `/insights` | Articles and Article Categories; Newsletters for signup | Connected | Populate/publish records and category grants |
| Article `/insights/:slug` | Article record, its images/content/SEO | Connected | Populate/publish records |
| Contact `/contact` | Project Types, Project Stages, Contact Forms, FAQs category `contact`, Translations | Connected | Configure choices/default submission status/grants |
| Privacy, Terms, Cookies, Accessibility and `/corporate/:slug` | Corporate Pages; Corporate Page Categories slug `corporate` for shared navigation | Connected | Publish records, category assignment and grants; expose section images if used |
| Global navigation/footer/buttons/errors | Translations `prosperya.*`; Corporate Pages for legal links | Connected | Edit label values; navigation topology remains code |
| SEO on normal/list pages | SEO Pages | Connected | Create/publish route-specific metadata |

### Home

Hero heading, lead, CTA text, audience captions, section headings, NetSuite
diagram captions and final CTA already call the label system. Edit their
Translations entries; a separate Home module is unnecessary for these strings.
Client logos come from Platforms.

Replace Home's local `expertiseData` with published Expertise records. The
Expertise CMS has `featured`; use featured records for the preview when curated
selection is intended, with CMS order determining display order. Replace local
case studies with Case Studies marked `featured`. Use the same Approach record's
`methodology` for the process preview, so Home and Approach cannot diverge.

For the earlier four-column architecture design, author one Static Pages record
with slug `home` (recommended new content identity, not an existing connection):

| Static Pages → Architecture | Meaning |
| --- | --- |
| `architecture_title` | Section heading |
| `architecture_description` | Section introduction |
| `architecture_column_1` | Source systems: translated input values |
| `architecture_column_2` | Integration layer: translated input values |
| `architecture_column_3` | Enterprise platform: translated input values |
| `architecture_column_4` | Results: translated input values |

These are compact input lists, not accordion repeaters. Each item is a locale
map such as `{"en":"CRM","fr":"CRM"}`. Four column captions and connector
labels can stay Translations. The website's current Home uses a NetSuite
foundation graphic rather than that exact supplied architecture diagram.
Implement the intended section or deliberately adapt the existing graphic;
do not claim the four columns are connected today.

`PublicPayload::page()` exposes the legacy Static Page About fields only. It does not expose
the Architecture fields or generic `sections`, despite those fields existing in
the copied Page model. Extend its explicit payload before connecting Home or
other Static Page sections. The existing `/api/pages/{slug}` route can be reused.

### About Us

Use **Corporate Pages → About Prosperya**, published record slug `about-prosperya`.
The website keeps `/en/about` and `/fr/about`; it reads
`/api/corporate-pages/about-prosperya?locale=en` (or `fr`). No new module is needed.

| Website slot | CMS tab / stored field |
| --- | --- |
| Hero heading | Corporate Page Content → `title` (localized Name is the fallback) |
| Hero introduction | Corporate Page Content → `description` |
| Hero photograph | Images → `cover_image` |
| Story heading / body | Our Story → `our_story_title`, `our_story_description` |
| Story blocks | Our Story → `our_story_blocks`: `story_block_title`, `story_block_description`, `story_block_image` |
| Focus list | Corporate Page Content → Focus Items (`corporate_content_items`), compact translated inputs, no accordion |
| Principles | Repeater → `sections`: existing `title`, `description`, `section_image` |
| How we work heading / body | How We Work → `how_we_work_title`, `how_we_work_description` |
| Work blocks | How We Work → `how_we_work_blocks`: `work_block_title`, `work_block_description`, `work_block_image` |
| Leadership | Corporate Page Properties → About Leadership (`about_users`), selected existing User IDs |
| Each leader's name/position/bio/avatar | Users, through the site's public User serializer |
| Client logos / platform names | Platforms |
| Quotes | Testimonials |
| Fixed captions/buttons | Translations |
| Website metadata | SEO Pages record slug `about` under the current SEO contract |

Titles, rich descriptions and compact inputs are translated. The two new tabs
each include their own title/description and an ordered title/description/image
repeater. SVG and raster block images are optional and remain in the block.
The current corporate record already has introduction, cover image and a section;
the new fields do not overwrite them. No live Static Page slug `about` existed at
the 2026-10-10 source-switch check, so there was no old About content to migrate.

Selected user order is the display order. The public User API exposes public
profile fields only. Do not copy the CMS authentication User model into the
website. Private/unpublished/out-of-scope selections remain excluded. CMS
deletion checks both Corporate Page and existing Static Page user references.
Empty About sections stay hidden; unavailable records do not fall back to
invented profiles. The legacy Static Page About fields remain available for other
consumers, but this website no longer reads them for `/about`.

### Solutions

Create one Solution per business function; maintain its existing website slug
when replacing a local record, for example `finance` or `supply-chain`.

| Website slot | CMS tab / stored field |
| --- | --- |
| Title / tagline / introductory body | Solution Content → `solution_title`, `solution_tagline`, `solution_description` |
| Pain points / capabilities | Solution Content → `solution_challenges`, `solution_capabilities` |
| Detail story statement / lead | Detail Story → `solution_statement`, `solution_lead` |
| Friction heading / items | Detail Story → `solution_friction_title`, `solution_friction` |
| Outcomes | Outcomes & Metrics → `outcomes`: `outcome_title`, `outcome_description`, `outcome_image` |
| Metrics / qualifier | `metrics`: `metric_value`, `metric_label`; `solution_metrics_note` |
| Extra authored sections | Content Sections → `sections`: `section_title`, `section_description`, `section_image` |
| Related expertise / proof case studies | Related Content → `related_expertise`, `related_case_studies` |
| Main image or SVG icon / social image | Images → `solution_image`, `meta_image` |
| Record metadata | SEO tab → standard `meta_*` fields; see SEO caveat below |

The old frontend calls challenges `pains`, and nests the story in `story`.
Map these explicitly in a serializer/adapter or update the components. Old
outcomes are `[icon, text]` tuples; CMS outcomes are objects. Render CMS images
and text rather than treating an uploaded SVG URL as a Lucide icon name.
`related_case_studies` is an ordered ID list, while the old code has one
`caseStudyId`; the existing single proof slot can use the first publicly visible
related record. Never keep resolving these links from static datasets.

### Expertise

Create one Expertise record per capability. Current local slugs include ERP
transformation, systems integration, custom automation and NetSuite services;
retain the actual slugs from `expertise.data.js` when importing.

| Website slot | CMS tab / stored field |
| --- | --- |
| Heading / tagline | Expertise Content → `expertise_title`, `expertise_tagline` |
| Card summary / detail introduction | `expertise_summary`, `expertise_description` |
| Capabilities / outcomes | `expertise_capabilities`, `expertise_outcomes` |
| Detail article sections and anchor navigation | Detail Sections → `sections`: `section_title`, `section_description`, `section_image` |
| Delivery steps | Delivery → `expertise_steps`: `step_title`, `step_description`, `step_image` |
| Metrics / qualifier | Metrics → `metrics`: `metric_value`, `metric_label`; `expertise_metrics_note` |
| Related solutions / work / platforms | Related Content → `related_solutions`, `related_case_studies`, `platforms` |
| Main image / social image | Images → `expertise_image`, `meta_image` |
| Home preview selection | Properties → `featured` |

The existing detail renderer expects `{title, description, sections}` with each
section `{title, description}`. Mapping the CMS's prefixed keys preserves this
template and its current anchor navigation. Rich HTML must use `CmsRichHtml`.
The CMS summary/title fields do not represent every old short title/eyebrow as a
separate slot: use a consistent title/tagline mapping, and put fixed captions in
labels. Related Expertise is currently all other capabilities: derive that from
the published Expertise list; there is no `related_expertise` field on Expertise.

### Work / Case Studies

Create one Case Study per project. Listing cards and detail routes use the same
record, not separate modules.

| Website slot | CMS tab / stored field |
| --- | --- |
| Title, client, industry, duration | Case Study Content → `case_study_title`, `case_study_client`, `case_study_industry`, `case_study_duration` |
| Listing summary / detail introduction | `case_study_summary`, `case_study_description` |
| Challenge / challenge bullets | `case_study_challenge`, `case_study_challenge_points` |
| Solution / results narrative | `case_study_solution`, `case_study_results` |
| Numeric results / qualifier | Results & Metrics → `case_study_metrics`: `metric_value`, `metric_label`; `case_study_metrics_note` |
| Extra sections | Detail Sections → `sections`: `section_title`, `section_description`, `section_image` |
| Deliverables / implementation steps | Implementation → `case_study_deliverables`, `implementation_steps` with `step_title`, `step_description`, `step_image` |
| Before/after headings and system lists | Architecture → `case_study_before_title`, `case_study_after_title`, `case_study_before`, `case_study_after` |
| Related content / stack / quote | Relationships → `related_solutions`, `related_expertise`, `platforms`, `case_study_testimonial` |
| Main image / gallery / social image | Images → `case_study_image`, `case_study_gallery`, `meta_image` |
| Featured Home/Work project | Properties → `featured` |

Derive the industry filter from public Case Study values; no Industries module
currently exists. Keep the filter identity stable across locales rather than
using the translated display string as a permanent ID. Capability filters come
from `related_expertise`; stack names/logos come from linked public Platforms.
The quote comes from the selected existing Testimonial, not a copied private
user or a hardcoded tuple. The next-project link comes from the ordered public
Case Study list.

**Exact old-layout gaps:** the local detail file separately has `heroFacts`,
`glance` (including a note per fact), `features`, before/after captions and result
metrics. The CMS currently has one metrics repeater, a deliverables list, extra
sections and before/after title fields. There is no independent `heroFacts` or
`glance` repeater and no per-metric note/icon field. Reuse metrics for fact slots,
deliverables for solution bullets, sections for additional narrative and existing
architecture headings for captions where that matches the intended design.
If independently editable values are required in all those slots, extend the
existing Case Study module with specifically named fields. Do not invent public
response fields backed by no CMS data or silently discard distinct source data
during import. This is an existing-module extension, not a new module.

Old metric IDs such as `markets` and `flows` drive an icon allowlist in Work.
CMS metrics have value/label only. Update that renderer to display arbitrary CMS
metrics with a generic presentation instead of filtering all new metrics out.

### Approach

Use one published Approach record with slug `approach` (recommended identity;
the website does not request it yet). No category field is needed on Approach.

| Website slot | CMS tab / stored field |
| --- | --- |
| Hero heading / introduction | Approach Content → `approach_title`, `approach_description` |
| Methodology sequence | Methodology → `methodology` rows: `methodology_title`, `methodology_buttons`, `methodology_descriptions`, `methodology_image` |
| How we work cards | How We Work → `how_we_work`: `work_title`, `work_description`, `work_image` |
| Collaboration heading / checklist | Collaboration & Principles → `collaboration_title`, `collaboration_items` |
| Client / shared goals / company / continuous value diagram | `diagram_client_title`, `diagram_client_description`, `diagram_shared_title`, `diagram_shared_description`, `diagram_company_title`, `diagram_company_description`, `diagram_value_title`, `diagram_value_description` |
| Delivery principles | `principles_title`, `principles`: `principle_title`, `principle_description`, `principle_image` |
| FAQs | FAQs assigned to category slug `approach` |
| Static section captions / buttons / navigation | Translations |

Methodology buttons and descriptions are compact translated lists inside a
methodology row. The old `companyData.process` separates description, activities
and deliverable. Use buttons for activities and define/document how description
entries map to introduction and deliverable, or render the ordered description
list directly. There is no separate named deliverable field today. How We Work
has one rich description per row; its existing bullet content can live as an
HTML list in that description instead of a separate points array.

The current CMS Approach form **does not have a separate Images tab**:
methodology/work/principle images are in their repeaters, and Meta Image is in
SEO. The other three new modules do have Images tabs. To apply the user's
"always an Images tab" convention to Approach, adjust its existing Create/Edit
forms and move Meta Image there; add a main Approach image only if it is actually
used. This handoff records the gap; it has not performed that change.

### Insights, Contact and corporate/legal pages

Insights article title/excerpt/body/images come from Articles; its filters come
from Article Categories. Newsletter submissions go to Newsletters. Fixed headings,
signup copy and filters such as "All insights" are labels.

Contact options come from Project Types and Project Stages; submissions go to
Contact Forms. FAQs use category slug `contact`. Form labels and fixed validation
messages are Translations. Form structure, field validation and submission
behavior remain implementation. Configure a default status for new submissions.

Corporate Pages owns legal/document text and its content-section repeater. Shared
footer/sidebar links use Corporate Page Categories slug `corporate`. Storage
slugs include `privacy-policy`, `terms-of-use`, `cookie-policy`, `accessibility`.
Marketing About `/about` reads the same Corporate Page `about-prosperya`
through its dedicated About layout. Existing French legal routes remain translated.

The website's Corporate Page detail payload explicitly exposes translated
`sections[].section_image`, the cover image, both new block lists, the compact
focus values and selected public User IDs. The list payload omits these detail
fields. About displays section icons and new block images; the generic legal
template still displays section title/description only.

## 4. Labels: what the editor does

Short fixed copy belongs in **Translations**, not a new content module: navigation,
buttons, listing hero text, section captions, filter labels, diagram captions,
loading/error/accessibility strings and fixed CTA copy. Per-record authored titles,
descriptions, metrics, images and relationships belong to their content modules.

The shared EN/FR manifest is `docs/cms/prosperya-labels.json`. The CMS has the
matching manifest, insert-only import command and migration. Imported keys begin
`prosperya.`. The website prefixes its `t()` keys and reads `/api/labels` across
all pages. Edit the Source/EN/FR values, keep keys unchanged, and preserve tokens
such as `{count}`, `{minutes}`, `{name}` and `{solution}`.

Existing CMS edits are preserved by the importer. Missing/blank label values
use the bundled localized fallback. Grant `translations` to the website key.
For new website label calls, regenerate with `node scripts/export-labels.mjs`
inside `frontend`, update the CMS manifest and run the insert-only importer.
See `about-and-labels.md` for the exact targeting commands. Labels can change
fixed list text, but cannot add/remove records in a hardcoded array.

## 5. SEO: current behavior versus the desired next integration

**Current website behavior:** normal routes, including Solution/Work/Expertise
details, use `SeoPage`. Article details use `Article`; corporate details use
`CorporatePage`. The SEO model allowlist currently accepts only those three.
New module SEO fields are not automatically used by the website.

Under the current behavior, SEO Pages slugs omit the language prefix:
`home`, `about`, `approach`, `solutions`, `work`, `expertise`, `insights`,
`contact`, and e.g. `solutions/finance`, `work/global-retail-core`,
`expertise/systems-integration`. These are metadata records, not new routes.
CMS slugs are generated on Create; use Edit to set the exact route slug,
including the slash for a detail-route SEO record.

Recommended integration: keep SEO Pages for listings and standalone routes;
use each Solution, Case Study, Expertise and Approach record's own SEO for its
content route. That requires updating the browser hook's model selection, backend
allowlist/route mapping, initial HTML metadata, canonical checks and sitemap
generation together. Do not change just the browser title and leave server SEO
on another source. Until implemented, populate SEO Pages for those routes.

Standard fields are localized `meta_title`, `meta_keywords`, `meta_description`,
plus `meta_url`, `meta_type` and `meta_image`. Keep the existing backend treatment
of canonical URLs, indexing, visibility and language alternates. Optional blank
SEO fields must still save in the CMS. A missing normal-route SEO record currently
leaves the page usable with `noindex`.

## 6. Can I copy the whole model file into the website?

**Yes, for these content models in this particular project:** copy the complete
CMS `backend/app/Models/Solution.php`, `CaseStudy.php`, `Expertise.php` and
`Approach.php` into the website's same folder, keeping namespace and class names.
The website intentionally provides compatible base classes/traits so copied
content models can be used unchanged. Check their referenced models/support
classes exist. Synchronize later CMS field changes deliberately.

**Copying a model is only the data-access step.** You still need a site-owned
public controller, an explicit safe payload, routes, frontend API methods and
React queries/rendering. Models do not create endpoints or remove static imports.

Do not overwrite the website's `Base/`, `Concerns/`, `Traits/`, query builder,
access services or middleware with the CMS versions. They enforce website-key
access. Do not copy CMS CRUD controllers or React CMS forms into the public site.
Do not copy CMS-internal User/ApiKey/Role/Tenant models; keep the site's existing
public User implementation. If you meant moving a module to another CMS instead
of this website, model-only is insufficient there too: the ordinary module also
needs its CMS controller, Index/Create/Edit React pages and registration/setup.

The website backend reads the CMS MongoDB and validates the website key with
the CMS. The browser calls the website's `/api/...` routes, not authenticated CMS
admin CRUD routes. Keep server credentials out of browser configuration.

## 7. Concrete implementation checklist for the other chat

1. Read this file, `README.md`, `docs/frontend-backend-integration.md`,
   `docs/seo-integration.md` and `docs/cms/about-and-labels.md`. Treat this audited
   handoff as the current scope where older docs list completed work as pending.
2. Copy the four current content models from the CMS. Check compatible helpers
   and supporting referenced models exist; preserve the site's access layers.
3. Implement proposed website endpoints (these do **not** exist today):

   | Purpose | Proposed URL |
   | --- | --- |
   | Solutions list / detail | `/api/solutions`, `/api/solutions/{slug}` |
   | Case Studies list / detail | `/api/case-studies`, `/api/case-studies/{slug}` |
   | Expertise list / detail | `/api/expertise`, `/api/expertise/{slug}` |
   | Approach content | `/api/approaches/{slug}` |

   Put them inside the existing `website.access` middleware group. Mirror
   existing public controller filtering: key-authorized tenant/module/owner,
   project, published status, country, locale, deletion, active and scheduling.
   Use the existing reference-aware builder. `forWebsite()` alone does not
   apply every content filter. Use capped pagination and stable CMS order.
4. Add explicit localized serializers for fields listed above. Preserve repeater
   order and reference IDs. Resolve related records through their own scoped
   public queries; a reference is not permission to publish its target. Batch
   reference resolution, avoiding a query per card. Normalize media through
   existing `PublicPayload::media()` and render rich descriptions safely.
5. Extend `websiteApi.js`, then replace static imports/queries on every relevant
   page, Home preview, detail, related-content block and filter. Keep EN/FR,
   cancellation signals, existing loading skeletons/retry/empty states and route
   recovery. Empty CMS content must not silently show fictional local records.
6. Handle the explicitly documented Case Study/Approach data-shape gaps. Use
   existing rich sections/lists where suitable; if exact independent fields are
   needed, extend the existing module consistently in model/Create/Edit and
   serializer. Preserve distinct source data during any migration.
7. Expose Static Page Architecture/sections and connect the intended Home
   architecture section. Apply
   the separate Images-tab convention to Approach.
8. Implement the SEO source change coherently, including initial HTML and
   sitemaps for arbitrary public CMS slugs. Preserve older URLs where possible.
9. Content import is separate work: existing local files are source material,
   not already-imported CMS records. If seeding them, use an explicit tenant/
   project, stable slug matching, translation preservation and relationship ID
   resolution in two passes. Do not overwrite editorial records or portray the
   datasets' illustrative figures/quotes as verified client results.
10. Verify with test fixtures: EN/FR text, arbitrary new slugs, ordered media and
    repeaters, pagination, omitted/unpublished/denied related records, no private
    user fields, zero/one methodology stage, changing industry filters, empty
    metrics, missing content, SEO/canonical/sitemap behavior and mobile layout.
    Run existing relevant checks and production build. Use throwaway databases
    for write tests; no test submissions or seeds against live editorial data.

Retire these production record imports once every consumer has migrated:
`expertise.data.js`, `expertiseDetails.data.js`, `solutions.data.js`,
`caseStudies.data.js`, `caseStudyDetails.data.js`, and `company.data.js` process.
Keep design assets, icon geometry, animations, form schema and fixed route
topology in code. `projectInquiry.data.js` is a form schema, not missing content.

## 8. CMS owner's remaining setup

1. Register Work / Case Studies if absent; keep existing module identities.
2. Assign editor roles and published statuses to the content modules.
3. Grant the website key: `solutions`, `case_studies`, `expertise`, `approaches`,
   `pages`, `users`, `translations`, `seo_pages`, `platforms`, `testimonials`,
   `articles`, `article_categories`, `faqs`, `faq_categories`, `corporate_pages`,
   `corporate_page_categories`, `project_types`, `project_stages`, `contact_forms`,
   `newsletters`, with appropriate project/country/language access.
4. Enter translated content and public media. Publish Corporate Page About slug `about-prosperya`, the
   chosen Approach record, real Solutions/Expertise/Case Studies, FAQ categories
   `approach` and `contact`, and corporate navigation category `corporate`.
5. Select existing Users for About, Platforms for technology relations and
   Testimonials for project quotes. Enter honest metric qualifiers.
6. Edit Translations rather than creating new modules for captions. Populate
   SEO Pages while the website still uses its current SEO source contract.
7. After website connection, verify a CMS edit changes the correct EN/FR page;
   record creation/deletion/order must change lists and detail availability too.

This document creates no CMS records, grants or new website endpoints. It is the
verified content map and implementation handoff, not a completion claim for the
remaining integration.
