<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsMedia;
use App\Rules\LocaleMap;

class SeoPage extends ContentEntity
{
    use Trashable;

    protected $table = 'seo_pages';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [];

    public array $searchable = ['name', 'slug', 'meta_title', 'meta_keywords', 'meta_url', 'meta_description'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'meta_url', 'name' => 'Meta URL', 'sortable' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'seo_pages', 'getter' => 'getStatusesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => [$this->exists ? 'required' : 'nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
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
        return Status::query()->forModule('seo_pages')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }
}
