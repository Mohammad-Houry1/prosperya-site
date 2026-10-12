<?php

namespace Tests\Feature;

use App\Services\GoogleRecaptcha;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class GoogleRecaptchaTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['website.public_url' => 'https://site.example.test', 'website.recaptcha.secret' => 'server-secret']);
    }

    public function test_checks_the_token_using_the_server_secret(): void
    {
        Http::fake(['www.google.com/recaptcha/api/siteverify' => Http::response(['success' => true, 'hostname' => 'site.example.test'])]);
        app(GoogleRecaptcha::class)->verify('visitor-token');
        Http::assertSent(fn ($request) => $request['secret'] === 'server-secret' && $request['response'] === 'visitor-token');
    }

    public function test_rejected_or_reused_tokens_fail_validation(): void
    {
        Http::fake(['*' => Http::response(['success' => false, 'error-codes' => ['timeout-or-duplicate']])]);
        $this->expectException(ValidationException::class);
        app(GoogleRecaptcha::class)->verify('expired-token');
    }

    public function test_a_token_for_a_different_hostname_is_rejected(): void
    {
        Http::fake(['*' => Http::response(['success' => true, 'hostname' => 'other.example.test'])]);
        $this->expectException(ValidationException::class);
        app(GoogleRecaptcha::class)->verify('visitor-token');
    }

    public function test_network_failure_fails_closed(): void
    {
        Http::fake(['*' => Http::failedConnection()]);
        try {
            app(GoogleRecaptcha::class)->verify('visitor-token');
            $this->fail('An unavailable verifier must block the submission.');
        } catch (HttpException $error) {
            $this->assertSame(503, $error->getStatusCode());
        }
    }

    public function test_missing_secret_fails_closed_without_calling_google(): void
    {
        config(['website.recaptcha.secret' => '']);
        try {
            app(GoogleRecaptcha::class)->verify('visitor-token');
            $this->fail('Missing configuration must block the submission.');
        } catch (HttpException $error) {
            $this->assertSame(503, $error->getStatusCode());
        }
        Http::assertNothingSent();
    }
}
