<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsMedia;
use App\Rules\ListRules;
use App\Rules\LocaleMap;

class Approach extends ContentEntity
{
    use Trashable;

    protected $table = 'approaches';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [];

    public array $searchable = ['name', 'slug', 'approach_title', 'approach_description', 'collaboration_title', 'principles_title', 'meta_title', 'meta_keywords', 'meta_url', 'meta_description'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'approaches', 'getter' => 'getStatusesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => [$this->exists ? 'required' : 'nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
            'approach_title' => LocaleMap::rules(max: 255),
            'approach_description' => LocaleMap::rules(),
            ...ListRules::of('methodology', [
                'methodology_title' => LocaleMap::rules(max: 255),
                ...ListRules::values('methodology_buttons', LocaleMap::rules(max: 255)),
                ...ListRules::values('methodology_descriptions', LocaleMap::rules()),
                'methodology_image' => ['nullable', CmsMedia::valueOnly()],
            ]),
            ...ListRules::of('how_we_work', [
                'work_title' => LocaleMap::rules(max: 255),
                'work_description' => LocaleMap::rules(),
                'work_image' => ['nullable', CmsMedia::valueOnly()],
            ]),
            'collaboration_title' => LocaleMap::rules(max: 255),
            ...ListRules::values('collaboration_items', LocaleMap::rules(max: 255)),
            'diagram_client_title' => LocaleMap::rules(max: 255),
            'diagram_client_description' => LocaleMap::rules(),
            'diagram_shared_title' => LocaleMap::rules(max: 255),
            'diagram_shared_description' => LocaleMap::rules(),
            'diagram_company_title' => LocaleMap::rules(max: 255),
            'diagram_company_description' => LocaleMap::rules(),
            'diagram_value_title' => LocaleMap::rules(max: 255),
            'diagram_value_description' => LocaleMap::rules(),
            'principles_title' => LocaleMap::rules(max: 255),
            ...ListRules::of('principles', [
                'principle_title' => LocaleMap::rules(max: 255),
                'principle_description' => LocaleMap::rules(),
                'principle_image' => ['nullable', CmsMedia::valueOnly()],
            ]),
            'meta_title' => LocaleMap::rules(max: 255),
            'meta_keywords' => LocaleMap::rules(),
            'meta_url' => ['nullable', 'string', 'max:2048'],
            'meta_type' => ['nullable', 'string', 'max:100'],
            'meta_description' => LocaleMap::rules(),
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('approaches')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }
}
