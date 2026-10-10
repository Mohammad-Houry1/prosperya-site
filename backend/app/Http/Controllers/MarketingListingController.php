<?php

namespace App\Http\Controllers;

use App\Models\CaseStudy;
use App\Models\Expertise;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use Illuminate\Http\Request;

class MarketingListingController
{
    public function work(Request $request, PublicContent $content, PublicPayload $payload): array
    {
        return $this->listing($request, $content, $payload, CaseStudy::class, 'caseStudyCard');
    }

    public function expertise(Request $request, PublicContent $content, PublicPayload $payload): array
    {
        return $this->listing($request, $content, $payload, Expertise::class, 'expertiseCard');
    }

    private function listing(Request $request, PublicContent $content, PublicPayload $payload, string $model, string $serialize): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1']]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $page = $model::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)->whereNotNull('slug')->where('slug', '!=', '')
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('order')->orderBy('_id')->paginate(min(50, (int) ($params['per_page'] ?? 50)));

        return ['data' => $page->getCollection()->map(fn ($row) => $payload->{$serialize}($row, $locale)),
            'meta' => $payload->pagination($page)];
    }
}
