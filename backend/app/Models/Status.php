<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;
use App\Rules\CmsMedia;
use App\Support\CurrentTenant;
use App\Support\ReferenceDataRegistry;
use App\Support\StatusDependencyDiscovery;
use App\Support\StatusRules;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use MongoDB\BSON\Regex;

class Status extends ReferenceEntity
{
    protected $table = 'ref_statuses';

    public string $referenceIdentityField = 'slug';

    protected function casts(): array
    {
        // Forms send '1'/'0'; StatusRules compares real booleans.
        return [...parent::casts(), 'record_enabled' => 'boolean', 'record_published' => 'boolean', 'is_default' => 'boolean'];
    }

    protected static function booted(): void
    {
        parent::booted();

        // StatusRules reads statuses once per request; a status written in
        // this request must be seen by the next question it is asked.
        $forget = fn () => app(StatusRules::class)->forget();
        static::saved($forget);
        static::deleted($forget);
    }

    public array $translatable = ['name'];

    // Nothing is listed: every module whose records carry a status is found
    // by discoveredDependents(), so a status in use by any module - including
    // one added later - cannot be deleted.
    public array $dependents = [];

    /**
     * The rest of them — this tenant's own status-carrying modules.
     *
     * The list above can only name what the deployment already knew about, and
     * an ordinary content module added without the core learning its name can
     * hold a status just as well (AR15). Those are discovered from the tenant's
     * persisted Module rows rather than registered here, so the fifteenth module
     * needs no edit to this file.
     *
     * @param  list<array{0: string, 1: string, 2: string}>  $declared
     * @return list<array{0: string, 1: string, 2: string}>
     */
    public function discoveredDependents(string $tenantId, array $declared = []): array
    {
        return app(StatusDependencyDiscovery::class)->forTenant($tenantId, $declared);
    }

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'modules', 'name' => 'Modules', 'type' => 'objects', 'source' => 'modules'],
        ['key' => 'color', 'name' => 'Text Color', 'type' => 'color'],
        ['key' => 'back_color', 'name' => 'Background', 'type' => 'color'],
        ['key' => 'is_active', 'name' => 'Active', 'type' => 'boolean'],
        ['key' => 'record_enabled', 'name' => 'Enables Records', 'type' => 'boolean'],
        ['key' => 'record_published', 'name' => 'Published', 'type' => 'boolean'],
        ['key' => 'is_default', 'name' => 'Default', 'type' => 'boolean'],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $filters = [
        ['key' => 'modules', 'name' => 'All Modules', 'type' => 'select', 'options_source' => 'modules', 'multiple' => true],
        ['key' => 'is_active', 'name' => 'All Status', 'type' => 'select', 'options' => [
            ['value' => true, 'label' => 'Active'],
            ['value' => false, 'label' => 'Inactive'],
        ]],
    ];

    /**
     * One status slug per tenant, regardless of how it is capitalised.
     *
     * The slug is the status's only identity - code finds a status by it - so
     * `active` and `Active` are one status. The database refuses the pair
     * (case-insensitive unique index); this is the same rule at the request
     * boundary, so the caller gets a named validation error.
     */
    protected function uniqueSlugWithinTenant(string $tenantId): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($tenantId): void {
            $canonical = ReferenceDataRegistry::canonicalStatusSlug($value);

            if ($canonical === '') {
                return;
            }

            $query = static::query()
                ->withoutGlobalScopes()
                ->where('tenant_id', $tenantId)
                ->whereNull('deleted_at')
                ->where('slug', 'regex', new Regex('^'.preg_quote($canonical, '/').'$', 'i'));

            if ($this->getKey()) {
                $query->where('_id', '!=', $this->getKey());
            }

            if ($query->exists()) {
                $fail('This status slug is already used by this tenant.');
            }
        };
    }

    public function scopeForModule(Builder $query, string $module): Builder
    {
        $tenantId = CurrentTenant::id();

        if (! $tenantId) {
            return $query->where('_id', '__missing_tenant__');
        }

        $moduleKey = Str::kebab($module);
        // Slug first: several rows can share a technical module (`users` and
        // `profile` are both User), and matching either in one query let
        // whichever row came back first decide — so Users could be handed My
        // Profile's (empty) statuses.
        $moduleModel = Module::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('slug', array_values(array_unique([
                $module,
                $moduleKey,
                Str::singular($moduleKey),
                Str::plural($moduleKey),
            ])))
            ->first()
            ?? Module::query()
                ->where('tenant_id', $tenantId)
                ->whereIn('technical_module', array_values(array_unique([
                    $module,
                    $moduleKey,
                    Str::studly(Str::singular($moduleKey)),
                ])))
                ->first();

        if (! $moduleModel) {
            return $query->where('_id', '__missing_module__');
        }

        return $query
            ->where('tenant_id', $tenantId)
            ->where('modules', (string) $moduleModel->getKey());
    }

    /**
     * What a Status accepts.
     *
     * Extracted from the shared union rather than invented: every rule here is
     * the rule this module already enforced.
     *
     * There is deliberately no `status`: this module is the status vocabulary,
     * so it has nothing to point at. `modules` is validated for shape only —
     * whether the ids resolve to real Module rows is StatusController's check,
     * with its own message, and that split is older than this contract and
     * stays where it is.
     *
     * @return array<string, mixed>
     */
    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'modules' => [...$sometimes, 'required', 'array'],
            'modules.*' => ['nullable'],
            'color' => ['nullable', 'string', 'max:20'],
            'back_color' => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
            // What the status means, decided in the CMS rather than by a list of
            // names in code: records in it are enabled (users can sign in, keys
            // work, modules and references are available), published on the
            // website, and whether new records/submissions start in it.
            'record_enabled' => ['nullable', 'boolean'],
            'record_published' => ['nullable', 'boolean'],
            'is_default' => ['nullable', 'boolean'],
            // A media value that is never uploaded to. Shared core used to
            // normalise this root because its own list happened to name it,
            // which also made a posted file pass image validation and then
            // crash the driver. The shape stays; the accidental upload door
            // does not.
            'icon' => ['nullable', CmsMedia::valueOnly()],
            'slug' => [...($this->exists ? ['sometimes', 'required'] : ['nullable']), 'string', 'max:255', $this->uniqueSlugWithinTenant($tenantId)],
            'description' => ['nullable'],
            'description.*' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
