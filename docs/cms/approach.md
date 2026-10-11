# Approach detail pages

The main detailed Approach record is identified by the CMS slug `our-approach`. Publish it in the `Approach` module and populate both English and French.

- Main routes: `/en/approach/our-approach` and `/fr/approach/our-approach`.
- Detail API: `GET /api/approaches/{slug}?locale=en|fr`.
- Other published Approach slugs use the same detail template.
- Existing `/en|fr/approach` links redirect to the main detail route. Server HTML uses a 301 when the published record exists; the frontend route redirects during client navigation.
- Home's methodology preview reads `our-approach`, using the same CMS methodology fields.

Titles, introduction, uploaded image, methodology descriptions/activities/deliverables, practice descriptions/points/media, collaboration labels/items and principles all come from the published record. The website's `Approach.php` is copied unchanged from the CMS engine. Newly connected fields are `methodology_deliverable`, `work_points` and `approach_image`. The populated collaboration/principles section now renders correctly.

SEO, locale alternates and sitemap entries resolve the actual detail slug. Missing or unpublished slugs return missing-content feedback. Access and localization rules remain unchanged. Existing decorative motion and translated interface labels retain their current sources; no CMS content, image, grant or label was written during this change.

Verification covers localized nested fields, unpublished records, canonical detail URLs, old-link redirection, authored deliverables/points/image/collaboration, the Home preview and EN/FR desktop/mobile routes.
