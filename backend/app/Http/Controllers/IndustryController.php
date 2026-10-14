<?php

namespace App\Http\Controllers;

use App\Models\Industry;
use App\Services\ContentResponse;
use App\Services\PublicContent;
use Illuminate\Http\Request;

class IndustryController
{
    public function index(Request $request, PublicContent $content): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1']]);
        $filters = $content->filters($content->language($params['locale'] ?? null)->code);
        $query = Industry::forWebsite()->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        return ContentResponse::collection($query->orderBy('order')->orderBy('_id'), $request);
    }
}
