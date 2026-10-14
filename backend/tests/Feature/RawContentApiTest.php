<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class RawContentApiTest extends WebsiteTestCase
{
    public function test_returns_new_fields_and_locale_maps_without_mapping(): void
    {
        $this->grant['modules'][] = ['id' => (string) new ObjectId, 'slug' => 'expertise', 'model' => 'Expertise', 'record_scope' => 'all'];
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake(['*' => Http::response($this->grant)]);
        $this->collection('expertise')->insertMany([
            $this->record(['slug' => 'raw', 'expertise_title' => ['en' => 'Title', 'fr' => 'Titre'],
                'new_cms_field' => ['nested' => ['value' => 42]], 'internal_secret' => 'private-value',
                'related_solutions' => ['123456789012345678901234']]),
            $this->record(['slug' => 'draft', 'status_id' => $this->ids['draft']]),
        ]);
        $this->getJson('/api/expertise?locale=fr')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.expertise_title.fr', 'Titre')
            ->assertJsonPath('data.0.new_cms_field.nested.value', 42)
            ->assertJsonPath('data.0.related_solutions.0', '123456789012345678901234')
            ->assertDontSee('private-value');
        $this->getJson('/api/expertise/raw?locale=en')->assertOk()
            ->assertJsonPath('data.new_cms_field.nested.value', 42)->assertJsonMissingPath('data.seo');
    }

    public function test_default_lists_do_not_truncate_and_pagination_is_explicit(): void
    {
        $this->collection('articles')->insertMany(array_map(fn ($i) => $this->record([
            'slug' => 'article-'.$i, 'article_title' => ['en' => 'Title '.$i], 'extra' => $i,
        ]), range(1, 55)));
        $this->getJson('/api/articles')->assertOk()->assertJsonCount(55, 'data')->assertJsonMissingPath('meta');
        $this->getJson('/api/articles?page=2&per_page=10')->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 55);
    }

    public function test_nested_private_fields_and_user_snapshot_content_are_not_serialized(): void
    {
        $this->collection('articles')->insertOne($this->record(['slug' => 'private',
            'author' => ['_id' => '123456789012345678901234', 'name' => 'Hidden snapshot'],
            'authors' => [['_id' => '123456789012345678901234', 'name' => 'Hidden author snapshot']],
            'sections' => [['heading' => 'Public', 'private' => 'hidden-nested', 'api_token' => 'hidden-token']],
        ]));
        $this->getJson('/api/articles/private')->assertOk()->assertJsonPath('data.sections.0.heading', 'Public')
            ->assertDontSee('hidden-nested')->assertDontSee('hidden-token')->assertDontSee('Hidden snapshot')->assertDontSee('Hidden author snapshot');
    }

    public function test_profile_lookups_do_not_expose_scheduled_users_or_private_translation_fields(): void
    {
        $this->grant['modules'][] = ['id' => (string) new ObjectId, 'slug' => 'users', 'model' => 'User', 'record_scope' => 'all'];
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake(['*' => Http::response($this->grant)]);
        $public = (string) new ObjectId;
        $scheduled = (string) new ObjectId;
        $this->collection('users')->insertMany([
            $this->record(['_id' => new ObjectId($public), 'slug' => 'public', 'name' => 'Person',
                'translations' => ['fr' => ['bio' => 'Bio', 'role_ids' => ['hidden-role'], 'personal_note' => 'hidden-note']]]),
            $this->record(['_id' => new ObjectId($scheduled), 'slug' => 'scheduled', 'published_at' => now()->addDay()]),
        ]);
        $this->getJson('/api/users?ids[]='.$public.'&ids[]='.$scheduled)->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.translations.fr.bio', 'Bio')->assertDontSee('hidden-role')->assertDontSee('hidden-note');
    }

    public function test_search_keeps_the_full_matching_record_instead_of_projecting_summary_fields(): void
    {
        $this->collection('articles')->insertOne($this->record(['slug' => 'searchable',
            'article_title' => ['en' => 'Searchable article'], 'new_cms_field' => ['value' => 42]]));
        $this->getJson('/api/search?q=Searchable')->assertOk()
            ->assertJsonPath('data.0.type', 'insights')->assertJsonPath('data.0.record.new_cms_field.value', 42);
    }
}
