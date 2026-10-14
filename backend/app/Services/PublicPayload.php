<?php

namespace App\Services;

use App\Models\Base\ContentEntity;

/** Server-rendered SEO/media and pagination metadata, not content record mapping. */
final class PublicPayload
{
    public function __construct(private readonly PublicContent $content) {}

    public function seo(ContentEntity $record, string $locale): array
    {
        return ['title' => $record->text('meta_title', $locale),
            'description' => $record->text('meta_description', $locale),
            'keywords' => $record->text('meta_keywords', $locale),
            'url' => is_string($record->meta_url) ? $record->meta_url : '',
            'type' => is_string($record->meta_type) ? $record->meta_type : '',
            'robots' => ($record->noindex === true || $record->noindex === 1) ? 'noindex, follow' : 'index, follow'];
    }

    public function media(mixed $value, string $locale): ?array
    {
        $value = is_string($value) ? ['url' => $value] : (array) $value;
        $url = $value['url'] ?? null;
        if (! is_string($url) || $url === '') {
            return null;
        }
        if (str_starts_with($url, '/') && ! str_starts_with($url, '//')) {
            $url = rtrim((string) config('website.cms_url'), '/').$url;
        }
        if (! filter_var($url, FILTER_VALIDATE_URL) || ! in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'], true)) {
            return null;
        }

        return ['url' => $url, 'alt' => $this->content->text((object) $value, 'alt', $locale),
            'width' => is_numeric($value['width'] ?? null) && $value['width'] > 0 ? (int) $value['width'] : null,
            'height' => is_numeric($value['height'] ?? null) && $value['height'] > 0 ? (int) $value['height'] : null];
    }

    public function pagination($page): array
    {
        return ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
            'per_page' => $page->perPage(), 'total' => $page->total()];
    }
}
