<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

class ContactForm extends ContentEntity
{
    use Trashable;

    protected $table = 'contact_forms';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public bool $canCreate = false;

    public bool $allowCloning = false;

    public bool $export = false;

    public array $dependents = [];

    public array $searchable = [
        'name', 'company_name', 'work_email', 'contact_phone',
        'contact_country', 'current_erp', 'project_brief',
    ];

    public array $defaultSort = ['column' => 'created_at', 'direction' => 'desc'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'work_email', 'name' => 'Work Email', 'sortable' => true],
        ['key' => 'company_name', 'name' => 'Company', 'sortable' => true],
        ['key' => 'project_type', 'name' => 'Project Type', 'type' => 'object', 'source' => 'project_types', 'getter' => 'getProjectTypesList'],
        ['key' => 'project_stage', 'name' => 'Project Stage', 'type' => 'object', 'source' => 'project_stages', 'getter' => 'getProjectStagesList'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'created_at', 'name' => 'Submitted', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'contact_forms', 'getter' => 'getStatusesList'],
        ['key' => 'project_type', 'name' => 'All Project Types', 'type' => 'select', 'source' => 'project_types', 'getter' => 'getProjectTypesList'],
        ['key' => 'project_stage', 'name' => 'All Project Stages', 'type' => 'select', 'source' => 'project_stages', 'getter' => 'getProjectStagesList'],
        ['key' => 'created_at', 'name' => 'Submitted', 'type' => 'date_range'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'company_name' => [...$sometimes, 'required', 'string', 'max:255'],
            'work_email' => [...$sometimes, 'required', 'string', 'email', 'max:254'],
            'contact_phone' => ['nullable', 'string', 'max:60'],
            'contact_country' => [...$sometimes, 'required', 'string', 'max:255'],
            'current_erp' => ['nullable', 'string', 'max:255'],
            'project_type' => [...$sometimes, 'required', 'string', Rule::exists(ProjectType::class, '_id')
                ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'project_stage' => [...$sometimes, 'required', 'string', Rule::exists(ProjectStage::class, '_id')
                ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'project_brief' => [...$sometimes, 'required', 'string', 'max:10000'],
            'status' => [...$sometimes, 'required'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('contact_forms')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')
            ->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getProjectTypesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return ProjectType::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getProjectStagesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return ProjectStage::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }
}
