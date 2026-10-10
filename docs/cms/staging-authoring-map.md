# Prosperya staging: CMS authoring map

Reviewed 2026-10-10 against `Mohammad-Houry1/prosperya-site`, branch `staging`,
commit `d3eb84f`. This is the current offline design reference, not the separate
`Mohammad-Houry1/Prosperya` repository. Staging intentionally uses bundled content.
Its older integration audit describes earlier connected code, not the current
runtime. Adding CMS fields alone does not connect staging to the CMS.

## Modules to use

| Website area | CMS module | Module Management identity |
| --- | --- | --- |
| Work listing, spotlight, homepage project cards, Work details | Case Studies | `case_studies` / `CaseStudy` |
| Expertise listing, right-hand heading list, homepage cards, details | Expertise | `expertise` / `Expertise` |
| Solutions listing and details | Solutions | `solutions` / `Solution` |
| Approach and homepage methodology preview | Approach | `approaches` / `Approach` |
| About | Corporate Pages, record `about-prosperya` | `corporate_pages` / `CorporatePage` |
| Leadership names, positions, bios, avatars, social links | Users | existing Users module |
| Platforms and their grouping | Platforms + Platform Categories | `platforms` / `Platform`, `platform_categories` / `PlatformCategory` |
| Listing metadata | SEO Pages, slug matching the route | `seo_pages` / `SeoPage` |
| Insights, quotes, questions | Articles, Testimonials, FAQ | existing modules |
| Shared diagram architecture | Static Pages, record `solutions` | `pages` / `Page` |
| Fixed headings, buttons, captions, navigation and interface messages | Translations | existing Translations module |

No additional module registrations are needed for the field additions below.
Existing modules must be visible, have their statuses assigned, and have the
appropriate editor permissions. Publishing records and website-key grants are
separate configuration tasks; this change does not publish content or alter grants.

## Work: one shared detail template

- Properties: name, scope, status, Featured; CMS reordering controls record order.
- Case Study Content: title, industry, client, duration, summary for cards;
  description for detail introduction; challenge and compact challenge points;
  solution for the intervention text.
- **New Hero Facts:** `case_study_hero_facts`, ordered rows with translated
  `hero_fact_value` and `hero_fact_label`. Maps to staging `detail.heroFacts`.
  These are independent from results metrics. Do not fill them with invented data.
- Results & Metrics: `case_study_results` maps to `outcomeIntro`;
  `case_study_metrics` value/label rows map to `outcomes`; metrics note supplies
  any qualification. The new shared template has no separate glance panel.
- Implementation: compact `case_study_deliverables` maps to the solution bullets.
- Architecture: translated before/after titles and compact before/after system
  lists map to the two architecture columns. Counts come from list lengths.
- Relationships: selected Platforms supply the technology list in selection
  order; Related Expertise supplies the listing filter; the selected Testimonial
  supplies the approved quote and attribution. Related Solutions remains available.
- Images: main image for grid, spotlight and detail cover; gallery and detail
  sections remain available but have no slots in the new shared Work template.
- SEO: the record's own SEO tab for `/work/{slug}`; SEO Pages `work` for listing.

The spotlight rotation, next/previous controls and its timing are presentation
code. Its slides come from CMS records. The next project is another published
Case Study; no relationship field is needed for automatic ordering.

## Expertise

- `expertise_title`: compact card heading, e.g. “Transform”.
- **New `expertise_detail_title`:** full capability name, e.g. “ERP Transformation”.
  Maps to staging `detailTitle`, the listing name and detail-page heading.
  Existing records can keep using `expertise_title` if the new field is empty.
- Tagline and summary: card/list supporting copy. Description: detail intro.
- Capabilities: translated compact service list for overview.
- Detail Sections: translated titles, rich descriptions and optional images.
  Existing rich descriptions can hold nested headings, paragraphs and lists.
- Images: overview image and Meta Image. Related Content remains available.
- SEO: record SEO for details; SEO Pages `expertise` for the listing.

Do not create new modules for each detail subsection. Existing `sections` covers
the retained detail layout. Hero animation presets currently follow known slugs;
arbitrary slugs need a supported default. Geometry and motion remain code.

## Approach

- Content: title and rich description for the hero.
- Methodology: each ordered row has title, compact translated button/activity
  inputs, dynamic rich descriptions, image, and **new `methodology_deliverable`**.
  Map buttons to staging stage activities; descriptions to stage body copy;
  deliverable to the stage handover text. Stage numbers derive from row order.
- How We Work: title, rich description, image, and **new `work_points`**, a compact
  translated input list inside each row. This covers each practice's bullet list.
- Collaboration & Principles: existing collaboration title/items, four diagram
  title/description pairs, principles title and ordered title/description/image rows.
- **Images tab:** new optional `approach_image` plus existing `meta_image`.
  Meta Image has moved out of SEO without changing its stored key. Row images
  stay in their rows. The current hero wave can remain decorative motion.
- SEO: record SEO. FAQs come from the existing FAQ module.

## About: Corporate Pages

Use Corporate Pages `about-prosperya`, preserving the earlier agreed source.
Do not switch About back to Static Pages merely because the historical audit
mentions `pages/about`.

- Content title/description: hero; Cover Image: photograph; media metadata: alt.
- **New Corporate Facts:** `corporate_facts`, ordered rows with translated
  `corporate_fact_title`, `corporate_fact_value` and optional
  `corporate_fact_image`. Covers Headquarters / Paris, Focus / Architecture,
  Core Platform / NetSuite, Working Model / Senior-led.
- Our Story: section title/description and optional authored story blocks.
- Focus: existing `corporate_content_items` compact translated text inputs.
- Principles: existing `sections` title/description/image rows.
- How We Work: section title/description and ordered work blocks.
- Leadership: `about_users` selects Users; keep profile content in Users.
- Expertise, Platforms and Testimonials on About use those existing modules.

Fixed section eyebrows and photo captions can be labels. Images/icons can be
uploaded SVGs; they do not need an icon taxonomy module.

## Home, Solutions and shared content

Home previews reuse featured Expertise/Case Studies, Approach methodology,
Users, Platforms and Testimonials. Fixed hero wording, audience captions and
section copy use Translations. The current design's company strip actually
reads Platforms; it is not a separate real-client-logo collection. Rename its
labels to describe technology platforms unless real client logos are requested.

Solutions already has title/tagline/description, statement/lead, friction title
and compact list, challenges/capabilities, outcomes, metrics/note, sections,
related Expertise/Case Studies/**Articles**, Images and SEO. Its Animation tab
already supplies a renderer selector, translated centre/result/signal captions
and compact lists of sources, lanes, steps, suppliers, hubs and channels.

The shared Solutions architecture uses Static Pages `solutions`:
`architecture_title`, `architecture_description`, `architecture_column_1` through
`architecture_column_4`. An ordered input list is editable without accordion rows.
Fixed layer captions are labels. Make rendering accommodate variable list counts.

## Remaining work after these CMS additions

1. Copy the changed CMS models into the website backend with its expected base
   classes/contracts. A model alone is not a working CMS module: keep its CMS
   controller and Create/Edit/Index pages in the CMS project.
2. Extend the public website payload allowlists for hero facts, detail title,
   methodology deliverable, work points, Approach image and Corporate facts.
   Also restore/expose Solution animation fields and related Articles, and the
   canonical Platform Category relation. Resolve selected relations through the
   target's publication scopes and grants; never return private snapshots.
3. Replace staging's local record imports and `stagingContent` calls on the
   intended connected branch. Keep the approved layouts and rotating spotlight.
   Render rich CMS descriptions through the existing sanitizer, not plain text.
4. Replace fixed copy with Translations and refresh the label import manifest:
   staging added EN/FR text directly in Work/Expertise and the new Work template.
   Remove illustrative disclaimers when showing approved real records.
5. Connect About to Corporate Pages `about-prosperya`, including its new facts.
   Do not use the stale Page About mapping in the old integration audit.
6. Diagram layouts must derive boxes/steps from authored arrays. NetSuiteCoreDiagram
   still has embedded wording and fixed slots; use labels or authored inputs for
   its wording. Existing audience icons, route paths and decorative scene geometry
   can stay in code.
7. Enter approved EN/FR content, uploads and relationships; configure publication
   scopes, module visibility/statuses/permissions and the website key's grants.
8. Verify empty content, arbitrary published slugs, multilingual rendering,
   mobile overflow and scoped relationship access; deploy the connected frontend
   and backend. Staging's hardcoded preview is not evidence of CMS completeness.

These new fields are optional and additive. Existing keys and records remain
valid; no backfill or database migration is required. Content is not seeded.
