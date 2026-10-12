# CMS rich text and loading states

Active CMS prose uses `CmsRichHtml`, which sanitizes with DOMPurify before rendering. Full content retains paragraphs, lists, links and images. Compact summaries and list values use `inline` mode: it preserves emphasis, decodes entities, keeps word boundaries and removes block elements and embedded links so cards do not contain nested anchors.

The page pass covers Home expertise/article cards, Expertise listing/detail, Solutions listing/detail and selected proof, Work listing/detail, Approach collaboration/practices/methodology, article introductions, shared section subtitles, calls to action and existing About/Legal rich content. Plain record names, headings, labels and metadata retain their text contracts.

Optional Work media, navigation, narrative columns and architecture panels collapse when no content exists. Imageless Approach practices use the full card width. Solutions overview rows derive capabilities/outcomes from selected public Expertise in selection order; detail pages retain their own authored Solution fields. Empty overview columns collapse.

Shared page and section loading layouts now use Mantine Skeleton. Existing loading status labels, layout dimensions, site theme and reduced-motion preferences are retained.

Verification uses local CMS fixtures, an isolated MongoDB for backend tests, desktop/mobile browser checks in English/French, source checks and a production build. This does not deploy the site or modify CMS content.

The completed pass verified 24 core tests, 137 UI tests, 76 backend tests (542 assertions), and all 41 browser tests. Production build, public-artifact checks, syntax/import/dependency/CSS checks and lint passed; lint retains two existing fast-refresh warnings, and the build retains its existing large-chunk warning. Review's remaining raw-text slots and About/corporate cache-shape issue were fixed and protected by regression checks.
