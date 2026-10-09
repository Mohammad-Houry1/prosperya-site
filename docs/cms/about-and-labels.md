# About Us and website labels

## Where to edit

| Website content | CMS location |
| --- | --- |
| About Us `/en/about`, `/fr/about` | Static Pages (`pages`), one published record with slug `about` |
| Introduction and story body | That page's Content tab: Description and Content |
| Main heading, story heading, facts, focus, principles, how-we-work heading/body/steps | That page's new About Us tab; all optional and translated |
| Leadership | Select Users in About Us → About Leadership. Edit names, positions, biographies and avatars in Users; selection order is display order |
| Hero picture | Static Pages → Images → Cover Image |
| Images for facts, principles and work steps | Image picker in the corresponding repeater row |
| Client logos and platform names | Platforms |
| Quotes | Testimonials |
| Section captions, navigation, buttons, filters, forms, accessibility and error text | Translations, keys beginning `prosperya.` |
| About/normal-route metadata and social image | SEO Pages, as in `../seo-integration.md`; the website currently uses SeoPage for these routes |

No new About module registration is needed. The existing module remains slug `pages`, technical module `Page`, path `/pages`, visible in the CMS. Keep its published status assignment and the relevant editor-role permissions. Grant the website API key `pages`, `users`, `translations`, `platforms`, `testimonials` and `seo_pages`, alongside the modules used elsewhere. Assign the About record and selected public users to the Prosperya project, applicable countries/languages and a published status. The public API retains those scope checks; selecting a private or unpublished user does not expose them.

The public `/api/pages/about?locale=en` endpoint returns only explicit public page fields. `/api/users?ids[]=...` retrieves the chosen profiles, excluding email, credentials, permissions and internal fields. Blank About sections stay hidden. A missing/unpublished/denied About record shows an unavailable state instead of a fictional company profile. Create and publish this record before deploying the website changes.

Static Pages retains its existing SEO fields and Meta Image picker for CMS/API consumers that use Page metadata. This website's normal-route SEO lookup remains SEO Pages; its About content request does not change that contract.

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

Fixed interface copy is editable through labels. This does not turn lists/detail records in `solutions.data.js`, `caseStudies.data.js`, `caseStudyDetails.data.js`, `expertise.data.js` or `expertiseDetails.data.js` into API data.

Solutions still needs its approved ordinary content module and website list/detail connection: Properties, Content, translated Features/Benefits/Outcomes, relationships, a separate Images tab and SEO. Work still needs case-study records for client/project summaries, metrics, challenge/solution/results, relationships and images. Approach has its CMS module, but the website's process records still need to be connected to it. Home and Expertise retain static record data too. Reuse these modules for authored records; keep short fixed captions/buttons in Translations instead of creating a module for each heading.

## Verification

The changes are covered by real local MongoDB tests for public page/label scopes and importer preservation, frontend tests for language fallback/pagination/selected-user ordering, and browser tests of EN/FR About content, CMS label overrides, related sections and route recovery. No browser submissions in these tests reach the live CMS.
