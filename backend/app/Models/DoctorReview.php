<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

/**
 * Ratings and comments submitted from the doctor appointment app. The CMS
 * moderates them through their status; it never creates them.
 */
class DoctorReview extends ContentEntity
{
    use Trashable;

    protected $table = 'doctor_reviews';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public bool $canCreate = false;

    public bool $allowCloning = false;

    public bool $export = false;

    public array $dependents = [];

    public array $searchable = ['name', 'review_comment'];

    public array $defaultSort = ['column' => 'created_at', 'direction' => 'desc'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Reviewer', 'sortable' => true, 'localized' => true],
        ['key' => 'doctor', 'name' => 'Doctor', 'type' => 'object', 'source' => 'doctors', 'getter' => 'getDoctorsList'],
        ['key' => 'review_rating', 'name' => 'Rating', 'sortable' => true],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'sortable' => true, 'sort_key' => 'status.name', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'created_at', 'name' => 'Submitted', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'doctor_reviews', 'getter' => 'getStatusesList'],
        ['key' => 'doctor', 'name' => 'All Doctors', 'type' => 'select', 'source' => 'doctors', 'getter' => 'getDoctorsList'],
        ['key' => 'created_at', 'name' => 'Submitted', 'type' => 'date_range'],
    ];

    protected function casts(): array
    {
        return [...parent::casts(), 'review_rating' => 'integer'];
    }

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'doctor' => [...$sometimes, 'required', 'string', Rule::exists(Doctor::class, '_id')
                ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'review_rating' => [...$sometimes, 'required', 'integer', 'between:1,5'],
            'review_comment' => ['nullable', 'string', 'max:5000'],
            'status' => [...$sometimes, 'required'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('doctor_reviews')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getDoctorsList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return Doctor::query()->orderBy('order')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'project', 'country', 'language'])->all();
    }
}
