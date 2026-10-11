<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class MarketingContentTest extends WebsiteTestCase
{
    public function test_home_can_request_four_newest_public_expertise_without_changing_cms_order(): void
    {
        $rows = [];
        foreach (range(1, 5) as $index) {
            $rows[] = $this->record(['slug' => 'skill-'.$index, 'order' => $index, 'featured' => false,
                'created_at' => new \MongoDB\BSON\UTCDateTime(new \DateTimeImmutable('2026-01-0'.$index))]);
        }
        $rows[] = $this->record(['slug' => 'draft', 'status_id' => $this->ids['draft'], 'created_at' => new \MongoDB\BSON\UTCDateTime]);
        $rows[] = $this->record(['slug' => 'scheduled', 'published_at' => new \MongoDB\BSON\UTCDateTime(new \DateTimeImmutable('+1 day')), 'created_at' => new \MongoDB\BSON\UTCDateTime]);
        $rows[] = $this->record(['slug' => 'other-tenant', 'tenant_id' => (string) new ObjectId, 'created_at' => new \MongoDB\BSON\UTCDateTime]);
        $this->collection('expertise')->insertMany($rows);

        $response = $this->getJson('/api/expertise?locale=en&page=1&per_page=4&sort=latest')->assertOk()->assertJsonCount(4, 'data');
        $this->assertSame(['skill-5', 'skill-4', 'skill-3', 'skill-2'], array_column($response->json('data'), 'slug'));
        $default = $this->getJson('/api/expertise?locale=en')->assertOk();
        $this->assertSame(['skill-1', 'skill-2', 'skill-3', 'skill-4', 'skill-5'], array_column($default->json('data'), 'slug'));
        $this->getJson('/api/expertise?locale=en&sort=unknown')->assertUnprocessable();
    }

    public function test_approach_details_are_selected_by_slug_and_localize_new_repeaters(): void
    {
        $this->collection('approaches')->insertMany([
            $this->record(['slug' => 'our-approach', 'approach_title' => ['fr' => 'Notre approche'],
                'methodology' => [['methodology_title' => ['fr' => 'Étape'], 'methodology_deliverable' => ['fr' => 'Livrable']]],
                'how_we_work' => [['work_title' => ['fr' => 'Pratique'], 'work_points' => [['fr' => 'Point CMS'], ['en' => 'English only']]]]]),
            $this->record(['slug' => 'draft-approach', 'status_id' => $this->ids['draft']]),
        ]);
        $this->getJson('/api/approaches/our-approach?locale=fr')->assertOk()->assertJsonPath('data.approach_title', 'Notre approche')
            ->assertJsonPath('data.methodology.0.methodology_deliverable', 'Livrable')->assertJsonPath('data.how_we_work.0.work_points', ['Point CMS']);
        $this->getJson('/api/approaches/draft-approach?locale=fr')->assertNotFound();
    }

    public function test_expertise_animation_type_is_validated_and_content_stays_localized(): void
    {
        $this->collection('expertise')->insertMany([
            $this->record(['slug' => 'arbitrary-animation', 'expertise_animation_type' => 'workflow',
                'expertise_tagline' => ['fr' => 'Accroche CMS'], 'expertise_description' => ['en' => 'English only'],
                'expertise_capabilities' => [['fr' => 'Service CMS']], 'expertise_outcomes' => [['fr' => 'Résultat CMS']],
                'expertise_steps' => [['step_title' => ['fr' => 'Étape CMS'], 'step_description' => ['fr' => '<p>Texte</p>']]],
                'metrics' => [['metric_value' => ['fr' => '12'], 'metric_label' => ['fr' => 'Équipes']]],
                'expertise_metrics_note' => ['fr' => 'Note CMS'], 'internal_secret' => 'never-public']),
            $this->record(['slug' => 'invalid-animation', 'expertise_animation_type' => 'not-a-scene']),
            $this->record(['slug' => 'no-animation']),
        ]);
        $this->getJson('/api/expertise/arbitrary-animation?locale=fr')->assertOk()
            ->assertJsonPath('data.expertise_animation_type', 'workflow')->assertJsonPath('data.expertise_tagline', 'Accroche CMS')
            ->assertJsonPath('data.expertise_description', '')->assertJsonPath('data.expertise_capabilities.0', 'Service CMS')
            ->assertJsonPath('data.expertise_outcomes.0', 'Résultat CMS')->assertJsonPath('data.expertise_steps.0.step_title', 'Étape CMS')
            ->assertJsonPath('data.metrics.0.metric_label', 'Équipes')->assertJsonPath('data.expertise_metrics_note', 'Note CMS')->assertDontSee('never-public');
        $this->getJson('/api/expertise/invalid-animation?locale=en')->assertOk()->assertJsonPath('data.expertise_animation_type', '');
        $this->getJson('/api/expertise/no-animation?locale=en')->assertOk()->assertJsonPath('data.expertise_animation_type', '');
    }

    public function test_case_studies_expose_authored_content_and_scoped_industry_records(): void
    {
        $this->grant['modules'][] = ['id' => (string) new ObjectId, 'slug' => 'industries', 'model' => 'Industry', 'record_scope' => 'all'];
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake(['*' => Http::response($this->grant)]);
        $industry = (string) new ObjectId;
        $hidden = (string) new ObjectId;
        $untranslated = (string) new ObjectId;
        $this->collection('industries')->insertMany([
            $this->record(['_id' => new ObjectId($industry), 'name' => 'Retail', 'translations' => ['fr' => ['name' => 'Commerce']]]),
            $this->record(['_id' => new ObjectId($hidden), 'name' => 'Private industry', 'status_id' => $this->ids['draft']]),
            $this->record(['_id' => new ObjectId($untranslated), 'name' => 'Industry EN', 'translations' => ['fr' => ['name' => '']]]),
        ]);
        $this->collection('case_studies')->insertMany([
            $this->record(['slug' => 'authored', 'industry' => $industry, 'case_study_chapeau' => ['fr' => 'Introduction CMS'],
                'case_study_animation_type' => 'network', 'case_study_hero_facts' => [['hero_fact_value' => ['fr' => '12'], 'hero_fact_label' => ['fr' => 'Équipes']]],
                'content_sections' => [['content_title' => ['fr' => 'Chapitre'], 'content_subtitle' => ['en' => 'English only'], 'content_description' => ['fr' => '<p>Texte</p>']]],
                'technology_stack' => [['technology_name' => ['fr' => 'Outil CMS']]],
                'sections' => [['section_subtitle' => ['fr' => 'Sous-titre']]], 'internal_secret' => 'never-public']),
            $this->record(['slug' => 'hidden-industry', 'industry' => ['_id' => $hidden, 'name' => 'private-snapshot'], 'case_study_industry' => ['fr' => 'Stale legacy label']]),
            $this->record(['slug' => 'untranslated-industry', 'industry' => $untranslated, 'case_study_industry' => ['fr' => 'Stale legacy label']]),
        ]);
        $this->getJson('/api/case-studies/authored?locale=fr')->assertOk()
            ->assertJsonPath('data.industry_id', $industry)->assertJsonPath('data.industry_record.name', 'Commerce')
            ->assertJsonPath('data.case_study_chapeau', 'Introduction CMS')->assertJsonPath('data.case_study_animation_type', 'network')
            ->assertJsonPath('data.case_study_hero_facts.0.hero_fact_label', 'Équipes')->assertJsonPath('data.content_sections.0.content_subtitle', '')
            ->assertJsonPath('data.technology_stack.0.technology_name', 'Outil CMS')->assertJsonPath('data.sections.0.section_subtitle', 'Sous-titre')->assertDontSee('never-public');
        $this->getJson('/api/case-studies/hidden-industry?locale=fr')->assertOk()
            ->assertJsonPath('data.industry_id', '')->assertJsonPath('data.industry_record', null)->assertJsonPath('data.case_study_industry', '')
            ->assertDontSee('private-snapshot')->assertDontSee('Private industry')->assertDontSee('Stale legacy label');
        $this->getJson('/api/case-studies/untranslated-industry?locale=fr')->assertOk()
            ->assertJsonPath('data.industry_id', $untranslated)->assertJsonPath('data.industry_record.name', '')->assertJsonPath('data.case_study_industry', '');
    }

    public function test_case_studies_keep_legacy_industries_but_omit_ungranted_industry_snapshots(): void
    {
        $industry = (string) new ObjectId;
        $this->collection('industries')->insertOne($this->record(['_id' => new ObjectId($industry), 'name' => 'Ungranted industry']));
        $this->collection('case_studies')->insertMany([
            $this->record(['slug' => 'legacy', 'case_study_industry' => ['en' => 'Retail', 'fr' => 'Commerce']]),
            $this->record(['slug' => 'ungranted', 'industry' => ['_id' => $industry, 'name' => 'Private snapshot'], 'case_study_industry' => ['fr' => 'Stale label']]),
        ]);
        $this->getJson('/api/case-studies/legacy?locale=fr')->assertOk()
            ->assertJsonPath('data.industry_id', 'Retail')->assertJsonPath('data.case_study_industry', 'Commerce');
        $this->getJson('/api/case-studies/ungranted?locale=fr')->assertOk()
            ->assertJsonPath('data.industry_id', '')->assertJsonPath('data.industry_record', null)->assertJsonPath('data.case_study_industry', '')
            ->assertDontSee('Ungranted industry')->assertDontSee('Private snapshot')->assertDontSee('Stale label');
    }

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
