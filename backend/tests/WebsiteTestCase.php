<?php

namespace Tests;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;

abstract class WebsiteTestCase extends TestCase
{
    protected array $ids = [];
    protected array $grant = [];
    private string $databaseName;

    protected function setUp(): void
    {
        parent::setUp();
        $this->databaseName = 'site_integration_test_'.new ObjectId;
        config(['website.cms_url' => 'https://cms.example.test', 'website.key' => 'site-fixture-key',
            'website.public_url' => 'https://site.example.test',
            'database.connections.mongodb.dsn' => env('MONGODB_TEST_URI', 'mongodb://127.0.0.1:27017'),
            'database.connections.mongodb.database' => $this->databaseName]);
        DB::purge('mongodb');
        $tenant = (string) new ObjectId;
        $modules = [];
        foreach (['articles' => 'Article', 'article_categories' => 'ArticleCategory', 'pages' => 'Page', 'seo_pages' => 'SeoPage',
            'corporate_pages' => 'CorporatePage', 'translations' => 'Translation', 'newsletters' => 'Newsletter',
            'project_types' => 'ProjectType', 'project_stages' => 'ProjectStage', 'contact_forms' => 'ContactForm',
            'testimonials' => 'Testimonial', 'faqs' => 'Faq', 'faq_categories' => 'FaqCategory',
            'platforms' => 'Platform', 'platform_categories' => 'PlatformCategory', 'corporate_page_categories' => 'CorporatePageCategory'] as $slug => $model) {
            $modules[] = ['id' => $this->ids[$slug.'_module'] = (string) new ObjectId, 'slug' => $slug,
                'model' => $model, 'record_scope' => 'all', 'owner_column' => 'author_id'];
        }
        foreach (['published', 'draft', 'new'] as $slug) {
            $this->ids[$slug] = (string) new ObjectId;
            $this->collection('ref_statuses')->insertOne(['_id' => new ObjectId($this->ids[$slug]),
                'tenant_id' => $tenant, 'slug' => $slug, 'name' => ucfirst($slug), 'is_active' => true,
                'modules' => array_column($modules, 'id'), 'is_default' => $slug === 'new']);
        }
        foreach (['en', 'fr'] as $locale) {
            $this->ids[$locale] = (string) new ObjectId;
            $this->collection('ref_languages')->insertOne(['_id' => new ObjectId($this->ids[$locale]),
                'tenant_id' => $tenant, 'code' => $locale, 'is_active' => true]);
        }
        $this->ids['project'] = (string) new ObjectId;
        $this->grant = ['valid' => true, 'tenant_id' => $tenant, 'issuer_id' => (string) new ObjectId,
            'project' => ['id' => $this->ids['project'], 'code' => 'prosperya'], 'modules' => $modules,
            'website_settings' => ['default_locale' => 'en', 'locales' => ['en', 'fr'], 'country' => null],
            'statuses' => ['published' => [$this->ids['published']], 'enabled' => array_map(fn ($key) => $this->ids[$key], ['published', 'draft', 'new'])]];
        Http::fake(['*' => Http::response($this->grant)]);
    }

    protected function tearDown(): void
    {
        DB::connection('mongodb')->getClient()->dropDatabase($this->databaseName);
        parent::tearDown();
    }

    protected function collection(string $name): \MongoDB\Collection
    {
        return DB::connection('mongodb')->getDatabase()->selectCollection($name);
    }

    protected function record(array $fields = []): array
    {
        return ['tenant_id' => $this->grant['tenant_id'], 'project' => [$this->ids['project']],
            'status_id' => $this->ids['published'], ...$fields];
    }
}
