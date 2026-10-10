<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\WebsiteContentController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\WebsiteSeoController;
use App\Http\Controllers\CorporatePageController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\PlatformController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Add this site's endpoints here, inside the group: every one of them then
// checks the website key first. Module slugs are the CMS's (Module Management).
Route::middleware(['website.access', 'throttle:content'])->group(function () {
    Route::get('/expertise/{slug?}', [\App\Http\Controllers\ExpertiseController::class, 'getExpertise']);
    Route::get('/solutions/{slug?}', [\App\Http\Controllers\SolutionController::class, 'getSolutions']);
    Route::get('/case-studies/{slug?}', [\App\Http\Controllers\CaseStudyController::class, 'getCaseStudies']);
    Route::get('/approaches/{slug}', [\App\Http\Controllers\ApproachController::class, 'getApproach']);
    Route::get('/pages/{slug}', [\App\Http\Controllers\PageController::class, 'getPage']);
    Route::get('/seo', [WebsiteSeoController::class, 'metadata']);
    Route::get('/articles', [ArticleController::class, 'getArticles']);
    Route::get('/articles/{slug}', [ArticleController::class, 'getArticles']);
    Route::get('/article-categories', [ArticleController::class, 'getCategories']);
    Route::get('/corporate-pages', [CorporatePageController::class, 'getCorporatePages']);
    Route::get('/corporate-pages/{slug}', [CorporatePageController::class, 'getCorporatePages']);
    Route::get('/corporate-page-categories', [CorporatePageController::class, 'getCategories']);
    Route::get('/faqs', [FaqController::class, 'getFaqs']);
    Route::get('/faq-categories', [FaqController::class, 'getCategories']);
    Route::get('/testimonials', [TestimonialController::class, 'getTestimonials']);
    Route::get('/platforms', [PlatformController::class, 'getPlatforms']);
    Route::get('/users', [UserController::class, 'getUsers']);
    Route::get('/users/{slug}', [UserController::class, 'getUsers']);
    Route::get('/labels', [WebsiteContentController::class, 'labels']);
    Route::post('/newsletter', [NewsletterController::class, 'store'])->middleware('throttle:newsletter');
    Route::get('/contact/options', [ContactController::class, 'options']);
    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');
});
