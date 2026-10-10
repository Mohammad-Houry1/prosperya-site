<?php

namespace App\Http\Controllers;

use App\Models\CaseStudy;
use App\Models\Expertise;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use Illuminate\Http\Request;
use App\Models\Platform;
use App\Models\Testimonial;
use App\Services\WebsiteAccess;

class MarketingListingController
{
    public function workDetail(Request $request, string $slug, PublicContent $content, PublicPayload $payload, WebsiteAccess $access): array
    {
        $locale = $this->locale($request, $content);
        $record = $this->published(CaseStudy::class, $content, $locale)->where('slug', $slug)->firstOrFail();
        $granted = collect($access->grant()['modules'])->pluck('model')->all();
        $platforms = in_array('Platform', $granted, true)
            ? $this->published(Platform::class, $content, $locale, false)->whereIn('_id', (array) $record->platforms)->get()->keyBy('id') : collect();
        $platforms = collect((array) $record->platforms)->map(fn ($id) => $platforms->get($id))->filter()->values();
        $testimonial = in_array('Testimonial', $granted, true) && $record->case_study_testimonial
            ? $this->published(Testimonial::class, $content, $locale, false)->where('_id', $record->case_study_testimonial)->first() : null;
        $next = $this->published(CaseStudy::class, $content, $locale)->where('_id', '!=', $record->id)
            ->where('order', '>=', $record->order ?? 0)->first()
            ?? $this->published(CaseStudy::class, $content, $locale)->where('_id', '!=', $record->id)->first();

        return ['data' => [...$payload->caseStudyDetail($record, $locale),
            'platforms' => $platforms->map(fn ($row) => $payload->platform($row, $locale))->values(),
            'testimonial' => $testimonial ? $payload->testimonial($testimonial, $locale) : null,
            'next' => $next ? $payload->caseStudyCard($next, $locale) : null]];
    }

    public function expertiseDetail(Request $request, string $slug, PublicContent $content, PublicPayload $payload): array
    {
        $locale = $this->locale($request, $content);
        $record = $this->published(Expertise::class, $content, $locale)->where('slug', $slug)->firstOrFail();
        return ['data' => $payload->expertiseDetail($record, $locale)];
    }

    private function locale(Request $request, PublicContent $content): string
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20']]);
        return $content->language($params['locale'] ?? null)->code;
    }

    private function published(string $model, PublicContent $content, string $locale, bool $requireSlug = true)
    {
        $filters = $content->filters($locale);
        $query = $model::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('order')->orderBy('_id');
        return $requireSlug ? $query->whereNotNull('slug')->where('slug', '!=', '') : $query;
    }
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
        $page = $this->published($model, $content, $locale)->paginate(min(50, (int) ($params['per_page'] ?? 50)));

        return ['data' => $page->getCollection()->map(fn ($row) => $payload->{$serialize}($row, $locale)),
            'meta' => $payload->pagination($page)];
    }
}
