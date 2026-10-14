<?php

namespace App\Http\Controllers;

use App\Models\Solution;
use App\Services\{PublicContent, ContentResponse};
use Illuminate\Http\Request;

class SolutionController
{
    public function getSolutions(Request $request, PublicContent $content, ?string $slug = null): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'featured' => ['sometimes', 'boolean'], 'ids' => ['sometimes', 'array', 'max:50'],
            'ids.*' => ['string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $query = Solution::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        if (isset($params['featured'])) $query->where('featured', (bool) $params['featured']);
        if (isset($params['ids'])) $query->whereIn('_id', $params['ids']);
        if ($slug !== null) return ['data' => $query->where('slug', $slug)->firstOrFail()];
        return ContentResponse::collection($query->orderBy('order')->orderBy('_id'), $request);
    }
}
