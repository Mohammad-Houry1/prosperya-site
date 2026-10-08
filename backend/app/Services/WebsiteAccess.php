<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * What this site may serve, as the CMS says right now.
 *
 * Asks the CMS key check (GET /api/website-key) with this site's key and
 * reuses a good answer for a short while. Anything else fails closed: a key
 * the CMS refuses is 403, a CMS that cannot answer is 503. Nothing about the
 * site - its project, modules, languages, what "published" means - is
 * configured here; it all comes from the answer.
 */
final class WebsiteAccess
{
    private ?array $grant = null;

    /** @return array<string, mixed> the key check's answer */
    public function grant(): array
    {
        if ($this->grant !== null) {
            return $this->grant;
        }

        $url = rtrim((string) config('website.cms_url'), '/');
        $key = (string) config('website.key');
        abort_if($url === '' || $key === '', 503, 'Service temporarily unavailable.');

        $cacheKey = 'website-grant:'.hash('sha256', $url.'|'.$key);
        $grant = Cache::get($cacheKey);

        if (! is_array($grant)) {
            try {
                $response = Http::timeout(3)->connectTimeout(3)->acceptJson()
                    ->withHeaders(['X-Api-Key' => $key])->get($url.'/api/website-key');
            } catch (Throwable) {
                abort(503, 'Service temporarily unavailable.');
            }

            abort_if(in_array($response->status(), [401, 403, 422], true), 403, 'Service unavailable.');
            $grant = $response->json();
            abort_unless($response->successful() && is_array($grant) && ($grant['valid'] ?? null) === true
                && is_string($grant['tenant_id'] ?? null) && is_array($grant['modules'] ?? null)
                && is_array($grant['statuses']['published'] ?? null), 503, 'Service temporarily unavailable.');

            Cache::put($cacheKey, $grant, max(1, (int) config('website.cache_seconds')));
        }

        return $this->grant = $grant;
    }

    /** A module the key grants, by its slug in the CMS; 404 when it does not. */
    public function module(string $slug): array
    {
        $module = collect($this->grant()['modules'])->firstWhere('slug', $slug);
        abort_unless(is_array($module), 404);

        return $module;
    }
}
