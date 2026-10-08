<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\LocaleMap;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

/**
 * Symptoms a patient picks in the app, each pointing at the specialties that
 * treat it.
 */
class Symptom extends ContentEntity
{
    use Trashable;

    protected $table = 'symptoms';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [];

    public array $fields = [
        ['key' => 'name', 'name' => 'Symptom', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'symptoms', 'getter' => 'getStatusesList'],
        ['key' => 'doctor_specialties', 'name' => 'All Specialties', 'type' => 'select', 'source' => 'doctor_specialties', 'getter' => 'getDoctorSpecialtiesList', 'multiple' => true],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'symptom_description' => LocaleMap::rules(),
            'doctor_specialties' => [...$sometimes, 'required', 'array', 'list', 'min:1'],
            'doctor_specialties.*' => ['string', Rule::exists(DoctorSpecialty::class, '_id')
                ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'status' => [...$sometimes, 'required'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('symptoms')->orderBy('name')
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
}
