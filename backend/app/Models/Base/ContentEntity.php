<?php

namespace App\Models\Base;

use App\Services\PublicContent;
use App\Services\ScopeQuery;
use App\Services\WebsiteAccess;
use Illuminate\Database\Eloquent\Builder;

/**
 * Site version of the CMS's App\Models\Base\ContentEntity: same name, so the
 * copied models work unchanged, but scoped to this site's website key.
 *
 * Every query is limited to the key's tenant and project and skips deleted
 * records, and a module the key does not grant (API Keys > modules) is a 404.
 *
 *     $published = Status::query()->where('slug', 'published')->first();
 *     Article::query()->where('status_id', $published->id)->where('article_category', $id)->get();
 *
 *     Article::forWebsite($locale)->get();   // or let the key's statuses/language/country decide
 */
abstract class ContentEntity extends MongoModel
{
    /** Never taken from a request: the key decides these. */
    protected $guarded = ['_id', 'id', 'tenant_id', 'project', 'status', 'status_id', 'author_id', 'created_by', 'updated_by'];

    protected function casts(): array
    {
        return [
            'status' => 'array', 'statusObject' => 'array', 'language' => 'array', 'country' => 'array',
            'project' => 'array', 'blocks' => 'array', 'cover_image' => 'array', 'thumbnail' => 'array',
            'gallery' => 'array', 'meta_image' => 'array', 'translations' => 'array',
            'is_active' => 'boolean', 'order' => 'integer', 'sort_order' => 'integer', 'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('website', fn (Builder $query) => static::websiteScope($query));

        // A record this site writes (a form submission) belongs to the key's tenant and project.
        static::creating(function (ContentEntity $model): void {
            $grant = app(WebsiteAccess::class)->grant();
            $model->tenant_id = $grant['tenant_id'];
            $model->project = [$grant['project']['id']];
        });
    }

    /** The key's tenant and project, live records only, and only a module the key grants. */
    protected static function websiteScope(Builder $query): void
    {
        $access = app(WebsiteAccess::class);
        $access->moduleFor(static::class);
        $grant = $access->grant();
        $query->where('tenant_id', $grant['tenant_id'])->whereNull('deleted_at')
            ->whereRaw(ScopeQuery::matches('project', [$grant['project']['id'], '*']));
    }

    /** What the website may show: published, live, in this language and country. */
    public function scopeForWebsite(Builder $query, ?string $locale = null): Builder
    {
        return $query->published()->inLanguage($locale)->inCountry();
    }

    /** In a status the CMS marks "published on the website", active, and not scheduled for later. */
    public function scopePublished(Builder $query): Builder
    {
        $access = app(WebsiteAccess::class);
        $grant = $access->grant();
        $ids = $grant['statuses']['published'];
        $module = $access->moduleFor(static::class);

        $query->where('is_active', '!=', false)
            ->whereRaw(['$or' => [['status_id' => ['$in' => $ids]], ['status._id' => ['$in' => $ids]], ['status' => ['$in' => $ids]]]])
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));

        // The key's issuer may be limited to their own records in the CMS.
        if (in_array($module['record_scope'] ?? 'all', ['user', 'both'], true) && ! empty($module['owner_column'])) {
            $query->where(fn ($q) => $q->where($module['owner_column'], $grant['issuer_id'])->orWhereNull($module['owner_column']));
        }

        return $query;
    }

    /** Assigned to this language (one of the key's), or to every language. */
    public function scopeInLanguage(Builder $query, ?string $locale = null): Builder
    {
        $language = app(PublicContent::class)->language($locale);

        return $query->whereRaw(ScopeQuery::matches('language', [(string) $language->id, '*'], true));
    }

    /** Assigned to the key's country, or to none (shared). */
    public function scopeInCountry(Builder $query): Builder
    {
        $country = app(PublicContent::class)->countryId();

        return $query->whereRaw(ScopeQuery::matches('country', array_values(array_filter([$country, '*'])), true));
    }

    /** A field's text in this language (translations, a locale map, or the plain value). */
    public function text(string $field, string $locale): string
    {
        return app(PublicContent::class)->text($this, $field, $locale);
    }
}
