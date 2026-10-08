<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;

class DialCode extends ReferenceEntity
{
    protected $table = 'ref_dial_codes';

    /** Shown as "+961 Lebanon". */
    public array $optionLabel = ['code', 'name'];

    /** Links this reference module validates on write: field => [source module, nullable, embed snapshot]. */
    public array $referenceLinks = [
        'country' => ['countries', true, true],
    ];


    public array $defaultSort = [
        'column' => 'sort_order',
        'direction' => 'asc',
    ];

    public array $fields = [
        ['key' => 'code', 'name' => 'Code', 'type' => 'mono', 'sortable' => true],
        ['key' => 'name', 'name' => 'Label', 'sortable' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()->forModule('dial_codes')->orderBy('name')
            ->get(['name', 'translations', '_id', 'slug', 'color', 'back_color'])->toArray();
    }

    public array $filters = [
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'dial_codes', 'getter' => 'getStatusesList'],
    ];
    /**
     * What a Dial Code accepts.
     *
     * Extracted from the shared union rather than invented: every rule here is
     * the rule this module already enforced. What changes is that the module
     * now accepts only its own fields, instead of the fifty-odd that belonged
     * to other modules and were merely tolerated.
     *
     * The tenant is passed in rather than looked up, so the contract does not
     * depend on who is asking.
     *
     * @return array<string, mixed>
     */
    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'code' => [...$sometimes, 'required', 'string', 'max:100', $this->uniqueWithinTenant($tenantId, 'code')],
            'description' => ['nullable'],
            'description.*' => ['nullable', 'string'],
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'sort_order' => ['nullable', 'integer'],
            'status' => [...$sometimes, 'required'],
        ];
    }

}
