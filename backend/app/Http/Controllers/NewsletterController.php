<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNewsletterRequest;
use App\Models\Newsletter;
use App\Services\PublicContent;
use App\Services\WebsiteAccess;
use MongoDB\Driver\Exception\BulkWriteException;

class NewsletterController
{
    public function store(StoreNewsletterRequest $request, PublicContent $content, WebsiteAccess $access)
    {
        $access->module('newsletters');
        $payload = $request->validated();
        $language = $content->language($payload['locale'] ?? null);
        $projectId = $access->grant()['project']['id'];
        $existing = Newsletter::query()->where('website_project_id', $projectId)->where('email', $payload['email'])->exists();
        if (! $existing) {
            $status = $content->defaultStatus('newsletters');
            $country = $content->countryId();
            $submission = new Newsletter(['email' => $payload['email'], 'origin' => $payload['origin'] ?? 'footer',
                'website_project_id' => $projectId, 'is_subscribed' => true]);
            $submission->forceFill(['language' => [(string) $language->id], 'country' => $country ? [$country] : [],
                'status_id' => (string) $status->id, 'status' => ['_id' => (string) $status->id, 'slug' => $status->slug, 'name' => $status->name]]);
            try {
                $submission->save();
            } catch (BulkWriteException $exception) {
                if ($exception->getCode() !== 11000) {
                    throw $exception;
                }
            }
        }

        return response()->json(['data' => ['accepted' => true]], 201);
    }
}
