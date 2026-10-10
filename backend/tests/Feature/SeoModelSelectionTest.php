<?php

namespace Tests\Feature;

use App\Models\SeoPage;
use App\Services\PublicContent;
use App\Services\WebsiteSeo;
use Illuminate\Support\Facades\Http;
use ReflectionMethod;
use ReflectionProperty;
use Tests\TestCase;

class SeoModelSelectionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['website.cms_url' => 'https://cms.example.test', 'website.key' => 'fixture-key',
            'website.public_url' => 'https://site.example.test']);
        Http::fake(['*' => Http::response(['valid' => true, 'tenant_id' => 'fixture-tenant',
            'modules' => [], 'statuses' => ['published' => []],
            'website_settings' => ['default_locale' => 'en', 'locales' => ['en', 'fr']]])]);
    }

    public function test_model_names_are_allowlisted_and_must_match_the_route(): void
    {
        $this->assertSame(['SeoPage', 'Article', 'CorporatePage', 'CaseStudy', 'Expertise'], WebsiteSeo::modelNames());
        $this->getJson('/api/seo?path=/en/insights&model=User')->assertUnprocessable()->assertJsonValidationErrors('model');
        $this->getJson('/api/seo?path=/en/insights&model=Article')->assertUnprocessable();
        $this->getJson('/api/seo?path=/en/corporate/about-prosperya&model=SeoPage')->assertUnprocessable();
        $this->getJson('/api/seo?path=/en/insights/example&model=CorporatePage')->assertUnprocessable();
    }

    public function test_explicit_selection_preserves_module_permissions_and_missing_detail_statuses(): void
    {
        $this->getJson('/api/seo?path=/en/insights&model=SeoPage')->assertOk()->assertJsonPath('data.robots', 'noindex, follow');
        $this->getJson('/api/seo?path=/en/insights/example&model=Article')->assertNotFound();
        $this->getJson('/api/seo?path=/en/corporate/about-prosperya&model=CorporatePage')->assertNotFound();
    }

    public function test_seo_page_localized_fields_and_media_use_the_existing_public_contract(): void
    {
        $content = app(PublicContent::class);
        (new ReflectionProperty($content, 'languages'))->setValue($content, ['fr' => (object) ['id' => 'fr-id', 'code' => 'fr']]);
        $record = new SeoPage;
        $record->setRawAttributes(['name' => 'Insights', 'meta_title' => ['fr' => 'Analyses du CMS'],
            'meta_description' => ['fr' => '<p>Description du CMS</p>'], 'meta_keywords' => ['fr' => 'ERP'],
            'meta_image' => ['url' => 'https://media.example.test/social.png'], 'internal_secret' => 'never-public']);
        $metadata = (new ReflectionMethod(WebsiteSeo::class, 'metadata'))->invoke(app(WebsiteSeo::class),
            $record, ['kind' => 'page', 'slug' => 'insights', 'locale' => 'fr', 'path' => '/fr/insights']);
        $this->assertSame('Analyses du CMS', $metadata['title']);
        $this->assertSame('Description du CMS', $metadata['description']);
        $this->assertSame('ERP', $metadata['keywords']);
        $this->assertSame('https://media.example.test/social.png', $metadata['ogImage']);
        $this->assertSame('https://site.example.test/fr/insights', $metadata['canonical']);
        $this->assertStringNotContainsString('never-public', json_encode($metadata));
    }
}
