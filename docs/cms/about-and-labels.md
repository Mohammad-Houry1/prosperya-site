# About Us and website labels

## Where to edit

Use **Corporate Pages → About Prosperya** (slug `about-prosperya`) for `/en/about`
and `/fr/about`. No additional module registration is needed.

| Website content | CMS location |
| --- | --- |
| Hero heading and introduction | Corporate Page Content → Title and Description |
| Focus items | Corporate Page Content → Focus Items; add compact translated inputs |
| Story heading, description and blocks | Our Story; each block has translated Title, rich Description and Image / Icon |
| Work heading, description and blocks | How We Work; each block has translated Title, rich Description and Image / Icon |
| Principles | Repeater → Content Sections: translated Title, rich Description and Section Image / Icon |
| Leadership selection | Corporate Page Properties → About Leadership; selection order is display order |
| Leadership names, positions, biographies and avatars | Users |
| Hero picture | Images → Cover Image |
| Client logos and platform names | Platforms |
| Quotes | Testimonials |
| Section captions, navigation, buttons, filters, forms, accessibility and error text | Translations, keys beginning `prosperya.` |
| About metadata and social image | SEO Pages record slug `about`, as in `../seo-integration.md` |

Grant the website API key `corporate_pages`, `users`, `translations`, `platforms`,
`testimonials` and `seo_pages`, alongside modules used elsewhere. Assign the
corporate record and selected public users to Prosperya and the applicable
countries/languages with a published status. Selecting a private or unpublished
user does not expose them.

`/api/corporate-pages/about-prosperya?locale=en` returns explicit public fields.
`/api/users?ids[]=...` returns selected public profiles, excluding email,
credentials, permissions and internal fields. Blank sections stay hidden; denied
or unpublished corporate content shows an unavailable state. Static Pages is no
longer the `/about` content source; its existing data remains available to other
consumers. Existing corporate introduction, cover image and section content are
preserved; fill the new tabs and select leadership users on this record.

Corporate Pages retains its own SEO fields and Meta Image for corporate detail
routes. `/about` remains a normal route and uses SEO Pages for its metadata.

## Import labels automatically

`prosperya-labels.json` is the generated EN/FR dictionary. The matching CMS copy lives at `backend/database/data/prosperya-labels.json`. The CMS migration `2026_10_09_000001_import_prosperya_website_labels` inserts missing entries on deployment when exactly one live project named/coded Prosperya can be identified. Existing labels, extra languages, edits and deliberately deleted entries are preserved. Rollback does not delete editorial content.

For an explicit target or a later import, run in the CMS backend:

```sh
php artisan cms:import-prosperya-labels --project=<project-id> --dry-run
php artisan cms:import-prosperya-labels --project=<project-id>
```

Client-database isolation also requires `--tenant=<tenant-id>`. Project-database isolation enters the selected project's database automatically. An ambiguous project never gets chosen silently. `--file=/absolute/path/to/prosperya-labels.json` accepts the exported file if needed. The CMS dictionary identifies labels by tenant + key, so the importer preserves an existing key even when an editor assigned it to another project; correct that existing label's scope in the CMS if it should appear on this website.

Edit imported Source/EN/FR values in Translations. Keys remain stable. Preserve interpolation tokens such as `{count}`, `{minutes}`, `{name}` and `{solution}` in translated templates. Blank or missing translations use the website's original text for the selected language. Labels are loaded across all API pages, including those beyond the 500-record page limit. The public website only reads the dictionary; it never registers labels or writes them automatically.

After adding literal `t(key, { en, fr })` calls or changing source fallback text, regenerate with:

```sh
cd frontend
node scripts/export-labels.mjs
```

Copy the result into the CMS manifest and run the explicit insert-only import command. It adds new keys; changes to fallback text do not overwrite existing CMS editorial choices.

## Remaining content modules

See [the complete page-by-page handoff](dynamic-content-handoff.md) for current
field mappings, the remaining connections, identified small gaps and instructions
for copying content models into this website.

Fixed interface copy is editable through labels. This does not turn lists/detail records in `solutions.data.js`, `caseStudies.data.js`, `caseStudyDetails.data.js`, `expertise.data.js` or `expertiseDetails.data.js` into API data.

Solutions, Work / Case Studies and Expertise now have CMS authoring implementations with translated content, repeaters, relationships, separate Images tabs and SEO. Their website list/detail API connections are still needed; their existence in the CMS does not replace these static website datasets automatically. Approach has its CMS module, but the website's process records still need its connection. Home retains static record data too. Reuse these modules for authored records; keep short fixed captions/buttons in Translations instead of creating a module for each heading. Exact CMS identities are `solutions` / `Solution`, `case_studies` / `CaseStudy` and `expertise` / `Expertise`.

## Verification

The changes are covered by real local MongoDB tests for public page/label scopes and importer preservation, frontend tests for language fallback/pagination/selected-user ordering, and browser tests of EN/FR About content, CMS label overrides, related sections and route recovery. No browser submissions in these tests reach the live CMS.
