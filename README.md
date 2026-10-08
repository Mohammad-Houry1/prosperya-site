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

Nothing is copied from the CMS. A model only names its module's slug.

1. In the CMS, grant the module to the website key (API Keys → edit → modules).
2. Add a model in `backend/app/Models`:

```php
class Faq extends CmsModel
{
    protected string $module = 'faqs';                 // the module's slug in Module Management

    public function category(): BelongsTo               // relations work like any Eloquent model
    {
        return $this->belongsTo(FaqCategory::class, 'faq_category');
    }
}
```

3. Add a route in `backend/routes/api.php` (inside the `website.access` group) and query it:

```php
$locale = $content->language($request->input('locale'))->code;

return ['data' => Faq::forWebsite($locale)
    ->where('faq_category', $categoryId)              // filter on any field
    ->orderBy('sort_order')->get()
    ->map(fn (Faq $faq) => [                          // pick public fields deliberately
        'question' => $faq->text('name', $locale),
        'answer' => $faq->text('content', $locale),
    ])];
```

What every model does for you:
- **Always:** limits queries to the key's tenant and project, skips deleted records, and reads from the collection the key check names. A module the key doesn't grant is a 404.
- **`forWebsite($locale)`:** keeps only records in a status marked published (in Statuses), active, and not scheduled for later. It applies the language (one of the key's) and the key's country, plus the "own records only" limit when the key issuer's role has one.
- **Pieces you can use alone:** `published()`, `inLanguage($locale)` and `inCountry()`.
- **`$model->text('field', $locale)`:** a translated field, read from the translations sidecar, a locale map or the plain value.

Field names (`name`, `content`, `slug`, `image`…) are the ones on the module's create/edit form in the CMS. Never return the whole record: CMS records also hold private fields.

**Writes** (form submissions) use the same models. `$model->save()` stamps the tenant and project from the key, and `$content->defaultStatus('module_slug')` gives the status marked "Default for new records". See `ContactController::store()`.

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
