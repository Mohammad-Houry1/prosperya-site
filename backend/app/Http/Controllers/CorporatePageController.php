<?php

namespace App\Http\Controllers;

use App\Models\CorporatePage;
use App\Models\CorporatePageCategory;
use App\Models\User;
use App\Services\WebsiteAccess;
use App\Services\PublicContent;
use App\Services\ContentResponse;
use Illuminate\Http\Request;

class CorporatePageController
{
    public function getCorporatePages(Request $request, PublicContent $content, ?string $slug = null): array
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
            $page = $query->where('slug', $slug)->firstOrFail();
            if ($slug !== 'about-prosperya') return ['data' => $page];
            $users = collect();
            if (collect(app(WebsiteAccess::class)->grant()['modules'])->contains('model', 'User')) {
                $users = User::forWebsite()
                    ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
                    ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
                    ->where('is_active', '!=', false)->where('is_approved', '!=', false)
                    ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
                    ->orderBy('name')->orderBy('_id')->get();
            }
            return ['data' => $page, 'users' => $users];
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

        return ContentResponse::collection($query->orderBy('sort_order')->orderBy('_id'), $request);
    }

    public function getCategories(Request $request, PublicContent $content): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'string', 'max:255'], 'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        return ContentResponse::collection(CorporatePageCategory::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('sort_order')->orderBy('_id'), $request);
    }
}
