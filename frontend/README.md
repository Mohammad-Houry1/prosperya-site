# Prosperya frontend

The original React site, connected through the Laravel API in `../backend`.

Run `npm ci` and `npm run dev`. The local API proxy targets port 8001. Run `npm test`, `npm run lint`, `npm run verify`, and `npm run build` to verify the frontend.

Run `npx playwright install chromium --only-shell` once, then `npm run test:browser` for failed-import recovery checks. With both servers running and a current build, `npm run check:routes` checks English/French routes in Chromium and reports missing CMS content separately from rendering failures.

See [the integration guide](../docs/frontend-backend-integration.md) for CMS modules, backend-owned SEO, configuration, remaining local content and production hosting. The pages, CSS and interaction code remain the original frontend implementation.
