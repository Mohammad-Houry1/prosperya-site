<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;
use App\Rules\CmsMedia;

class Country extends ReferenceEntity
{
    protected $table = 'ref_countries';

    public array $translatable = ['name'];

    public array $dependents = [
        [Region::class, 'country_id', 'regions'],
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'code', 'name' => 'Code'],
        ['key' => 'phone_code', 'name' => 'Phone Code'],
        ['key' => 'currency', 'name' => 'Currency'],
        ['key' => 'region', 'name' => 'Region'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('countries')
            ->orderBy('name')
            ->get(['name', 'translations', '_id', 'slug', 'color', 'back_color'])
            ->toArray();
    }

    public array $filters = [
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'countries', 'getter' => 'getStatusesList'],
    ];

    /**
     * What a Country accepts.
     *
     * Extracted from the shared union rather than invented: every rule here is
     * the rule this module already enforced.
     *
     * `currency` and `region` read like relations and are not. The form submits
     * plain text for both, the union validated them as `['nullable']`, and
     * nothing resolves either against the Currency or Region collections — a
     * Country may name a currency that does not exist. Turning them into
     * references would be a new rule, not a migrated one, so they stay exactly
     * as weak as they were and the gap is recorded instead.
     *
     * @return array<string, mixed>
     */
    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'code' => [...$sometimes, 'required', 'string', 'max:100', $this->uniqueWithinTenant($tenantId, 'code')],

            // The only one of the three cross-reference fields with any
            // constraint at all.
            'phone_code' => ['nullable', 'string', 'max:20'],
            'currency' => ['nullable'],
            'region' => ['nullable'],

            // A media value that is never uploaded to. Shared core used to
            // normalise this root because its own list happened to name it,
            // which also made a posted file pass image validation and then
            // crash the driver. The shape stays; the accidental upload door
            // does not.
            'icon' => ['nullable', CmsMedia::valueOnly()],
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'sort_order' => ['nullable', 'integer'],
            'status' => [...$sometimes, 'required'],
        ];
    }
}
