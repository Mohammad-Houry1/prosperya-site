<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsMedia;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

/**
 * Company and platform logos displayed in configurable order.
 */
class Platform extends ContentEntity
{
    use Trashable;

    protected $table = 'platforms';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public bool $reordering = true;

    public array $dependents = [
        [CaseStudy::class, 'platforms', 'Case Studies'],
        [Expertise::class, 'platforms', 'Expertise'],
    ];

    public array $fields = [
        ['key' => 'logo_image', 'name' => 'Company Logo', 'type' => 'image', 'width' => '90px'],
        ['key' => 'name', 'name' => 'Platform', 'width' => '30%', 'sortable' => true, 'localized' => true],
        ['key' => 'platform_category', 'name' => 'Category', 'type' => 'object', 'source' => 'platform_categories', 'getter' => 'getPlatformCategoriesList'],
        [
            'key' => 'status',
            'name' => 'Status',
            'width' => '120px',
            'type' => 'badge',
            'sortable' => true,
            'sort_key' => 'status.name',
            'changeable' => true,
            'input' => [
                'type' => 'object',
                'multi' => false,
                'function' => '',
                'key_to_update' => 'status',
                'getter' => 'getStatusesList',
            ],
        ],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        [
            'key' => 'status',
            'name' => 'Status',
            'type' => 'object',
            'multiple' => false,
            'function' => '',
            'key_to_update' => 'status',
            'getter' => 'getStatusesList',
        ],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'platforms', 'getter' => 'getStatusesList'],
        ['key' => 'platform_category', 'name' => 'All Categories', 'type' => 'select', 'source' => 'platform_categories', 'getter' => 'getPlatformCategoriesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:40'],
            'logo_image' => ['nullable', CmsMedia::uploadable()],
            'platform_category' => ['nullable', 'string', 'regex:/^[a-f0-9]{24}$/',
                Rule::exists(PlatformCategory::class, '_id')->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'status' => [...$sometimes, 'required'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('platforms')
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])
            ->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()
            ->orderBy('name')
            ->get(['_id', 'name', 'translations', 'code'])
            ->toArray();
    }

    public function getPlatformCategoriesList(): array
    {
        $tenantId = CurrentTenant::id();
        if (! $tenantId) {
            return [];
        }

        return PlatformCategory::query()->where('tenant_id', $tenantId)->whereNull('deleted_at')
            ->orderBy('name')->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function category()
    {
        return $this->belongsTo(PlatformCategory::class, 'platform_category');
    }
}
