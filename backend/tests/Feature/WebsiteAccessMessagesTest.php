<?php

namespace Tests\Feature;

use App\Models\Testimonial;
use App\Services\WebsiteAccess;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class WebsiteAccessMessagesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['website.cms_url' => 'https://cms.example.test', 'website.key' => 'fixture-key']);
        Http::fake(['*' => Http::response(['valid' => true, 'tenant_id' => 'fixture-tenant',
            'modules' => [], 'statuses' => ['published' => []]])]);
    }

    public function test_a_missing_model_module_explains_the_denial(): void
    {
        try {
            app(WebsiteAccess::class)->moduleFor(Testimonial::class);
            $this->fail('A denied module must not be accessible.');
        } catch (HttpException $error) {
            $this->assertSame(404, $error->getStatusCode());
            $this->assertSame('This website key does not allow the testimonials module.', $error->getMessage());
        }
    }

    public function test_a_missing_submission_module_explains_the_denial(): void
    {
        try {
            app(WebsiteAccess::class)->module('newsletters');
            $this->fail('A denied module must not be accessible.');
        } catch (HttpException $error) {
            $this->assertSame(404, $error->getStatusCode());
            $this->assertSame('This website key does not allow the newsletters module.', $error->getMessage());
        }
    }
}
