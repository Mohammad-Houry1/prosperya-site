<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;
use Illuminate\Validation\Rule;

class ContactMethod extends ReferenceEntity
{
    protected $table = 'ref_contact_methods';

    public string $referenceIdentityField = 'slug';

    public array $defaultSort = [
        'column' => 'sort_order',
        'direction' => 'asc',
    ];

    public array $translatable = [
        'name',
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Method', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'type' => 'mono'],
        ['key' => 'value_type', 'name' => 'Value Type', 'type' => 'badge'],
        ['key' => 'requires_dial_code', 'name' => 'Dial Code', 'type' => 'boolean'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('contact_methods')
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])
            ->toArray();
    }

    public array $filters = [
        ['key' => 'value_type', 'name' => 'All Value Types', 'type' => 'select', 'options' => [
            ['value' => 'text', 'label' => 'Text'],
            ['value' => 'email', 'label' => 'Email'],
            ['value' => 'tel', 'label' => 'Telephone'],
            ['value' => 'url', 'label' => 'URL'],
            ['value' => 'id', 'label' => 'ID'],
        ]],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'contact_methods', 'getter' => 'getStatusesList'],
    ];
    /**
     * What a Contact Method accepts.
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
            'value_type' => [...$sometimes, 'required', 'string', Rule::in(['text', 'email', 'tel', 'url', 'id'])],
            'placeholder' => ['nullable', 'string', 'max:255'],
            'requires_dial_code' => ['nullable', 'boolean'],
            'description' => ['nullable'],
            'description.*' => ['nullable', 'string'],
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'sort_order' => ['nullable', 'integer'],
            'status' => [...$sometimes, 'required'],
        ];
    }

}
