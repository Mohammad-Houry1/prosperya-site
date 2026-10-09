<?php

namespace Tests\Feature;

use App\Services\WebsiteRoutes;
use Tests\TestCase;

class CorporateRoutesTest extends TestCase
{
    public function test_new_corporate_slugs_have_routes_in_both_languages(): void
    {
        $routes = new WebsiteRoutes;
        foreach (['en', 'fr'] as $locale) {
            $path = '/'.$locale.'/corporate/about-prosperya';
            $this->assertSame(['kind' => 'legal', 'slug' => 'about-prosperya', 'locale' => $locale, 'path' => $path], $routes->parse($path));
            $this->assertSame($path, $routes->path('legal', 'about-prosperya', $locale));
        }
    }

    public function test_existing_terms_urls_resolve_the_cms_slug(): void
    {
        $routes = new WebsiteRoutes;
        $this->assertSame('terms-of-use', $routes->parse('/en/terms-of-use')['slug']);
        $this->assertSame('terms-of-use', $routes->parse('/fr/terms-of-use')['slug']);
        $this->assertSame('/en/terms-of-use', $routes->parse('/en/corporate/terms-of-use')['path']);
        $this->assertSame('/fr/privacy-policy', $routes->path('legal', 'privacy-policy', 'fr'));
    }

    public function test_invalid_detail_paths_are_not_indexable_routes(): void
    {
        $routes = new WebsiteRoutes;
        $this->assertNull($routes->parse('/en/corporate/private%2Frecord'));
        $this->assertNull($routes->parse('/en/corporate/../secret'));
        $this->assertNull($routes->parse('/de/corporate/about-prosperya'));
    }
}
