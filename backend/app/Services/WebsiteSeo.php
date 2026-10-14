<?php

namespace App\Services;

use App\Models\Article;
use App\Models\{Expertise, Solution, CaseStudy, Approach};
use App\Models\Base\ContentEntity;
use App\Models\CorporatePage;
use App\Models\SeoPage;

final class WebsiteSeo
{
    /** One route-to-model mapping for metadata, canonicals and sitemap entries. */
    private const SOURCES = ['page' => SeoPage::class, 'article' => Article::class, 'legal' => CorporatePage::class,
        'expertise' => Expertise::class, 'solution' => Solution::class, 'case-study' => CaseStudy::class, 'approach' => Approach::class];

    public function __construct(private readonly WebsiteAccess $access, private readonly PublicPayload $payload,
        private readonly WebsiteRoutes $routes, private readonly PublicContent $content) {}

    public function origin(): string
    {
        $value = (string) config('website.public_url');
        $url = parse_url($value);
        abort_unless(is_array($url) && in_array($url['scheme'] ?? '', ['http', 'https'], true)
            && ! empty($url['host']) && ! isset($url['user']) && ! isset($url['pass'])
            && ! isset($url['query']) && ! isset($url['fragment']) && in_array($url['path'] ?? '', ['', '/'], true), 503);

        return rtrim($value, '/');
    }

    public static function modelNames(): array
    {
        return array_map('class_basename', array_values(self::SOURCES));
    }

    public function resolve(string $path, ?string $model = null): array
    {
        $metadata = $this->lookup($path, $model);

        return [...$metadata, 'siteName' => $this->label('site.name', $metadata['locale'])];
    }

    private function lookup(string $path, ?string $model): array
    {
        $origin = $this->origin();
        $route = $this->routes->parse($path);
        if (! $route || ! in_array($route['locale'], $this->locales(), true)) {
            return $this->missing($path);
        }
        abort_if($model !== null && $model !== class_basename(self::SOURCES[$route['kind']]),
            422, 'The requested SEO model does not match this website route.');
        $record = $this->record($route, $route['locale']);
        if (! $record) {
            // Fixed listing routes exist independently of optional metadata.
            $status = $route['kind'] === 'page' ? 200 : 404;

            return [...$this->missing($route['path']), 'status' => $status,
                ...($status === 200 ? ['title' => $this->label('site.name', $route['locale']), 'ogTitle' => $this->label('site.name', $route['locale'])] : []),
                'canonical' => $status === 200 ? $origin.$route['path'] : null];
        }
        $metadata = $this->metadata($record, $route);
        $canonicalRoute = $this->routes->parse(parse_url($metadata['canonical'], PHP_URL_PATH)) ?? $route;
        $alternates = [];
        foreach ($this->locales() as $locale) {
            $alternatePath = $this->routes->path($canonicalRoute['kind'], $canonicalRoute['slug'], $locale);
            $alternateRoute = [...$canonicalRoute, 'locale' => $locale, 'path' => $alternatePath];
            $alternateRecord = $this->record($alternateRoute, $locale);
            if ($alternateRecord && ! str_contains($this->payload->seo($alternateRecord, $locale)['robots'], 'noindex')) {
                $alternateMetadata = $this->metadata($alternateRecord, $alternateRoute);
                if ($alternateMetadata['canonical'] === $origin.$alternatePath) {
                    $alternates[] = ['locale' => $locale, 'url' => $alternateMetadata['canonical']];
                }
            }
        }
        $metadata['alternates'] = $this->withDefault($alternates);

        return $metadata;
    }

    /** Only records the key grants and the React router can actually display. */
    public function sitemapEntries(): array
    {
        $entries = [];
        $entryCount = 0;
        foreach ($this->locales() as $locale) {
            $this->content->language($locale);
            $filters = $this->content->filters($locale);
            foreach (self::SOURCES as $kind => $model) {
                if (! $this->granted($model)) {
                    continue;
                }
                foreach ($model::forWebsite()
                    ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
                    ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
                    ->where('is_active', '!=', false)
                    ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
                    ->orderBy('_id')->cursor() as $record) {
                    $slug = trim((string) $record->slug, '/');
                    if ($slug === '') {
                        continue;
                    }
                    $path = $this->routes->path($kind, $slug, $locale);
                    $route = $this->routes->parse($path);
                    if (! $route || $route['kind'] !== $kind || $route['slug'] !== $slug) {
                        continue;
                    }
                    $metadata = $this->metadata($record, $route);
                    if (str_contains($metadata['robots'], 'noindex') || $metadata['canonical'] !== $this->origin().$route['path']) {
                        continue;
                    }
                    if (! isset($entries[$kind.':'.$slug][$locale])) {
                        $entryCount++;
                    }
                    $entries[$kind.':'.$slug][$locale] = $metadata;
                    abort_if($entryCount > 50000, 503, 'Sitemap requires an index.');
                }
            }
        }
        $result = [];
        foreach ($entries as $translations) {
            $alternates = $this->withDefault(array_map(fn ($entry) => ['locale' => $entry['locale'], 'url' => $entry['canonical']], array_values($translations)));
            foreach ($translations as $entry) {
                $result[] = [...$entry, 'alternates' => $alternates];
            }
        }

        return $result;
    }

    private function metadata(ContentEntity $record, array $route): array
    {
        $locale = $route['locale'];
        $seo = $this->payload->seo($record, $locale);
        $title = $seo['title'];
        $description = $seo['description'];
        $image = $this->payload->media($record->meta_image, $locale);
        $canonical = $this->canonical($seo['url'], $route['path']);

        return ['path' => $route['path'], 'locale' => $locale, 'status' => 200, 'title' => $title,
            'description' => trim(strip_tags($description)), 'keywords' => $seo['keywords'], 'canonical' => $canonical,
            'ogTitle' => $title, 'ogDescription' => trim(strip_tags($description)), 'ogImage' => $image['url'] ?? $this->origin().'/og-default.png',
            'ogType' => $seo['type'] ?: ($route['kind'] === 'article' ? 'article' : 'website'),
            'robots' => $seo['robots'], 'alternates' => [],
            'lastModified' => $record->updated_at?->toISOString(),
            'structuredData' => ['@context' => 'https://schema.org', '@type' => $route['kind'] === 'article' ? 'Article' : 'WebPage',
                'name' => $title, 'description' => trim(strip_tags($description)), 'url' => $canonical, 'inLanguage' => $locale]];
    }

    private function record(array $route, string $locale): ?ContentEntity
    {
        $model = self::SOURCES[$route['kind']];
        // Static frontend pages still exist when their SEO module is unavailable.
        // Return the noindex fallback without reading a module the key denies.
        if (! $this->granted($model)) {
            return null;
        }
        $filters = $this->content->filters($locale);
        $query = $model::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));

        return $query->whereIn('slug', [$route['slug'], '/'.$route['slug']])->first();
    }

    private function canonical(string $value, string $path): string
    {
        $origin = $this->origin();
        if (str_starts_with($value, '/') && ! str_starts_with($value, '//')) {
            $value = $origin.$value;
        }
        if (str_starts_with($value, $origin.'/') && filter_var($value, FILTER_VALIDATE_URL)) {
            $target = $this->routes->parse(parse_url($value, PHP_URL_PATH));
            $source = $this->routes->parse($path);
            if ($target && $target['locale'] === ($source['locale'] ?? null)) {
                $record = $this->record($target, $target['locale']);
                if ($record && ! str_contains($this->payload->seo($record, $target['locale'])['robots'], 'noindex')) {
                    return $origin.$target['path'];
                }
            }
        }

        return $origin.$path;
    }

    private function missing(string $path): array
    {
        $locale = str_starts_with($path, '/fr') ? 'fr' : 'en';
        $title = $this->label('pages.not-found.not-found-page.page-not-found-prosperya-9423d8', $locale);

        return ['path' => $path, 'locale' => $locale, 'status' => 404,
            'title' => $title, 'description' => '', 'keywords' => '', 'canonical' => null,
            'ogTitle' => $title, 'ogDescription' => '', 'ogImage' => null, 'ogType' => 'website',
            'robots' => 'noindex, follow', 'alternates' => [], 'structuredData' => null];
    }

    /** A CMS label (prosperya.<key>) for server-rendered metadata; '' when the language or label is unavailable. */
    private function label(string $key, string $locale): string
    {
        return in_array($locale, $this->locales(), true) ? $this->content->label('prosperya.'.$key, $locale) : '';
    }

    private function locales(): array
    {
        return array_values(array_intersect(['en', 'fr'], $this->access->grant()['website_settings']['locales'] ?? []));
    }

    private function granted(string $model): bool
    {
        return collect($this->access->grant()['modules'])->contains('model', class_basename($model));
    }

    private function withDefault(array $alternates): array
    {
        $default = $this->access->grant()['website_settings']['default_locale'] ?? 'en';
        foreach ($alternates as $alternate) {
            if ($alternate['locale'] === $default) {
                $alternates[] = ['locale' => 'x-default', 'url' => $alternate['url']];
                break;
            }
        }

        return $alternates;
    }
}
