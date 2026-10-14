<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Services\PublicContent;
use App\Services\ContentResponse;
use Illuminate\Http\Request;

class ArticleController
{
    public function getArticles(Request $request, PublicContent $content, ?string $slug = null): array
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
            return ['data' => $query->where('slug', $slug)->firstOrFail()];
        }

        $params = $request->validate(['page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1'], 'category' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);

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

        return ContentResponse::collection($query->orderBy('published_at', 'desc')->orderBy('_id'), $request);
    }

    public function getCategories(Request $request, PublicContent $content): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        return ContentResponse::collection(ArticleCategory::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('sort_order')->orderBy('_id'), $request);
    }
}
