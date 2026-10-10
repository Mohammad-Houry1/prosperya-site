<?php

namespace App\Models;

use App\Enums\AnimatedVisualType;
use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsGallery;
use App\Rules\CmsMedia;
use App\Rules\ListRules;
use App\Rules\LocaleMap;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

class CaseStudy extends ContentEntity
{
    use Trashable;

    protected $table = 'case_studies';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public bool $reordering = true;

    public array $dependents = [
        [Solution::class, 'related_case_studies', 'Solutions'],
        [Expertise::class, 'related_case_studies', 'Expertise'],
    ];

    public array $searchable = ['case_study_chapeau', 'content_sections', 'technology_stack', 'case_study_hero_facts', 'name', 'slug', 'case_study_title', 'case_study_industry', 'case_study_client', 'case_study_duration', 'case_study_summary', 'case_study_description', 'case_study_challenge', 'case_study_challenge_points', 'case_study_solution', 'case_study_results', 'case_study_before_title', 'case_study_after_title', 'case_study_before', 'case_study_after', 'meta_title', 'meta_keywords', 'meta_url', 'meta_description'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'industry', 'name' => 'Industry', 'type' => 'object', 'source' => 'industries', 'getter' => 'getIndustriesList'],
        ['key' => 'related_solutions', 'name' => 'Related Solutions', 'type' => 'objects', 'source' => 'solutions', 'getter' => 'getSolutionsList'],
        ['key' => 'related_expertise', 'name' => 'Related Expertise', 'type' => 'objects', 'source' => 'expertise', 'getter' => 'getExpertiseList'],
        ['key' => 'platforms', 'name' => 'Platforms', 'type' => 'objects', 'source' => 'platforms', 'getter' => 'getPlatformsList'],
        ['key' => 'case_study_testimonial', 'name' => 'Case Study Testimonial', 'type' => 'object', 'source' => 'testimonials', 'getter' => 'getTestimonialsList'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'case_studies', 'getter' => 'getStatusesList'],
        ['key' => 'industry', 'name' => 'All Industries', 'type' => 'select', 'source' => 'industries', 'getter' => 'getIndustriesList'],
        ['key' => 'related_solutions', 'name' => 'All Solutions', 'type' => 'select', 'source' => 'solutions', 'getter' => 'getSolutionsList', 'multiple' => true],
        ['key' => 'related_expertise', 'name' => 'All Expertise', 'type' => 'select', 'source' => 'expertise', 'getter' => 'getExpertiseList', 'multiple' => true],
        ['key' => 'platforms', 'name' => 'All Platforms', 'type' => 'select', 'source' => 'platforms', 'getter' => 'getPlatformsList', 'multiple' => true],
    ];

    protected function casts(): array
    {
        return [...parent::casts(), 'featured' => 'boolean'];
    }

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => [$this->exists ? 'required' : 'nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
            'featured' => ['sometimes', 'boolean'],
            'case_study_title' => LocaleMap::rules(max: 255),
            'case_study_chapeau' => LocaleMap::rules(max: 255),
            'case_study_animation_type' => ['nullable', 'string', Rule::enum(AnimatedVisualType::class)],
            'case_study_industry' => LocaleMap::rules(max: 255),
            'industry' => ['bail', 'nullable', 'string', 'regex:/^[a-f0-9]{24}$/',
                Rule::exists(Industry::class, '_id')->where('tenant_id', $tenantId)->whereNull('deleted_at')],
            'case_study_client' => LocaleMap::rules(max: 255),
            'case_study_duration' => LocaleMap::rules(max: 255),
            ...ListRules::of('case_study_hero_facts', [
                'hero_fact_value' => LocaleMap::rules(max: 255),
                'hero_fact_label' => LocaleMap::rules(max: 255),
            ], max: 50),
            'case_study_summary' => LocaleMap::rules(),
            'case_study_description' => LocaleMap::rules(),
            ...ListRules::of('content_sections', [
                'content_title' => LocaleMap::rules(max: 255),
                'content_subtitle' => LocaleMap::rules(max: 255),
                'content_description' => LocaleMap::rules(),
            ], max: 50),
            ...ListRules::of('technology_stack', [
                'technology_name' => LocaleMap::rules(max: 255),
                'technology_image' => ['nullable', CmsMedia::valueOnly()],
            ], max: 50),
            'case_study_challenge' => LocaleMap::rules(),
            ...ListRules::values('case_study_challenge_points', LocaleMap::rules(max: 255), max: 50),
            'case_study_solution' => LocaleMap::rules(),
            'case_study_results' => LocaleMap::rules(),
            'case_study_before_title' => LocaleMap::rules(max: 255),
            'case_study_after_title' => LocaleMap::rules(max: 255),
            ...ListRules::values('case_study_before', LocaleMap::rules(max: 255), max: 50),
            ...ListRules::values('case_study_after', LocaleMap::rules(max: 255), max: 50),
            ...ListRules::of('case_study_metrics', [
                'metric_value' => LocaleMap::rules(max: 255),
                'metric_label' => LocaleMap::rules(max: 255),
            ], max: 50),
            'case_study_metrics_note' => LocaleMap::rules(),
            ...ListRules::of('sections', [
                'section_title' => LocaleMap::rules(max: 255),
                'section_subtitle' => LocaleMap::rules(max: 255),
                'section_description' => LocaleMap::rules(),
                'section_image' => ['nullable', CmsMedia::valueOnly()],
            ], max: 50),
            ...ListRules::values('case_study_deliverables', LocaleMap::rules(max: 255), max: 50),
            ...ListRules::of('implementation_steps', [
                'step_title' => LocaleMap::rules(max: 255),
                'step_description' => LocaleMap::rules(),
                'step_image' => ['nullable', CmsMedia::valueOnly()],
            ], max: 50),
            'related_solutions' => ['nullable', 'array', 'list', 'max:50'],
            'related_solutions.*' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/', 'distinct',
                Rule::exists(Solution::class, '_id')->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'related_expertise' => ['nullable', 'array', 'list', 'max:50'],
            'related_expertise.*' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/', 'distinct',
                Rule::exists(Expertise::class, '_id')->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'platforms' => ['nullable', 'array', 'list', 'max:50'],
            'platforms.*' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/', 'distinct',
                Rule::exists(Platform::class, '_id')->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'case_study_testimonial' => ['nullable', 'string', 'regex:/^[a-f0-9]{24}$/',
                Rule::exists(Testimonial::class, '_id')->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'case_study_image' => ['nullable', CmsMedia::uploadable()],
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'case_study_gallery' => ['nullable', 'array', 'list', new CmsGallery],
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
        return Status::query()->forModule('case_studies')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getIndustriesList(): array
    {
        $tenantId = CurrentTenant::id();
        if (! $tenantId) {
            return [];
        }

        return Industry::query()->where('tenant_id', $tenantId)->whereNull('deleted_at')
            ->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'slug', 'translations', 'project', 'country', 'language'])->all();
    }

    public function industryRecord()
    {
        return $this->belongsTo(Industry::class, 'industry');
    }

    public function getSolutionsList(): array
    {
        $tenantId = CurrentTenant::id();

        if (! $tenantId) {
            return [];
        }

        return Solution::query()->where('tenant_id', $tenantId)->whereNull('deleted_at')
            ->orderBy('name')->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getExpertiseList(): array
    {
        $tenantId = CurrentTenant::id();

        if (! $tenantId) {
            return [];
        }

        return Expertise::query()->where('tenant_id', $tenantId)->whereNull('deleted_at')
            ->orderBy('name')->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getPlatformsList(): array
    {
        $tenantId = CurrentTenant::id();

        if (! $tenantId) {
            return [];
        }

        return Platform::query()->where('tenant_id', $tenantId)->whereNull('deleted_at')
            ->orderBy('name')->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }

    public function getTestimonialsList(): array
    {
        $tenantId = CurrentTenant::id();

        if (! $tenantId) {
            return [];
        }

        return Testimonial::query()->where('tenant_id', $tenantId)->whereNull('deleted_at')
            ->orderBy('name')->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }
}
