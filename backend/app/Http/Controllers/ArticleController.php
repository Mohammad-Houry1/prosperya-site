<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use Illuminate\Http\Request;

class ArticleController
{
    public function getArticles(Request $request, PublicContent $content, PublicPayload $payload, ?string $slug = null): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $query = Article::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));

        if ($slug !== null) {
            return ['data' => $payload->article($query->where('slug', $slug)->firstOrFail(), $locale, true)];
        }

        $params = $request->validate(['page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1'], 'category' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);
        $perPage = min(50, (int) ($params['per_page'] ?? 20));

        // ?category=<slug>: only a category the website itself may show.
        if (isset($params['category']) || isset($params['category_id'])) {
            $categories = ArticleCategory::forWebsite()
                ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
                ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
                ->where('is_active', '!=', false)
                ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        }
        if (isset($params['category'])) {
            $category = (clone $categories)->where('slug', $params['category'])->firstOrFail();
            $query->where('article_category', (string) $category->id);
        }
        if (isset($params['category_id'])) {
            $category = (clone $categories)->whereKey($params['category_id'])->firstOrFail();
            $query->where('article_category', (string) $category->id);
        }

        $page = $query->orderBy('published_at', 'desc')->orderBy('_id')->paginate($perPage);

        return ['data' => $page->getCollection()->map(fn (Article $article) => $payload->article($article, $locale)),
            'meta' => $payload->pagination($page)];
    }

    public function getCategories(Request $request, PublicContent $content, PublicPayload $payload): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $page = ArticleCategory::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('sort_order')->orderBy('_id')
            ->paginate(min(50, (int) ($params['per_page'] ?? 50)));

        return ['data' => $page->getCollection()->map(fn ($row) => [
            'id' => (string) $row->id, 'slug' => $row->slug ?? '', 'name' => $row->text('name', $locale),
        ]), 'meta' => $payload->pagination($page)];
    }
}
