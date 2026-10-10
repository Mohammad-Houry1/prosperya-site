# Expertise detail CMS mapping

`/en|fr/expertise/{slug}` reads the published `Expertise` model through `GET /api/expertise/{slug}?locale=...`. The model remains identical to the CMS engine copy; no new authoring fields, content seeds or migrations are required.

| CMS field | Website |
| --- | --- |
| `expertise_detail_title` | Full heading; falls back to the same locale's `expertise_title` |
| `expertise_tagline` | Hero tagline |
| `expertise_description` | Sanitized hero introduction; requested-locale `expertise_summary` is used if the description is empty |
| `expertise_summary` | Metadata description fallback |
| `expertise_animation_type` | Optional hero animation selected from the CMS enum |
| `expertise_image` | Optional uploaded media |
| `sections` | Ordered rich sections, headings and images, with matching navigation anchors and reading progress |
| `expertise_capabilities`, `expertise_outcomes` | Ordered lists with existing translated section labels |
| `expertise_steps` | Ordered implementation steps with descriptions and media |
| `metrics`, `expertise_metrics_note` | Actual metric values, labels and qualification |
| `platforms` | Selected published platform names and `logo_image` media |
| `related_solutions`, `related_case_studies` | Selected published links, in selection order |

Complementary Expertise links follow the public Expertise list order and exclude the current record. The model has no explicit complementary-Expertise relationship field.

Animation choices are `flowing-lines`, `consolidation`, `workflow`, `network` and `insight`. These select existing decorative wave presets. Expertise has no diagram-node fields, so the site does not invent system names or process labels. The slug no longer selects an animation, including familiar existing slugs. Missing or invalid selections omit the animation frame.

Empty sections are omitted consistently from content and navigation. A missing record shows the translated missing-Expertise state; transient request failures retain retry. The existing tenant, grant, project, publication and locale rules still apply. Complete both English and French in the CMS; no live records or labels were edited here.

Verification covers enum validation, localized fields, all detail content, sanitization, platform logos, missing records and blank sections. Browser checks exercise every visual preset in EN/FR on desktop/mobile, ordinary animation, section navigation, reading progress and reduced motion.
