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
        }
        $this->getJson('/api/expertise?locale=fr')->assertJsonPath('data.0.capabilities.0', 'Connecter');
    }

    public function test_ungranted_modules_fail_closed(): void
    {
        $this->getJson('/api/case-studies')->assertNotFound();
        $this->getJson('/api/expertise')->assertNotFound();
    }
}
