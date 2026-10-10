<?php

namespace App\Http\Controllers;

use App\Models\Expertise;
use App\Services\{PublicContent, MarketingPayload, PublicPayload};
use Illuminate\Http\Request;

class ExpertiseController
{
    public function getExpertise(Request $request, PublicContent $content, MarketingPayload $payload, PublicPayload $pagination, ?string $slug = null): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'featured' => ['sometimes', 'boolean'], 'ids' => ['sometimes', 'array', 'max:50'],
            'ids.*' => ['string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $query = Expertise::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        if (isset($params['featured'])) $query->where('featured', (bool) $params['featured']);
        if (isset($params['ids'])) $query->whereIn('_id', $params['ids']);
        if ($slug !== null) return ['data' => $payload->record($query->where('slug', $slug)->firstOrFail(), $locale)];
        if (!isset($params['page']) && !isset($params['per_page'])) {
            $rows = $query->orderBy('order')->orderBy('_id')->get();
            return ['data' => $rows->map(fn ($row) => $payload->record($row, $locale))];
        }
        $page = $query->orderBy('order')->orderBy('_id')->paginate(min(50, (int) ($params['per_page'] ?? 50)));
        return ['data' => $page->getCollection()->map(fn ($row) => $payload->record($row, $locale)), 'meta' => $pagination->pagination($page)];
    }
}
