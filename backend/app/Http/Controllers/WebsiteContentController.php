<?php

namespace App\Http\Controllers;

use App\Services\PublicContent;
use Illuminate\Http\Request;

class WebsiteContentController
{
    public function labels(Request $request, PublicContent $content): array
    {
        [$locale] = $this->parameters($request, $content, 500);
        $query = $content->labels($locale)->orderBy('_id');
        return \App\Services\ContentResponse::collection($query, $request, 500);
    }

    private function parameters(Request $request, PublicContent $content, int $maximum): array
    {
        $params = $request->validate(['locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'], 'per_page' => ['sometimes', 'integer', 'min:1']]);

        return [$content->language($params['locale'] ?? null)->code, min($maximum, (int) ($params['per_page'] ?? $maximum))];
    }
}
