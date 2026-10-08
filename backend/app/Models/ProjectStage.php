<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;

class ProjectStage extends ContentEntity
{
    use Trashable;

    protected $table = 'project_stages';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [
        [ContactForm::class, 'project_stage', 'Contact Forms'],
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Stage Name', 'sortable' => true, 'localized' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'project_stages', 'getter' => 'getStatusesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'status' => [...$sometimes, 'required'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('project_stages')
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])
            ->toArray();
    }
}
