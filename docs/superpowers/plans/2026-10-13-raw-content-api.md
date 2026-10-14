# Raw CMS content API implementation plan

**Goal:** Return full CMS content records and adapt them for display in the frontend, preserving access/publication rules and private profile protection.

**Architecture:** Content controllers return models/collections directly. Explicit pagination stays available; unpaginated reads use get(). Responses carry public locale/media context. Frontend responses retain original `data` and expose a separate display `view`, resolving selected relationships through scoped API reads. SEO and submission result protocols retain their contracts.

**Constraints:** Preserve existing workspace edits, CMS query restrictions, EN/FR behavior, server-rendered SEO, and HTML sanitization. Never expose credentials or private user snapshots. No live CMS writes or production deployment.

- [x] Add failing contract tests for additional CMS fields, locale maps, unpaginated reads, private fields, and scoped relationships.
- [x] Replace API record projections with direct model results, retain optional pagination, add lookup support and serialization privacy rules.
- [x] Add frontend localization/media/record adapters and targeted relationship resolution. Keep raw response data intact; migrate page consumers to display views.
- [x] Update old contract assertions and run backend, frontend, build, and public-artifact checks. Document any unavailable checks and the new API shape.

**Review focus:** Nested private snapshots, language-ID translations, absent relationship grants, FAQ split answers, abort propagation and pagination.

**Verification:** Backend: 89 tests / 604 assertions passed against isolated disposable MongoDB databases. Frontend: 157 UI tests and 16 core tests passed. Lint: zero errors, two existing fast-refresh warnings. Syntax/import/dependency/CSS verification, production build and public-artifact credential scan passed. Build retains the existing large-chunk warning.

**Review:** Independent reviewer found plural author snapshot serialization, mixed legacy industries, label/FAQ sidecars and string gallery media regressions. Each was reproduced and fixed with regression tests. Existing Hero/Home fixtures were updated for their CMS-driven content and Home request. No live CMS writes or production deployment performed.
