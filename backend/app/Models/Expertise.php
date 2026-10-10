<?php

namespace App\Models;

use App\Enums\AnimatedVisualType;
use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsMedia;
use App\Rules\ListRules;
use App\Rules\LocaleMap;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

class Expertise extends ContentEntity
{
    use Trashable;

    protected $table = 'expertise';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [
        [Solution::class, 'related_expertise', 'Solutions'],
        [CaseStudy::class, 'related_expertise', 'Case Studies'],
    ];

    public array $searchable = ['expertise_detail_title', 'name', 'slug', 'expertise_title', 'expertise_tagline', 'expertise_summary', 'expertise_description', 'meta_title', 'meta_keywords', 'meta_url', 'meta_description'];

    public array $fields = [
        ['key' => 'expertise_image', 'name' => 'Image', 'type' => 'image', 'width' => '90px'],
        ['key' => 'name', 'name' => 'Expertise Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'related_solutions', 'name' => 'Related Solutions', 'type' => 'objects', 'source' => 'solutions', 'getter' => 'getSolutionsList'],
        ['key' => 'related_case_studies', 'name' => 'Related Case Studies', 'type' => 'objects', 'source' => 'case_studies', 'getter' => 'getCaseStudiesList'],
        ['key' => 'platforms', 'name' => 'Platforms', 'type' => 'objects', 'source' => 'platforms', 'getter' => 'getPlatformsList'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'created_at', 'name' => 'Created', 'sortable' => true, 'type' => 'datetime'],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'expertise', 'getter' => 'getStatusesList'],
        ['key' => 'related_solutions', 'name' => 'All Related Solutions', 'type' => 'select', 'source' => 'solutions', 'getter' => 'getSolutionsList', 'multiple' => true],
        ['key' => 'related_case_studies', 'name' => 'All Related Case Studies', 'type' => 'select', 'source' => 'case_studies', 'getter' => 'getCaseStudiesList', 'multiple' => true],
        ['key' => 'platforms', 'name' => 'All Platforms', 'type' => 'select', 'source' => 'platforms', 'getter' => 'getPlatformsList', 'multiple' => true],
    ];

    protected function casts(): array
    {
        return [...parent::casts(), 'featured' => 'boolean'];
    }

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];
        $live = fn (string $model) => Rule::exists($model, '_id')
            ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'));

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
            'featured' => ['sometimes', 'boolean'],
            'expertise_title' => LocaleMap::rules(max: 255),
            'expertise_animation_type' => ['nullable', 'string', Rule::enum(AnimatedVisualType::class)],
            'expertise_detail_title' => LocaleMap::rules(max: 255),
            'expertise_tagline' => LocaleMap::rules(max: 255),
            'expertise_summary' => LocaleMap::rules(),
            'expertise_description' => LocaleMap::rules(),
            ...ListRules::values('expertise_capabilities', LocaleMap::rules(max: 255)),
            ...ListRules::values('expertise_outcomes', LocaleMap::rules(max: 255)),
            ...ListRules::of('sections', [
                'section_title' => LocaleMap::rules(max: 255),
                'section_description' => LocaleMap::rules(),
                'section_image' => ['nullable', CmsMedia::valueOnly()],
            ]),
            ...ListRules::of('expertise_steps', [
                'step_title' => LocaleMap::rules(max: 255),
                'step_description' => LocaleMap::rules(),
                'step_image' => ['nullable', CmsMedia::valueOnly()],
            ]),
            ...ListRules::of('metrics', [
                'metric_value' => LocaleMap::rules(max: 255),
                'metric_label' => LocaleMap::rules(max: 255),
            ]),
            'expertise_metrics_note' => LocaleMap::rules(),
            'related_solutions' => ['nullable', 'array', 'list', 'max:50'],
            'related_solutions.*' => ['bail', 'required', 'string', 'regex:/^[a-f0-9]{24}$/', 'distinct', $live(Solution::class)],
            'related_case_studies' => ['nullable', 'array', 'list', 'max:50'],
            'related_case_studies.*' => ['bail', 'required', 'string', 'regex:/^[a-f0-9]{24}$/', 'distinct', $live(CaseStudy::class)],
            'platforms' => ['nullable', 'array', 'list', 'max:50'],
            'platforms.*' => ['bail', 'required', 'string', 'regex:/^[a-f0-9]{24}$/', 'distinct', $live(Platform::class)],
            'expertise_image' => ['nullable', CmsMedia::uploadable()],
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'meta_title' => LocaleMap::rules(max: 255),
            'meta_keywords' => LocaleMap::rules(),
            'meta_url' => ['nullable', 'string', 'max:2048'],
            'meta_type' => ['nullable', 'string', 'max:100'],
            'meta_description' => LocaleMap::rules(),
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('expertise')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getSolutionsList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return Solution::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getCaseStudiesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return CaseStudy::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getPlatformsList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return Platform::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }
}
