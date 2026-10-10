<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsMedia;

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
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:40'],
            'logo_image' => ['nullable', CmsMedia::uploadable()],
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
}
