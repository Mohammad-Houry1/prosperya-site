<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsGallery;
use App\Rules\CmsMedia;
use App\Rules\ListRules;
use App\Rules\LocaleMap;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

class CorporatePage extends ContentEntity
{
    use Trashable;

    protected $table = 'corporate_pages';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public bool $reordering = true;

    public array $dependents = [];

    public array $searchable = ['name', 'slug', 'title', 'description', 'meta_title', 'meta_description', 'meta_keywords', 'meta_url'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'corporate_page_category', 'name' => 'Category', 'type' => 'object', 'source' => 'corporate_page_categories', 'getter' => 'getCorporatePageCategoriesList'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'corporate_pages', 'getter' => 'getStatusesList'],
        ['key' => 'corporate_page_category', 'name' => 'All Categories', 'type' => 'select', 'source' => 'corporate_page_categories', 'getter' => 'getCorporatePageCategoriesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
            'corporate_page_category' => ['nullable', 'string', Rule::exists(CorporatePageCategory::class, '_id')
                ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'title' => LocaleMap::rules(max: 255),
            'description' => LocaleMap::rules(),
            ...ListRules::of('sections', [
                'title' => LocaleMap::rules(max: 255),
                'description' => LocaleMap::rules(),
            ]),
            'cover_image' => ['nullable', CmsMedia::uploadable()],
            'mobile_image' => ['nullable', CmsMedia::uploadable()],
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'album' => ['nullable', 'array', new CmsGallery],
            'meta_title' => LocaleMap::rules(max: 255),
            'meta_description' => LocaleMap::rules(),
            'meta_keywords' => LocaleMap::rules(),
            'meta_url' => ['nullable', 'string', 'max:2048'],
            'meta_type' => ['nullable', 'string', 'max:100'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('corporate_pages')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getCorporatePageCategoriesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return CorporatePageCategory::query()->orderBy('name')->get()->all();
    }

    public function category()
    {
        return $this->belongsTo(CorporatePageCategory::class, 'corporate_page_category');
    }
}
