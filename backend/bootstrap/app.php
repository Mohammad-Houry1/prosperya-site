<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(api: __DIR__.'/../routes/api.php', health: '/up')
    ->withMiddleware(fn (Middleware $middleware) => $middleware->alias([
        'website.access' => App\Http\Middleware\RequireWebsiteAccess::class,
    ]))
    ->withExceptions(fn (Exceptions $exceptions) => $exceptions->shouldRenderJsonWhen(fn () => true))
    ->create();
