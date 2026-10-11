# Remaining pages: source audit, 2026-10-11

Read-only comparison of current production code and the connected CMS model files. No remaining-page implementation or live CMS records were changed during this audit. Styling constants and decorative geometry are distinguished from authored business content.

| Page | Already connected | Confirmed remaining work |
| --- | --- | --- |
| Home | Featured Expertise/Work, clients, Approach preview, four architecture columns and CMS translation copy | Hero audiences have five fixed slots/icons in `heroStory.copy.js`. The current Page model has no audience repeater. Decide the CMS authoring contract before replacing those slots. Preview limits (four expertise/three projects) are intentional presentation limits, not local records. |
| About | `about-prosperya` Page, facts, principles, focus, steps, public leaders, testimonials and platforms | New CMS `page_title` is absent from the site's copied Page model/public payload. Confirm its intended role alongside `about_title`. CMS has removed the leadership picker from the Page fields list; existing leadership data still reads, so confirm authoring before changing the section. |
| Approach | Methodology, collaboration nodes/items, principles, FAQs and practices | CMS now has `methodology_deliverable`, `work_points`, and `approach_image`, absent from the site's model/payload. Practices currently receive an empty points array. The collaboration/principles JSX condition needs parentheses: truthy earlier operands bypass rendering the actual section. |
| Insights list | Published paginated articles and categories | No missing basic API connection identified. Verify populated filters, paging and empty translated content with live records. |
| Article detail | Public article, body, metadata, categories and newsletter | Suggestions are derived from the first 12 public articles, prioritizing matching category; they are not CMS-selected relationships. Confirm whether editorial selection is desired before adding a field or endpoint. |
| Contact | Public form options, FAQs, validation and submission | No missing basic API connection identified. Verify project-type/stage publication and actual email/submission setup separately; browser fixtures do not establish live delivery. |
| Legal | Public corporate pages, categories, rich text, dates and SEO | Backend exposes section media, but `LegalPage.jsx` drops it in the layout adapter. Missing records also share generic failure feedback. |

The unused `ConnectionMesh` and `NetSuiteCoreDiagram` components still contain embedded business names; they are no longer imported by Expertise details. Verify a production import path before treating their source as visible hardcoded content. Home's foundation columns are authored CMS data, not the old fixed NetSuite module diagram.

## Recommended order after search

Update: Approach is now completed; see [Approach detail mapping](approach.md). Its main CMS slug is `our-approach`, with canonical `/en|fr/approach/our-approach` detail routes and redirects for old links.

1. Approach: sync its unchanged CMS model, map deliverables/points/image and fix the populated-content condition with regression coverage.
2. About and Home: sync Page, agree how page titles and audience lists should be authored, then map existing fields.
3. Legal media mapping and missing-record feedback.
4. Populated Insights/Article/Contact checks and editorial decisions about article suggestions.
5. Complete English/French content and labels; verify live publishing, forms and deployment.

The local code audit cannot confirm live editorial completeness or deployment. Earlier configured CMS reads returned service errors. No new CMS fields or data should be invented merely to make the website look populated.
