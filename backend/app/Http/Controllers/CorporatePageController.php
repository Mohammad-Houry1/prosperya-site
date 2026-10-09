<?php

namespace App\Http\Controllers;

use App\Models\CorporatePage;
use App\Models\CorporatePageCategory;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use Illuminate\Http\Request;

class CorporatePageController
{
    public function getCorporatePages(Request $request, PublicContent $content, PublicPayload $payload, ?string $slug = null): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'string', 'max:255'], 'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $query = CorporatePage::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        if ($slug !== null) {
            return ['data' => $payload->corporatePage($query->where('slug', $slug)->firstOrFail(), $locale)];
        }
        if (isset($params['category']) || isset($params['category_id'])) {
            $categories = CorporatePageCategory::forWebsite()
                ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
                ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
                ->where('is_active', '!=', false)
                ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        }
        if (isset($params['category'])) {
            $category = (clone $categories)->where('slug', $params['category'])->firstOrFail();
            $query->where('corporate_page_category', (string) $category->id);
        }
        if (isset($params['category_id'])) {
            $category = (clone $categories)->whereKey($params['category_id'])->firstOrFail();
            $query->where('corporate_page_category', (string) $category->id);
        }

        $page = $query->orderBy('sort_order')->orderBy('_id')->paginate(min(50, (int) ($params['per_page'] ?? 50)));

        return ['data' => $page->getCollection()->map(fn ($row) => $payload->corporatePage($row, $locale, false)),
            'meta' => $payload->pagination($page)];
    }

    public function getCategories(Request $request, PublicContent $content, PublicPayload $payload): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'string', 'max:255'], 'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $page = CorporatePageCategory::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('sort_order')->orderBy('_id')->paginate(min(50, (int) ($params['per_page'] ?? 50)));

        return ['data' => $page->getCollection()->map(fn ($row) => $payload->category($row, $locale)),
            'meta' => $payload->pagination($page)];
    }
}
