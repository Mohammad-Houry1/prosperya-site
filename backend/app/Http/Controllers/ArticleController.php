<?php

namespace App\Http\Controllers;

use App\Services\PublicContent;
use Illuminate\Http\Request;

class ArticleController
{
    public function index(Request $request, PublicContent $content)
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'], 'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $perPage = min(50, (int) ($params['per_page'] ?? 20));
        $page = $content->published('articles', $locale)->orderBy('published_at', 'desc')->orderBy('_id')
            ->paginate($perPage, ['_id', 'slug', 'name', 'article_title', 'article_small_description', 'translations',
                'featured', 'article_category', 'published_at']);

        return ['data' => $page->getCollection()->map(fn ($row) => $content->article($row, $locale)),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'per_page' => $perPage, 'total' => $page->total()]];
    }

    public function show(Request $request, string $slug, PublicContent $content)
    {
        $locale = $content->language($request->validate(['locale' => ['sometimes', 'string', 'max:20']])['locale'] ?? null)->code;
        $article = $content->published('articles', $locale)->where('slug', $slug)->first();
        abort_unless($article, 404);

        return ['data' => $content->article($article, $locale, true)];
    }
}
