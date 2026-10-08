<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;
use App\Rules\CmsMedia;

class Currency extends ReferenceEntity
{
    protected $table = 'ref_currencies';

    /** Shown as "USD $". */
    public array $optionLabel = ['code', 'symbol'];

    public array $translatable = ['name'];

    public array $defaultSort = [
        'column' => 'sort_order',
        'direction' => 'asc',
    ];

    public array $fields = [
        ['key' => 'icon', 'name' => 'Icon', 'type' => 'image'],
        ['key' => 'name', 'name' => 'Currency', 'sortable' => true, 'localized' => true],
        ['key' => 'code', 'name' => 'Code', 'type' => 'mono'],
        ['key' => 'symbol', 'name' => 'Symbol'],
        ['key' => 'decimal_places', 'name' => 'Decimals'],
        ['key' => 'is_default', 'name' => 'Default', 'type' => 'boolean'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()->forModule('currencies')->orderBy('name')
            ->get(['name', 'translations', '_id', 'slug', 'color', 'back_color'])->toArray();
    }

    public array $filters = [
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'currencies', 'getter' => 'getStatusesList'],
    ];

    /**
     * What a Currency accepts.
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
            'symbol' => [...$sometimes, 'required', 'string', 'max:20'],
            'decimal_places' => ['nullable', 'integer', 'min:0', 'max:8'],
            'is_default' => ['nullable', 'boolean'],

            // A media value that is never uploaded to. Shared core used to
            // normalise this root because its own list happened to name it,
            // which also made a posted file pass image validation and then
            // crash the driver. The shape stays; the accidental upload door
            // does not.
            'icon' => ['nullable', CmsMedia::valueOnly()],
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
        ];
    }
}
