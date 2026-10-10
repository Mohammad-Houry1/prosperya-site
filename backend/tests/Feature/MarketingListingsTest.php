<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class MarketingListingsTest extends WebsiteTestCase
{
    public function test_lists_are_localized_ordered_scoped_and_do_not_leak_private_fields(): void
    {
        foreach (['case_studies' => 'CaseStudy', 'expertise' => 'Expertise'] as $table => $model) {
            $this->grant['modules'][] = ['id' => (string) new ObjectId, 'slug' => $table, 'model' => $model];
            $prefix = $table === 'expertise' ? 'expertise' : 'case_study';
            $this->collection($table)->insertMany([
                $this->record(['slug' => 'second', 'order' => 2, $prefix.'_title' => ['fr' => 'Deuxième']]),
                $this->record(['slug' => 'first', 'order' => 1, $prefix.'_title' => ['fr' => 'Premier'],
                    $prefix.'_summary' => ['fr' => '<p>Résumé</p>'], $prefix.'_image' => ['url' => '/cover.svg'],
                    'expertise_capabilities' => [['fr' => 'Connecter']], 'internal_secret' => 'never-public']),
                $this->record(['slug' => 'draft', 'status_id' => $this->ids['draft']]),
                $this->record(['slug' => 'foreign', 'tenant_id' => (string) new ObjectId]),
                $this->record(['slug' => 'project', 'project' => [(string) new ObjectId]]),
                $this->record(['slug' => 'country', 'country' => [(string) new ObjectId]]),
                $this->record(['slug' => 'language', 'language' => [$this->ids['en']]]),
                $this->record(['slug' => 'future', 'published_at' => now()->addDay()]),
                $this->record(['slug' => 'deleted', 'deleted_at' => now()]),
            ]);
        }
        Cache::put('website-grant:'.hash('sha256', 'https://cms.example.test|site-fixture-key'), $this->grant, 60);
        foreach (['case-studies', 'expertise'] as $path) {
            $this->getJson('/api/'.$path.'?locale=fr&per_page=1')->assertOk()
                ->assertJsonPath('data.0.title', 'Premier')->assertJsonPath('data.0.summary', '<p>Résumé</p>')
                ->assertJsonPath('data.0.image.url', 'https://cms.example.test/cover.svg')->assertJsonPath('meta.total', 2)
                ->assertDontSee('never-public');
            $this->getJson('/api/'.$path.'?locale=fr&page=2&per_page=1')->assertJsonPath('data.0.slug', 'second');
            $this->getJson('/api/'.$path.'?per_page=0')->assertUnprocessable();
            $this->getJson('/api/'.$path.'/first?locale=fr')->assertOk()->assertJsonPath('data.title', 'Premier')->assertDontSee('never-public');
            foreach (['draft', 'foreign', 'project', 'country', 'language', 'future', 'deleted', 'missing'] as $slug) {
                $this->getJson('/api/'.$path.'/'.$slug.'?locale=fr')->assertNotFound();
            }
        }
        $this->getJson('/api/expertise?locale=fr')->assertJsonPath('data.0.capabilities.0', 'Connecter');
        $this->getJson('/api/seo?path=/fr/expertise/first&model=Expertise')->assertOk()->assertJsonPath('data.title', 'Premier');
        $this->getJson('/api/seo?path=/fr/work/first&model=CaseStudy')->assertOk()->assertJsonPath('data.title', 'Premier');
        $this->getJson('/api/seo?path=/fr/work/draft&model=CaseStudy')->assertNotFound();
        $this->getJson('/api/seo?path=/fr/work/first&model=SeoPage')->assertUnprocessable();
    }

    public function test_ungranted_modules_fail_closed(): void
    {
        $this->getJson('/api/case-studies')->assertNotFound();
        $this->getJson('/api/expertise')->assertNotFound();
        $this->getJson('/api/expertise/first')->assertNotFound();
        $this->getJson('/api/case-studies/first')->assertNotFound();
    }

    public function test_work_relations_follow_selection_order_and_exclude_hidden_records(): void
    {
        $this->grant['modules'][] = ['id' => (string) new ObjectId, 'slug' => 'case_studies', 'model' => 'CaseStudy'];
        Cache::put('website-grant:'.hash('sha256', 'https://cms.example.test|site-fixture-key'), $this->grant, 60);
        $one = (string) new ObjectId; $two = (string) new ObjectId; $hidden = (string) new ObjectId;
        $quote = (string) new ObjectId;
        $this->collection('platforms')->insertMany([
            $this->record(['_id' => new ObjectId($one), 'name' => 'Selected first', 'order' => 9]),
            $this->record(['_id' => new ObjectId($two), 'name' => 'Selected second', 'order' => 1]),
            $this->record(['_id' => new ObjectId($hidden), 'name' => 'never-public', 'status_id' => $this->ids['draft']]),
        ]);
        $this->collection('testimonials')->insertOne($this->record(['_id' => new ObjectId($quote),
            'testimonial_description' => ['fr' => '<p>Avis du CMS</p>'], 'user_name' => 'Client', 'internal_secret' => 'never-public']));
        $this->collection('case_studies')->insertOne($this->record(['slug' => 'new',
            'platforms' => [$one, $two, $hidden], 'case_study_testimonial' => $quote,
            'case_study_metrics' => [['metric_value' => ['fr' => '20'], 'metric_label' => ['fr' => 'Résultat']]],
            'sections' => [['section_title' => ['fr' => 'Section'], 'section_description' => ['fr' => '<p>Texte</p>']]]]));
        $this->getJson('/api/case-studies/new?locale=fr')->assertOk()->assertJsonCount(2, 'data.platforms')
            ->assertJsonPath('data.platforms.0.name', 'Selected first')->assertJsonPath('data.testimonial.quote', 'Avis du CMS')
            ->assertJsonPath('data.metrics.0.label', 'Résultat')->assertJsonPath('data.sections.0.section_title', 'Section')
            ->assertDontSee('never-public');
        $this->collection('testimonials')->updateOne(['_id' => new ObjectId($quote)], ['$set' => ['status_id' => $this->ids['draft']]]);
        $this->getJson('/api/case-studies/new?locale=fr')->assertOk()->assertJsonPath('data.testimonial', null);
    }
}
