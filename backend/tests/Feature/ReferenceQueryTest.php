<?php

namespace Tests\Feature;

use App\Models\Article;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class ReferenceQueryTest extends WebsiteTestCase
{
    public function test_reference_equality_matches_ids_arrays_and_embedded_records(): void
    {
        $id = (string) new ObjectId;
        $other = (string) new ObjectId;
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'id', 'article_category' => $id]),
            $this->record(['slug' => 'snapshot', 'article_category' => ['_id' => $id, 'name' => 'Category']]),
            $this->record(['slug' => 'array', 'article_category' => [$id]]),
            $this->record(['slug' => 'snapshots', 'article_category' => [['_id' => $id]]]),
            $this->record(['slug' => 'other', 'article_category' => $other]),
        ]);

        $this->assertSame(['array', 'id', 'snapshot', 'snapshots'], Article::forWebsite()
            ->where('article_category', $id)->orderBy('slug')->pluck('slug')->all());
        $this->assertSame(4, Article::forWebsite()->where('article_category', '=', $id)->count());
        $this->assertSame(4, Article::forWebsite()->whereIn('article_category', collect([$id]))->count());
        $this->assertSame(0, Article::forWebsite()->whereIn('article_category', [])->count());
    }

    public function test_reference_or_filters_preserve_tenant_project_and_publication_rules(): void
    {
        $id = (string) new ObjectId;
        $author = (string) new ObjectId;
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'category', 'article_category' => ['_id' => $id]]),
            $this->record(['slug' => 'author', 'authors' => [['_id' => $author]]]),
            $this->record(['slug' => 'tenant', 'tenant_id' => (string) new ObjectId, 'article_category' => ['_id' => $id]]),
            $this->record(['slug' => 'project', 'project' => [(string) new ObjectId], 'authors' => [['_id' => $author]]]),
            $this->record(['slug' => 'draft', 'status_id' => $this->ids['draft'], 'article_category' => ['_id' => $id]]),
        ]);

        $this->assertSame(['author', 'category'], Article::forWebsite()
            ->where('project', $this->ids['project'])->where('status', $this->ids['published'])->where(fn ($q) =>
            $q->where('article_category', $id)->orWhere('authors', $author))
            ->orderBy('slug')->pluck('slug')->all());
        $this->assertSame(['author', 'category'], Article::forWebsite()
            ->where('project', $this->ids['project'])->where('status', $this->ids['published'])->where(fn ($q) =>
            $q->where('article_category', $id)->orWhereIn('authors', [$author]))
            ->orderBy('slug')->pluck('slug')->all());
    }

    public function test_ordinary_queries_and_null_reference_queries_keep_mongo_semantics(): void
    {
        $id = (string) new ObjectId;
        $this->collection('articles')->insertMany([
            $this->record(['slug' => 'assigned', 'article_category' => $id]),
            $this->record(['slug' => 'unassigned', 'article_category' => null]),
            $this->record(['slug' => 'missing']),
        ]);

        $this->assertSame(1, Article::query()->where('slug', 'assigned')->count());
        $this->assertSame(2, Article::query()->where('article_category', null)->count());
        $this->assertSame(2, Article::query()->where('article_category', '!=', $id)->count());
        $this->assertSame(1, Article::query()->where(['slug' => ['$eq' => 'assigned']])->count());
    }
}
