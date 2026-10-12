<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;
class StoreContactRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return ['name' => ['required','string','max:255'], 'company_name' => ['required','string','max:255'],
            'work_email' => ['required','email','max:254','not_regex:/[\r\n]/'], 'contact_phone' => ['nullable','string','max:60'],
            'contact_country' => ['required','string','max:255'], 'current_erp' => ['nullable','string','max:255'],
            'project_type' => ['required','string','regex:/^[a-f0-9]{24}$/i'],
            'project_stage' => ['required','string','regex:/^[a-f0-9]{24}$/i'],
            'project_brief' => ['required','string','max:10000'], 'website' => ['nullable','string','max:0'],
            'locale' => ['sometimes','string','max:20'],
            'captcha_token' => ['required','string','max:4096']];
    }
    protected function prepareForValidation(): void
    {
        $unknown = array_diff(array_keys($this->all()), array_keys($this->rules()));
        if ($unknown) { throw ValidationException::withMessages(array_fill_keys($unknown, 'This field is not accepted.')); }
    }
}
