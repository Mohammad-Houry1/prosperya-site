<?php

use App\Http\Controllers\WebsiteSeoController;
use App\Http\Controllers\FrontendAssetController;
use Illuminate\Support\Facades\Route;

// The build contains public assets only. Loading one does not query the CMS.
Route::get('/{asset}', [FrontendAssetController::class, 'show'])
    ->where('asset', '(?:assets|images)/.+|[^/]+\.(?:ico|svg|png|webp|webmanifest)');

Route::middleware(['website.access', 'throttle:content'])->group(function () {
    Route::get('/sitemap.xml', [WebsiteSeoController::class, 'sitemap']);
    Route::get('/robots.txt', [WebsiteSeoController::class, 'robots']);
    Route::get('/{path?}', [WebsiteSeoController::class, 'page'])->where('path', '.*');
});
