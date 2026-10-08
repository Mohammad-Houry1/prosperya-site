<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsMedia;
use App\Rules\LocaleMap;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

class Faq extends ContentEntity
{
    use Trashable;

    protected $table = 'faqs';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public bool $reordering = true;

    public array $searchable = ['name', 'content'];

    public array $dependents = [[self::class, 'question', 'linked FAQs']];

    protected function casts(): array
    {
        return [...parent::casts(), 'is_question' => 'boolean'];
    }

    public array $fields = [
        ['key' => 'name', 'name' => 'FAQ', 'width' => '30%', 'sortable' => true, 'localized' => true],
        ['key' => 'is_question', 'name' => 'Is Question', 'type' => 'boolean', 'sortable' => true],
        [
            'key' => 'faq_category',
            'name' => 'Category',
            'type' => 'object',
            'source' => 'faq_categories',
            'getter' => 'getFaqCategoriesList',
        ],
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
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'faqs', 'getter' => 'getStatusesList'],
        ['key' => 'faq_category', 'name' => 'All Categories', 'type' => 'select', 'source' => 'faq_categories', 'getter' => 'getFaqCategoriesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'status' => [...$sometimes, 'required'],
            'is_question' => ['sometimes', 'boolean'],
            'faq_category' => ['nullable', 'string', Rule::exists(FaqCategory::class, '_id')
                ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'question' => ['nullable', 'string', Rule::exists(self::class, '_id')
                ->where(fn ($query) => $query->where('tenant_id', $tenantId)
                    ->whereNull('deleted_at')->whereIn('is_question', [true, 1, '1'])
                    ->when($this->getKey(), fn ($query) => $query->where('_id', '!=', $this->getKey())))],
            'content' => ['nullable', new LocaleMap],
            'content.*' => ['nullable', 'string'],
            'cover_image' => ['nullable', CmsMedia::uploadable()],
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('faqs')
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

    public function getFaqCategoriesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return FaqCategory::query()
            ->orderBy('name')
            ->get()
            ->all();
    }

    public function category()
    {
        return $this->belongsTo(FaqCategory::class, 'faq_category');
    }
}
