# Prosperya CMS modules: registration and content

The code includes all three content modules. Creating a Module Management entry
connects its deployed implementation to the CMS; it does not generate code.

## Module Management entries

| Name | Slug | Technical Module | Internal URL / List URL |
| --- | --- | --- | --- |
| Solutions | `solutions` | `Solution` | `/solutions` |
| Work / Case Studies | `case_studies` | `CaseStudy` | `/case_studies` |
| Expertise | `expertise` | `Expertise` | `/expertise` |
| Approach | `approaches` | `Approach` | `/approaches` |
| SEO Pages | `seo_pages` | `SeoPage` | `/seo_pages` |
| Platform Categories | `platform_categories` | `PlatformCategory` | `/platform_categories` |

A read-only check of the Prosperya tenant on 2026-10-10 found Solutions,
Expertise, Approach and SEO Pages already registered with these identities.
Keep those entries. Only Work / Case Studies was missing at that check; create
it if it is still absent. Never add a duplicate row for the same implementation.
Platform Categories was also absent at its separate 2026-10-10 check. Register
the restored implementation if no current row exists; configure its content
statuses and editor permissions. Its legacy category records are retained.

For each entry:

1. Select an enabled **Module Management Status**. This is the module entry's
   status, distinct from the content records' workflow statuses.
2. Turn **Visible In CMS** on and **Parent Module** off. Optionally choose an
   existing grouping Parent; no new parent/category module is required.
3. Set Internal URL and List URL to the path in the table. External URL and
   Frontend URL can remain empty. Detail URL may remain empty; the standard
   CMS route is `/<slug>/<record-id>/edit`.
4. In **Statuses**, assign the content workflow statuses you want, such as
   Draft and Published, to these module records. Use the CMS's existing status
   records. Published statuses must have record-enabled and record-published
   behavior configured for public website content.
5. In **Roles**, grant the relevant editors View/Create/Edit/Delete permissions.
   Keep project, country and language authority appropriate to those editors.
6. For future website reads, include `solutions`, `case_studies` and `expertise`
   in the website API key's Modules and the correct project/country/language
   grants. Existing supporting records use Platforms and Testimonials grants.
7. Refresh the CMS and open the module list. Create each record with a name,
   content status and scopes. Record slugs are generated on Create and editable
   on Edit. Add main images in **Images** and metadata in **SEO**.

## What belongs where

- **Solutions:** translated title/tagline/description; compact challenges and
  capabilities; story statement/lead/friction; outcomes, metrics and detail
  sections; related Expertise, Case Studies and Articles; one image/icon and Meta Image.
  The Animation tab contains compact translated lists for diagram boxes and
  workflow steps. See [the animation handoff](solutions-animation-handoff.md)
  for fields and the remaining website integration.
- **Work / Case Studies:** translated title, client, industry, duration and
  summary/description; challenge/solution/results; challenge points, metrics,
  detail sections, deliverables and implementation steps; before/after
  architecture headings and lists; related Solutions, Expertise, Platforms and
  an existing Testimonial; main image, Meta Image and gallery.
- **Expertise:** translated title/tagline/summary/description; compact
  capabilities and outcomes; detail sections, delivery steps and metrics;
  related Solutions, Case Studies and Platforms; main image and Meta Image.
- **Approach:** Content, Methodology, How We Work, Collaboration & Principles
  and SEO in its existing implementation. Its current forms keep repeater
  images inside their rows and Meta Image in SEO; a separate Images tab remains
  to be added to match the convention used by the other three modules.
- **SEO Pages:** metadata for listing/standalone routes, including Meta Image.
- **Platform Categories:** translated category name/description, slug and
  standard scopes/status. In Platforms → Properties, select a Category; the
  platform list also has a category column and filter. Category is optional,
  so existing uncategorized logos still save. Unlink Platforms before deleting
  their category. Grant `platform_categories` to the website key only when a
  website API reads category records; the current platform payload does not.
- **About Us:** existing **Corporate Pages** (`CorporatePage`, `corporate_pages`,
  `/corporate_pages`), record slug `about-prosperya`. Corporate Content holds the
  hero and compact translated Focus Items; Our Story and How We Work each have
  title/description and title/description/image blocks. Repeater supplies
  Principles; Properties selects leadership from Users. No new About module.
  Fixed interface copy uses existing **Translations**.

All descriptions use translated rich text. Empty optional content and SEO
values can be saved. Nested repeater images remain in their own rows. Array
order is preserved and records are reorderable. Related selections store live
tenant IDs; references block deletion until they are removed. Existing
Platforms and Testimonials remain the reusable supporting modules.

## Delivery scope

These are complete CMS authoring modules. This release does not seed real
client/project content, grant website access or replace the website's static
Solutions/Work/Expertise record datasets. Their public website APIs and page
connections remain separate work. CMS registration and website connection are
different steps; the forms described above work after deployment and setup.

For the complete page-by-page website content map, exact field mappings,
remaining integration gaps and model-copy instructions, see
[dynamic-content-handoff.md](dynamic-content-handoff.md). A matching copy is
kept in the website repository at `docs/cms/dynamic-content-handoff.md` so it can
be passed directly to the chat finishing the website.

Search indexing now lives once in `CmsController`. Each model declares its
searchable fields; saves index all their translations and only matching
sidecar fields. Existing records get the updated index on their next save.

Platform Categories was registered live on 2026-10-10 with Active/Inactive statuses;
its selector is available in Platforms. No category content was seeded.
