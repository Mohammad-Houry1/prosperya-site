<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\LocaleMap;

class DoctorSpecialty extends ContentEntity
{
    use Trashable;

    protected $table = 'doctor_specialties';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [
        [Doctor::class, 'doctor_specialty', 'doctors'],
        [Symptom::class, 'doctor_specialties', 'symptoms'],
        [AppBanner::class, 'banner_doctor_specialty', 'app banners'],
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'doctor_specialties', 'getter' => 'getStatusesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            // Generated from the name on create; editable (never blank) afterwards.
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'specialty_description' => LocaleMap::rules(),
            'status' => [...$sometimes, 'required'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('doctor_specialties')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }
}
