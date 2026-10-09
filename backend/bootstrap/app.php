<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', api: __DIR__.'/../routes/api.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias(['website.access' => App\Http\Middleware\RequireWebsiteAccess::class]);
        // Public HTML is stateless, like the API: it needs no session cookies.
        $middleware->group('web', [Illuminate\Routing\Middleware\SubstituteBindings::class]);
    })
    ->withExceptions(fn (Exceptions $exceptions) => $exceptions->shouldRenderJsonWhen(fn ($request) => $request->is('api/*') || $request->expectsJson()))
    ->create();
