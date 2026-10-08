<?php

namespace App\Models;

use App\Models\Base\ReferenceEntity;
use App\Rules\CmsMedia;
use App\Rules\SafePathSegment;
use App\Support\DatabaseIsolationMode;

class Project extends ReferenceEntity
{
    public bool $centralRegistry = true;

    public function getConnectionName()
    {
        return DatabaseIsolationMode::project() ? 'mongodb_central' : parent::getConnectionName();
    }

    protected $table = 'ref_projects';

    public array $translatable = ['name'];

    public array $dependents = [
        [Page::class, 'project', 'pages'],
        [User::class, 'project', 'users'],
        [ApiKey::class, 'projects', 'API keys'],
    ];

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'sortable' => true, 'localized' => true],
        ['key' => 'code', 'name' => 'Code'],
        ['key' => 'description', 'name' => 'Description'],
        ['key' => 'color', 'name' => 'Color', 'type' => 'color'],
        ['key' => 'updated_at', 'name' => 'Updated', 'sortable' => true, 'type' => 'datetime'],
    ];

    /**
     * What a Project accepts.
     *
     * Extracted from the shared union rather than invented: every rule here is
     * the rule this module already enforced.
     *
     * There is deliberately no `status`. A Project has no status column, no
     * rule for one, and it was the only module the retired shared required-field
     * switch left it out of. `icon` is an ordinary value
     * here, as it is everywhere: nothing uploads it.
     *
     * @return array<string, mixed>
     */
    public function validationRules(string $tenantId): array
    {
        $sometimes = $this->exists ? ['sometimes'] : [];

        return [
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'code' => [...$sometimes, 'required', 'string', 'max:100', new SafePathSegment, $this->uniqueWithinTenant($tenantId, 'code')],
            'description' => ['nullable'],
            'description.*' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:20'],
            // A media value that is never uploaded to. Shared core used to
            // normalise this root because its own list happened to name it,
            // which also made a posted file pass image validation and then
            // crash the driver. The shape stays; the accidental upload door
            // does not.
            'icon' => ['nullable', CmsMedia::valueOnly()],
            'slug' => ['nullable', 'string', 'max:255', $this->uniqueWithinTenant($tenantId, 'slug')],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
