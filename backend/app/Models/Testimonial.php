<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\LocaleMap;
use App\Support\CurrentTenant;
use Illuminate\Validation\Rule;

class Testimonial extends ContentEntity
{
    use Trashable;

    protected $table = 'testimonials';

    public bool $reordering = true;

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public array $dependents = [];

    public array $searchable = ['name', 'testimonial_subject', 'testimonial_description', 'user_name', 'user_company'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Testimonial Name', 'sortable' => true, 'localized' => true],
        ['key' => 'user', 'name' => 'Selected User', 'type' => 'object', 'source' => 'users', 'getter' => 'getUsersList'],
        ['key' => 'user_name', 'name' => 'User Name'],
        ['key' => 'user_company', 'name' => 'User Company'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true,
            'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        ['key' => 'status', 'name' => 'Status', 'type' => 'object', 'multiple' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList'],
    ];

    public array $filters = [
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'testimonials', 'getter' => 'getStatusesList'],
    ];

    protected function casts(): array
    {
        return [...parent::casts(), 'use_existing_user' => 'boolean'];
    }

    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'status' => [...$sometimes, 'required'],
            'testimonial_subject' => [...$sometimes, ...LocaleMap::rules(required: true, max: 255)],
            'testimonial_description' => [...$sometimes, ...LocaleMap::rules(required: true)],
            'use_existing_user' => ['required', 'boolean'],
            'user' => ['exclude_unless:use_existing_user,true', 'required', 'string',
                Rule::exists(User::class, '_id')->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'user_name' => ['exclude_if:use_existing_user,true', 'required', 'string', 'max:255'],
            'user_company' => ['exclude_if:use_existing_user,true', 'required', 'string', 'max:255'],
            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()->forModule('testimonials')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getUsersList(): array
    {
        $tenantId = CurrentTenant::id();

        if (! $tenantId) {
            return [];
        }

        return User::query()->where('tenant_id', $tenantId)->whereNull('deleted_at')
            ->orderBy('name')->get(['_id', 'name', 'project', 'country', 'language'])->all();
    }

    public function clearInactiveIdentity(): void
    {
        if ($this->use_existing_user) {
            $this->user_name = null;
            $this->user_company = null;
            $translations = $this->translations ?? [];
            foreach ($translations as &$translation) {
                if (is_array($translation)) {
                    unset($translation['user_name']);
                }
            }
            unset($translation);
            $this->translations = $translations;
        } else {
            $this->user = null;
        }
    }
}
