<?php

// This site's website key, issued in the CMS (API Keys → Public website).
// Server-side only: never expose it to the browser (no VITE_ variable).
return [
    'cms_url' => env('CMS_BASE_URL'),
    'key' => env('WEBSITE_KEY'),
    // How long a good answer from the CMS key check is reused. Keep it short
    // so disabling or rotating the key in the CMS lands quickly.
    'cache_seconds' => (int) env('WEBSITE_KEY_CACHE_SECONDS', 60),
    'public_url' => env('WEBSITE_PUBLIC_URL', env('APP_URL', 'http://localhost:8001')),
    'frontend_dist' => dirname(__DIR__, 2).'/frontend/dist',
];
