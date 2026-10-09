<?php

namespace App\Models\Base;

use App\Services\PublicContent;
use App\Services\WebsiteAccess;
use App\Models\Concerns\HasWebsiteScope;
use App\Models\Builders\WebsiteBuilder;
use Illuminate\Database\Eloquent\Builder;

/**
 * Site version of the CMS's App\Models\Base\ContentEntity: same name, so the
 * copied models work unchanged, with access checked through this site's key.
 *
 * Every query is limited to the key's tenant and skips deleted
 * records, and a module the key does not grant (API Keys > modules) is a 404.
 *
 *     $published = Status::query()->where('slug', 'published')->first();
 *     Article::query()->where('status_id', $published->id)->where('article_category', $id)->get();
 *
 *     Article::forWebsite()->where('project', $projectId)->where('status', $statusId)->get();
 *
 * Project, status, country and language filters are explicit caller choices.
 */
abstract class ContentEntity extends MongoModel
{
    use HasWebsiteScope;
    /** Never taken from a request: the key decides these. */
    protected $guarded = ['_id', 'id', 'tenant_id', 'project', 'status', 'status_id', 'author_id', 'created_by', 'updated_by'];

    public function newEloquentBuilder($query): WebsiteBuilder
    {
        return new WebsiteBuilder($query);
    }

    protected function casts(): array
    {
        return [
            'status' => 'array', 'statusObject' => 'array', 'language' => 'array', 'country' => 'array',
            'project' => 'array', 'blocks' => 'array', 'cover_image' => 'array', 'thumbnail' => 'array',
            'gallery' => 'array', 'meta_image' => 'array', 'translations' => 'array',
            'is_active' => 'boolean', 'order' => 'integer', 'sort_order' => 'integer', 'published_at' => 'datetime',
        ];
    }

    /** Access safeguards only. Content filters belong to the caller. */
    protected static function websiteScope(Builder $query): void
    {
        $access = app(WebsiteAccess::class);
        $module = $access->moduleFor(static::class);
        $grant = $access->grant();
        $query->where('tenant_id', $grant['tenant_id'])->whereNull('deleted_at');

        // The key's issuer may be limited to their own records in the CMS.
        if (in_array($module['record_scope'] ?? 'all', ['user', 'both'], true) && ! empty($module['owner_column'])) {
            $query->where(fn ($q) => $q->where($module['owner_column'], $grant['issuer_id'])->orWhereNull($module['owner_column']));
        }

    }

    /** Validate the key without choosing project, status, country or language filters. */
    public function scopeForWebsite(Builder $query): Builder
    {
        app(WebsiteAccess::class)->grant();

        return $query;
    }

    /** A field's text in this language (translations, a locale map, or the plain value). */
    public function text(string $field, string $locale): string
    {
        return app(PublicContent::class)->text($this, $field, $locale);
    }
}
