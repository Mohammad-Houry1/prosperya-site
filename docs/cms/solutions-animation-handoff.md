# Solutions: dynamic diagrams and remaining website work

The CMS additions are implemented. The website still needs its Solution API and
diagram connection; adding CMS fields alone does not replace its local data.
Use the existing modules below. No new animation or architecture module is needed.

## 1. Each Solution

Edit **Solutions → the record → Animation**. Choose one of four implemented
website renderer types: `consolidation`, `workflow`, `network`, `insight`.
The selector is an implementation choice, not a new category or reference module.

| Animation | CMS field | Meaning |
| --- | --- | --- |
| All | `solution_animation_type` | Renderer type; leave empty to use the Solution image instead |
| Consolidation | `solution_animation_sources` | Compact translated source boxes; add/remove/reorder |
| Consolidation | `solution_animation_centre_label` | Translated centre box label |
| Consolidation | `solution_animation_result_label` | Translated report/result label |
| Workflow | `solution_animation_lanes` | Compact translated lane captions; add/remove/reorder |
| Workflow | `solution_animation_steps` | Compact translated step boxes in process order; add/remove/reorder |
| Network | `solution_animation_suppliers` | Compact translated supplier boxes |
| Network | `solution_animation_hubs` | Compact translated hub/warehouse boxes |
| Network | `solution_animation_channels` | Compact translated destination/channel boxes |
| Insight | `solution_animation_signal_label` | Translated decorative chart caption |

These are text inputs, without accordion rows. Lists store locale maps such as
`[{"en":"Order","fr":"Commande"},{"en":"Confirm","fr":"Confirmer"}]`.
Current limits are 20 sources/suppliers/channels, 10 lanes/hubs and 40 steps;
each translated value has a 255-character limit. Empty values are optional.
Titles, taglines, content, outcomes, metrics and pictures remain in the existing
Solution tabs. Select articles in **Related Content → Related Articles**;
`related_articles` stores up to 50 live tenant Article IDs in selection order.
Article deletion is blocked until Solutions release their references.

## 2. Shared architecture on the Solutions listing

Use **Static Pages**, one published record with slug `solutions`, and its existing
**Architecture** tab. This is a page-level diagram, shared by all Solutions.

| CMS field | Website layer |
| --- | --- |
| `architecture_title` | Heading beside the diagram |
| `architecture_description` | Rich translated introduction beside the diagram |
| `architecture_column_1` | Experience layer boxes (Employees, Partners, etc.) |
| `architecture_column_2` | Solution layer boxes |
| `architecture_column_3` | Platform layer boxes |
| `architecture_column_4` | Foundation layer boxes |

Each column is already a compact translated input list. Its name describes
storage, not the horizontal/vertical direction of the website drawing.
The four layer captions remain editable through existing Translations keys
`prosperya.components.visuals.layered-architecture.copy.*`. Avoid creating a
duplicate content field for fixed captions already managed by labels.

## 3. Website implementation still required

1. Copy the current `Solution.php` and `Article.php` content models into the
   website, preserving its own Base/Concerns/Traits and access layers. These
   copies are included in the website handoff change.
2. Add public Solution list/detail APIs under `website.access`. Explicitly filter
   tenant, module, project, country, language, published/enabled status, deletion
   and scheduling. Never return whole CMS documents.
3. Serialize translated Solution content and animation values explicitly.
   Resolve related Articles, Expertise and Case Studies with their own public
   scopes and module grants. Preserve selection order and omit inaccessible rows.
4. Connect Solutions list/detail queries to those APIs; remove their imports of
   `solutions.data.js`. Render related Articles using the existing article card
   layout and `/insights/:slug` routes.
5. Expose the existing Static Page Architecture fields in `PublicPayload::page()`
   and fetch `/api/pages/solutions?locale=...` for this diagram. The current Page
   serializer does not expose them yet. Do not mix this page with About, which
   now reads Corporate Pages → `about-prosperya`.
6. Pass CMS animation data into `SolutionMetaphor`. Replace fixed coordinates and
   array sizes (`STEP_AT`, `SUPPLIERS`, `HUBS`, `CHANNELS`, fixed entity spacing)
   with positions derived from actual list lengths. Generate connectors from
   those positions. Workflow steps follow CMS order; distribute them across the
   ordered lanes, or add an explicit grouping contract if the editor needs to
   assign individual steps to a particular lane. Do not silently discard extras.
7. Let `LayeredArchitecture` accept the four CMS arrays. Generate boxes and column
   widths from actual counts, including zero/one/many items, and wrap responsively.
   Keep accessible text and reduced-motion behavior. Long translated labels must
   wrap or have an accessible full-text alternative. Business content must not
   silently fall back to the illustrative local records.

The timing, SVG paths, particle interpolation, hover/scroll triggers, responsive
layout and reduced-motion handling remain website implementation. CMS values
control the displayed content and number/order of boxes. The Insight particles
are decorative, not invented business metrics or a real analytics dataset.

## 4. What still uses hardcoded record data

| Area | Remaining work |
| --- | --- |
| Solutions list/detail and these animations | API connection and renderer updates above |
| Work list/case-study detail | Replace Case Study local records and architecture/metrics mappings with public CMS records |
| Expertise list/detail | Replace local Expertise datasets with public CMS records |
| Approach | Connect authored Methodology, How We Work, Collaboration and Principles; FAQs/labels are already connected |
| Home | Connect its Expertise, featured Work and Approach summaries; optionally connect its own Static Page Architecture diagram |
| Platform categories | Expose public category data if the website will display/filter it; current platform API returns names/logos |

About, Insights, Contact, legal/corporate content, selected public Users,
Testimonials, Platforms, labels and normal-route SEO have existing connections.
Editors still need to enter/publish real content and verify website-key grants.
Fixed headings, buttons and diagram captions already use Translations. Navigation
structure, page layout, validation and animation behavior remain code by design.
