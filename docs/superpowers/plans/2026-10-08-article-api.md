# Article API simplification

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline.

**Goal:** Two article controller methods with normal reference filters and compatible public responses.
**Architecture:** A ContentEntity builder recognizes reference fields from copied CMS metadata and translates positive equality and membership filters internally. PublicPayload owns article formatting; the controller owns validation and fetching.
**Tech Stack:** Laravel 12, MongoDB Laravel, PHPUnit.
**Spec:** User-approved design: getArticles handles lists and detail slugs; getCategories handles categories; preserve URLs, public fields, and CMS key rules.

## Constraints and review focus

- Do not edit copied CMS models or frontend files.
- Preserve tenant, project, module, publication, language and country restrictions.
- Preserve scalar, null, negative and raw Mongo query semantics.
- Recognize only declared reference fields; match IDs and embedded `_id` records.
- Keep reference OR conditions grouped with global access scopes.
- Tests use a throwaway database, never the CMS database.

## Task 1: Automatic reference filters

Files: new backend/app/Models/Builders/WebsiteBuilder.php; ContentEntity.php; new tests/Feature/ReferenceQueryTest.php.

- [x] Test equality/membership against scalar IDs, ID arrays and snapshots; OR access restrictions; ordinary scalar and null queries.
- [x] Observe failures, implement builder behind ContentEntity, rerun tests.

## Task 2: Two controller methods

Files: ArticleController.php, WebsiteContentController.php, PublicPayload.php, routes/api.php, WebsiteIntegrationTest.php.

- [x] Test embedded category API filtering, scalar public category ID, detail localization and pagination compatibility.
- [x] Observe failures; move formatter and categories, consolidate list/detail routes, replace explicit ScopeQuery calls.
- [x] Run backend suite and live read-only endpoint checks; update integration docs.
- [x] Obtain fresh scoped review and resolve important findings; remove temporary test runtime.

## Execution ledger

- Approved to execute in the existing shared checkout; existing integration changes remain uncommitted.
- Ruling: only positive reference equality and whereIn/orWhereIn are normalized. Negative, null, raw, and literal array equality retain MongoDB semantics; expanding these would be unnecessary for the requested interface.
- Observed three initial failures: equality/snapshot queries, OR queries, and leaked category snapshot. Fixed behind the shared builder and payload service.
- Review found singleton category arrays losing the public ID. Added a failing list/detail regression, normalized singleton references, and reran the full suite: 32 tests / 219 assertions passed.
- No frontend files were changed by this refactor.
- Live frontend-proxy checks returned HTTP 200 for EN/FR article lists, FR categories, and FR article detail; removed the isolated MongoDB runtime after verification.
