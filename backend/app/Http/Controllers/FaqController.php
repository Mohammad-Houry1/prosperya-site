<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\FaqCategory;
use App\Services\PublicContent;
use App\Services\ContentResponse;
use Illuminate\Http\Request;

class FaqController
{
    public function getFaqs(Request $request, PublicContent $content): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'string', 'max:255'], 'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $base = Faq::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        $query = clone $base;
        if (isset($params['category']) || isset($params['category_id'])) {
            $categories = FaqCategory::forWebsite()
                ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
                ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
                ->where('is_active', '!=', false)
                ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        }
        if (isset($params['category'])) {
            $category = (clone $categories)->where('slug', $params['category'])->first();
            abort_unless($category, 404, 'No public FAQ category matches the requested category for this website and language.');
            $query->where('faq_category', (string) $category->id);
        }
        if (isset($params['category_id'])) {
            $category = (clone $categories)->whereKey($params['category_id'])->first();
            abort_unless($category, 404, 'No public FAQ category matches the requested category for this website and language.');
            $query->where('faq_category', (string) $category->id);
        }

        $result = ContentResponse::collection($query->where('is_question', '!=', false)->orderBy('order')->orderBy('sort_order')->orderBy('_id'), $request);
        $ids = $result['data']->modelKeys();
        $result['answers'] = (clone $base)->where('is_question', false)->whereIn('question', $ids)
            ->orderBy('order')->orderBy('sort_order')->orderBy('_id')->get();
        return $result;
    }

    public function getCategories(Request $request, PublicContent $content): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'string', 'max:255'], 'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        return ContentResponse::collection(FaqCategory::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('sort_order')->orderBy('_id'), $request);
    }
}
