<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsMedia;
use App\Rules\ListRules;
use App\Rules\LocaleMap;
use App\Rules\Money;
use App\Rules\PhoneNumber;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;
use App\Support\StatusRules;

/**
 * Doctor profiles for the doctor appointment app.
 */
class Doctor extends ContentEntity
{
    use Trashable;

    public const SCHEDULE_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    protected $table = 'doctors';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [
        [DoctorAppointment::class, 'doctor', 'doctor appointments'],
        [DoctorReview::class, 'doctor', 'doctor reviews'],
        [AppBanner::class, 'banner_doctor', 'app banners'],
    ];

    public array $searchable = ['name', 'slug', 'doctor_title', 'doctor_email'];

    public array $fields = [
        ['key' => 'doctor_photo', 'name' => 'Photo', 'type' => 'image', 'width' => '90px'],
        ['key' => 'name', 'name' => 'Doctor', 'width' => '30%', 'sortable' => true, 'localized' => true],
        ['key' => 'doctor_specialty', 'name' => 'Specialty', 'type' => 'object', 'source' => 'doctor_specialties', 'getter' => 'getDoctorSpecialtiesList'],
        ['key' => 'status', 'name' => 'Status', 'width' => '120px', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'doctors', 'getter' => 'getStatusesList'],
        ['key' => 'doctor_specialty', 'name' => 'All Specialties', 'type' => 'select', 'source' => 'doctor_specialties', 'getter' => 'getDoctorSpecialtiesList'],
        ['key' => 'clinics', 'name' => 'All Clinics', 'type' => 'select', 'source' => 'clinics', 'getter' => 'getClinicsList', 'multiple' => true],
    ];

    protected function casts(): array
    {
        return [...parent::casts(), 'years_of_experience' => 'integer', 'appointment_duration' => 'integer'];
    }

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];
        $live = fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at');

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
            'doctor_specialty' => [...$sometimes, 'required', 'string', Rule::exists(DoctorSpecialty::class, '_id')->where($live)],
            'doctor_title' => LocaleMap::rules(max: 255),
            'doctor_biography' => LocaleMap::rules(),
            'doctor_qualifications' => LocaleMap::rules(),
            'clinics' => [...$sometimes, 'required', 'array', 'list', 'min:1'],
            'clinics.*' => ['string', Rule::exists(Clinic::class, '_id')->where($live)],
            ...ListRules::values('medical_services', ['string', Rule::exists(MedicalService::class, '_id')->where($live)]),
            ...ListRules::values('insurance_providers', ['string', Rule::exists(InsuranceProvider::class, '_id')->where($live)]),
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:80'],
            ...ListRules::values('spoken_languages', ['string', Rule::exists(Language::class, '_id')->where($live)]),
            'doctor_email' => ['nullable', 'string', 'email', 'max:254'],
            'doctor_phone' => ['nullable', new PhoneNumber($tenantId)],
            'consultation_fee' => ['nullable', new Money($tenantId)],
            'appointment_duration' => ['nullable', 'integer', 'min:5', 'max:480'],
            ...ListRules::of('weekly_schedule', [
                // A slot is at one of the doctor's own clinics.
                'schedule_clinic' => ['required', 'string', 'in_array:clinics.*'],
                'schedule_day' => ['required', Rule::in(self::SCHEDULE_DAYS)],
                'start_time' => ['required', 'date_format:H:i'],
                'end_time' => ['required', 'date_format:H:i', 'after:weekly_schedule.*.start_time'],
            ]),
            ...ListRules::of('doctor_time_off', [
                'time_off_starts_on' => ['required', 'date_format:Y-m-d'],
                'time_off_ends_on' => ['required', 'date_format:Y-m-d', 'after_or_equal:doctor_time_off.*.time_off_starts_on'],
                'time_off_reason' => LocaleMap::rules(max: 255),
            ]),
            'doctor_photo' => ['nullable', CmsMedia::uploadable()],
            'cover_image' => ['nullable', CmsMedia::uploadable()],
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'meta_title' => LocaleMap::rules(max: 255),
            'meta_keywords' => LocaleMap::rules(),
            'meta_url' => ['nullable', 'string', 'max:2048'],
            'meta_type' => ['nullable', 'string', 'max:100'],
            'meta_description' => LocaleMap::rules(),
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('doctors')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getDoctorSpecialtiesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return DoctorSpecialty::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getLanguagesList(): array
    {
        return Language::query()->tap(fn ($query) => app(StatusRules::class)->whereEnabled($query, (string) CurrentTenant::id()))->orderBy('name')
            ->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getClinicsList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return Clinic::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getInsuranceProvidersList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return InsuranceProvider::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getMedicalServicesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return MedicalService::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }
}
