<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;

// Add this site's endpoints here, inside the group: every one of them then
// checks the website key first. Module slugs are the CMS's (Module Management).
Route::middleware(['website.access', 'throttle:content'])->group(function () {
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/{slug}', [ArticleController::class, 'show']);
    Route::get('/contact/options', [ContactController::class, 'options']);
    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');
});
