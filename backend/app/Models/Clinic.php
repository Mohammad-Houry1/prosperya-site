<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsGallery;
use App\Rules\CmsMedia;
use App\Rules\ListRules;
use App\Rules\LocaleMap;
use App\Rules\PhoneNumber;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

/**
 * Clinics where doctors practise, with the location the app shows on its map.
 * The clinic_* geography fields are the clinic's address, distinct from the
 * record's country scope.
 */
class Clinic extends ContentEntity
{
    use Trashable;

    protected $table = 'clinics';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [
        [Doctor::class, 'clinics', 'doctors'],
        [DoctorAppointment::class, 'clinic', 'doctor appointments'],
        [AppBanner::class, 'banner_clinic', 'app banners'],
    ];

    public array $searchable = ['name', 'slug', 'clinic_email'];

    public array $fields = [
        ['key' => 'cover_image', 'name' => 'Cover', 'type' => 'image', 'width' => '90px'],
        ['key' => 'name', 'name' => 'Clinic', 'width' => '30%', 'sortable' => true, 'localized' => true],
        ['key' => 'clinic_city', 'name' => 'City', 'type' => 'object', 'source' => 'cities', 'getter' => 'getCitiesList'],
        ['key' => 'status', 'name' => 'Status', 'width' => '120px', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'clinics', 'getter' => 'getStatusesList'],
        ['key' => 'clinic_country', 'name' => 'All Countries', 'type' => 'select', 'source' => 'countries', 'getter' => 'getCountriesList'],
        ['key' => 'clinic_city', 'name' => 'All Cities', 'type' => 'select', 'source' => 'cities', 'getter' => 'getCitiesList'],
    ];

    protected function casts(): array
    {
        return [...parent::casts(), 'latitude' => 'float', 'longitude' => 'float'];
    }

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];
        $live = fn (string $model) => Rule::exists($model, '_id')
            ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'));

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
            'clinic_description' => LocaleMap::rules(),

            // ponytail: each level must exist in the tenant; the form's cascade keeps
            // the chain consistent. Add a parent-chain check if clinics get imported.
            'clinic_country' => [...$sometimes, 'required', 'string', $live(Country::class)],
            'clinic_region' => [...$sometimes, 'required', 'string', $live(Region::class)],
            'clinic_department' => [...$sometimes, 'required', 'string', $live(Department::class)],
            'clinic_city' => [...$sometimes, 'required', 'string', $live(City::class)],
            'clinic_area' => ['nullable', 'string', $live(Area::class)],
            'clinic_address' => [...$sometimes, ...LocaleMap::rules(required: true, max: 500)],
            'latitude' => [...$sometimes, 'required', 'numeric', 'between:-90,90'],
            'longitude' => [...$sometimes, 'required', 'numeric', 'between:-180,180'],

            ...ListRules::values('medical_services', ['string', $live(MedicalService::class)]),
            'clinic_email' => ['nullable', 'string', 'email', 'max:254'],
            'clinic_phone' => ['nullable', new PhoneNumber($tenantId)],
            ...ListRules::of('opening_hours', [
                'opening_day' => ['required', Rule::in(Doctor::SCHEDULE_DAYS)],
                'opens_at' => ['required', 'date_format:H:i'],
                'closes_at' => ['required', 'date_format:H:i', 'after:opening_hours.*.opens_at'],
            ]),
            ...ListRules::of('clinic_closures', [
                'closure_starts_on' => ['required', 'date_format:Y-m-d'],
                'closure_ends_on' => ['required', 'date_format:Y-m-d', 'after_or_equal:clinic_closures.*.closure_starts_on'],
                'closure_reason' => LocaleMap::rules(max: 255),
            ]),

            'cover_image' => ['nullable', CmsMedia::uploadable()],
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'album' => ['nullable', 'array', new CmsGallery],
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
        return Status::query()->forModule('clinics')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getCountriesList(): array
    {
        return Country::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getRegionsList(): array
    {
        return Region::query()->orderBy('name')->get(['_id', 'name', 'translations', 'country_id'])->toArray();
    }

    public function getDepartmentsList(): array
    {
        return Department::query()->orderBy('name')->get(['_id', 'name', 'translations', 'region_id'])->toArray();
    }

    public function getCitiesList(): array
    {
        return City::query()->orderBy('name')->get(['_id', 'name', 'translations', 'department_id'])->toArray();
    }

    public function getAreasList(): array
    {
        return Area::query()->orderBy('name')->get(['_id', 'name', 'translations', 'city_id'])->toArray();
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
