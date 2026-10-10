<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class MarketingContentTest extends WebsiteTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        foreach (['expertise' => 'Expertise', 'solutions' => 'Solution', 'case_studies' => 'CaseStudy', 'approaches' => 'Approach'] as $slug => $model) {
            $this->grant['modules'][] = ['id' => (string) new ObjectId, 'slug' => $slug, 'model' => $model, 'record_scope' => 'all'];
        }
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake(['*' => Http::response($this->grant)]);
    }

    public function test_public_details_localize_nested_fields_and_exclude_private_and_draft_records(): void
    {
        $this->collection('expertise')->insertMany([
            $this->record(['slug' => 'arbitrary-capability', 'expertise_title' => ['en' => 'Architecture', 'fr' => 'Architecture FR'],
                'expertise_description' => ['en' => 'English only'], 'internal_secret' => 'never-public',
                'sections' => [['section_title' => ['fr' => 'Section FR'], 'section_description' => ['fr' => '<p>Texte</p>']]]]),
            $this->record(['slug' => 'draft', 'status_id' => $this->ids['draft']]),
            $this->record(['slug' => 'inactive', 'is_active' => false]),
        ]);
        $this->getJson('/api/expertise/arbitrary-capability?locale=fr')->assertOk()
            ->assertJsonPath('data.expertise_title', 'Architecture FR')
            ->assertJsonPath('data.expertise_description', '')
            ->assertJsonPath('data.sections.0.section_title', 'Section FR')->assertDontSee('never-public');
        $this->getJson('/api/expertise?locale=en&per_page=500')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('meta.per_page', 50);
        $this->getJson('/api/expertise/draft?locale=en')->assertNotFound();
    }

    public function test_relationships_preserve_selection_order_and_omit_unpublished_targets(): void
    {
        $first = (string) new ObjectId;
        $second = (string) new ObjectId;
        $hidden = (string) new ObjectId;
        $this->collection('expertise')->insertMany([
            $this->record(['_id' => new ObjectId($first), 'slug' => 'first', 'expertise_title' => ['en' => 'First']]),
            $this->record(['_id' => new ObjectId($second), 'slug' => 'second', 'expertise_title' => ['en' => 'Second']]),
            $this->record(['_id' => new ObjectId($hidden), 'slug' => 'hidden', 'status_id' => $this->ids['draft']]),
        ]);
        $this->collection('solutions')->insertOne($this->record(['slug' => 'new-solution', 'solution_title' => ['en' => 'Solution'],
            'related_expertise' => [$second, $hidden, $first]]));
        $response = $this->getJson('/api/solutions/new-solution?locale=en')->assertOk();
        $this->assertSame([$second, $first], array_column($response->json('data.related_expertise'), 'id'));
    }

    public function test_expertise_listing_exposes_localized_full_titles_in_cms_order(): void
    {
        $this->collection('expertise')->insertMany([
            $this->record(['slug' => 'second', 'order' => 2,
                'expertise_title' => ['en' => 'Connect', 'fr' => 'Connecter'],
                'expertise_detail_title' => ['en' => 'Systems Integration', 'fr' => 'Intégration des systèmes'],
                'expertise_tagline' => ['fr' => 'Des systèmes connectés'],
                'expertise_summary' => ['fr' => 'Résumé CMS'],
                'expertise_capabilities' => [['fr' => 'Service CMS']],
                'internal_secret' => 'not-public']),
            $this->record(['slug' => 'first', 'order' => 1, 'expertise_title' => ['fr' => 'Premier'],
                'expertise_detail_title' => ['en' => 'English-only heading']]),
            $this->record(['slug' => 'scheduled', 'order' => 0, 'published_at' => now()->addDay()]),
        ]);
        $this->getJson('/api/expertise?locale=fr')->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.slug', 'first')
            ->assertJsonPath('data.0.expertise_detail_title', '')
            ->assertJsonPath('data.1.expertise_title', 'Connecter')
            ->assertJsonPath('data.1.expertise_detail_title', 'Intégration des systèmes')
            ->assertJsonPath('data.1.expertise_capabilities.0', 'Service CMS')
            ->assertDontSee('not-public');
        $this->getJson('/api/expertise/second?locale=en')->assertOk()
            ->assertJsonPath('data.expertise_detail_title', 'Systems Integration');
    }

    public function test_page_architecture_and_canonical_dictionary_are_public_without_text_fallbacks(): void
    {
        $this->collection('pages')->insertOne($this->record(['slug' => 'home', 'architecture_column_1' => [['en' => 'CRM', 'fr' => 'CRM FR']]]));
        $this->getJson('/api/pages/home?locale=fr')->assertOk()->assertJsonPath('data.architecture_column_1.0', 'CRM FR');
        $this->collection('translations')->insertOne(['tenant_id' => $this->grant['tenant_id'], 'key' => 'prosperya.test',
            'source' => 'Source', 'translations' => ['en' => 'English']]);
        $this->assertSame('', $this->getJson('/api/labels?locale=fr')->assertOk()->json('data')['prosperya.test']);
    }

    public function test_single_collection_requests_are_complete_and_explicit_pagination_stays_bounded(): void
    {
        for ($index = 0; $index < 55; $index++) $this->collection('expertise')->insertOne($this->record(['slug' => 'capability-'.$index, 'order' => $index]));
        $this->getJson('/api/expertise?locale=en')->assertOk()->assertJsonCount(55, 'data');
        $this->getJson('/api/expertise?locale=en&page=1&per_page=500')->assertOk()->assertJsonCount(50, 'data')->assertJsonPath('meta.last_page', 2);
        for ($index = 0; $index < 505; $index++) $this->collection('translations')->insertOne(['tenant_id' => $this->grant['tenant_id'], 'key' => 'prosperya.test.'.$index, 'source' => 'Source', 'translations' => ['en' => 'CMS']]);
        $labels = $this->getJson('/api/labels?locale=en')->assertOk()->json('data');
        $this->assertCount(505, $labels);
        $this->getJson('/api/labels?locale=en&page=1&per_page=500')->assertOk()->assertJsonPath('meta.last_page', 2);
    }

    public function test_denied_related_modules_do_not_expose_snapshots_or_disable_the_public_parent(): void
    {
        $this->grant['modules'] = array_values(array_filter($this->grant['modules'], fn ($row) => $row['model'] !== 'Expertise'));
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake(['*' => Http::response($this->grant)]);
        $this->collection('solutions')->insertOne($this->record(['slug' => 'allowed', 'solution_title' => 'Public solution',
            'related_expertise' => [['_id' => (string) new ObjectId, 'expertise_title' => 'private-snapshot']]]));
        $this->getJson('/api/solutions/allowed?locale=en')->assertOk()->assertJsonPath('data.related_expertise', [])->assertDontSee('private-snapshot');
    }

    public function test_solutions_expose_authored_animation_and_public_articles_in_selection_order(): void
    {
        $first = (string) new ObjectId;
        $second = (string) new ObjectId;
        $draft = (string) new ObjectId;
        $this->collection('articles')->insertMany([
            $this->record(['_id' => new ObjectId($first), 'slug' => 'first', 'article_title' => ['fr' => 'Premier article']]),
            $this->record(['_id' => new ObjectId($second), 'slug' => 'second', 'article_title' => ['fr' => 'Deuxième article']]),
            $this->record(['_id' => new ObjectId($draft), 'slug' => 'draft', 'status_id' => $this->ids['draft']]),
        ]);
        $this->collection('solutions')->insertOne($this->record(['slug' => 'arbitrary-solution',
            'solution_title' => ['en' => 'Solution', 'fr' => 'Solution FR'],
            'solution_animation_type' => 'workflow',
            'solution_animation_centre_label' => ['en' => 'English only'],
            'solution_animation_lanes' => [['fr' => 'Voie CMS']],
            'solution_animation_steps' => array_map(fn ($i) => ['fr' => 'Étape '.$i], range(1, 8)),
            'related_articles' => [$second, $draft, $first], 'internal_secret' => 'never-public']));
        $response = $this->getJson('/api/solutions/arbitrary-solution?locale=fr')->assertOk()
            ->assertJsonPath('data.solution_animation_type', 'workflow')
            ->assertJsonPath('data.solution_animation_centre_label', '')
            ->assertJsonPath('data.solution_animation_lanes.0', 'Voie CMS')
            ->assertJsonPath('data.solution_animation_steps.7', 'Étape 8')->assertDontSee('never-public');
        $this->assertSame([$second, $first], array_column($response->json('data.related_articles'), 'id'));
        $this->assertSame('Deuxième article', $response->json('data.related_articles.0.title'));
    }
}
