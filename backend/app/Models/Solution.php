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

class Solution extends ContentEntity
{
    use Trashable;

    protected $table = 'solutions';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [
        [CaseStudy::class, 'related_solutions', 'Case Studies'],
        [Expertise::class, 'related_solutions', 'Expertise'],
    ];

    public array $searchable = ['name', 'slug', 'solution_title', 'solution_tagline', 'solution_description', 'solution_statement', 'solution_lead', 'meta_title', 'meta_keywords', 'meta_url', 'meta_description'];

    public array $fields = [
        ['key' => 'solution_image', 'name' => 'Image', 'type' => 'image', 'width' => '90px'],
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'related_expertise', 'name' => 'Related Expertise', 'type' => 'object', 'multiple' => true, 'source' => 'expertise', 'getter' => 'getExpertiseList'],
        ['key' => 'related_case_studies', 'name' => 'Related Case Studies', 'type' => 'object', 'multiple' => true, 'source' => 'case_studies', 'getter' => 'getCaseStudiesList'],
        ['key' => 'related_articles', 'name' => 'Related Articles', 'type' => 'objects', 'source' => 'articles', 'getter' => 'getArticlesList'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'solutions', 'getter' => 'getStatusesList'],
    ];

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];
        $live = fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at');

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
            'solution_title' => LocaleMap::rules(max: 255),
            'solution_tagline' => LocaleMap::rules(max: 255),
            'solution_description' => LocaleMap::rules(),
            'solution_animation_type' => ['nullable', 'string', Rule::enum(AnimatedVisualType::class)],
            'solution_animation_centre_label' => LocaleMap::rules(max: 255),
            'solution_animation_result_label' => LocaleMap::rules(max: 255),
            'solution_animation_signal_label' => LocaleMap::rules(max: 255),
            ...ListRules::values('solution_animation_sources', LocaleMap::rules(max: 255), max: 20),
            ...ListRules::values('solution_animation_lanes', LocaleMap::rules(max: 255), max: 10),
            ...ListRules::values('solution_animation_steps', LocaleMap::rules(max: 255), max: 40),
            ...ListRules::values('solution_animation_suppliers', LocaleMap::rules(max: 255), max: 20),
            ...ListRules::values('solution_animation_hubs', LocaleMap::rules(max: 255), max: 10),
            ...ListRules::values('solution_animation_channels', LocaleMap::rules(max: 255), max: 20),
            ...ListRules::values('solution_challenges', LocaleMap::rules(max: 255)),
            ...ListRules::values('solution_capabilities', LocaleMap::rules(max: 255)),
            'solution_statement' => LocaleMap::rules(max: 255),
            'solution_lead' => LocaleMap::rules(),
            'solution_friction_title' => LocaleMap::rules(max: 255),
            ...ListRules::values('solution_friction', LocaleMap::rules(max: 255)),
            ...ListRules::of('outcomes', [
                'outcome_title' => LocaleMap::rules(max: 255),
                'outcome_description' => LocaleMap::rules(),
                'outcome_image' => ['nullable', CmsMedia::valueOnly()],
            ]),
            ...ListRules::of('metrics', [
                'metric_value' => LocaleMap::rules(max: 255),
                'metric_label' => LocaleMap::rules(max: 255),
            ]),
            'solution_metrics_note' => LocaleMap::rules(),
            ...ListRules::of('sections', [
                'section_title' => LocaleMap::rules(max: 255),
                'section_description' => LocaleMap::rules(),
                'section_image' => ['nullable', CmsMedia::valueOnly()],
            ]),
            'related_expertise' => ['nullable', 'array', 'list', 'max:50'],
            'related_expertise.*' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/', 'distinct', Rule::exists(Expertise::class, '_id')->where($live)],
            'related_case_studies' => ['nullable', 'array', 'list', 'max:50'],
            'related_case_studies.*' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/', 'distinct', Rule::exists(CaseStudy::class, '_id')->where($live)],
            'related_articles' => ['nullable', 'array', 'list', 'max:50'],
            'related_articles.*' => ['bail', 'required', 'string', 'regex:/^[a-f0-9]{24}$/', 'distinct', Rule::exists(Article::class, '_id')->where($live)],
            'solution_image' => ['nullable', CmsMedia::uploadable()],
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
        return Status::query()->forModule('solutions')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getExpertiseList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return Expertise::query()->orderBy('order')->orderBy('name')
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

    public function getArticlesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return Article::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }
}
