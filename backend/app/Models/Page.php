<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use App\Rules\CmsGallery;
use App\Rules\CmsMedia;
use App\Rules\LocaleMap;
use App\Support\CurrentTenant;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class Page extends ContentEntity
{
    use Trashable;

    /** Embedded block UUIDs identify one block across all visible Pages. */
    public function prepareClone(): void
    {
        $blocks = $this->blocks;
        if ($blocks instanceof Collection) {
            $blocks = $blocks->all();
        }
        if (! is_array($blocks)) {
            return;
        }

        $this->blocks = array_values(array_map(static fn (array $block): array => [
            ...$block,
            'id' => (string) Str::uuid(),
        ], $blocks));
    }

    protected $table = 'pages';

    /**
     * Fields the dedicated CMS Translation page manages.
     *
     * Not a statement about form components: a normal create/edit form may use
     * a localized input for a field that is not listed here.
     */
    public array $translatable = [
        'name',
    ];

    /**
     * TRANSITIONAL — the scope Page participates in today, stated explicitly.
     *
     * These are the values the controller default was already supplying; the
     * declaration removes the hidden default without changing behaviour, order
     * included. It does not settle whether country belongs here — the
     * scope-semantics phase decides that.
     */
    public array $scopeFields = [
        'language',
        'country',
        'project',
    ];

    /**
     * What Page search matches: the name, the slug and the translated text
     * fields. `content` and the meta fields are not list columns in $fields,
     * so they are declared here explicitly.
     */
    public array $searchable = [
        'name',
        'slug',
        'description',
        'content',
        'meta_title',
        'meta_url',
        'meta_description',
    ];

    /**
     * Nothing outside the Page document points at a Page.
     *
     * Blocks are an embedded array on the record itself, so they travel with it
     * and cannot be orphaned by a delete. Declaring the empty contract is what
     * lets destroy() consult the shared dependency guard against something real
     * rather than an absent property.
     */
    public array $dependents = [];

    public bool $export = true;

    public bool $reordering = true;

    public bool $allowCloning = true;

    public array $fields = [
        ['key' => 'name', 'name' => 'Name', 'width' => '30%', 'sortable' => true, 'localized' => true],
        ['key' => 'slug', 'name' => 'Slug', 'sortable' => true],
        ['key' => 'description', 'name' => 'description', 'sortable' => true],
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
        [
            'key' => 'page_category',
            'name' => 'Category',
            'type' => 'object',
            'source' => 'page_categories',
            'getter' => 'getPageCategoriesList',
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
        [
            'key' => 'project',
            'name' => 'All Projects',
            'type' => 'select',
            'source' => 'projects',
            'getter' => 'getProjectsList',
            'search' => [
                'condition' => ['project'],
            ],
        ],
        [
            'key' => 'status',
            'name' => 'All Status',
            'type' => 'select',
            'source' => 'statuses',
            'module' => 'pages',
            'getter' => 'getStatusesList',
            'search' => [
                'condition' => ['status'],
            ],
        ],
        [
            'key' => 'page_category',
            'name' => 'All Categories',
            'type' => 'select',
            'source' => 'page_categories',
            'getter' => 'getPageCategoriesList',
            'search' => [
                'condition' => ['page_category'],
            ],
        ],
    ];

    /**
     * What a Page accepts.
     *
     * Every module used to validate against one shared union, so Page accepted
     * `decimal_places`, `phone_code` and forty other fields belonging to
     * reference modules. Declaring the rules here is what makes the contract
     * Page's own — and what the closed input boundary and the form's published
     * `writable_fields` are both derived from, so all three agree by
     * construction.
     *
     * Scope (`language`, `country`, `project`) is deliberately absent: it comes
     * from $scopeFields and stays the shared layer's, because the backfill from
     * workspace context has to run before anything requires a value. Uploaded
     * files are also the shared layer's, overlaid on the media roots below only
     * when a file actually arrives.
     *
     * The tenant is passed in rather than looked up: a model that resolves the
     * current tenant itself is a model that behaves differently depending on
     * who is asking.
     *
     * @return array<string, mixed>
     */
    public function validationRules(string $tenantId): array
    {
        $isUpdate = $this->exists;
        $sometimes = $isUpdate ? ['sometimes'] : [];

        // A name freed by deletion has to be reusable without emptying the
        // trash first, so a trashed record does not reserve its slug.
        $slug = $this->uniqueWithinTenant($tenantId, 'slug');

        return [
            // The record's identity in every list, picker and breadcrumb.
            'name' => [...$sometimes, 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', $slug],

            // Field-local locale maps only (`{}` when empty). A bare string is
            // the legacy shape the M4 migration removed; it is refused, not wrapped.
            'description' => ['nullable', new LocaleMap],
            'description.*' => ['nullable', 'string'],
            'content' => ['nullable', new LocaleMap],
            'content.*' => ['nullable', 'string'],
            'meta_title' => ['nullable', new LocaleMap],
            'meta_title.*' => ['nullable', 'string', 'max:255'],
            'meta_url' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', new LocaleMap],
            'meta_description.*' => ['nullable', 'string'],
            'meta_keywords' => LocaleMap::rules(),
            'meta_type' => ['nullable', 'string', 'max:100'],

            'page_category' => ['nullable'],
            'status' => [...$sometimes, 'required'],
            'published_at' => ['nullable', 'date'],

            'translations' => ['nullable', 'array'],
            'translations.*' => ['array'],

            // Media, declared rather than inferred. CmsMedia leaves a stored
            // object, a bare URL string and null exactly as they are — the read
            // payload is what an edit form sends back — and holds an actual
            // upload to the image constraints. Shared core reads these
            // declarations instead of keeping its own list of field names.
            'thumbnail' => ['nullable', CmsMedia::uploadable()],
            'cover_image' => ['nullable', CmsMedia::uploadable()],
            'meta_image' => ['nullable', CmsMedia::uploadable()],
            'gallery' => ['nullable', 'array', new CmsGallery],
        ];
    }

    public function getStatusesList(): array
    {
        return Status::query()
            ->forModule('pages')
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

    public function getPageCategoriesList(): array
    {
        $tenantId = CurrentTenant::id();

        if (! $tenantId) {
            return [];
        }

        return PageCategory::query()
            ->orderBy('name')
            ->get()
            ->all();
    }

    public function category()
    {
        return $this->belongsTo(PageCategory::class, 'page_category');
    }
}
