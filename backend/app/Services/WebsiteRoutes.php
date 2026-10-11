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
        if ($kind === 'page' && preg_match('~^(insights|corporate|expertise|solutions|work|approach)/([^/]+)$~u', $slug, $match)) {
            $kind = match ($match[1]) { 'insights' => 'article', 'corporate' => 'legal', 'expertise' => 'expertise', 'solutions' => 'solution', 'work' => 'case-study', 'approach' => 'approach' };
            $slug = rawurldecode($match[2]);
            if (! preg_match('/^[\p{L}\p{N}_-]+$/u', $slug)) {
                return null;
            }
        } elseif ($kind === 'page' && ! in_array($slug, self::STATIC_PAGES, true)) {
            return null;
        }

        if ($kind === 'page' && $slug === 'approach') { $kind = 'approach'; $slug = 'our-approach'; }

        return ['kind' => $kind, 'slug' => $slug === '' ? 'home' : $slug, 'locale' => $locale,
            'path' => $this->path($kind, $slug === '' ? 'home' : $slug, $locale)];
    }

    public function path(string $kind, string $slug, string $locale): string
    {
        $suffix = match ($kind) {
            'legal' => self::LEGAL[$slug][$locale] ?? 'corporate/'.rawurlencode($slug),
            'article' => 'insights/'.rawurlencode($slug),
            'expertise' => 'expertise/'.rawurlencode($slug),
            'solution' => 'solutions/'.rawurlencode($slug),
            'case-study' => 'work/'.rawurlencode($slug),
            'approach' => 'approach/'.rawurlencode($slug),
            default => $slug === 'home' ? '' : $slug,
        };

        return '/'.$locale.($suffix === '' ? '' : '/'.$suffix);
    }
}
