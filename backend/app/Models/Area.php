<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;
use App\Models\Concerns\SavesConsistentReferenceHierarchy;
use App\Rules\CmsGallery;
use App\Rules\CmsMedia;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Area extends ReferenceEntity
{
    use SavesConsistentReferenceHierarchy;

    protected $table = 'ref_areas';

    /** Links this reference module validates on write: field => [source module, nullable, embed snapshot]. */
    public array $referenceLinks = [
        'country_id' => ['countries', false, false],
        'region_id' => ['regions', false, false],
        'department_id' => ['departments', false, false],
        'city_id' => ['cities', false, false],
    ];


    public array $translatable = [
        'name',
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'code', 'name' => 'Code'],
        ['key' => 'country_id', 'name' => 'Country', 'type' => 'object', 'source' => 'countries'],
        ['key' => 'region_id', 'name' => 'Region', 'type' => 'object', 'source' => 'regions'],
        ['key' => 'department_id', 'name' => 'Department', 'type' => 'object', 'source' => 'departments'],
        ['key' => 'city_id', 'name' => 'City', 'type' => 'object', 'source' => 'cities'],
        ['key' => 'postal_code', 'name' => 'Postal Code'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('areas')
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

    public function getCitiesList(): array
    {
        return City::query()
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'code', 'country_id', 'region_id', 'department_id'])
            ->toArray();
    }

    public array $filters = [
        ['key' => 'country_id', 'name' => 'All Countries', 'type' => 'select', 'source' => 'countries', 'getter' => 'getCountriesList'],
        ['key' => 'region_id', 'name' => 'All Regions', 'type' => 'select', 'source' => 'regions', 'getter' => 'getRegionsList'],
        ['key' => 'department_id', 'name' => 'All Departments', 'type' => 'select', 'source' => 'departments', 'getter' => 'getDepartmentsList'],
        ['key' => 'city_id', 'name' => 'All Cities', 'type' => 'select', 'source' => 'cities', 'getter' => 'getCitiesList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'areas', 'getter' => 'getStatusesList'],
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

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    /**
     * What a Area accepts.
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
            'city_id' => [...$sometimes, 'required', 'string', $this->existsWithinTenant($tenantId, City::class)],
            'postal_code' => ['nullable', 'string', 'max:40'],
            'description' => ['nullable'],
            'description.*' => ['nullable', 'string'],
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'sort_order' => ['nullable', 'integer'],
            'status' => [...$sometimes, 'required'],

            // Media, declared rather than inferred. CmsMedia leaves a stored
            // object, a bare URL string and null exactly as they are — the read
            // payload is what an edit form sends back — and holds an actual
            // upload to the image constraints. Shared core reads these
            // declarations instead of keeping its own list of field names.
            'thumbnail' => ['nullable', CmsMedia::uploadable()],
            'cover_image' => ['nullable', CmsMedia::uploadable()],
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'gallery' => ['nullable', 'array', new CmsGallery],
        ], $tenantId);
    }
}
