<?php

namespace App\Http\Controllers;

use App\Services\FrontendHtml;
use App\Services\WebsiteAccess;
use App\Services\WebsiteRoutes;
use App\Services\WebsiteSeo;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WebsiteSeoController
{
    public function metadata(Request $request, WebsiteSeo $seo)
    {
        $params = $request->validate(['path' => ['required', 'string', 'max:2048', 'starts_with:/'],
            'model' => ['sometimes', 'string', Rule::in(WebsiteSeo::modelNames())]]);
        $metadata = $seo->resolve($params['path'], $params['model'] ?? null);

        return response()->json(['data' => $metadata], $metadata['status'])->header('Cache-Control', 'no-store');
    }

    public function page(Request $request, WebsiteSeo $seo, FrontendHtml $frontend, WebsiteRoutes $routes)
    {
        $path = $request->getPathInfo();
        abort_if(preg_match('~^/(assets|images|api)(/|$)~', $path), 404);
        if ($path === '/') {
            $default = app(WebsiteAccess::class)->grant()['website_settings']['default_locale'] ?? 'en';

            return redirect('/'.$default, 302);
        }
        $metadata = $seo->resolve($path);
        $route = $routes->parse($path);
        if ($route && $metadata['status'] === 200 && $path !== $route['path']) {
            return redirect($route['path'], 301);
        }

        return response($frontend->render($metadata), $metadata['status'], [
            'Content-Type' => 'text/html; charset=UTF-8', 'Cache-Control' => 'no-store', 'X-Robots-Tag' => $metadata['robots'],
        ]);
    }

    public function sitemap(WebsiteSeo $seo)
    {
        $escape = fn ($value) => htmlspecialchars((string) $value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';
        foreach ($seo->sitemapEntries() as $entry) {
            $xml .= '<url><loc>'.$escape($entry['canonical']).'</loc>';
            if ($entry['lastModified']) {
                $xml .= '<lastmod>'.$escape($entry['lastModified']).'</lastmod>';
            }
            foreach ($entry['alternates'] as $alternate) {
                $xml .= '<xhtml:link rel="alternate" hreflang="'.$escape($alternate['locale']).'" href="'.$escape($alternate['url']).'"/>';
            }
            $xml .= '</url>';
        }

        return response($xml.'</urlset>', 200, ['Content-Type' => 'application/xml; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }

    public function robots(WebsiteSeo $seo)
    {
        return response("User-agent: *\nAllow: /\n\nSitemap: ".$seo->origin()."/sitemap.xml\n", 200,
            ['Content-Type' => 'text/plain; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }
}
