<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class StoreNewsletterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['email' => ['required', 'email', 'max:254', 'not_regex:/[\r\n]/'],
            'locale' => ['sometimes', 'string', 'max:20'], 'origin' => ['sometimes', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:0']];
    }

    protected function prepareForValidation(): void
    {
        $unknown = array_diff(array_keys($this->all()), array_keys($this->rules()));
        if ($unknown) {
            throw ValidationException::withMessages(array_fill_keys($unknown, 'This field is not accepted.'));
        }
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }
}
