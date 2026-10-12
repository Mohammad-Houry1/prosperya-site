# Cloud Run

Cloud Build's existing trigger builds the root `Dockerfile`. The image builds the React app, installs production Composer dependencies and MongoDB 2.5, and runs Apache/PHP against `backend/public`. Laravel serves initial HTML/SEO, API routes and built frontend assets together. Apache listens on Cloud Run's `PORT` (8080 by default).

Environment files, local dependencies, test data, logs and `.verification` are excluded from the build context. The image runs the public-artifact credential check before packaging the frontend. Runtime secrets must be configured on the Cloud Run service, not passed as Docker build arguments.

Configure these backend environment variables/secrets before using the site:

- `APP_KEY`: a stable Laravel application key.
- `APP_URL` and `WEBSITE_PUBLIC_URL`: the website's actual HTTPS origin.
- `CMS_BASE_URL`, `WEBSITE_KEY`: the CMS URL and this website's key.
- `MONGODB_URI`, `MONGODB_DATABASE`: the reachable CMS database and its name.
- `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`: Google v2 checkbox keys for contact submissions.

Laravel configuration is cached at container startup so it includes the service's runtime environment. Errors go to standard error for Cloud Logging. The container does not import CMS content or run migrations.

The frontend defaults to same-origin `/api` and enables the existing submission flows. `VITE_API_BASE_URL` and `VITE_CMS_SUBMISSIONS_ENABLED` are optional public Docker build arguments; these are not server credentials.

Local verification:

```sh
docker build -t prosperya-site:local .
docker run --rm -p 8080:8080 prosperya-site:local
```

`/up` checks that Laravel starts without querying CMS content. Content routes additionally require the website and database configuration above. To test another Cloud Run port, run with `-e PORT=9090 -p 9090:9090`.

The missing-Dockerfile failure must be fixed with a new production commit/build. Retrying an older commit without this file repeats the same failure.
