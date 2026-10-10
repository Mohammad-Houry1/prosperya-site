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
        $query = Translation::forWebsite()
            ->where(function ($query) use ($filters) {
                $query->whereIn('project', $filters['project'])
                    ->orWhere(function ($dictionary) {
                        // Tenant-wide CMS labels are public only in this site's namespace.
                        $dictionary->whereRaw(['source' => ['$type' => 'string']])
                            ->where('key', 'like', 'prosperya.%')
                            ->whereIn('project', [null, []]);
                    });
            })
            ->where(function ($query) use ($filters) {
                $query->whereIn('status', $filters['status'])
                    ->orWhere(function ($dictionary) {
                        // Canonical dictionary entries have source/translations and no status.
                        // Content-style entries still require a granted published status.
                        $dictionary->whereRaw(['source' => ['$type' => 'string']])
                            ->whereNull('status')->whereNull('status_id');
                    });
            })
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->orderBy('_id');
        if (!$request->has('page') && !$request->has('per_page')) {
            $labels = $query->get()->mapWithKeys(fn ($row) => is_string($row->key) && $row->key !== ''
                ? [$row->key => $this->labelText($row, $locale)] : []);
            return ['data' => (object) $labels->all()];
        }
        $page = $query->paginate($perPage);
        $labels = $page->getCollection()->mapWithKeys(fn ($row) => is_string($row->key) && $row->key !== ''
            ? [$row->key => $this->labelText($row, $locale)] : []);

        return ['data' => (object) $labels->all(), 'meta' => $payload->pagination($page)];
    }

    private function labelText(Translation $row, string $locale): string
    {
        if (is_string($row->source)) {
            $translation = ((array) $row->translations)[$locale] ?? null;
            // Only an authored value in the requested locale may be displayed.
            return is_string($translation) ? $translation : '';
        }

        return $row->text('value', $locale);
    }

    private function parameters(Request $request, PublicContent $content, int $maximum): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1']]);

        return [$content->language($params['locale'] ?? null)->code, min($maximum, (int) ($params['per_page'] ?? $maximum))];
    }
}
