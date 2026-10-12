<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class GoogleRecaptcha
{
    public function verify(string $token): void
    {
        $secret = config('website.recaptcha.secret');
        abort_unless(is_string($secret) && $secret !== '', 503, 'Contact verification is unavailable.');
        try {
            $response = Http::asForm()->connectTimeout(3)->timeout(8)
                ->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $secret, 'response' => $token,
                ]);
        } catch (\Illuminate\Http\Client\ConnectionException $exception) {
            abort(503, 'Contact verification is unavailable.');
        }
        abort_unless($response->successful(), 503, 'Contact verification is unavailable.');
        $expectedHost = parse_url(config('website.public_url'), PHP_URL_HOST);
        if ($response->json('success') !== true || ! is_string($expectedHost)
            || strtolower((string) $response->json('hostname')) !== strtolower($expectedHost)) {
            throw ValidationException::withMessages(['captcha_token' => 'Please complete verification again.']);
        }
    }
}
