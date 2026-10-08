<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\LocaleMap;
use App\Rules\Money;

/**
 * What a patient books (consultation, ECG, vaccination…). Doctors and clinics
 * list the services they offer; an appointment may name one.
 */
class MedicalService extends ContentEntity
{
    use Trashable;

    protected $table = 'medical_services';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [
        [Doctor::class, 'medical_services', 'doctors'],
        [Clinic::class, 'medical_services', 'clinics'],
        [DoctorAppointment::class, 'medical_service', 'doctor appointments'],
        [AppBanner::class, 'banner_medical_service', 'app banners'],
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Medical Service', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'service_duration', 'name' => 'Duration (min)', 'sortable' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'medical_services', 'getter' => 'getStatusesList'],
    ];

    protected function casts(): array
    {
        return [...parent::casts(), 'service_duration' => 'integer'];
    }

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'medical_service_description' => LocaleMap::rules(),
            'service_price' => ['nullable', new Money($tenantId)],
            'service_duration' => ['nullable', 'integer', 'min:5', 'max:480'],
            'status' => [...$sometimes, 'required'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('medical_services')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }
}
