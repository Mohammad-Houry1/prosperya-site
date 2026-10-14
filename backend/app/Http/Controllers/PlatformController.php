<?php

namespace App\Http\Controllers;

use App\Models\Platform;
use App\Models\PlatformCategory;
use App\Services\PublicContent;
use App\Services\ContentResponse;
use Illuminate\Http\Request;

class PlatformController
{
    public function getPlatforms(Request $request, PublicContent $content): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'string', 'max:255'], 'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $query = Platform::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        if (isset($params['category']) || isset($params['category_id'])) {
            $categories = PlatformCategory::forWebsite()
                ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
                ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
                ->where('is_active', '!=', false)
                ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
            if (isset($params['category'])) {
                $categories->where('slug', $params['category']);
            }
            if (isset($params['category_id'])) {
                $categories->whereKey($params['category_id']);
            }
            $category = $categories->first();
            abort_unless($category, 404, 'No public platform category matches the requested category for this website and language.');
            $query->where('platform_category', (string) $category->id);
        }
        return ContentResponse::collection($query->orderBy('sort_order')->orderBy('_id'), $request);
    }
}
