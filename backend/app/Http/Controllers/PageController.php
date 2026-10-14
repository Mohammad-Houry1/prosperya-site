<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Services\PublicContent;
use App\Services\ContentResponse;
use Illuminate\Http\Request;

class PageController
{
    public function getPage(Request $request, PublicContent $content, string $slug): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $page = Page::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->where('slug', $slug)->firstOrFail();

        return ['data' => $page];
    }
}
