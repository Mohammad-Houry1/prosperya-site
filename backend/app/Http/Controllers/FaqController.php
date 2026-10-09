<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\FaqCategory;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use Illuminate\Http\Request;

class FaqController
{
    public function getFaqs(Request $request, PublicContent $content, PublicPayload $payload): array
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
            $category = (clone $categories)->where('slug', $params['category'])->firstOrFail();
            $query->where('faq_category', (string) $category->id);
        }
        if (isset($params['category_id'])) {
            $category = (clone $categories)->whereKey($params['category_id'])->firstOrFail();
            $query->where('faq_category', (string) $category->id);
        }

        $page = $query->where('is_question', '!=', false)->orderBy('sort_order')->orderBy('_id')
            ->paginate(min(50, (int) ($params['per_page'] ?? 50)));
        $ids = $page->getCollection()->map(fn ($row) => (string) $row->id)->all();
        $answers = (clone $base)->where('is_question', false)->whereIn('question', $ids)
            ->orderBy('sort_order')->orderBy('_id')->get()->groupBy(fn ($row) => $payload->referenceId($row->question));

        return ['data' => $page->getCollection()->map(fn ($row) => $payload->faq($row, $locale,
            ($answers->get((string) $row->id) ?? collect())->map(fn ($answer) => $answer->text('content', $locale))->implode("\n"))),
            'meta' => $payload->pagination($page)];
    }

    public function getCategories(Request $request, PublicContent $content, PublicPayload $payload): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1'],
            'category' => ['sometimes', 'string', 'max:255'], 'category_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $page = FaqCategory::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('sort_order')->orderBy('_id')->paginate(min(50, (int) ($params['per_page'] ?? 50)));

        return ['data' => $page->getCollection()->map(fn ($row) => $payload->category($row, $locale)),
            'meta' => $payload->pagination($page)];
    }
}
