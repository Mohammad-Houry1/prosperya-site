<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Models\Concerns\StoresNativeArrays;
use App\Models\Concerns\UsesCentralDatabase;
use App\Notifications\ResetPasswordNotification;
use App\Support\CurrentTenant;
use App\Support\DatabaseIsolationMode;
use App\Support\RoleAccess;
use App\Support\StatusRules;
use App\Traits\HasAutoSlug;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Sanctum\NewAccessToken;
use Laravel\Sanctum\Sanctum;
use MongoDB\Laravel\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, HasAutoSlug, HasFactory, Notifiable, StoresNativeArrays;
    use UsesCentralDatabase;

    protected $connection = 'mongodb';

    protected $keyType = 'string';

    // Must stay at the framework default (true) for MongoDB: setting it false
    // skips key backfill after insert, so a freshly created user has an empty
    // _id — which breaks the create response and token issuance at registration.
    protected string $slugSourceField = 'name';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $dependents = [
        [Page::class, 'about_users', 'Pages'],
        [CorporatePage::class, 'about_users', 'Corporate Pages'],
    ];

    public bool $usesAuthor = false;

    public string $recordScopeColumn = '_id';

    public bool $export = true;

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true],
        ['key' => 'email', 'name' => 'Email', 'sortable' => true],
        ['key' => 'roles_list', 'name' => 'Roles'],
        ['key' => 'status', 'name' => 'Status', 'type' => 'badge', 'changeable' => true, 'input' => ['type' => 'object', 'multi' => false, 'function' => '', 'key_to_update' => 'status', 'getter' => 'getStatusesList']],
        ['key' => 'language', 'name' => 'Language', 'type' => 'objects', 'source' => 'languages'],
        ['key' => 'country', 'name' => 'Country', 'type' => 'objects', 'source' => 'countries'],
        ['key' => 'project', 'name' => 'Project', 'type' => 'objects', 'source' => 'projects'],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $attributesToEdit = [
        [
            'key' => 'status',
            'name' => 'Status',
            'type' => 'object',
            'multiple' => false,
            'key_to_update' => 'status',
            'getter' => 'getStatusesList',
        ],
        [
            'key' => 'project',
            'name' => 'Project',
            'type' => 'objects',
            'multiple' => true,
            'key_to_update' => 'project',
            'getter' => 'getProjectsList',
        ],
        [
            'key' => 'country',
            'name' => 'Country',
            'type' => 'objects',
            'multiple' => true,
            'key_to_update' => 'country',
            'getter' => 'getCountriesList',
        ],
        [
            'key' => 'language',
            'name' => 'Language',
            'type' => 'objects',
            'multiple' => true,
            'key_to_update' => 'language',
            'getter' => 'getLanguagesList',
        ],
    ];

    public array $filters = [
        ['key' => 'status', 'name' => 'All Status', 'type' => 'select', 'source' => 'statuses', 'module' => 'users', 'getter' => 'getStatusesList'],
        ['key' => 'role', 'name' => 'All Roles', 'type' => 'select', 'source' => 'roles', 'columns' => ['role', 'role_ids', 'roles']],
        ['key' => 'country', 'name' => 'All Countries', 'type' => 'select', 'source' => 'countries', 'getter' => 'getCountriesList'],
        ['key' => 'language', 'name' => 'All Languages', 'type' => 'select', 'source' => 'languages', 'getter' => 'getLanguagesList'],
        ['key' => 'project', 'name' => 'All Projects', 'type' => 'select', 'source' => 'projects', 'getter' => 'getProjectsList'],
    ];

    protected $fillable = [
        'name',
        'slug',
        'email',
        'password',
        'role',
        'role_ids',
        'roles',
        'status',
        'status_id',
        'statusObject',
        'tenant_id',
        'is_active',
        'is_approved',
        'avatar',
        'language',
        'language_assignment_mode',
        'cms_content_language',
        'country',
        'country_assignment_mode',
        'cms_content_country',
        'city',
        'department',
        'area',
        'project',
        'project_assignment_mode',
        'cms_content_project',
        'timezone',
        'position',
        'bio',
        'receive_notifications',
        'contact_methods',
        'social_links',
        'provider',
        'register_provider',
        'content_owner_id',
        'locker',
        'last_login_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = ['roles_list'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
        'status' => 'array',
        'statusObject' => 'array',
        'avatar' => 'array',
        'role_ids' => 'array',
        'roles' => 'array',
        'language' => 'array',
        'country' => 'array',
        'project' => 'array',
        'is_active' => 'boolean',
        'is_approved' => 'boolean',
        'receive_notifications' => 'boolean',
        'contact_methods' => 'array',
        'social_links' => 'array',
        'locker' => 'array',
    ];

    protected function email(): Attribute
    {
        // Control characters are stripped, not just trimmed: an embedded CR/LF
        // survives trim() and turns a stored address into a mail-header
        // injection vector the moment it is used as a recipient.
        //
        // The getter is not redundant. Declaring this method at all marks the
        // attribute as custom-mutated, and a set-only Attribute resolves reads
        // through a null getter — so $user->email came back null everywhere
        // while the stored value was intact, which silently broke password
        // reset emails (the notification routes mail via $notifiable->email)
        // and blanked the address in the session payload.
        return Attribute::make(
            get: fn (mixed $value): ?string => $value === null ? null : (string) $value,
            set: fn (mixed $value): string => Str::lower(trim(
                preg_replace('/[\x00-\x1F\x7F]/u', '', (string) $value) ?? ''
            ))
        );
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification((string) $token));
    }

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('users')
            ->orderBy('name')
            ->get(['name', 'translations', '_id', 'slug', 'color', 'back_color'])
            ->toArray();
    }

    public function getProjectsList(): array
    {
        return Project::query()
            ->orderBy('name')
            ->get(['name', 'translations', '_id', 'code'])
            ->toArray();
    }

    public function getCountriesList(): array
    {
        return Country::query()
            ->tap(fn ($query) => app(StatusRules::class)->whereEnabled($query, (string) CurrentTenant::id()))
            ->orderBy('name')
            ->get(['name', 'translations', '_id', 'code'])
            ->toArray();
    }

    public function getLanguagesList(): array
    {
        return Language::query()
            ->tap(fn ($query) => app(StatusRules::class)->whereEnabled($query, (string) CurrentTenant::id()))
            ->orderBy('name')
            ->get(['name', 'translations', '_id', 'code'])
            ->toArray();
    }

    public function createToken(string $name, array $abilities = ['*'], ?DateTimeInterface $expiresAt = null): NewAccessToken
    {
        $plainTextToken = $this->generateTokenString();
        $hashedToken = hash('sha256', $plainTextToken);

        $token = $this->tokens()->create([
            'name' => $name,
            'token' => $hashedToken,
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
        ]);

        if (! $token->getKey()) {
            $tokenModel = Sanctum::$personalAccessTokenModel;
            $token = $tokenModel::where('token', $hashedToken)->first() ?? $token;
        }

        return new NewAccessToken($token, (string) $token->getKey().'|'.$plainTextToken);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function roleDefinition(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role', 'slug')
            ->where('tenant_id', $this->tenant_id);
    }

    public function resolvedRole(): ?UserRole
    {
        return is_string($this->role) ? UserRole::tryFrom(str_replace('-', '_', $this->role)) : null;
    }

    public function isSuperAdmin(): bool
    {
        if (DatabaseIsolationMode::isolated()) {
            return $this->resolvedRole()?->isSuperAdmin() ?? false;
        }

        return ($this->resolvedRole()?->isSuperAdmin() ?? false) || $this->isUserRole('super-admin');
    }

    public function roleModels(): Collection
    {
        return app(RoleAccess::class)->rolesForUser($this);
    }

    public function getRolesListAttribute(): string
    {
        return $this->roleModels()
            ->pluck('name')
            ->filter()
            ->implode(', ');
    }

    public function isUserRole(string $roleToCompare): bool
    {
        $target = $this->normalizeRoleSlug($roleToCompare);
        $roleKeys = collect([$this->role])
            ->merge(is_array($this->role_ids ?? null) ? $this->role_ids : [])
            ->merge(is_array($this->roles ?? null) ? $this->roles : [])
            ->map(fn (mixed $role): ?string => $this->roleKey($role))
            ->filter()
            ->map(fn (string $role): string => $this->normalizeRoleSlug($role));

        if ($roleKeys->contains($target)) {
            return true;
        }

        return $this->roleModels()
            ->pluck('slug')
            ->map(fn (mixed $role): string => $this->normalizeRoleSlug((string) $role))
            ->contains($target);
    }

    public function checkPermission(string $tab): bool
    {
        return $this->hasAnyModuleAction($tab);
    }

    public function checkPermissionId(string $tab): bool
    {
        return $this->hasAnyModuleAction($tab);
    }

    public function checkModulePermissions(string $model): array
    {
        return app(RoleAccess::class)->legacyModulePermissionsForUser($this, $model);
    }

    public function checkModulePermissionAction(string $model, ?string $id = null): array
    {
        return app(RoleAccess::class)->legacyModulePermissionsForUser(
            $this,
            $model,
            $this->permissionRecord($model, $id)
        );
    }

    public function authorizeRoles(mixed $roles): bool
    {
        $roles = is_array($roles) ? $roles : [$roles];

        return collect($roles)->contains(fn (mixed $role): bool => is_string($role) && $this->isUserRole($role));
    }

    public function getSimpleObject(): array
    {
        return [
            '_id' => (string) $this->getKey(),
            'name' => $this->name,
            'email' => $this->email,
            'photo' => $this->avatar,
        ];
    }

    private function hasAnyModuleAction(string $module): bool
    {
        $access = app(RoleAccess::class);

        foreach (RoleAccess::ACTIONS as $action) {
            if ($access->canUserPerform($this, $module, $action)) {
                return true;
            }
        }

        return false;
    }

    private function permissionRecord(string $model, ?string $id): mixed
    {
        if (! $id) {
            return null;
        }

        $class = $this->permissionModelClass($model);

        if (! $class || ! class_exists($class)) {
            return null;
        }

        try {
            return $class::query()->find($id);
        } catch (\Throwable) {
            return null;
        }
    }

    private function permissionModelClass(string $model): ?string
    {
        if (class_exists($model)) {
            return $model;
        }

        $model = trim(str_replace(['App\\Models\\', 'App\\'], '', $model), '\\');

        foreach ([
            __NAMESPACE__.'\\'.$model,
            __NAMESPACE__.'\\'.class_basename($model),
        ] as $class) {
            if (class_exists($class)) {
                return $class;
            }
        }

        return null;
    }

    private function roleKey(mixed $role): ?string
    {
        if (is_array($role)) {
            foreach (['slug', 'key', 'value', '_id', 'id', 'name'] as $key) {
                if (! empty($role[$key])) {
                    return (string) $role[$key];
                }
            }

            return null;
        }

        if (is_object($role)) {
            return $this->roleKey((array) $role);
        }

        return $role === null || $role === '' ? null : (string) $role;
    }

    private function normalizeRoleSlug(string $role): string
    {
        return str_replace('_', '-', trim($role));
    }
}
