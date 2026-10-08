<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Models\ContactForm;
use App\Services\PublicContent;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ContactController
{
    /** Choices for the contact form, from modules the website key grants. */
    public function options(Request $request, PublicContent $content): array
    {
        $locale = $content->language($request->input('locale'))->code;
        $options = [];
        foreach (['project_types', 'project_stages'] as $module) {
            $options[$module] = $content->published($module, $locale)->orderBy('name')->get()
                ->map(fn ($row) => ['id' => (string) $row->id, 'name' => $content->text($row, 'name', $locale)])->all();
        }
        $options['countries'] = $content->enabled('ref_countries')->orderBy('name')->get()
            ->map(fn ($row) => ['id' => (string) $row->id, 'name' => $content->text($row, 'name', $locale)])->all();

        return ['data' => $options];
    }

    /** Stores a submission in the CMS's Contact Forms, in that module's default status. */
    public function store(StoreContactRequest $request, PublicContent $content)
    {
        $payload = $request->validated();
        $language = $content->language($payload['locale'] ?? null);
        foreach (['project_type' => 'project_types', 'project_stage' => 'project_stages'] as $field => $module) {
            if (! $content->published($module, $language->code)->where('_id', $payload[$field])->exists()) {
                throw ValidationException::withMessages([$field => 'Choose an available option.']);
            }
        }
        unset($payload['website'], $payload['locale']);

        $status = $content->defaultStatus('contact_forms');
        $country = $content->countryId();
        $submission = new ContactForm($payload);
        $submission->forceFill([
            'country' => $country ? [$country] : [],
            'language' => [(string) $language->id],
            'status' => ['_id' => (string) $status->id, 'slug' => $status->slug ?? null, 'name' => $status->name ?? null],
            'status_id' => (string) $status->id,
            'search_key' => mb_strtolower(implode(' ', [$payload['name'], $payload['company_name'], $payload['work_email'], $payload['project_brief']])),
        ])->save();

        return response()->json(['message' => 'Your message has been received.'], 201);
    }
}
