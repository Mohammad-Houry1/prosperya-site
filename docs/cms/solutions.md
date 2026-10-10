# Solutions content

Solutions list and detail routes use the CMS `Solution` model. Work routes continue to use `CaseStudy`. The website model is copied from the CMS engine; create or edit records in the CMS rather than adding frontend content.

## Listing

`GET /api/solutions?locale=en|fr` supplies the published cards, images, summaries, diagrams and selected case studies. The proof carousel follows each solution's `related_case_studies` selection order; it does not query a global list of case studies.

The `solutions` Page record supplies the shared architecture via `architecture_title`, `architecture_description`, and `architecture_column_1` through `architecture_column_4`. Empty columns and an empty architecture are omitted. The four column positions retain their translated experience, solution, platform and foundation labels.

## Detail

`GET /api/solutions/{slug}?locale=en|fr` supplies the title, tagline, statement, lead, friction, change, capabilities, outcomes, metrics, qualification note, media and selected relationships. Optional empty sections are omitted. A missing slug shows a missing-solution state.

Selected case studies show their own summaries and metrics and link to Work. Solution metrics remain a separate section. Selected expertise links to Expertise, and selected articles link to Insights. Relationships are filtered by publication and the website's access scopes.

## Diagrams

Choose `solution_animation_type` from the CMS enum:

| Type | Content fields |
| --- | --- |
| `flowing-lines` | Decorative wave; accessible label uses the solution title |
| `consolidation` | `solution_animation_sources`, `solution_animation_centre_label`, `solution_animation_result_label` |
| `workflow` | `solution_animation_lanes`, `solution_animation_steps` |
| `network` | `solution_animation_suppliers`, `solution_animation_hubs`, `solution_animation_channels` |
| `insight` | `solution_animation_signal_label` |

Lists render the authored number of entries. Workflow steps wrap across rows. Without a diagram type, cards can show the authored solution image. Detail pages omit an unauthored diagram.

Labels and lists use the requested locale without invented business content or cross-locale label fallbacks. Populate both English and French in the CMS. No database migration or content seed is included in this change; the CMS engine must expose the matching model fields.

## Verification

Backend tests cover translated fields, variable list lengths and selected published articles in order. Frontend tests cover optional sections, relationship mapping and missing records. Browser tests cover both locales, all five diagram types, large lists, mobile overflow, empty content and missing detail pages.
