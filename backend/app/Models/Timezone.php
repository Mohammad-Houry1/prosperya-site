<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;

class Timezone extends ReferenceEntity
{
    protected $table = 'ref_timezones';

    /** A timezone is chosen by its IANA identifier (Asia/Beirut), not its record id. */
    public string $optionValue = 'code';

    public array $defaultSort = [
        'column' => 'sort_order',
        'direction' => 'asc',
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Timezone', 'sortable' => true],
        ['key' => 'code', 'name' => 'Identifier', 'type' => 'mono'],
        ['key' => 'offset', 'name' => 'UTC Offset'],
        ['key' => 'is_default', 'name' => 'Default', 'type' => 'boolean'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()->forModule('timezones')->orderBy('name')
            ->get(['name', 'translations', '_id', 'slug', 'color', 'back_color'])->toArray();
    }

    public array $filters = [
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'timezones', 'getter' => 'getStatusesList'],
    ];
    /**
     * What a Timezone accepts.
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
            'offset' => ['nullable', 'string', 'max:20'],
            'is_default' => ['nullable', 'boolean'],
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
        ];
    }

}
