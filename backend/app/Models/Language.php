<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;
use App\Rules\CmsMedia;

class Language extends ReferenceEntity
{
    protected $table = 'ref_languages';

    public array $scopeFields = [];

    public array $translatable = ['name'];

    public array $dependents = [
        [Page::class, 'language', 'pages'],
        [User::class, 'language', 'users'],
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'code', 'name' => 'Code'],
        ['key' => 'native_name', 'name' => 'Native Name'],
        ['key' => 'direction', 'name' => 'Direction'],
        ['key' => 'is_cms_enabled', 'name' => 'CMS', 'type' => 'boolean'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('languages')
            ->orderBy('name')
            ->get(['name', 'translations', '_id', 'slug', 'color', 'back_color'])
            ->toArray();
    }

    public array $filters = [
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'languages', 'getter' => 'getStatusesList'],
    ];

    /**
     * What a Language accepts.
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
            'native_name' => ['nullable', 'string', 'max:255'],
            'direction' => ['nullable', 'string', 'max:10'],
            'is_cms_enabled' => ['nullable', 'boolean'],

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
