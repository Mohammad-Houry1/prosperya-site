<?php

namespace App\Http\Middleware;

use App\Services\WebsiteAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Every data route asks the CMS (cached) whether this site's key is still good. */
class RequireWebsiteAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        app(WebsiteAccess::class)->grant();

        $response = $next($request);
        if ($request->is('api/*')) {
            // Crawlers may fetch data to render pages; JSON URLs themselves
            // should not become search results.
            $response->headers->set('X-Robots-Tag', 'noindex');
            $response->headers->set('Cache-Control', 'no-store');
        }

        return $response;
    }
}
