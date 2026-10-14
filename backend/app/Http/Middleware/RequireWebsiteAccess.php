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
            if ($request->isMethod('GET') && !$request->is('api/seo') && $response instanceof \Illuminate\Http\JsonResponse && $response->isSuccessful()) {
                $content = app(\App\Services\PublicContent::class);
                $language = $content->language($request->input('locale'));
                $body = $response->getData(true);
                $body['context'] = ['locale' => $language->code, 'language_id' => (string) $language->id,
                    'default_locale' => app(WebsiteAccess::class)->grant()['website_settings']['default_locale'],
                    'cms_url' => config('website.cms_url')];
                $response->setData($body);
            }
            // Crawlers may fetch data to render pages; JSON URLs themselves
            // should not become search results.
            $response->headers->set('X-Robots-Tag', 'noindex');
            $response->headers->set('Cache-Control', 'no-store');
        }

        return $response;
    }
}
