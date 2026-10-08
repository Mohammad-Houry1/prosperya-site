<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Services\PublicContent;
use Illuminate\Http\Request;

class ArticleController
{
    public function index(Request $request, PublicContent $content)
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'], 'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1'], 'category' => ['sometimes', 'string', 'max:255']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $perPage = min(50, (int) ($params['per_page'] ?? 20));

        $query = Article::forWebsite($locale);
        // ?category=<slug>: only a category the website itself may show.
        if (isset($params['category'])) {
            $category = ArticleCategory::forWebsite($locale)->where('slug', $params['category'])->firstOrFail();
            $query->where('article_category', (string) $category->id);
        }

        $page = $query->orderBy('published_at', 'desc')->orderBy('_id')->paginate($perPage);

        return ['data' => $page->getCollection()->map(fn (Article $article) => $article->toWebsite($locale)),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'per_page' => $perPage, 'total' => $page->total()]];
    }

    public function show(Request $request, string $slug, PublicContent $content)
    {
        $locale = $content->language($request->validate(['locale' => ['sometimes', 'string', 'max:20']])['locale'] ?? null)->code;

        return ['data' => Article::forWebsite($locale)->where('slug', $slug)->firstOrFail()->toWebsite($locale, true)];
    }
}
