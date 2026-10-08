# Prosperya site

The Prosperya website: a Laravel API (`backend/`) and a React + Vite frontend (`frontend/`).

The CMS (a separate private repo) owns all the data. This repo **reads the CMS database directly** and asks the CMS one question before serving anything: *is this site's website key still good, and what may it serve?* (`GET /api/website-key`). Nothing about the site is hardcoded here: the project, modules, languages, country and which statuses count as published all come from that answer.

```text
Browser ──► frontend ──/api──► backend ──read──► CMS MongoDB
                                  └──GET /api/website-key──► CMS (cached 60 s)
```

## 1. Set up the CMS (once)

1. **Statuses:** the statuses your content uses must have **Records are published on the website = Yes** (e.g. *Published*). Contact Forms needs a status with **Default for new records = Yes** (e.g. *New*).
2. **API Keys → Create → Public website.** Pick:
   - the Prosperya project;
   - the modules: `articles`, `project_types`, `project_stages`, `contact_forms` (add more as you build);
   - origins (`https://prosperya.com`, `http://localhost:5173`);
   - languages and a default language.

   Use an enabled status. Copy the secret; it is shown once.
3. **Database user:** ask for a MongoDB user on the CMS database with a custom role: `find` on the database and `insert` on `contact_forms` only.

## 2. Run it locally

Requirements: PHP 8.4+ with the `mongodb` extension 2.5+, Composer, Node 22+.

```bash
cd backend
cp .env.example .env        # fill CMS_BASE_URL, WEBSITE_KEY, MONGODB_URI, MONGODB_DATABASE
composer install
php artisan key:generate
php artisan serve --port=8001
```

```bash
cd frontend
npm ci
npm run dev                  # http://localhost:5173, /api proxied to :8001
```

Production: serve `frontend/dist` and route `/api` to the Laravel app on the same domain. Run `npm run build` and then `node scripts/verify-public-artifacts.mjs` from the repo root; it fails if a secret leaked into the bundle.

## 3. Add an endpoint

1. Grant the module to the website key in the CMS (API Keys → edit → modules).
2. Add a route in `backend/routes/api.php`, inside the `website.access` group.
3. In the controller, read through `PublicContent`:

```php
public function index(Request $request, PublicContent $content)
{
    $locale = $content->language($request->input('locale'))->code;
    $rows = $content->published('corporate_pages', $locale)   // CMS module slug
        ->orderBy('sort_order')->get(['_id', 'slug', 'name', 'translations']);

    return ['data' => $rows->map(fn ($row) => [
        'slug' => $row->slug,
        'title' => $content->text($row, 'name', $locale),    // pick fields deliberately
    ])];
}
```

`published()` already applies everything:
- the site's tenant, project, language and country;
- the statuses the CMS marks as published;
- `deleted_at`, `is_active` and `published_at`;
- the "own records only" limit when the key issuer's role has one.

It returns 404 when the key doesn't grant the module. Use `enabled()` for reference lists like countries. Return only public fields, never the whole record.

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
