# Complete dynamic CMS integration implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution, or superpowers:subagent-driven-development if the user selects that method. Track steps with checkboxes.

**Execution status:** Local implementation, review fixes and verification completed on 2026-10-10. See `docs/cms-dynamic-audit.md` for the actual contracts, test results and editorial limits. Original test-first task checklists below are retained as planning history, not a claim that every historical step was replayed.

**Requirement ruling:** The user's direct requirement for simple inline page queries overrides this plan's proposed `loadLabels`/collection helpers and frontend pagination loops. Whole permitted marketing collections/labels are returned by a single request when pagination is omitted; explicit pagination remains bounded. No custom marketing query/getter layer remains. This choice may need explicit UI pagination if future collection size becomes large.

**Scope update:** The user asked to keep completion local. No production deployment, live imports/submissions or remote push is part of this completion.

**Review:** A read-only reviewer checked the working tree. Important findings about relationship order, rich HTML/media, omitted authored collections, empty sections, metric notes and scoped testimonial attribution were fixed and covered by focused regression tests. The arbitrary-node diagram crash and missing-media panel were also reproduced and fixed. Existing inactive fixture datasets and development fast-refresh warnings are deferred minor cleanup. Hosting/live completeness was outside source review; local observations are documented separately.

**Goal:** Replace all public hardcoded display content with CMS data and labels, using existing integration patterns and page-specific skeletons.

**Architecture:** Existing Laravel controllers, scoped Eloquent queries, explicit PublicPayload serializers and routes feed named websiteApi methods and React Query consumers. Preserve presentation and access layers. Keep metadata sources consistent between React, initial HTML and sitemap generation.

**Tech Stack:** Existing Laravel 12, PHP 8.4+, MongoDB extension 2.5+, React 19, JavaScript, Vite, React Query, Vitest, PHPUnit and Playwright. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-10-dynamic-cms-design.md`

## Global constraints

- Work in `C:/Users/houry/OneDrive/Desktop/Prosperya`; preserve all pre-existing model modifications.
- Follow existing API/controller/serializer/import patterns; no arbitrary-model or batch transport.
- Retain website-key tenant/module/owner/deletion safeguards and explicit publication/scope filters.
- Missing or blank labels display the full `prosperya.*` key; no bundled text, source-text or cross-locale fallback.
- Missing content stays empty/unavailable; no sample records or substitution from another field/language.
- Preserve layouts, routes, interactions, animations, EN/FR and reduced-motion behavior.
- Public lists cap each response at 50; clients retrieve all required pages.
- No new dependencies, live CMS writes, imports, submissions, permission changes or deployment.

## Review focus

1. Denied/private related records must be excluded without leaking snapshots or disabling an otherwise accessible parent.
2. Blank French fields and labels must not display English content; blank labels must reveal full keys.
3. A newly published detail slug must work in the API, browser, initial metadata and sitemap without rebuilding sample inventories.
4. Empty or single-stage methodology and arbitrary/empty metrics must render without divide-by-zero errors or invented claims.
5. Pagination, changed locale, changed filter and failed requests must not leave truncated lists or stale content visible.

## Task 1: Labels and strict public localization

**Files:** Modify `backend/app/Services/PublicContent.php`, `backend/app/Http/Controllers/WebsiteContentController.php`, `frontend/src/i18n/LocaleProvider.jsx`; create `frontend/src/i18n/labels.js`; update label/core/UI fixtures and `backend/tests/Feature/ContentApiTest.php` or a focused label test.

**Interfaces:** `createTranslator(locale, labels)` returns `t(key, values = {})`; it prefixes unprefixed keys with `prosperya.`, interpolates known tokens and returns the full key when missing/blank. `loadLabels(api, locale, signal)` returns the merged namespaced dictionary across all pages. Existing `PublicContent::text(object, field, locale): string` retains its signature but no longer chooses another locale.

- [ ] Add failing tests for blank labels, interpolation, labels beyond page 1, cancellation and French content without an EN substitute; backend dictionary tests cover canonical and content-style records without exposing another tenant/namespace.
- [ ] Run focused frontend tests and `php vendor/bin/phpunit --filter Label` in `backend`; confirm the expected missing behavior fails.
- [ ] Implement strict localization and namespaced label loading; preserve existing access filters, add canonical dictionary handling from the handoff's reference implementation and remove LocaleProvider's bundled messages dependency.
- [ ] Re-run focused tests and verify a missing label yields exactly its full key.

## Task 2: New content APIs and scoped relationships

**Files:** Create `backend/app/Http/Controllers/ExpertiseController.php`, `SolutionController.php`, `CaseStudyController.php`, `ApproachController.php`, `PageController.php`; extend `backend/app/Services/PublicPayload.php`, `backend/routes/api.php`, `backend/tests/WebsiteTestCase.php`; create `backend/tests/Feature/MarketingContentTest.php`; extend `frontend/src/services/websiteApi.js` and its tests.

**Interfaces:** Existing-style controller list/detail methods return `{data, meta}` for lists and `{data}` for details. Add named websiteApi methods `expertise(query, signal)`, `expertiseDetail(slug, locale, signal)`, `solutions(query, signal)`, `solution(slug, locale, signal)`, `caseStudies(query, signal)`, `caseStudy(slug, locale, signal)`, `approach(slug, locale, signal)` and `page(slug, locale, signal)`. Serializers expose the exact public prefixed CMS fields from the spec with localized scalar text, normalized media and ordered repeaters. Detail relationships contain only public serialized targets; list relation IDs must be filtered to visible targets where used for public filters.

- [ ] Add failing API fixtures for EN/FR fields/repeaters/media, ordered relationships, drafts/inactive/future/private selections, denied modules, arbitrary slugs, featured filtering and pagination caps. Extend throwaway test-module grants only.
- [ ] Run `php vendor/bin/phpunit --filter MarketingContentTest` and focused websiteApi tests; confirm absent routes/methods fail.
- [ ] Implement controllers using existing explicit scoped queries, stable CMS ordering, bounded pagination and batched reference resolution. Avoid optional denied-module lookups when no references exist; exclude denied targets without exposing snapshots. Preserve selected order.
- [ ] Add explicit Page About/architecture/section payloads and CorporatePage section-image serialization; keep the public User model and submission contract intact.
- [ ] Add named API methods and rerun backend/API tests. Do not add an arbitrary SiteData payload without confirmed public fields; report that limitation.

## Task 3: Authored frontend content and relationships

**Files:** Update Home, About, Approach, Expertise/ExpertiseDetail, Solutions/SolutionDetail, Work/CaseStudy page components and their child sections/cards; add narrowly scoped adapters/helpers under `frontend/src/repositories/` only where presentation needs them. Update related UI tests and fixtures.

**Interfaces:** React Query consumers use named websiteApi methods with `{signal}` and locale-specific query keys. Adapters only reshape CMS values; they do not introduce content. All required collections load all pages. CmsRichHtml renders authored HTML; ResponsiveImage renders normalized media. Missing optional sections render nothing.

- [ ] Add failing tests for arbitrary CMS lists/slugs, Home featured selections, About selected public leaders, ordered relationship proof/stack/quote blocks and omission of absent content.
- [ ] Run focused UI tests and confirm current local datasets fail those assertions.
- [ ] Connect Expertise and Solution lists/details, preserving rich detail sections and mapping object outcomes/media properly; fix the existing `capabilitiesMap` rendering path through the real CMS shape.
- [ ] Connect Work/CaseStudy lists/details, arbitrary metrics, stable industry filters, selected public quote, architecture content, images/gallery and ordered next-project links.
- [ ] Connect Approach methodology, work cards, collaboration diagram and principles; render ordered methodology descriptions/buttons directly and handle zero/one stage safely.
- [ ] Connect About Page content and selected leadership order, and Home featured previews/methodology/architecture columns. Preserve existing layouts and avoid fictional profiles or fixed photographs.
- [ ] Re-run affected UI tests, including locale/filter switching, pagination and failures; retire migrated production record/copy imports.

## Task 4: Every visible/interface string uses CMS labels

**Files:** Update all relevant components under `frontend/src/components/`, `sections/`, `pages/`, `app/`, `three/`, form schema/repository and i18n; add/update `docs/cms/prosperya-labels.json` as an editorial import artifact and a labels audit script if useful. Use the linked checkout's manifest/key definitions as a read-only reference.

**Interfaces:** All display copy calls `t(key, interpolationValues)` with no literal fallback argument. Structural form schema, routes, icon identifiers and visual geometry remain implementation constants. Diagram labels use translations without replacing geometry or business records with a fixed translated record list.

- [ ] Add failing tests covering representative navigation, form validation, error/loading accessibility text, diagram labels and absence of literal fallback behavior.
- [ ] Run focused tests to confirm the current bundled/default text violates these requirements.
- [ ] Migrate copy in layout, Contact, Insights/Article/Newsletter, legal layout, feedback, cards, CTAs and visual diagrams; remove runtime copy dictionaries and embedded marketing strings.
- [ ] Preserve interpolation tokens; maintain a manifest identifying every required key without deploying/importing it into the CMS.
- [ ] Re-run label/UI tests and audit source for remaining display literals, distinguishing implementation constants from content. Report unresolved entries rather than hide them.

## Task 5: Page-specific loading layouts

**Files:** Replace `frontend/src/components/feedback/PageLoader.jsx` composition, add dedicated page skeleton components/styles under `components/feedback/`, update `frontend/src/app/SiteLayout.jsx` and page data-loading branches; create `frontend/tests/ui/PageSkeletons.test.jsx`.

**Interfaces:** Route-aware skeleton selection accepts the current route/path and uses distinct compositions for Home, About, Approach, Expertise, ExpertiseDetail, Solutions, SolutionDetail, Work, CaseStudy, Contact, Insights, Article, corporate/legal and unknown-page geometry. Shared Skeleton primitives remain reusable.

- [ ] Add failing tests verifying route families produce the correct layout shapes during both lazy and data loading, including detail paths and mobile proportions.
- [ ] Run the focused skeleton tests and confirm the identical loader fails.
- [ ] Implement page compositions and matching responsive styles; preserve reduced-motion behavior and use CMS loading labels/full missing keys.
- [ ] Wire Suspense and data-loading paths to those compositions and re-run skeleton and route-recovery tests.

## Task 6: CMS detail routes and coherent SEO

**Files:** Update `backend/app/Services/WebsiteRoutes.php`, `WebsiteSeo.php`, relevant SEO controller/HTML service as needed, `frontend/src/hooks/useDocumentMeta.js`, authored detail page model selection and `frontend/scripts/generate-route-manifest.mjs`; extend SEO/route tests.

**Interfaces:** Fixed SEO allowlist adds Expertise, Solution, CaseStudy and Approach. Route parsing supports valid arbitrary CMS detail slugs. Lists/standalone pages retain SeoPage. Initial HTML, API, canonical checks, locale alternates and sitemap share the same record selection and public scope.

- [ ] Add failing tests for arbitrary published/unpublished detail slugs, allowed/mismatched SEO models, locale alternates, canonical targets and sitemap visibility.
- [ ] Run focused backend SEO tests and frontend metadata tests; confirm the current sample inventory/model allowlist fails.
- [ ] Implement consistent source selection and public sitemap enumeration; remove build-manifest imports of local record datasets.
- [ ] Re-run affected SEO, route, metadata and sitemap tests and check absent details remain 404/noindex.

## Task 7: Full verification and completion audit

**Files:** Update `docs/dynamic-content-recap.md`, `docs/frontend-backend-integration.md`, `docs/seo-integration.md` and `docs/cms-dynamic-audit.md` with actual results.

- [ ] Run frontend `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run verify`, `npm.cmd run build` and root `node scripts/verify-public-artifacts.mjs`; inspect every result and fix relevant regressions.
- [ ] Run backend `php vendor/bin/phpunit`, PHP syntax checks for touched files and `php artisan route:list --path=api`; report external service/test limitations honestly.
- [ ] Run existing Chromium browser tests with local fixtures and inspect representative EN/FR/mobile rendered pages; never send live submissions for verification.
- [ ] Audit production sources and build artifacts for remaining sample record imports, bundled copy, fallback expressions and credential exposure.
- [ ] Record implemented endpoints/pages, missing CMS keys/content/grants, SiteData field-contract uncertainty, CaseStudy independent fact-slot gaps and the CMS-only Approach Images-tab gap. Report only verified completion.

## Execution recommendation

Native execution in this session keeps the API and frontend contract changes together and avoids overlapping edits. The plan is ready for the user's review and execution-method selection; application code remains unchanged.
