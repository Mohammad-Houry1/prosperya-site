<?php

// This site's website key, issued in the CMS (API Keys → Public website).
// Server-side only: never expose it to the browser (no VITE_ variable).
return [
    'cms_url' => env('CMS_BASE_URL'),
    'key' => env('WEBSITE_KEY'),
    // How long a good answer from the CMS key check is reused. Keep it short
    // so disabling or rotating the key in the CMS lands quickly.
    'cache_seconds' => (int) env('WEBSITE_KEY_CACHE_SECONDS', 60),
    // Where `php artisan cms:sync-models` copies the CMS models from.
    'cms_models_path' => env('CMS_MODELS_PATH', base_path('../../cloud-cms-engine123/backend/app/Models')),
];
