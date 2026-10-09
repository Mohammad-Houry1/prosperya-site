<?php

namespace App\Providers;

use App\Services\WebsiteAccess;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // One key-check answer per request.
        $this->app->scoped(WebsiteAccess::class);
        $this->app->scoped(\App\Services\PublicContent::class);
    }

    public function boot(): void
    {
        RateLimiter::for('content', fn ($request) => Limit::perMinute(120)->by('content:'.$request->ip()));
        RateLimiter::for('contact', fn ($request) => Limit::perMinute(5)->by('contact:'.$request->ip()));
        RateLimiter::for('newsletter', fn ($request) => Limit::perMinute(10)->by('newsletter:'.$request->ip()));
    }
}
