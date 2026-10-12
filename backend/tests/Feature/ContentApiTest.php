<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use Tests\TestCase;

/**
 * Runs against a throwaway local MongoDB (MONGODB_TEST_URI, default
 * 127.0.0.1:27017) with the CMS key check faked. Each test gets its own
 * database, dropped afterwards.
 */
class ContentApiTest extends TestCase
{
    private string $databaseName;

    private array $ids = [];

    private array $grant = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->databaseName = 'site_api_test_'.new ObjectId;
        $tenant = (string) new ObjectId;
        config(['website.cms_url' => 'https://cms.example.test', 'website.key' => 'site-fixture-key',
            'website.public_url' => 'https://site.example.test', 'website.recaptcha.secret' => 'server-secret',
            'database.connections.mongodb.dsn' => env('MONGODB_TEST_URI', 'mongodb://127.0.0.1:27017'),
            'database.connections.mongodb.database' => $this->databaseName]);
        DB::purge('mongodb');
        $database = DB::connection('mongodb')->getDatabase();

        $modules = [];
        foreach (['articles' => 'articles', 'article_categories' => 'article_categories', 'project_types' => 'project_types', 'project_stages' => 'project_stages', 'contact_forms' => 'contact_forms'] as $slug => $collection) {
            $modules[] = ['id' => $this->ids[$slug.'_module'] = (string) new ObjectId, 'slug' => $slug, 'collection' => $collection,
                'model' => \Illuminate\Support\Str::studly(\Illuminate\Support\Str::singular($slug)),
                'record_scope' => 'all', 'owner_column' => 'author_id'];
        }
        // What an admin set up in the CMS: statuses with their meaning as flags.
        foreach (['published' => ['record_published' => true], 'draft' => [], 'new' => ['is_default' => true]] as $slug => $flags) {
            $this->ids[$slug] = (string) new ObjectId;
            $database->selectCollection('ref_statuses')->insertOne(['_id' => new ObjectId($this->ids[$slug]), 'tenant_id' => $tenant,
                'slug' => $slug, 'name' => ucfirst($slug), 'is_active' => true, 'modules' => array_column($modules, 'id'), ...$flags]);
        }
        $this->ids['language'] = (string) new ObjectId;
        $database->selectCollection('ref_languages')->insertOne(['_id' => new ObjectId($this->ids['language']), 'tenant_id' => $tenant, 'code' => 'en', 'is_active' => true]);
        $this->ids['project'] = (string) new ObjectId;

        $this->grant = ['valid' => true, 'tenant_id' => $tenant, 'issuer_id' => (string) new ObjectId,
            'project' => ['id' => $this->ids['project'], 'code' => 'prosperya'], 'modules' => $modules,
            'website_settings' => ['default_locale' => 'en', 'locales' => ['en'], 'country' => null],
            'allowed_origins' => ['https://prosperya.com'],
            'statuses' => ['published' => [$this->ids['published']], 'enabled' => [$this->ids['published'], $this->ids['draft'], $this->ids['new']]]];
        Http::fake(['www.google.com/recaptcha/api/siteverify' => Http::response(['success' => true, 'hostname' => 'site.example.test']), '*' => Http::response($this->grant)]);

        foreach (['project_types', 'project_stages'] as $collection) {
            $this->ids[$collection] = (string) new ObjectId;
            $database->selectCollection($collection)->insertOne(['_id' => new ObjectId($this->ids[$collection]), ...$this->scope(),
                'name' => 'Option', 'status_id' => $this->ids['published']]);
        }
    }

    protected function tearDown(): void
    {
        DB::connection('mongodb')->getClient()->dropDatabase($this->databaseName);
        parent::tearDown();
    }

    private function scope(): array
    {
        return ['tenant_id' => $this->grant['tenant_id'] ?? null, 'project' => [$this->ids['project']]];
    }

    public function test_only_published_live_records_of_the_keys_project_are_served(): void
    {
        $articles = DB::connection('mongodb')->getDatabase()->selectCollection('articles');
        $articles->insertOne([...$this->scope(), 'slug' => 'published', 'name' => 'Fallback',
            'article_title' => ['en' => 'Public title'], 'article_description' => ['en' => 'Body'],
            'status_id' => $this->ids['published'], 'internal_secret' => 'never-public']);
        $articles->insertOne([...$this->scope(), 'slug' => 'draft', 'status_id' => $this->ids['draft'], 'article_title' => ['en' => 'Draft']]);
        $articles->insertOne([...$this->scope(), 'slug' => 'deleted', 'status_id' => $this->ids['published'], 'deleted_at' => new UTCDateTime]);
        $articles->insertOne([...$this->scope(), 'slug' => 'scheduled', 'status_id' => $this->ids['published'],
            'published_at' => new UTCDateTime((time() + 86400) * 1000)]);
        $articles->insertOne([...$this->scope(), 'project' => [(string) new ObjectId], 'slug' => 'other-project', 'status_id' => $this->ids['published']]);
        $articles->insertOne(['tenant_id' => $this->grant['tenant_id'], 'project' => [['_id' => $this->ids['project'], 'code' => 'prosperya']],
            'slug' => 'cms-snapshot', 'article_title' => ['en' => 'CMS snapshot'], 'status' => ['_id' => $this->ids['published']]]);

        $result = $this->getJson('/api/articles?per_page=500&locale=en')->assertOk()->assertJsonCount(2, 'data')
            ->assertDontSee('never-public');
        $this->assertEqualsCanonicalizing(['published', 'cms-snapshot'], array_column($result->json('data'), 'slug'));
        $this->assertSame(50, $result->json('meta.per_page'));
        $this->getJson('/api/articles/published')->assertOk()->assertJsonPath('data.body', 'Body');
        $this->getJson('/api/articles/draft')->assertNotFound();
        $this->getJson('/api/articles?locale=fr')->assertUnprocessable();
    }

    public function test_articles_filter_by_a_category_the_website_may_show(): void
    {
        $database = DB::connection('mongodb')->getDatabase();
        $news = (string) new ObjectId;
        $hidden = (string) new ObjectId;
        $database->selectCollection('article_categories')->insertMany([
            ['_id' => new ObjectId($news), ...$this->scope(), 'slug' => 'news', 'status_id' => $this->ids['published']],
            ['_id' => new ObjectId($hidden), ...$this->scope(), 'slug' => 'hidden', 'status_id' => $this->ids['draft']],
        ]);
        $database->selectCollection('articles')->insertMany([
            [...$this->scope(), 'slug' => 'in-news', 'article_category' => $news, 'status_id' => $this->ids['published']],
            [...$this->scope(), 'slug' => 'in-hidden', 'article_category' => $hidden, 'status_id' => $this->ids['published']],
        ]);

        $this->getJson('/api/articles?category=news')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'in-news');
        $this->getJson('/api/articles?category=hidden')->assertNotFound();
    }

    /** Tenant access is automatic; project and status are explicit caller filters. */
    public function test_copied_models_query_like_eloquent_inside_the_key_scope(): void
    {
        $articles = DB::connection('mongodb')->getDatabase()->selectCollection('articles');
        $articles->insertMany([
            [...$this->scope(), 'slug' => 'mine', 'status_id' => $this->ids['published']],
            [...$this->scope(), 'slug' => 'my-draft', 'status_id' => $this->ids['draft']],
            ['tenant_id' => (string) new ObjectId, 'project' => [$this->ids['project']], 'slug' => 'other-tenant', 'status_id' => $this->ids['published']],
            [...$this->scope(), 'project' => [(string) new ObjectId], 'slug' => 'other-project', 'status_id' => $this->ids['published']],
        ]);

        $published = \App\Models\Status::query()->where('slug', 'published')->first();
        $this->assertNotNull($published);
        $this->assertSame(['mine'], \App\Models\Article::forWebsite()->where('project', $this->ids['project'])
            ->where('status', (string) $published->id)->pluck('slug')->all());
        $this->assertEqualsCanonicalizing(['mine', 'my-draft', 'other-project'], \App\Models\Article::query()->pluck('slug')->all());
    }

    public function test_a_module_the_key_does_not_grant_is_not_served(): void
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response(['modules' => []] + $this->grant)]);

        $this->getJson('/api/articles')->assertNotFound();
    }

    public function test_contact_writes_the_cms_shape_in_the_modules_default_status(): void
    {
        $payload = ['name' => 'Visitor', 'company_name' => 'Company', 'work_email' => 'visitor@example.test',
            'contact_country' => 'Lebanon', 'project_type' => $this->ids['project_types'],
            'project_stage' => $this->ids['project_stages'], 'project_brief' => 'Please contact me.', 'captcha_token' => 'visitor-token'];
        $this->postJson('/api/contact', [...$payload, 'tenant_id' => 'forged'])->assertUnprocessable();
        $this->postJson('/api/contact', [...$payload, 'status' => 'forged'])->assertUnprocessable();
        $this->postJson('/api/contact', [...$payload, 'project_stage' => 'malformed'])->assertUnprocessable();
        $withoutCaptcha = $payload;
        unset($withoutCaptcha['captcha_token']);
        $this->postJson('/api/contact', $withoutCaptcha)->assertUnprocessable()->assertJsonValidationErrors('captcha_token');
        $this->assertSame(0, DB::connection('mongodb')->getDatabase()->selectCollection('contact_forms')->countDocuments());
        $this->postJson('/api/contact', $payload)->assertCreated();

        $stored = DB::connection('mongodb')->getDatabase()->selectCollection('contact_forms')->findOne(['work_email' => $payload['work_email']]);
        $this->assertSame($this->grant['tenant_id'], $stored['tenant_id']);
        $this->assertEquals([$this->ids['project']], (array) $stored['project']);
        $this->assertSame($this->ids['new'], $stored['status_id']);
        $this->assertSame('new', $stored['status']['slug']);
        $this->assertEquals([$this->ids['language']], (array) $stored['language']);
        $this->assertArrayNotHasKey('captcha_token', (array) $stored);
    }

    public function test_a_key_the_cms_refuses_blocks_reads_and_submissions(): void
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response([], 401)]);
        $this->getJson('/api/articles')->assertForbidden();
        $this->postJson('/api/contact', [])->assertForbidden();
    }

    public function test_an_unreachable_cms_fails_closed(): void
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response('down', 500)]);
        $this->getJson('/api/articles')->assertStatus(503);
    }
}
