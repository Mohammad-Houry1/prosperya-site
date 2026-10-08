<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;

class PageCategory extends ReferenceEntity
{
    protected $table = 'ref_page_categories';

    public array $scopeFields = ['project','country','language'];

    public array $translatable = ['name'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'description', 'name' => 'Description'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('page_categories')
            ->orderBy('name')
            ->get(['name', 'translations', '_id', 'slug', 'color', 'back_color'])
            ->toArray();
    }

    public array $filters = [
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'page_categories', 'getter' => 'getStatusesList'],
    ];
    /**
     * What a Page Category accepts.
     *
     * Content only. `project`, `country` and `language` are absent on purpose:
     * they are declared once in $scopeFields, and the shared layer derives both
     * the rules and the requirement from that single declaration. Restating
     * them here would create a second source that could disagree with it.
     *
     * Declaring this contract also changes what scope this module requires.
     * Before it, ReferenceEntity's empty $requiredScopeFields meant a category
     * could be created with no scope at all; now participation means
     * requirement, as the frozen semantics say. The contextual backfill still
     * runs first, so an omitted body scope is not the same as an absent one.
     *
     * @return array<string, mixed>
     */
    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'description' => ['nullable'],
            'description.*' => ['nullable', 'string'],
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'sort_order' => ['nullable', 'integer'],
            'status' => [...$sometimes, 'required'],
        ];
    }

}
