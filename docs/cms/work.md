# Work and case studies

The Work listing and `/en|fr/work/{slug}` detail pages use `CaseStudy`. Both `CaseStudy.php` and its required `Industry.php` model are copied unchanged from the CMS engine. Solutions continue to use `Solution`.

## Listing and filters

`GET /api/case-studies?locale=en|fr` returns the complete published list in CMS order. Existing spotlight, project grid, expertise filters and testimonials retain their CMS sources. The selected Industry's record ID is the stable filter identity and its translated name is the display label.

Grant the website key the `Industry` module and publish Industry records within the site's project, language and country scopes. A selected unpublished or ungranted Industry is omitted, including stale legacy labels and embedded snapshots. Existing case studies without an Industry selection continue to use `case_study_industry`; its default-locale value supplies a stable filter identity.

## Detail fields

| CMS field | Website |
| --- | --- |
| `case_study_chapeau` | Short hero introduction |
| `case_study_description` / `case_study_summary` | Rich introduction / listing summary |
| `case_study_hero_facts` | Ordered `hero_fact_value` and `hero_fact_label` pairs |
| `content_sections` | Ordered chapters with title, subtitle and sanitized rich description; titled chapters get navigation anchors |
| `technology_stack` | Authored technology names and optional logos |
| `sections` | Extra sections including `section_subtitle`, rich text and media |
| `case_study_animation_type` | Decorative hero visual selected from the CMS enum |
| Existing challenge, solution, before/after, results and metrics | Existing narrative sections, shown when populated |
| Existing steps, gallery, testimonials and related records | Existing ordered content and published links |

Authored hero facts take precedence over the existing client/duration/metrics fallback. Authored technology entries take precedence over selected platforms; platforms remain the fallback when no populated technology entries exist. New chapters appear before existing narrative sections, in CMS order. Next-project navigation follows the published list order.

The CaseStudy model contains no diagram-node data. Its animation selector chooses existing decorative wave presets (`flowing-lines`, `consolidation`, `workflow`, `network`, `insight`); the website does not infer or invent business processes. With both an animation and uploaded image, the animation appears in the hero and the uploaded image follows it. Without an animation, the uploaded image stays in the hero.

Populate English and French content in the CMS. Empty optional content is omitted; missing detail records show the missing-case-study state. No content seeds, database migrations or changes to the CMS engine are included.

## Verification

Backend checks cover localized nested fields, selected industry publication and grant filtering, legacy compatibility and hidden snapshot exclusion. Frontend checks cover facts, chapters, sanitization, logos, filters and missing records. Browser checks cover both locales, all five visual presets, desktop/mobile overflow and empty content.
