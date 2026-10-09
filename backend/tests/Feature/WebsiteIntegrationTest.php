<?php

namespace Tests\Feature;

use App\Models\Newsletter;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class WebsiteIntegrationTest extends WebsiteTestCase
{
    public function test_singleton_category_arrays_keep_the_public_category_id(): void
    {
        $id = (string) new ObjectId;
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'id-array', 'article_category' => [$id]]),
            $this->record(['slug' => 'snapshot-array', 'article_category' => [['_id' => $id, 'secret' => 'never-public']]]),
        ]);

        $response = $this->getJson('/api/articles')->assertOk()->assertJsonCount(2, 'data')->assertDontSee('never-public');
        $this->assertSame([$id, $id], array_column($response->json('data'), 'category_id'));
        foreach (['id-array', 'snapshot-array'] as $slug) {
            $this->getJson('/api/articles/'.$slug)->assertOk()->assertJsonPath('data.category_id', $id)->assertDontSee('never-public');
        }
    }

    public function test_embedded_categories_filter_and_serialize_without_exposing_snapshots(): void
    {
        $id = (string) new ObjectId;
        $hidden = (string) new ObjectId;
        $this->collection('article_categories')->insertMany([
            $this->record(['_id' => new ObjectId($id), 'slug' => 'finance', 'name' => ['fr' => 'Finances']]),
            $this->record(['_id' => new ObjectId($hidden), 'slug' => 'private', 'status_id' => $this->ids['draft']]),
        ]);
        $this->collection('articles')->insertOne($this->record(['slug' => 'embedded',
            'article_category' => ['_id' => $id, 'internal_secret' => 'never-public'],
            'article_title' => ['en' => 'Article', 'fr' => 'Analyse'],
            'article_description' => ['fr' => '<p>Contenu</p>']]));

        $this->getJson('/api/articles?locale=fr&category=finance&per_page=1')->assertOk()
            ->assertJsonPath('data.0.category_id', $id)->assertJsonPath('meta.total', 1)
            ->assertJsonPath('meta.per_page', 1)->assertDontSee('body')->assertDontSee('never-public');
        $this->getJson('/api/articles?locale=fr&category_id='.$id)->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/articles/embedded?locale=fr')->assertOk()
            ->assertJsonPath('data.title', 'Analyse')->assertJsonPath('data.body', '<p>Contenu</p>')
            ->assertJsonPath('data.category_id', $id)->assertDontSee('never-public');
        $this->getJson('/api/article-categories?locale=fr&per_page=1')->assertOk()
            ->assertJsonPath('data.0.name', 'Finances')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/articles?category=private')->assertNotFound();
        $this->getJson('/api/articles?category_id='.$hidden)->assertNotFound();
        $this->getJson('/api/articles/missing')->assertNotFound();
    }

    public function test_categories_and_articles_match_the_existing_frontend_contract(): void
    {
        $categoryId = (string) new ObjectId;
        $this->collection('article_categories')->insertOne($this->record(['_id' => new ObjectId($categoryId), 'name' => 'Finance', 'slug' => 'finance']));
        $this->collection('article_categories')->insertOne($this->record(['name' => 'Private', 'status_id' => $this->ids['draft']]));
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'finance', 'article_category' => $categoryId, 'article_title' => ['en' => 'Finance'],
                'meta_title' => ['en' => 'Finance SEO'], 'cover_image' => ['url' => '/storage/finance.jpg', 'alt' => ['en' => 'Finance'], 'disk' => 'private'], 'internal_secret' => 'never-public']),
            $this->record(['slug' => 'other', 'article_title' => ['en' => 'Other']]),
        ]);
        $this->getJson('/api/article-categories?locale=en')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $categoryId);
        $this->getJson('/api/articles?locale=en&category_id='.$categoryId)->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.seo.title', 'Finance SEO')->assertJsonPath('data.0.cover_image.url', 'https://cms.example.test/storage/finance.jpg')
            ->assertDontSee('never-public')->assertDontSee('private');
        $this->getJson('/api/articles?category_id=malformed')->assertUnprocessable();
    }

    public function test_corporate_pages_and_labels_are_localized_and_public_only(): void
    {
        $this->collection('corporate_pages')->insertOne($this->record(['slug' => 'privacy-policy',
            'title' => ['en' => 'Privacy', 'fr' => 'Confidentialité'], 'description' => ['fr' => 'Introduction'],
            'sections' => [['title' => ['fr' => 'Données'], 'description' => ['fr' => '<p>Texte</p>'], 'private' => 'never-public']],
            'meta_title' => ['fr' => 'Vie privée'], 'internal_secret' => 'never-public']));
        $this->collection('translations')->insertMany([
            $this->record(['key' => 'nav.insights', 'value' => ['en' => 'Insights', 'fr' => 'Analyses']]),
            $this->record(['key' => 'secret', 'value' => ['fr' => 'never-public'], 'status_id' => $this->ids['draft']]),
        ]);
        $this->getJson('/api/corporate-pages/privacy-policy?locale=fr')->assertOk()->assertJsonPath('data.title', 'Confidentialité')
            ->assertJsonPath('data.sections.0.description', '<p>Texte</p>')->assertJsonPath('data.seo.title', 'Vie privée')->assertDontSee('never-public');
        $labels = $this->getJson('/api/labels?locale=fr')->assertOk()->assertDontSee('never-public');
        $this->assertSame('Analyses', $labels->json('data')['nav.insights']);
        $this->getJson('/api/corporate-pages/missing')->assertNotFound();
        $this->getJson('/api/labels?locale=de')->assertUnprocessable();
    }

    public function test_newsletter_is_validated_deduplicated_and_stamped_by_the_key(): void
    {
        $this->collection('newsletters')->createIndex(['tenant_id' => 1, 'website_project_id' => 1, 'email' => 1], [
            'unique' => true, 'partialFilterExpression' => ['deleted_at' => null, 'website_project_id' => ['$type' => 'string']],
        ]);
        $this->postJson('/api/newsletter', ['email' => 'invalid'])->assertUnprocessable();
        $this->postJson('/api/newsletter', ['email' => 'visitor@example.test', 'tenant_id' => 'forged'])->assertUnprocessable();
        $this->postJson('/api/newsletter', ['email' => 'visitor@example.test', 'website' => 'bot'])->assertUnprocessable();
        $this->postJson('/api/newsletter', ['email' => ' Visitor@Example.test ', 'locale' => 'fr', 'origin' => 'footer'])->assertCreated()->assertJsonPath('data.accepted', true);
        $this->postJson('/api/newsletter', ['email' => 'visitor@example.test', 'locale' => 'fr', 'origin' => 'footer'])->assertCreated()->assertJsonPath('data.accepted', true);
        $stored = $this->collection('newsletters')->findOne(['email' => 'visitor@example.test']);
        $this->assertSame(1, $this->collection('newsletters')->countDocuments());
        $this->assertSame($this->grant['tenant_id'], $stored['tenant_id']);
        $this->assertSame($this->ids['project'], $stored['website_project_id']);
        $this->assertEquals([$this->ids['project']], (array) $stored['project']);
        $this->assertEquals([$this->ids['fr']], (array) $stored['language']);
        $this->assertSame($this->ids['new'], $stored['status_id']);
    }

    public function test_newsletter_copied_model_keeps_inherited_access_scopes(): void
    {
        $this->collection('newsletters')->insertMany([
            $this->record(['email' => 'mine@example.test']),
            $this->record(['tenant_id' => (string) new ObjectId, 'email' => 'other@example.test']),
            $this->record(['project' => [(string) new ObjectId], 'email' => 'other-project@example.test']),
        ]);
        $this->assertSame(['mine@example.test'], Newsletter::forWebsite()
            ->where('project', $this->ids['project'])->pluck('email')->all());
        $this->assertEqualsCanonicalizing(['mine@example.test', 'other-project@example.test'], Newsletter::query()->pluck('email')->all());
    }

    public function test_newsletter_is_blocked_when_the_module_is_not_granted(): void
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response(['modules' => []] + $this->grant)]);
        $this->postJson('/api/newsletter', ['email' => 'blocked@example.test'])->assertNotFound();
    }

    public function test_contact_acknowledgement_matches_the_existing_form(): void
    {
        foreach (['project_types', 'project_stages'] as $name) {
            $this->ids[$name] = (string) new ObjectId;
            $this->collection($name)->insertOne($this->record(['_id' => new ObjectId($this->ids[$name]), 'name' => 'Option']));
        }
        $this->postJson('/api/contact', ['name' => 'Visitor', 'company_name' => 'Company', 'work_email' => 'visitor@example.test',
            'contact_country' => 'Lebanon', 'project_type' => $this->ids['project_types'], 'project_stage' => $this->ids['project_stages'],
            'project_brief' => 'Please contact me.', 'locale' => 'en', 'website' => ''])->assertCreated()->assertJsonPath('data.accepted', true);
    }

    public function test_language_id_sidecars_localize_category_names(): void
    {
        $this->collection('article_categories')->insertOne($this->record(['name' => 'Finance',
            'translations' => [$this->ids['fr'] => ['name' => 'Finances']]]));
        $this->getJson('/api/article-categories?locale=fr')->assertOk()->assertJsonPath('data.0.name', 'Finances');
    }

    public function test_contact_options_reject_non_string_locales(): void
    {
        $this->getJson('/api/contact/options?locale[]=en')->assertUnprocessable();
    }
}
