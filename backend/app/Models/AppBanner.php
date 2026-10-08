<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsMedia;
use App\Rules\LocaleMap;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

/**
 * The app's home-screen carousel. A banner links to nothing, a doctor, a
 * clinic, a specialty, a medical service or an external URL; only the field
 * for the chosen link type is kept.
 */
class AppBanner extends ContentEntity
{
    use Trashable;

    /** Link type => the field that holds its target. */
    public const LINK_FIELDS = [
        'none' => null,
        'doctor' => 'banner_doctor',
        'clinic' => 'banner_clinic',
        'doctor_specialty' => 'banner_doctor_specialty',
        'medical_service' => 'banner_medical_service',
        'url' => 'banner_url',
    ];

    protected $table = 'app_banners';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [];

    public array $fields = [
        ['key' => 'banner_image', 'name' => 'Banner', 'type' => 'image', 'width' => '120px'],
        ['key' => 'name', 'name' => 'Banner Name', 'sortable' => true, 'localized' => true],
        ['key' => 'banner_link_type', 'name' => 'Link Type'],
        ['key' => 'banner_starts_on', 'name' => 'Starts', 'sortable' => true],
        ['key' => 'banner_ends_on', 'name' => 'Ends', 'sortable' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'app_banners', 'getter' => 'getStatusesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];
        $target = fn (string $type, string $model) => [
            "exclude_unless:banner_link_type,{$type}", 'required', 'string',
            Rule::exists($model, '_id')->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at')),
        ];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'status' => [...$sometimes, 'required'],
            'banner_title' => [...$sometimes, ...LocaleMap::rules(required: true, max: 255)],
            'banner_subtitle' => LocaleMap::rules(max: 255),
            'banner_image' => ['nullable', CmsMedia::uploadable()],
            'banner_link_type' => [...$sometimes, 'required', Rule::in(array_keys(self::LINK_FIELDS))],
            'banner_doctor' => $target('doctor', Doctor::class),
            'banner_clinic' => $target('clinic', Clinic::class),
            'banner_doctor_specialty' => $target('doctor_specialty', DoctorSpecialty::class),
            'banner_medical_service' => $target('medical_service', MedicalService::class),
            'banner_url' => ['exclude_unless:banner_link_type,url', 'required', 'url:http,https', 'max:2048'],
            'banner_starts_on' => ['nullable', 'date_format:Y-m-d'],
            'banner_ends_on' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:banner_starts_on'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function clearInactiveLink(): void
    {
        $active = self::LINK_FIELDS[$this->banner_link_type] ?? null;

        foreach (array_filter(self::LINK_FIELDS) as $field) {
            if ($field !== $active) {
                $this->{$field} = null;
            }
        }
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('app_banners')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    /** @return array<string, list<mixed>> option lists for every link target */
    public function linkTargetOptions(): array
    {
        if (! CurrentTenant::id()) {
            return ['doctors' => [], 'clinics' => [], 'doctor_specialties' => [], 'medical_services' => []];
        }

        $columns = ['_id', 'name', 'translations', 'project', 'country', 'language'];

        return [
            'doctors' => Doctor::query()->orderBy('order')->orderBy('name')->get($columns)->all(),
            'clinics' => Clinic::query()->orderBy('order')->orderBy('name')->get($columns)->all(),
            'doctor_specialties' => DoctorSpecialty::query()->orderBy('order')->orderBy('name')->get($columns)->all(),
            'medical_services' => MedicalService::query()->orderBy('order')->orderBy('name')->get($columns)->all(),
        ];
    }
}
