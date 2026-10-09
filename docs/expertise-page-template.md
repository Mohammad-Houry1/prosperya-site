# Expertise page template

Every expertise detail page uses `ExpertisePageContent` and the same hero, numbered content sections, related links and card CTA. The animation always sits in the right hero column and is selected by slug in that component. New slugs use the default wave.

The page component accepts the Corporate Pages content shape:

```json
{
  "slug": "systems-integration",
  "title": "Systems Integration",
  "description": "<p>Introduction</p>",
  "sections": [
    { "title": "What we do", "description": "<p>Section content</p>" }
  ]
}
```

Descriptions support sanitized rich text, lists, headings and images. The number and order of sections come from the content. No section type or page-specific layout is required.

Section titles also generate the sticky in-page navigation. Active links follow the section being read. The framed hero diagram and section accents reveal once, the reading line follows scroll progress, and related cards have subtle hover feedback. Reduced motion keeps the layout and section navigation readable without scroll-driven movement.

API integration is intentionally unchanged for this task. The six local expertise records use this structure so the same component can render CMS records when connected. `expertise/:slug` remains a single dynamic frontend route.

Legal routes use the explicit CMS slugs in both languages: `privacy-policy`, `terms-of-use`, `cookie-policy`, and `accessibility`. Arbitrary corporate documents remain under `corporate/:slug`.
