<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\LocaleMap;

class ArticleCategory extends ContentEntity
{
    use Trashable;

    protected $table = 'article_categories';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [
        [Article::class, 'article_category', 'Articles'],
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Category Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('article_categories')
            ->orderBy('name')
            ->get(['name', 'translations', '_id', 'slug', 'color', 'back_color'])
            ->toArray();
    }

    public array $filters = [
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'article_categories', 'getter' => 'getStatusesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'category_description' => LocaleMap::rules(),
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'sort_order' => ['nullable', 'integer'],
            'status' => [...$sometimes, 'required'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array:name'],
            'translations.*.name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
