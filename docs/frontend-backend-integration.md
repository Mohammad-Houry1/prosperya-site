# Frontend/backend integration

The CMS-driven integration is complete in the current checkout. The current connection map, label behavior, query contracts, public scope rules, SEO sources and verification results are documented in [cms-dynamic-audit.md](cms-dynamic-audit.md). The label import artifact is [cms/prosperya-labels.json](cms/prosperya-labels.json).

## Local setup

Set server-only `CMS_BASE_URL`, `WEBSITE_KEY`, `MONGODB_URI`, `MONGODB_DATABASE`, `WEBSITE_PUBLIC_URL` and the Laravel application key in `backend/.env`. Never prefix credentials with `VITE_`. Frontend `VITE_API_BASE_URL` is empty for same-origin requests; development proxies `/api` to Laravel. `VITE_CMS_SUBMISSIONS_ENABLED` controls contact/newsletter submission availability.

Install the locked dependencies with Composer in `backend` and `npm ci` in `frontend`. Run Laravel on port 8000 and Vite on port 5173. PHP/MongoDB extension requirements are declared in Composer; do not bypass platform checks.

## Public content

Named Laravel controllers use site-owned scoped CMS models and explicit publication filters. Allowlisted serializers return only public fields. Pages call named `websiteApi` methods directly in `useQuery`, passing the cancellation signal and including locale/slug/filter inputs in query keys. Pure adapters reshape field names without content fallbacks.

Expertise, Solutions, Case Studies and the labels dictionary return their permitted collection when pagination is omitted. Explicit pagination remains available and bounded. Existing article and other module pagination contracts remain unchanged. Missing content stays unavailable; missing labels show their full namespaced key.

## Production hosting

Build in `frontend` with `npm run build`, then run `node scripts/verify-public-artifacts.mjs` at the repository root. Route public HTML, `/api`, `/robots.txt` and `/sitemap.xml` to Laravel on the same domain. Set `WEBSITE_PUBLIC_URL` to the confirmed HTTPS origin. Static assets can be served directly from `frontend/dist`; do not serve its static index instead of Laravel HTML, which would bypass initial SEO. See [hosting/nginx.conf.example](hosting/nginx.conf.example).

The root `Dockerfile` packages both applications for the existing Cloud Run build trigger. See [Cloud Run hosting](hosting/cloud-run.md) for runtime configuration. Local verification does not deploy the image or change Cloud Run settings.

## Verification

Run frontend tests, lint, `npm run verify`, build and the root artifact check. Backend `php vendor/bin/phpunit` uses a random throwaway database on `MONGODB_TEST_URI`; never configure fixtures against the CMS database. Browser tests mock external content and submissions. The latest verified counts and remaining editorial requirements are in the completion audit.
