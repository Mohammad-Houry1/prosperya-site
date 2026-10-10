<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class SearchTest extends WebsiteTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        foreach (['expertise' => 'Expertise', 'solutions' => 'Solution', 'case_studies' => 'CaseStudy'] as $slug => $model) {
            $this->grant['modules'][] = ['id' => (string) new ObjectId, 'slug' => $slug, 'model' => $model, 'record_scope' => 'all'];
        }
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake(['*' => Http::response($this->grant)]);
    }

    public function test_search_returns_localized_public_results_across_content_types(): void
    {
        $this->collection('expertise')->insertMany([
            $this->record(['slug' => 'architecture', 'expertise_title' => ['en' => 'ERP Architecture', 'fr' => 'Architecture ERP'], 'internal_secret' => 'private-search-data']),
            $this->record(['slug' => 'draft', 'expertise_title' => ['fr' => 'ERP secret'], 'status_id' => $this->ids['draft']]),
            $this->record(['slug' => 'future', 'expertise_title' => ['fr' => 'ERP future'], 'published_at' => now()->addDay()]),
            $this->record(['slug' => 'other-project', 'expertise_title' => ['fr' => 'ERP other'], 'project' => (string) new ObjectId]),
            $this->record(['slug' => 'inactive', 'expertise_title' => ['fr' => 'ERP inactive'], 'is_active' => false]),
            $this->record(['slug' => 'deleted', 'expertise_title' => ['fr' => 'ERP deleted'], 'deleted_at' => now()]),
            $this->record(['slug' => 'foreign', 'expertise_title' => ['fr' => 'ERP foreign'], 'tenant_id' => (string) new ObjectId]),
            $this->record(['slug' => 'wrong-language', 'expertise_title' => ['fr' => 'ERP wrong-language'], 'language' => [$this->ids['en']]]),
        ]);
        $this->collection('solutions')->insertOne($this->record(['slug' => 'solution', 'solution_title' => ['fr' => 'ERP Solution']]));
        $this->collection('case_studies')->insertOne($this->record(['slug' => 'work', 'case_study_title' => ['fr' => 'ERP Projet']]));
        $this->collection('articles')->insertOne($this->record(['slug' => 'article', 'article_title' => ['fr' => 'ERP Article'], 'article_small_description' => ['fr' => '<p>Résumé CMS</p>']]));
        $this->getJson('/api/search?q=ERP&locale=fr')->assertOk()->assertJsonCount(4, 'data')
            ->assertJsonPath('data.0.title', 'Architecture ERP')->assertJsonPath('data.0.href', '/fr/expertise/architecture')
            ->assertJsonPath('data.3.href', '/fr/insights/article')->assertJsonPath('data.3.summary', 'Résumé CMS')
            ->assertJsonPath('meta.total', 4)->assertDontSee('private-search-data')->assertDontSee('ERP secret')->assertDontSee('ERP future')->assertDontSee('ERP other');
    }

    public function test_search_matches_literal_text_and_respects_translation_overrides(): void
    {
        $this->collection('expertise')->insertMany([
            $this->record(['slug' => 'literal', 'expertise_title' => ['en' => 'a.b service', 'fr' => 'Service FR']]),
            $this->record(['slug' => 'regex', 'expertise_title' => ['en' => 'axb service']]),
            $this->record(['slug' => 'override', 'expertise_title' => ['en' => 'Original term'], 'translations' => ['en' => ['expertise_title' => 'Replacement heading']]]),
            $this->record(['slug' => 'id-override', 'expertise_title' => ['en' => 'Original term'], 'translations' => [$this->ids['en'] => ['expertise_title' => 'Replacement heading']]]),
            $this->record(['slug' => 'code-wins', 'expertise_title' => ['en' => 'Code sidecar wins'], 'translations' => ['en' => [], $this->ids['en'] => ['expertise_title' => 'Original term']]]),
            $this->record(['slug' => 'map-override', 'expertise_title' => ['en' => 'Original term'], 'translations' => ['en' => ['expertise_title' => ['en' => 'Mapped override']]]]),
        ]);
        $this->getJson('/api/search?q=a.b&locale=en')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'literal');
        $this->getJson('/api/search?q=a.b&locale=fr')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/search?q=Original&locale=en')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/search?q=Replacement&locale=en')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/search?q=Mapped&locale=en')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_search_pages_results_and_skips_ungranted_modules(): void
    {
        for ($i = 0; $i < 23; $i++) $this->collection('expertise')->insertOne($this->record(['slug' => 'service-'.$i, 'order' => $i, 'expertise_title' => ['en' => 'Search service '.$i]]));
        $this->collection('solutions')->insertOne($this->record(['slug' => 'solution', 'solution_title' => ['en' => 'Search solution']]));
        $this->getJson('/api/search?q=Search&locale=en&page=2&per_page=20')->assertOk()->assertJsonCount(4, 'data')
            ->assertJsonPath('meta.total', 24)->assertJsonPath('meta.last_page', 2)->assertJsonPath('data.0.slug', 'service-20')->assertJsonPath('data.3.type', 'solutions');
        $this->getJson('/api/search?q=x&locale=en')->assertUnprocessable();
        $this->getJson('/api/search?q=%20%20&locale=en')->assertUnprocessable();
        $this->getJson('/api/search?q=Search&type=users')->assertUnprocessable();
    }

    public function test_search_omits_ungranted_modules(): void
    {
        $this->grant['modules'] = array_values(array_filter($this->grant['modules'], fn ($row) => $row['model'] !== 'Solution'));
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake(['*' => Http::response($this->grant)]);
        $this->collection('solutions')->insertOne($this->record(['slug' => 'private', 'solution_title' => ['en' => 'Search secret']]));
        $this->getJson('/api/search?q=Search&locale=en&type=solutions')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/search?q=Search&locale=en')->assertOk()->assertJsonCount(0, 'data')->assertDontSee('Search secret');
    }
}
