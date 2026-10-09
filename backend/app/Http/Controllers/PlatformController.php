<?php

namespace App\Http\Controllers;

use App\Models\Platform;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use Illuminate\Http\Request;

class PlatformController
{
    public function getPlatforms(Request $request, PublicContent $content, PublicPayload $payload): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'string', 'max:255'], 'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $page = Platform::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('sort_order')->orderBy('_id')->paginate(min(50, (int) ($params['per_page'] ?? 50)));

        return ['data' => $page->getCollection()->map(fn ($row) => $payload->platform($row, $locale)),
            'meta' => $payload->pagination($page)];
    }
}
