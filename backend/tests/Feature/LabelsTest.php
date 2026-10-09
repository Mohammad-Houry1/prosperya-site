<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class LabelsTest extends WebsiteTestCase
{
    private function dictionary(array $fields = []): array
    {
        return ['tenant_id' => $this->grant['tenant_id'], 'project' => [$this->ids['project']],
            'key' => 'prosperya.about.eyebrow', 'source' => 'About us',
            'translations' => ['en' => 'About us', 'fr' => 'À propos'], ...$fields];
    }

    public function test_canonical_dictionary_and_legacy_labels_are_localized(): void
    {
        $this->collection('translations')->insertMany([
            $this->dictionary(),
            $this->record(['key' => 'nav.work', 'value' => ['en' => 'Work', 'fr' => 'Projets']]),
            $this->dictionary(['key' => 'prosperya.blank', 'translations' => ['en' => '', 'fr' => '']]),
            $this->dictionary(['key' => 'prosperya.missing', 'translations' => []]),
        ]);
        $labels = $this->getJson('/api/labels?locale=fr')->assertOk()->json('data');
        $this->assertSame('À propos', $labels['prosperya.about.eyebrow']);
        $this->assertSame('Projets', $labels['nav.work']);
        $this->assertSame('', $labels['prosperya.blank']);
        $this->assertSame('', $labels['prosperya.missing']);
        $english = $this->getJson('/api/labels?locale=en')->assertOk()->json('data');
        $this->assertSame('About us', $english['prosperya.missing']);
    }

    public function test_dictionary_rows_keep_all_website_access_filters(): void
    {
        $otherId = (string) new ObjectId;
        $blocked = [
            ['tenant_id' => $otherId], ['project' => [$otherId]], ['country' => [$otherId]],
            ['language' => [$this->ids['en']]], ['deleted_at' => now()], ['is_active' => false],
            ['status_id' => $this->ids['draft']], ['status' => [$this->ids['draft']]],
            ['published_at' => now()->addDay()],
        ];
        foreach ($blocked as $index => $fields) {
            $this->collection('translations')->insertOne($this->dictionary([
                'key' => 'prosperya.blocked.'.$index, 'source' => 'never-public',
                'translations' => ['fr' => 'never-public'], ...$fields,
            ]));
        }
        // Unscoped CMS admin labels and legacy value rows are never exposed.
        $this->collection('translations')->insertMany([
            $this->dictionary(['key' => 'admin.secret', 'project' => null, 'translations' => ['fr' => 'never-public']]),
            $this->record(['key' => 'prosperya.legacy-private', 'project' => null, 'value' => ['fr' => 'never-public']]),
            ['tenant_id' => $this->grant['tenant_id'], 'project' => [$this->ids['project']],
                'key' => 'prosperya.statusless-content', 'value' => ['fr' => 'never-public']],
            $this->dictionary(['key' => 'prosperya.global', 'project' => null]),
        ]);
        $labels = $this->getJson('/api/labels?locale=fr')->assertOk()->assertDontSee('never-public');
        $this->assertSame(['prosperya.global' => 'À propos'], $labels->json('data'));
    }

    public function test_dictionary_pagination_does_not_discard_later_keys(): void
    {
        $this->collection('translations')->insertMany([
            $this->dictionary(['key' => 'prosperya.first']),
            $this->dictionary(['key' => 'prosperya.second']),
        ]);
        $this->getJson('/api/labels?locale=fr&per_page=1')->assertOk()
            ->assertJsonPath('meta.total', 2)->assertJsonPath('meta.last_page', 2);
        $second = $this->getJson('/api/labels?locale=fr&per_page=1&page=2')->assertOk();
        $this->assertCount(1, $second->json('data'));
        $this->assertArrayHasKey('prosperya.second', $second->json('data'));
    }

    public function test_dictionary_requires_the_granted_module(): void
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response(['modules' => []] + $this->grant)]);
        $this->getJson('/api/labels?locale=fr')->assertNotFound();
    }
}
