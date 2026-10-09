<?php

namespace App\Http\Controllers;

use App\Models\Translation;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use Illuminate\Http\Request;

class WebsiteContentController
{
    public function labels(Request $request, PublicContent $content, PublicPayload $payload): array
    {
        [$locale, $perPage] = $this->parameters($request, $content, 500);
        $filters = $content->filters($locale);
        $page = Translation::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('_id')->paginate($perPage);
        $labels = $page->getCollection()->mapWithKeys(fn ($row) => is_string($row->key) && $row->key !== ''
            ? [$row->key => $row->text('value', $locale)] : []);

        return ['data' => (object) $labels->all(), 'meta' => $payload->pagination($page)];
    }

    private function parameters(Request $request, PublicContent $content, int $maximum): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1']]);

        return [$content->language($params['locale'] ?? null)->code, min($maximum, (int) ($params['per_page'] ?? $maximum))];
    }
}
