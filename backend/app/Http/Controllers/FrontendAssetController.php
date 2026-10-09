<?php

namespace App\Http\Controllers;

/** Standalone Laravel serving; production web servers can serve these directly. */
class FrontendAssetController
{
    public function show(string $asset)
    {
        $root = realpath(config('website.frontend_dist'));
        $file = $root ? realpath($root.DIRECTORY_SEPARATOR.$asset) : false;
        abort_unless($root && $file && is_file($file) && str_starts_with($file, $root.DIRECTORY_SEPARATOR), 404);
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $types = ['js' => 'text/javascript', 'css' => 'text/css', 'svg' => 'image/svg+xml', 'webp' => 'image/webp',
            'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'ico' => 'image/x-icon',
            'woff' => 'font/woff', 'woff2' => 'font/woff2', 'webmanifest' => 'application/manifest+json'];
        abort_unless(isset($types[$extension]), 404);

        return response()->file($file, ['Content-Type' => $types[$extension], 'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => str_starts_with($asset, 'assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600']);
    }
}
