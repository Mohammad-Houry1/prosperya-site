<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsGallery;
use App\Rules\CmsMedia;
use App\Rules\LocaleMap;
use App\Support\CurrentTenant;
use Closure;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;

class Article extends ContentEntity
{
    use Trashable;

    protected $table = 'articles';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = ['name'];

    public bool $reordering = true;

    public array $dependents = [];

    public array $searchable = ['name', 'slug', 'article_title', 'article_small_description', 'article_description', 'meta_title', 'meta_description', 'meta_keywords', 'meta_url'];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'article_category', 'name' => 'Article Category', 'type' => 'object', 'source' => 'article_categories', 'getter' => 'getArticleCategoriesList'],
        ['key' => 'authors', 'name' => 'Article Authors', 'type' => 'objects', 'source' => 'users', 'getter' => 'getAuthorsList'],
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
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'articles', 'getter' => 'getStatusesList'],
        ['key' => 'article_category', 'name' => 'All Article Categories', 'type' => 'select', 'source' => 'article_categories', 'getter' => 'getArticleCategoriesList'],
        ['key' => 'authors', 'name' => 'All Article Authors', 'type' => 'select', 'source' => 'users', 'getter' => 'getAuthorsList', 'multiple' => true],
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
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'status' => [...$sometimes, 'required'],
            'featured' => ['sometimes', 'boolean'],
            'article_category' => ['nullable', 'string', Rule::exists(ArticleCategory::class, '_id')
                ->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('deleted_at'))],
            'authors' => ['bail', 'nullable', 'array', 'list', function (string $attribute, mixed $value, Closure $fail) use ($tenantId): void {
                if ($value === [] || collect($value)->contains(fn (mixed $id): bool => ! is_string($id))) {
                    return;
                }

                $ids = array_values(array_unique($value));
                $eligibleIds = $this->eligibleAuthors($tenantId, $ids)
                    ->map(fn (User $user): string => (string) $user->getKey())
                    ->all();

                if (array_diff($ids, $eligibleIds) !== []) {
                    $fail('Every article author must be an active user with the Author role in this tenant.');
                }
            }],
            'authors.*' => ['required', 'string', 'distinct'],
            'article_title' => LocaleMap::rules(max: 255),
            'article_small_description' => LocaleMap::rules(),
            'article_description' => LocaleMap::rules(),
            'poster' => ['nullable', CmsMedia::uploadable()],
            'cover_image' => ['nullable', CmsMedia::uploadable()],
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'album' => ['nullable', 'array', new CmsGallery],
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
        return Status::query()->forModule('articles')->orderBy('name')
            ->get(['_id', 'name', 'translations', 'slug', 'color', 'back_color'])->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()->orderBy('name')->get(['_id', 'name', 'translations', 'code'])->toArray();
    }

    public function getArticleCategoriesList(): array
    {
        if (! CurrentTenant::id()) {
            return [];
        }

        return ArticleCategory::query()->orderBy('name')->get()->all();
    }

    public function getAuthorsList(): array
    {
        $tenantId = CurrentTenant::id();

        if (! $tenantId) {
            return [];
        }

        return $this->eligibleAuthors((string) $tenantId)
            ->map(fn (User $user): array => [
                '_id' => (string) $user->getKey(),
                'name' => $user->name,
                'project' => $user->project,
                'country' => $user->country,
                'language' => $user->language,
            ])
            ->all();
    }

    public function category()
    {
        return $this->belongsTo(ArticleCategory::class, 'article_category');
    }

    /** Options and writes share the same live tenant role-membership check. */
    private function eligibleAuthors(string $tenantId, ?array $ids = null): Collection
    {
        $roles = Role::withoutGlobalScopes()->where('tenant_id', $tenantId)
            ->where('slug', 'author')->whereNull('deleted_at')->get()
            ->reject(fn (Role $role): bool => $role->is_active === false);

        if ($roles->isEmpty()) {
            return collect();
        }

        $roleKeys = $roles->map(fn (Role $role): string => (string) $role->getKey())
            ->push('author')->unique()->values()->all();

        return User::query()->where('tenant_id', $tenantId)->whereNull('deleted_at')
            ->where('is_active', '!=', false)
            ->when($ids !== null, fn ($query) => $query->whereIn('_id', $ids))
            ->where(function ($query) use ($roleKeys): void {
                $query->whereIn('role', $roleKeys);

                foreach (['role_ids', 'roles'] as $field) {
                    $query->orWhereIn($field, $roleKeys);

                    foreach (['_id', 'id', 'value', 'key', 'code', 'slug'] as $key) {
                        $query->orWhereIn($field.'.'.$key, $roleKeys);
                    }
                }
            })
            ->orderBy('name')->get(['_id', 'name', 'tenant_id', 'is_active', 'role', 'role_ids', 'roles', 'project', 'country', 'language'])
            ->filter(fn (User $user): bool => $user->is_active !== false
                && $this->hasAuthorRole($user, $roleKeys))
            ->values();
    }

    private function hasAuthorRole(User $user, array $roleKeys): bool
    {
        $keys = is_string($user->role) && trim($user->role) !== '' ? [trim($user->role)] : [];

        foreach (['role_ids', 'roles'] as $field) {
            foreach (is_array($user->{$field}) ? $user->{$field} : [] as $assignment) {
                $assignment = is_object($assignment) ? (array) $assignment : $assignment;

                // Match RoleAccess's assignment precedence: a stale explicit ID
                // must not fall through to an embedded role's old slug.
                if (is_array($assignment)) {
                    foreach (['_id', 'id', 'value', 'key', 'code', 'slug'] as $candidate) {
                        if (isset($assignment[$candidate]) && $assignment[$candidate] !== '') {
                            $assignment = $assignment[$candidate];
                            break;
                        }
                    }
                }

                if (is_scalar($assignment) && (string) $assignment !== '') {
                    $keys[] = (string) $assignment;
                }
            }
        }

        return array_intersect($keys, $roleKeys) !== [];
    }
}
