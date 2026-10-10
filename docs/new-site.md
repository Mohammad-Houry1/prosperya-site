# Starting a new client site from this repo

Every client website gets its own repo, built by copying this one. The CMS
(`cloud-cms-engine123`) stays private: a site repo never contains CMS code
beyond the model files it pastes in, and it only reads the data its website
key allows.

```text
Browser ──► site frontend ──/api──► site backend ──read──► CMS MongoDB (read-only user)
                                        └──GET /api/website-key──► CMS (cached 60 s)
```

## How it works, in one paragraph

The site backend reads the CMS database directly with the CMS's own model
classes (`Article`, `Faq`, `Status`…), pasted in unchanged. What those models
extend (`Base\ContentEntity`, `Base\ReferenceEntity`, the traits) is this
repo's own code under the same names. It asks the CMS, on every request (with
the answer cached for 60 seconds), whether this site's website key is still
good and what it may serve, and it limits every query to:
- the key's tenant and owner permissions (project is an explicit filter);
- live (not deleted) records;
- the modules the key grants.

A disabled, expired or deleted key makes every endpoint return 403 within a minute.

## The folders

### Shared: copy into every site repo, don't change per site

| Path (under `backend/`) | What it is |
|---|---|
| `app/Models/Base/` | Site versions of the CMS base classes. They scope every query to the website key. |
| `app/Models/Concerns/`, `app/Models/Traits/`, `app/Traits/` | Site versions of the CMS traits the models use. |
| `app/Support/` | Site versions of `CurrentTenant` and `DatabaseIsolationMode`, which the models call. |
| `app/Services/WebsiteAccess.php` | Calls the CMS key check and caches the answer. Fails closed: 403 for a refused key, 503 when the CMS can't answer. |
| `app/Services/PublicContent.php` | Shared lookups: the site's language and country, translated text, the default status for submissions. |
| `app/Services/ScopeQuery.php` | Matches a record's project/language/country field, which holds ids or `{_id}` snapshots. |
| `app/Http/Middleware/RequireWebsiteAccess.php` | Runs the key check before every data route. |
| `bootstrap/app.php`, `config/website.php` | Middleware alias and key settings. |
| `tests/` | Test setup that fakes the CMS key check against a throwaway database. |
| `scripts/verify-public-artifacts.mjs` | Fails the build if a secret ends up in the frontend bundle. |

When you improve something here, copy the change into the other site repos.
Each repo carries its own copy.

### Per site: change for each new repo

| Path | What to do |
|---|---|
| `backend/.env` | This site's own `WEBSITE_KEY`, the database connection, `CMS_BASE_URL`. See below. |
| `backend/app/Models/*.php` | Paste in the CMS model files this site uses (see the rules below). |
| `backend/routes/api.php` | This site's endpoints, inside the `website.access` group. |
| `backend/app/Http/Controllers/` | This site's controllers. The Prosperya ones here (articles, contact) are examples. |
| `backend/composer.json` (`name`), `frontend/` | The site's name and its frontend. |

## Steps for a new site

1. **Copy this repo** (without `.git`, `vendor/` or `node_modules/`) into the new repo. Delete the Prosperya controllers and routes you don't need.
2. **In the CMS**, for the site's project:
   - **Statuses:** content you publish must be in a status with **Records are published on the website = Yes**. Form submissions need a status with **Default for new records = Yes** on that module.
   - **API Keys → Create → Public website:**
     - pick the project and the modules the site may read;
     - set origins, languages and a default language;
     - use an enabled status.

     Copy the secret: it's shown once. Every site gets its own key.
3. **Database user:** a MongoDB user on the CMS database with a custom role:
   - `find` on the database;
   - `insert` only on the collections the site writes to, e.g. `contact_forms`.

   If the client has its own database (client databases), use that database's name.
4. **`backend/.env`:**
   ```dotenv
   CMS_BASE_URL=https://cms.prosperya.com
   WEBSITE_KEY=<this site's key>
   MONGODB_URI=<read-only connection string>
   MONGODB_DATABASE=<CMS database name>
   ```
5. **Run it:**
   ```bash
   cd backend && composer install && php artisan key:generate && php artisan serve --port=8000
   cd frontend && npm ci && npm run dev
   ```
   Production: route HTML, `/api`, sitemap and robots to Laravel; static assets can come directly from `frontend/dist`. Set `WEBSITE_PUBLIC_URL`. See [frontend-backend-integration.md](frontend-backend-integration.md) and the hosting example. Run `node scripts/verify-public-artifacts.mjs` after every build.

## Adding a module to a site

1. Build the module in the CMS and deploy it.
2. Copy its model file from the CMS's `backend/app/Models/` into this repo's `backend/app/Models/`, unchanged.
3. Grant the module to the site's website key (CMS → API Keys → edit → modules).
4. Write the endpoint your usual way:

```php
$language = $content->language($request->input('locale'));
$filters = $content->filters($language->code);

$faqs = Faq::forWebsite()
    ->whereIn('project', $filters['project'])
    ->whereIn('status', $filters['status'])
    ->whereIn('country', $filters['country'])
    ->whereIn('language', $filters['language'])       // IDs, snapshots, and shared records
    ->where('is_active', '!=', false)
    ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
    ->with('category')                                 // the CMS model's relations
    ->orderBy('sort_order')
    ->get()
    ->map(fn (Faq $faq) => [                           // pick public fields yourself
        'question' => $faq->text('name', $language->code),
        'answer' => $faq->text('content', $language->code),
    ]);
```

`forWebsite()` checks the key without filtering project, status, country or language. All content selection stays explicit in your query. For exact matches, use `->where('project', $projectId)->where('status', $statusId)->where('country', $countryId)->where('language', $languageId)`. `PublicContent::filters()` only supplies the key's suggested values; it does not modify queries. Tenant/module/deletion/owner safeguards remain automatic. Public endpoints must explicitly select their publication and visibility rules, as above.

## Rules

- **Copy model files only.** Never paste the CMS's `Base/`, `Concerns/` or `Traits/` folders over the site's. The site's versions are what keep queries inside the key, and the CMS ones won't even run here.
- **Don't copy CMS-internal models:** User, ApiKey, Role, Tenant, Module, Setting, ActivityLog, EditLock, ExportJob, the version and membership models.
- **Don't edit pasted model files.** Change the model in the CMS, then copy it again.
- **Never return a whole record.** CMS records hold private fields (author ids, internal notes, tenant ids). Every endpoint picks its public fields.
- **The website key is server-side only.** It goes in `backend/.env`, never in a `VITE_` variable.
- **New base classes or traits need a site version.** If the CMS adds one for models to extend, add a same-named version in `Base/`, `Concerns/` or `Traits/`. The site errors with "class not found" until then.

## Requirements

PHP 8.4+ with the `mongodb` extension 2.5+ (the library needs it), Composer, and Node 22+.

If your local PHP's extension is older, run the backend tests in Docker:

```bash
docker run --rm -v "$PWD/backend:/app" -w /app \
  -e MONGODB_TEST_URI="mongodb://host.docker.internal:27017/?directConnection=true" \
  php:8.4-cli sh -c "apt-get update -qq && apt-get install -y -qq libssl-dev >/dev/null && pecl install mongodb >/dev/null && docker-php-ext-enable mongodb && php vendor/bin/phpunit"
```

(`libssl-dev` matters: without it the MongoDB extension can't run transactions.)
