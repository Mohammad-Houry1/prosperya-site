<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;
use App\Models\Concerns\SavesConsistentReferenceHierarchy;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Region extends ReferenceEntity
{
    use SavesConsistentReferenceHierarchy;

    protected $table = 'ref_regions';

    public array $referenceLinks = [
        'country_id' => ['countries', false, false],
    ];


    public array $translatable = ['name'];

    public array $dependents = [
        [Department::class, 'region_id', 'departments'],
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'code', 'name' => 'Code'],
        ['key' => 'country_id', 'name' => 'Country', 'type' => 'object', 'source' => 'countries'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()->forModule('regions')->orderBy('name')
            ->get(['name', 'translations', '_id', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getCountriesList(): array
    {
        return Country::query()
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'code'])
            ->toArray();
    }

    public array $filters = [
        ['key' => 'country_id', 'name' => 'All Countries', 'type' => 'select', 'source' => 'countries'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'regions', 'getter' => 'getStatusesList'],
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    /**
     * What a Region accepts.
     *
     * Extracted from the shared union rather than invented: every rule here is
     * the rule this module already enforced. The parent constraints are the
     * part worth reading twice — they check that the id resolves to a record of
     * the right kind, in this tenant, that has not been trashed. They do not
     * check that a country is the one a later record claims, and nothing else in the write path does either.
     * That is recorded as relation-integrity debt; migrating ownership is not
     * the place to start enforcing it.
     *
     * @return array<string, mixed>
     */
    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'code' => [...$sometimes, 'required', 'string', 'max:100', $this->uniqueWithinTenant($tenantId, 'code')],
            'country_id' => [...$sometimes, 'required', 'string', $this->existsWithinTenant($tenantId, Country::class)],
            'description' => ['nullable'],
            'description.*' => ['nullable', 'string'],
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'sort_order' => ['nullable', 'integer'],
            'status' => [...$sometimes, 'required'],
        ];
    }
}
