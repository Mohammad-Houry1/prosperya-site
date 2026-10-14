<?php

namespace App\Services;

use Illuminate\Http\Request;

/** Return CMS models directly; only the response envelope is constructed here. */
final class ContentResponse
{
    public static function collection($query, Request $request, int $maximum = 50): array
    {
        $params = $request->validate(['ids' => ['sometimes', 'array', 'max:50'],
            'ids.*' => ['string', 'regex:/^[a-f0-9]{24}$/i']]);
        if (isset($params['ids'])) $query->whereIn('_id', array_map('strtolower', $params['ids']));
        if (!$request->has('page') && !$request->has('per_page')) return ['data' => $query->get()];
        $page = $query->paginate(min($maximum, (int) $request->input('per_page', $maximum)));
        return ['data' => $page->getCollection(), 'meta' => app(PublicPayload::class)->pagination($page)];
    }
}
