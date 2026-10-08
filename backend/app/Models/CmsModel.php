<?php

namespace App\Models;

use App\Services\PublicContent;
use App\Services\ScopeQuery;
use App\Services\WebsiteAccess;
use Illuminate\Database\Eloquent\Builder;
use MongoDB\Laravel\Eloquent\Model;

/**
 * A CMS module's records, read (or, for submissions, written) by this site.
 *
 * A model only names its module's slug in the CMS. Everything else comes from
 * the website key: the collection it lives in (and a 404 when the key does not
 * grant the module), the tenant and project every query is limited to, and -
 * through forWebsite() - which records are published, in which language and
 * country, and whether the key's issuer may only publish their own.
 *
 *     class Faq extends CmsModel { protected string $module = 'faqs'; }
 *     Faq::forWebsite($locale)->where('faq_category', $id)->orderBy('sort_order')->get();
 */
abstract class CmsModel extends Model
{
    protected $connection = 'mongodb';

    /** The module's slug in the CMS (Module Management). */
    protected string $module = '';

    /** Never taken from a request: the key decides these. */
    protected $guarded = ['_id', 'id', 'tenant_id', 'project', 'status', 'status_id', 'author_id', 'created_by', 'updated_by'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    public function getTable(): string
    {
        return app(WebsiteAccess::class)->module($this->module)['collection'];
    }

    protected static function booted(): void
    {
        // Every query: this site's tenant and project, live records only.
        static::addGlobalScope('website', function (Builder $query): void {
            $grant = app(WebsiteAccess::class)->grant();
            $query->where('tenant_id', $grant['tenant_id'])->whereNull('deleted_at')
                ->whereRaw(ScopeQuery::matches('project', [$grant['project']['id'], '*']));
        });

        // A record this site writes belongs to the key's tenant and project.
        static::creating(function (CmsModel $model): void {
            $grant = app(WebsiteAccess::class)->grant();
            $model->tenant_id = $grant['tenant_id'];
            $model->project = [$grant['project']['id']];
        });
    }

    /** What the website may show: published, live, in this language and country. */
    public function scopeForWebsite(Builder $query, ?string $locale = null): Builder
    {
        return $query->published()->inLanguage($locale)->inCountry();
    }

    /** In a status the CMS marks "published on the website", active, and not scheduled for later. */
    public function scopePublished(Builder $query): Builder
    {
        $grant = app(WebsiteAccess::class)->grant();
        $ids = $grant['statuses']['published'];
        $module = app(WebsiteAccess::class)->module($this->module);

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
