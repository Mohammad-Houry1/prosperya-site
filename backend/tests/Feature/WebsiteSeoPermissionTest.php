<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebsiteSeoPermissionTest extends TestCase
{
    private string $frontendDirectory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->frontendDirectory = sys_get_temp_dir().'/prosperya-routes-'.bin2hex(random_bytes(6));
        mkdir($this->frontendDirectory);
        file_put_contents($this->frontendDirectory.'/site-routes.json', json_encode([
            'expertise/systems-integration', 'work/global-retail-core',
        ]));
        config(['website.frontend_dist' => $this->frontendDirectory]);
    }

    protected function tearDown(): void
    {
        unlink($this->frontendDirectory.'/site-routes.json');
        rmdir($this->frontendDirectory);
        parent::tearDown();
    }

    public function test_missing_seo_module_keeps_existing_static_pages_usable_without_indexing_them(): void
    {
        config(['website.cms_url' => 'https://cms.example.test', 'website.key' => 'site-fixture-key',
            'website.public_url' => 'https://site.example.test']);
        Http::fake(['*' => Http::response(['valid' => true, 'tenant_id' => 'site-fixture-tenant',
            'modules' => [], 'statuses' => ['published' => []],
            'website_settings' => ['default_locale' => 'en', 'locales' => ['en', 'fr']]])]);

        foreach (['/en', '/fr', '/en/about', '/fr/about'] as $path) {
            $this->getJson('/api/seo?path='.$path)->assertOk()
                ->assertJsonPath('data.robots', 'noindex, follow')
                ->assertJsonPath('data.canonical', 'https://site.example.test'.$path)
                ->assertJsonCount(0, 'data.alternates');
        }
        $this->getJson('/api/seo?path=/en/unknown')->assertNotFound();
        $this->getJson('/api/seo?path=/en/expertise/systems-integration')->assertNotFound();
        $this->getJson('/api/seo?path=/fr/work/global-retail-core')->assertNotFound();
        $this->getJson('/api/seo?path=/en/insights/missing')->assertNotFound();
    }
}
