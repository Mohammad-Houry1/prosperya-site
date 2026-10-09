<?php

namespace App\Services;

final class FrontendHtml
{
    public function render(array $seo): string
    {
        $file = config('website.frontend_dist').'/index.html';
        abort_unless(is_file($file), 503, 'Build the frontend before serving the website.');
        $html = file_get_contents($file);
        $html = preg_replace('/<title\b[^>]*>.*?<\/title>/is', '', $html);
        $html = preg_replace('/<meta\b[^>]*(?:name=["\'](?:description|keywords|robots|twitter:[^"\']*)["\']|property=["\']og:[^"\']*["\'])[^>]*>/i', '', $html);
        $html = preg_replace('/<link\b[^>]*rel=["\'](?:canonical|alternate)["\'][^>]*>/i', '', $html);
        $html = preg_replace('/(<html\b[^>]*\blang=)["\'][^"\']*["\']/i', '$1"'.$seo['locale'].'"', $html);
        $escape = fn ($value) => htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $head = '<title>'.$escape($seo['title']).'</title>';
        foreach (['description' => $seo['description'], 'keywords' => $seo['keywords'], 'robots' => $seo['robots'],
            'twitter:card' => 'summary_large_image', 'twitter:title' => $seo['ogTitle'], 'twitter:description' => $seo['ogDescription'],
            'twitter:image' => $seo['ogImage']] as $name => $value) {
            $head .= '<meta name="'.$name.'" content="'.$escape($value).'">';
        }
        foreach (['og:title' => $seo['ogTitle'], 'og:description' => $seo['ogDescription'], 'og:url' => $seo['canonical'],
            'og:image' => $seo['ogImage'], 'og:type' => $seo['ogType'], 'og:site_name' => 'Prosperya',
            'og:locale' => $seo['locale'] === 'fr' ? 'fr_FR' : 'en_GB'] as $name => $value) {
            if ($value) {
                $head .= '<meta property="'.$name.'" content="'.$escape($value).'">';
            }
        }
        if ($seo['canonical']) {
            $head .= '<link rel="canonical" href="'.$escape($seo['canonical']).'">';
        }
        foreach ($seo['alternates'] as $alternate) {
            $head .= '<link rel="alternate" hreflang="'.$escape($alternate['locale']).'" href="'.$escape($alternate['url']).'">';
        }
        $flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR;
        $head .= '<script id="website-seo" type="application/json">'.json_encode($seo, $flags).'</script>';
        if ($seo['structuredData']) {
            $head .= '<script id="website-schema" type="application/ld+json">'.json_encode($seo['structuredData'], $flags).'</script>';
        }

        return str_replace('</head>', $head.'</head>', $html);
    }
}
