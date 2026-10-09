<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\WebsiteTestCase;

class WebsiteFiltersTest extends WebsiteTestCase
{
    public function test_for_website_does_not_choose_project_status_country_or_language(): void
    {
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'published']),
            $this->record(['slug' => 'draft', 'status_id' => $this->ids['draft']]),
            $this->record(['slug' => 'other-project', 'project' => [(string) new ObjectId]]),
            $this->record(['slug' => 'country', 'country' => [(string) new ObjectId]]),
            $this->record(['slug' => 'language', 'language' => [$this->ids['fr']]]),
            $this->record(['slug' => 'inactive', 'is_active' => false]),
            $this->record(['slug' => 'scheduled', 'published_at' => new UTCDateTime((time() + 86400) * 1000)]),
            $this->record(['slug' => 'tenant', 'tenant_id' => (string) new ObjectId]),
            $this->record(['slug' => 'deleted', 'deleted_at' => new UTCDateTime]),
        ]);

        $this->assertSame(['country', 'draft', 'inactive', 'language', 'other-project', 'published', 'scheduled'],
            Article::forWebsite()->orderBy('slug')->pluck('slug')->all());
        // Public endpoints still explicitly choose published content for this site.
        $this->getJson('/api/articles?locale=en')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'published');
    }

    public function test_explicit_where_filters_select_embedded_project_status_country_and_language(): void
    {
        $project = (string) new ObjectId;
        $country = (string) new ObjectId;
        $fields = ['project' => [['_id' => $project]], 'country' => [['_id' => $country]],
            'language' => [['_id' => $this->ids['fr']]], 'status_id' => null, 'status' => ['_id' => $this->ids['draft']]];
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'selected', ...$fields]),
            $this->record(['slug' => 'different-country', ...$fields, 'country' => [(string) new ObjectId]]),
            $this->record(['slug' => 'different-status', ...$fields, 'status' => ['_id' => $this->ids['published']]]),
        ]);

        $this->assertSame(['selected'], Article::forWebsite()->where('project', $project)
            ->where('status', $this->ids['draft'])->where('country', $country)
            ->where('language', $this->ids['fr'])->pluck('slug')->all());
    }

    public function test_status_filters_accept_flat_ids_snapshots_and_legacy_status_id(): void
    {
        $id = $this->ids['draft'];
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'legacy', 'status_id' => $id]),
            $this->record(['slug' => 'flat', 'status_id' => null, 'status' => $id]),
            $this->record(['slug' => 'snapshot', 'status_id' => null, 'status' => ['_id' => $id]]),
            $this->record(['slug' => 'published']),
        ]);

        $this->assertSame(3, Article::forWebsite()->where('status', $id)->count());
        $this->assertSame(3, Article::forWebsite()->whereIn('status', [$id])->count());
    }

    public function test_shared_language_filters_do_not_match_unrelated_snapshots(): void
    {
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'missing']),
            $this->record(['slug' => 'null', 'language' => null]),
            $this->record(['slug' => 'empty', 'language' => []]),
            $this->record(['slug' => 'wildcard', 'language' => ['*']]),
            $this->record(['slug' => 'english', 'language' => [['_id' => $this->ids['en']]]]),
            $this->record(['slug' => 'french', 'language' => [['_id' => $this->ids['fr']]]]),
            $this->record(['slug' => 'bad-snapshot', 'language' => ['code' => 'fr']]),
        ]);

        $this->assertSame(['empty', 'english', 'missing', 'null', 'wildcard'], Article::forWebsite()
            ->whereIn('language', [$this->ids['en'], '*', null, []])->orderBy('slug')->pluck('slug')->all());
    }

    public function test_for_website_still_rejects_a_module_not_allowed_by_the_key(): void
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response(['modules' => []] + $this->grant)]);
        $this->expectException(HttpException::class);
        $this->expectExceptionCode(0);
        Article::forWebsite()->get();
    }

    public function test_key_owner_permission_is_preserved_without_publication_filters(): void
    {
        $grant = $this->grant;
        foreach ($grant['modules'] as &$module) {
            if ($module['model'] === 'Article') {
                $module['record_scope'] = 'user';
            }
        }
        unset($module);
        Http::swap(new Factory);
        Http::fake(['*' => Http::response($grant)]);
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'mine', 'author_id' => $grant['issuer_id'], 'status_id' => $this->ids['draft']]),
            $this->record(['slug' => 'unassigned', 'status_id' => $this->ids['draft']]),
            $this->record(['slug' => 'other-owner', 'author_id' => (string) new ObjectId]),
        ]);

        $this->assertSame(['mine', 'unassigned'], Article::forWebsite()->orderBy('slug')->pluck('slug')->all());
    }
}
