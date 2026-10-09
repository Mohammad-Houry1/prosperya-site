<?php

namespace App\Services;

final class WebsiteRoutes
{
    public const LEGAL = [
        'privacy-policy' => ['en' => 'privacy-policy', 'fr' => 'privacy-policy'],
        'terms-of-use' => ['en' => 'terms-of-use', 'fr' => 'terms-of-use'],
        'cookie-policy' => ['en' => 'cookie-policy', 'fr' => 'cookie-policy'],
        'accessibility' => ['en' => 'accessibility', 'fr' => 'accessibility'],
    ];

    public const STATIC_PAGES = ['', 'expertise', 'solutions', 'work', 'approach', 'about', 'insights', 'contact'];

    public function parse(string $path): ?array
    {
        $path = explode('?', $path, 2)[0];
        $parts = explode('/', trim($path, '/'), 2);
        $locale = $parts[0];
        if (! in_array($locale, ['en', 'fr'], true)) {
            return null;
        }
        $slug = $parts[1] ?? '';
        $kind = 'page';
        foreach (self::LEGAL as $key => $translations) {
            if (in_array($slug, $translations, true)) {
                $kind = 'legal';
                $slug = $key;
                break;
            }
        }
        if ($kind === 'page' && preg_match('~^(insights|corporate)/([^/]+)$~u', $slug, $match)) {
            $kind = $match[1] === 'insights' ? 'article' : 'legal';
            $slug = rawurldecode($match[2]);
            if (! preg_match('/^[\p{L}\p{N}_-]+$/u', $slug)) {
                return null;
            }
        } elseif ($kind === 'page' && ! in_array($slug, $this->pagePaths(), true)) {
            return null;
        }

        return ['kind' => $kind, 'slug' => $slug === '' ? 'home' : $slug, 'locale' => $locale,
            'path' => $this->path($kind, $slug === '' ? 'home' : $slug, $locale)];
    }

    public function path(string $kind, string $slug, string $locale): string
    {
        $suffix = match ($kind) {
            'legal' => self::LEGAL[$slug][$locale] ?? 'corporate/'.rawurlencode($slug),
            'article' => 'insights/'.rawurlencode($slug),
            default => $slug === 'home' ? '' : $slug,
        };

        return '/'.$locale.($suffix === '' ? '' : '/'.$suffix);
    }

    private function pagePaths(): array
    {
        $file = config('website.frontend_dist').'/site-routes.json';
        $routes = is_file($file) ? json_decode(file_get_contents($file), true) : [];

        return array_values(array_unique([...self::STATIC_PAGES, ...array_filter(is_array($routes) ? $routes : [],
            fn ($path) => is_string($path) && preg_match('~^(expertise|solutions|work)/[a-z0-9_-]+$~i', $path))]));
    }
}
