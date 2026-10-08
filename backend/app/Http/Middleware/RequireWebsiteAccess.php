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

        return $next($request);
    }
}
