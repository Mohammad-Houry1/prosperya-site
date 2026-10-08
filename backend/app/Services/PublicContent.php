<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use MongoDB\Laravel\Query\Builder;

/**
 * Reads CMS content the way the CMS means it, for this site's key only.
 *
 * Every rule comes from the key check: the tenant, the one project, the
 * modules the key grants (and the collection each one lives in), the site's
 * languages and country, which statuses count as published or enabled, and
 * whether the key's issuer may only publish their own records.
 */
final class PublicContent
{
    public function __construct(private readonly WebsiteAccess $access) {}

    /** Live rows of a CMS collection in this site's tenant. */
    public function references(string $collection): Builder
    {
        return DB::connection('mongodb')->table($collection)
            ->where('tenant_id', $this->access->grant()['tenant_id'])
            ->whereNull('deleted_at')->where('is_active', '!=', false);
    }

    /** Reference rows (countries, languages…) whose status is enabled in the CMS, or that have none. */
    public function enabled(string $collection): Builder
    {
        $ids = $this->access->grant()['statuses']['enabled'] ?? [];

        return $this->references($collection)->where(fn ($query) => $query
            ->whereNull('status_id')->orWhere('status_id', '')->orWhereIn('status_id', $ids));
    }

    /** Published records of a module the website key grants (404 if it does not). */
    public function published(string $moduleSlug, ?string $locale = null): Builder
    {
        $grant = $this->access->grant();
        $module = $this->access->module($moduleSlug);
        $language = $this->language($locale);
        $published = $grant['statuses']['published'];

        $query = $this->references($module['collection'])
            ->whereRaw(ScopeQuery::matches('project', [$grant['project']['id'], '*']))
            ->whereRaw(ScopeQuery::matches('language', [(string) $language->id, '*'], true))
            ->whereRaw(ScopeQuery::matches('country', array_values(array_filter([$this->countryId(), '*'])), true))
            ->whereRaw(['$or' => [
                ['status_id' => ['$in' => $published]],
                ['status._id' => ['$in' => $published]],
                ['status' => ['$in' => $published]],
            ]])
            ->where(fn ($query) => $query->whereNull('published_at')->orWhere('published_at', '<=', now()));

        // The key's issuer may be limited to their own records in the CMS.
        if (in_array($module['record_scope'] ?? 'all', ['user', 'both'], true) && ! empty($module['owner_column'])) {
            $query->where(fn ($query) => $query->where($module['owner_column'], $grant['issuer_id'])
                ->orWhereNull($module['owner_column']));
        }

        return $query;
    }

    /** The requested language, which must be one the key lists; the key's default otherwise. */
    public function language(?string $locale): object
    {
        $settings = $this->access->grant()['website_settings'] ?? [];
        $code = $locale ?: ($settings['default_locale'] ?? null);
        abort_unless(is_string($code) && in_array($code, $settings['locales'] ?? [], true), 422, 'Choose an available language.');

        $language = $this->enabled('ref_languages')->where('code', $code)->first();
        abort_unless($language, 422, 'Choose an available language.');

        return $language;
    }

    /** The site's country from the key, or null: then only country-unassigned content is served. */
    public function countryId(): ?string
    {
        $code = $this->access->grant()['website_settings']['country'] ?? null;
        if (! is_string($code) || $code === '') {
            return null;
        }
        $country = $this->enabled('ref_countries')->where('code', $code)->first();
        abort_unless($country, 503, 'Service temporarily unavailable.');

        return (string) $country->id;
    }

    /** A text field in the requested language: the translations sidecar, then a locale map, then the plain value. */
    public function text(object $record, string $field, string $locale): string
    {
        $default = $this->access->grant()['website_settings']['default_locale'] ?? $locale;
        $override = (array) (((array) ($record->translations ?? []))[$locale] ?? []);
        $value = $override[$field] ?? $record->{$field} ?? '';
        if (is_string($value)) {
            return $value;
        }
        $values = (array) $value;
        foreach ([$locale, $default] as $key) {
            if (is_string($values[$key] ?? null) && $values[$key] !== '') {
                return $values[$key];
            }
        }
        foreach ($values as $candidate) {
            if (is_string($candidate) && $candidate !== '') {
                return $candidate;
            }
        }

        return '';
    }

    /** The public shape of an article. Add fields deliberately; never return the whole record. */
    public function article(object $record, string $locale, bool $detail = false): array
    {
        $data = ['id' => (string) $record->id, 'slug' => $record->slug ?? '',
            'title' => $this->text($record, 'article_title', $locale) ?: $this->text($record, 'name', $locale),
            'excerpt' => $this->text($record, 'article_small_description', $locale),
            'featured' => (bool) ($record->featured ?? false), 'category_id' => $record->article_category ?? null,
            'published_at' => $record->published_at ?? null];
        if ($detail) {
            $data['body'] = $this->text($record, 'article_description', $locale);
        }

        return $data;
    }

    /** The status a new submission to this module starts in: its "Default for new records" status in the CMS. */
    public function defaultStatus(string $moduleSlug): object
    {
        $module = $this->access->module($moduleSlug);
        $status = $this->references('ref_statuses')->where('modules', $module['id'])
            ->where('is_default', true)->orderBy('sort_order')->orderBy('_id')->first();
        abort_unless($status, 503, 'Service temporarily unavailable.');

        return $status;
    }
}
