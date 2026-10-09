<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Http;
use MongoDB\BSON\UTCDateTime;
use Tests\WebsiteTestCase;

class WebsiteSeoTest extends WebsiteTestCase
{
    private string $frontendDirectory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->frontendDirectory = sys_get_temp_dir().'/prosperya-html-'.bin2hex(random_bytes(6));
        mkdir($this->frontendDirectory);
        file_put_contents($this->frontendDirectory.'/index.html', '<!doctype html><html lang="en"><head><title>Old title</title><meta name="description" content="Old description"></head><body><div id="root"></div><script src="/assets/app.js"></script></body></html>');
        file_put_contents($this->frontendDirectory.'/site-routes.json', json_encode(['', 'about', 'insights', 'expertise', 'expertise/systems-integration', 'solutions', 'work', 'approach', 'contact']));
        mkdir($this->frontendDirectory.'/assets');
        file_put_contents($this->frontendDirectory.'/assets/app.js', 'console.log("public build");');
        config(['website.frontend_dist' => $this->frontendDirectory]);
    }

    protected function tearDown(): void
    {
        unlink($this->frontendDirectory.'/index.html');
        unlink($this->frontendDirectory.'/site-routes.json');
        unlink($this->frontendDirectory.'/assets/app.js');
        rmdir($this->frontendDirectory.'/assets');
        rmdir($this->frontendDirectory);
        parent::tearDown();
    }

    public function test_backend_metadata_overrides_frontend_defaults_in_initial_html_and_json(): void
    {
        $this->collection('pages')->insertOne($this->record(['slug' => 'home', 'name' => 'Home',
            'meta_title' => ['en' => 'Backend title', 'fr' => 'Titre serveur'], 'meta_description' => ['en' => 'Backend description'],
            'meta_image' => ['url' => 'https://cms.example.test/social.jpg'], 'internal_secret' => 'never-public']));
        $this->getJson('/api/seo?path=/en')->assertOk()->assertJsonPath('data.title', 'Backend title')
            ->assertJsonPath('data.canonical', 'https://site.example.test/en')->assertJsonPath('data.robots', 'index, follow')->assertDontSee('never-public');
        $html = $this->get('/en')->assertOk()->assertHeader('Content-Type', 'text/html; charset=UTF-8')->getContent();
        $this->assertStringContainsString('<title>Backend title</title>', $html);
        $this->assertStringContainsString('content="Backend description"', $html);
        $this->assertStringContainsString('hreflang="fr"', $html);
        $this->assertStringContainsString('id="website-seo"', $html);
        $this->assertStringContainsString('<div id="root"></div>', $html);
        $this->assertSame(1, substr_count($html, 'rel="canonical"'));
        $this->assertStringNotContainsString('Old title', $html);
    }

    public function test_escaped_backend_content_cannot_break_html_or_the_metadata_bootstrap(): void
    {
        $this->collection('pages')->insertOne($this->record(['slug' => 'about',
            'meta_title' => ['en' => '</title><script>alert(1)</script>'], 'meta_description' => ['en' => '"><script>alert(2)</script>']]));
        $html = $this->get('/en/about')->assertOk()->getContent();
        $this->assertStringNotContainsString('<script>alert(', $html);
        $this->assertStringContainsString('&lt;/title&gt;', $html);
        preg_match('/<script id="website-seo" type="application\/json">(.*?)<\/script>/s', $html, $match);
        $metadata = json_decode($match[1], true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame('</title><script>alert(1)</script>', $metadata['title']);
    }

    public function test_sitemap_uses_only_published_indexable_existing_routes_and_available_locales(): void
    {
        $this->collection('pages')->insertMany([
            $this->record(['slug' => 'home', 'meta_title' => ['en' => 'Home']]),
            $this->record(['slug' => 'about', 'language' => [$this->ids['en']], 'meta_title' => ['en' => 'About']]),
            $this->record(['slug' => 'expertise', 'status_id' => $this->ids['draft']]),
            $this->record(['slug' => 'solutions', 'noindex' => true]),
            $this->record(['slug' => 'work', 'published_at' => new UTCDateTime((time() + 86400) * 1000)]),
            $this->record(['slug' => 'admin/secret']),
            $this->record(['slug' => 'expertise/unimplemented']),
        ]);
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'public-article', 'article_title' => ['en' => 'Article']]),
            $this->record(['slug' => 'draft-article', 'status_id' => $this->ids['draft']]),
        ]);
        $xml = $this->get('/sitemap.xml')->assertOk()->getContent();
        $this->assertStringContainsString('<loc>https://site.example.test/en</loc>', $xml);
        $this->assertStringContainsString('<loc>https://site.example.test/fr</loc>', $xml);
        $this->assertStringContainsString('/en/about', $xml);
        $this->assertStringNotContainsString('/fr/about', $xml);
        $this->assertStringContainsString('/en/insights/public-article', $xml);
        foreach (['draft-article', 'admin/secret', 'expertise/unimplemented', '/en/solutions', '/en/work', '/en/expertise</loc>'] as $hidden) {
            $this->assertStringNotContainsString($hidden, $xml);
        }
        $this->assertNotFalse(simplexml_load_string($xml));
        $this->get('/robots.txt')->assertOk()->assertSee('Sitemap: https://site.example.test/sitemap.xml');
    }

    public function test_unknown_and_missing_detail_routes_return_real_404_and_noindex(): void
    {
        $this->get('/en/unknown')->assertNotFound()->assertSee('noindex, follow');
        $this->get('/en/insights/missing')->assertNotFound()->assertSee('noindex, follow');
        $this->getJson('/api/seo?path=/en/unknown')->assertNotFound()->assertJsonPath('data.robots', 'noindex, follow');
        $this->getJson('/api/seo?path=/de')->assertNotFound();
        $this->get('/assets/missing.js')->assertNotFound();
    }

    public function test_existing_static_pages_without_backend_seo_remain_usable_but_noindex(): void
    {
        $this->get('/en/about')->assertOk()->assertSee('noindex, follow');
        $this->getJson('/api/seo?path=/en/about')->assertOk()->assertJsonPath('data.robots', 'noindex, follow')
            ->assertJsonPath('data.ogTitle', 'Prosperya');
    }

    public function test_article_and_translated_legal_routes_use_their_backend_records(): void
    {
        $this->collection('articles')->insertOne($this->record(['slug' => 'erp', 'article_title' => ['fr' => 'ERP français'],
            'meta_title' => ['fr' => 'SEO article'], 'meta_description' => ['fr' => 'Description article']]));
        $this->collection('corporate_pages')->insertOne($this->record(['slug' => 'privacy-policy', 'title' => ['fr' => 'Confidentialité'],
            'meta_title' => ['fr' => 'SEO vie privée']]));
        $this->get('/fr/insights/erp')->assertOk()->assertSee('<title>SEO article</title>', false)->assertSee('content="article"', false);
        $this->getJson('/api/seo?path=/fr/politique-de-confidentialite')->assertOk()->assertJsonPath('data.title', 'SEO vie privée');
        $this->get('/fr/privacy-policy')->assertRedirect('/fr/politique-de-confidentialite');
        $this->get('/')->assertRedirect('/en');
    }

    public function test_canonical_and_origin_validation_do_not_trust_browser_host_or_unsafe_cms_urls(): void
    {
        $this->collection('pages')->insertOne($this->record(['slug' => 'about', 'meta_url' => 'javascript:alert(1)']));
        $this->withHeader('Host', 'attacker.example')->getJson('/api/seo?path=/en/about')->assertOk()
            ->assertJsonPath('data.canonical', 'https://site.example.test/en/about');
        config(['website.public_url' => 'javascript:alert(1)']);
        $this->get('/robots.txt')->assertStatus(503);
    }

    public function test_sitemap_does_not_query_modules_that_are_not_granted(): void
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response(['modules' => []] + $this->grant)]);
        $xml = $this->get('/sitemap.xml')->assertOk()->getContent();
        $this->assertStringNotContainsString('<loc>', $xml);
        $this->getJson('/api/seo?path=/en')->assertOk()->assertJsonPath('data.robots', 'noindex, follow');
    }

    public function test_laravel_can_serve_built_assets_without_a_cms_request(): void
    {
        Http::swap(new Factory);
        Http::preventStrayRequests();
        $this->get('/assets/app.js')->assertOk()->assertHeader('Content-Type', 'text/javascript; charset=utf-8')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->get('/assets/../index.html')->assertNotFound();
        $this->get('/assets/missing.js')->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_canonical_overrides_cannot_publish_nonexistent_or_draft_urls(): void
    {
        $this->collection('pages')->insertMany([
            $this->record(['slug' => 'about', 'meta_url' => '/en/does-not-exist']),
            $this->record(['slug' => 'solutions', 'status_id' => $this->ids['draft']]),
        ]);
        $this->getJson('/api/seo?path=/en/about')->assertOk()->assertJsonPath('data.canonical', 'https://site.example.test/en/about');
        $this->collection('pages')->updateOne(['slug' => 'about'], ['$set' => ['meta_url' => '/en/solutions']]);
        $this->getJson('/api/seo?path=/en/about')->assertOk()->assertJsonPath('data.canonical', 'https://site.example.test/en/about');
        $xml = $this->get('/sitemap.xml')->assertOk()->getContent();
        $this->assertStringNotContainsString('does-not-exist', $xml);
        $this->assertStringNotContainsString('/en/solutions', $xml);
    }

    public function test_valid_canonical_aliases_use_the_targets_alternates_and_do_not_duplicate_sitemap_entries(): void
    {
        $this->collection('pages')->insertOne($this->record(['slug' => 'about', 'meta_url' => '/en/insights/erp']));
        $this->collection('articles')->insertOne($this->record(['slug' => 'erp', 'article_title' => ['en' => 'ERP']]));
        $this->getJson('/api/seo?path=/en/about')->assertOk()
            ->assertJsonPath('data.canonical', 'https://site.example.test/en/insights/erp')
            ->assertJsonPath('data.alternates.0.url', 'https://site.example.test/en/insights/erp')
            ->assertJsonPath('data.alternates.1.url', 'https://site.example.test/fr/insights/erp');
        $xml = $this->get('/sitemap.xml')->assertOk()->getContent();
        $this->assertStringNotContainsString('<loc>https://site.example.test/en/about</loc>', $xml);
        $this->assertSame(1, substr_count($xml, '<loc>https://site.example.test/en/insights/erp</loc>'));
    }
}
