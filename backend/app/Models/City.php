<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;
use App\Models\Concerns\SavesConsistentReferenceHierarchy;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class City extends ReferenceEntity
{
    use SavesConsistentReferenceHierarchy;

    protected $table = 'ref_cities';

    /** Links this reference module validates on write: field => [source module, nullable, embed snapshot]. */
    public array $referenceLinks = [
        'country_id' => ['countries', false, false],
        'region_id' => ['regions', false, false],
        'department_id' => ['departments', false, false],
    ];


    public array $translatable = [
        'name',
    ];

    public array $dependents = [
        [Area::class, 'city_id', 'areas'],
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'code', 'name' => 'Code'],
        ['key' => 'country_id', 'name' => 'Country', 'type' => 'object', 'source' => 'countries'],
        ['key' => 'region_id', 'name' => 'Region', 'type' => 'object', 'source' => 'regions'],
        ['key' => 'department_id', 'name' => 'Department', 'type' => 'object', 'source' => 'departments'],
        ['key' => 'timezone', 'name' => 'Timezone'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('cities')
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])
            ->toArray();
    }

    public function getCountriesList(): array
    {
        return Country::query()
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'code'])
            ->toArray();
    }

    public function getRegionsList(): array
    {
        return Region::query()
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'code', 'country_id'])
            ->toArray();
    }

    public function getDepartmentsList(): array
    {
        return Department::query()
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'code', 'country_id', 'region_id'])
            ->toArray();
    }

    public function getTimezonesList(): array
    {
        return Timezone::query()
            ->orderBy('name')
            ->get(['code', 'name', 'translations', 'offset'])
            ->all();
    }

    public array $filters = [
        ['key' => 'country_id', 'name' => 'All Countries', 'type' => 'select', 'source' => 'countries', 'getter' => 'getCountriesList'],
        ['key' => 'region_id', 'name' => 'All Regions', 'type' => 'select', 'source' => 'regions', 'getter' => 'getRegionsList'],
        ['key' => 'department_id', 'name' => 'All Departments', 'type' => 'select', 'source' => 'departments', 'getter' => 'getDepartmentsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'cities', 'getter' => 'getStatusesList'],
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * What a City accepts.
     *
     * Extracted from the shared union rather than invented: every rule here is
     * the rule this module already enforced. Parent IDs resolve within the
     * tenant, and their declared relationships must agree with the complete
     * proposed chain, including fields preserved by a partial update.
     *
     * @return array<string, mixed>
     */
    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return $this->withConsistentParentRules([
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'code' => [...$sometimes, 'required', 'string', 'max:100', $this->uniqueWithinTenant($tenantId, 'code')],
            'country_id' => [...$sometimes, 'required', 'string', $this->existsWithinTenant($tenantId, Country::class)],
            'region_id' => [...$sometimes, 'required', 'string', $this->existsWithinTenant($tenantId, Region::class)],
            'department_id' => [...$sometimes, 'required', 'string', $this->existsWithinTenant($tenantId, Department::class)],

            // A free value, not a relation: the shared union never checked it
            // against the Timezone module, and promoting it to a foreign key
            // here would be a new rule rather than a migrated one.
            'timezone' => ['nullable'],
            'description' => ['nullable'],
            'description.*' => ['nullable', 'string'],
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'sort_order' => ['nullable', 'integer'],
            'status' => [...$sometimes, 'required'],
        ], $tenantId);
    }
}
