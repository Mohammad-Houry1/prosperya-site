# Prosperya site

The Prosperya website: a Laravel API (`backend/`) and a React + Vite frontend (`frontend/`).

`frontend/` now reuses the complete supplied frontend. Pages, styling and interactions are preserved. Articles, legal content, translated labels and submissions use this backend; SEO is served in initial HTML and through the API. See [the integration guide](docs/frontend-backend-integration.md) for the exact scope and setup.

The CMS (a separate private repo) owns the connected content. This repo **reads the CMS database directly** and asks the CMS one question before serving that content: *is this site's website key still good, and what may it serve?* (`GET /api/website-key`). The access limits—project, modules, languages, country and which statuses count as published—all come from that answer. Authored marketing pages now use the CMS too; see docs/cms-dynamic-audit.md for coverage and editorial requirements.

```text
Browser ──► frontend ──/api──► backend ──read──► CMS MongoDB
                                  └──GET /api/website-key──► CMS (cached 60 s)
```

Starting another client site from this repo: see [docs/new-site.md](docs/new-site.md).

## 1. Set up the CMS (once)

1. **Statuses:** the statuses your content uses must have **Records are published on the website = Yes** (e.g. *Published*). Contact Forms needs a status with **Default for new records = Yes** (e.g. *New*).
2. **API Keys → Create → Public website.** Pick:
   - the Prosperya project;
   - the modules: `pages`, `articles`, `article_categories`, `corporate_pages`, `translations`, `project_types`, `project_stages`, `contact_forms`, `newsletters`;
   - origins (`https://prosperya.com`, `http://localhost:5173`);
   - languages and a default language.

   Use an enabled status. Copy the secret; it is shown once.
3. **Database user:** ask for a MongoDB user on the CMS database with a custom role: `find` on the database and `insert` on `contact_forms` and `newsletters`. Provision the CMS-declared newsletter unique index (see the integration guide).

## 2. Run it locally

Requirements: PHP 8.4+ with the `mongodb` extension 2.5+, Composer, Node 22+.

```bash
cd backend
cp .env.example .env        # fill CMS_BASE_URL, WEBSITE_KEY, MONGODB_URI, MONGODB_DATABASE, WEBSITE_PUBLIC_URL
composer install
php artisan key:generate
php artisan serve --port=8000
```

```bash
cd frontend
npm ci
npm run dev                  # http://localhost:5173, /api proxied to :8000
```

Production: route public HTML, `/api`, `/sitemap.xml` and `/robots.txt` to Laravel on the same domain, with `WEBSITE_PUBLIC_URL` set to the confirmed HTTPS origin. Laravel can serve the built assets, or the web server can serve them directly from `frontend/dist`. Serving the static `index.html` directly bypasses backend SEO. Run `npm run build` in `frontend`, then `node scripts/verify-public-artifacts.mjs` from the repo root; it fails if a secret leaked into the bundle. A hosting example is in `docs/hosting/nginx.conf.example`.

## 3. Models and endpoints

For Cloud Run, the root `Dockerfile` builds and serves both applications. See [Cloud Run setup](docs/hosting/cloud-run.md) for service environment variables and local container checks.

Platform categories: Home requests `/api/platforms?category=clients`; About requests `category=we-work-with`. Grant the website key the `platform_categories` module as well as `platforms`, and publish those category records within the website's permitted project/language scope. Platforms link through `platform_category` to records in the CMS's `ref_platform_categories` collection.

**The models are the CMS's own files, pasted in unchanged.** When the CMS gains or changes a model, copy that file from the CMS's `backend/app/Models/` into `backend/app/Models/` here. That's all: no command, no edits.

- **Copy model files only**: `Article.php`, `Faq.php`, `Status.php`… Never copy the CMS's `Base/`, `Concerns/` or `Traits/` folders over this repo's. Those are this site's own versions under the same names, and they give every query the website key's limits:
  - **Content models** (Article, Faq…): this site's tenant only, no deleted records, module and owner permissions enforced. Project and content filters are explicit caller choices.
  - **Reference models** (Status, Language, Country…): this site's tenant only.
- **Don't copy CMS-internal models**: User, ApiKey, Role, Tenant, Module, Setting, ActivityLog, EditLock, ExportJob or the version/membership models. A website has no business reading them.
- If the CMS ever adds a new base class or trait for models to extend, the site needs a same-named one in `Base/`, `Concerns/` or `Traits/`. The site errors with "class not found" until then.

Write endpoints the usual Eloquent way. Add the route in `backend/routes/api.php` inside the `website.access` group:

```php
$filters = $content->filters($locale); // values from the CMS key, not applied automatically

$articles = Article::forWebsite()
    ->whereIn('project', $filters['project'])
    ->whereIn('status', $filters['status'])
    ->whereIn('country', $filters['country'])
    ->whereIn('language', $filters['language'])
    ->where('article_category', $categoryId)       // any field
    ->with('category')                             // the CMS model's relations
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();
```

`forWebsite()` validates the key and does not choose project, status, country or language. You may instead use scalar filters such as `->where('project', $projectId)->where('status', $statusId)->where('country', $countryId)->where('language', $languageId)`. Public endpoints explicitly add their published statuses, active and not-scheduled conditions; see `ArticleController` for the complete query. Status filters handle embedded statuses and legacy `status_id` records. `$article->text('article_title', $locale)` reads a translated field.

**Data shape in the CMS:**
- `language`, `country` and `project` hold ids, or `{_id}` snapshots.
- `status_id` holds the status id.
- Relations use the field names on the CMS model, e.g. Article `article_category`.

Content endpoints return full CMS records; private fields and relationship snapshots are protected during model serialization. Display mapping lives in the frontend. See [the raw content API contract](docs/raw-content-api.md).

**Writes** (form submissions) use the same models. `save()` stamps the tenant and project from the key, and `$content->defaultStatus('contact_forms')` gives the status marked "Default for new records". See `ContactController::store()`.

## 4. Tests

```bash
cd backend && php vendor/bin/phpunit      # needs a throwaway MongoDB; set MONGODB_TEST_URI
cd frontend && npm test
```

Backend tests fake the CMS key check and use a temporary database on `MONGODB_TEST_URI` (default `mongodb://127.0.0.1:27017`), dropped afterwards. Never point it at the real CMS database.

If your local PHP's `mongodb` extension is older than 2.5, run them in Docker:

```bash
docker run --rm -v "$PWD/backend:/app" -w /app -e MONGODB_TEST_URI="mongodb://host.docker.internal:27017/?directConnection=true" php:8.4-cli sh -c "pecl install mongodb >/dev/null && docker-php-ext-enable mongodb && php vendor/bin/phpunit"
```

## How access works

- No key, a wrong key, or a key that is disabled, expired, deleted or rotated: the CMS says no, and every endpoint returns **403**. The issuer losing access or a language being disabled does the same.
- CMS unreachable: **503**. The site never serves on a guess.
- A good answer is reused for `WEBSITE_KEY_CACHE_SECONDS` (60), so changes in the CMS take effect within a minute.

## Branches

`production` contains the CMS-connected website. `staging` is an offline, hardcoded design reference. Their content sources intentionally differ. Production hosting is not configured by this branch setup.

Production now uses staging's Work grid and rotating spotlight, numbered Expertise listing, shared case-study layout, and split contact sections. These layouts still use production's CMS APIs, translations, sanitized rich text and published relationships. Contact and newsletter submissions, SEO, About's `about-prosperya` source and platform category filters retain their production implementations.

Home shows the four newest public Expertise records and three latest public Articles, the main `our-approach` methodology and platforms in category `clients`. Its NetSuite/core section is removed. See [Home content sources](docs/cms/home.md). Future authored content and interface copy must continue to come from the CMS.

Promote future presentation changes selectively on `production` (or a branch based on it). Do not merge the staging branch or copy its local data/service implementations into production. Extend the remaining API fields page by page while using staging as the visual reference.
