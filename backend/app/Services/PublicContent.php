<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use MongoDB\Laravel\Query\Builder;

/**
 * The lookups every model and controller shares, all decided by the website
 * key: the site's language and country, translated text, reference lists,
 * and the status a new submission starts in. Module records themselves are
 * read through the models (App\Models\CmsModel::forWebsite()).
 */
final class PublicContent
{
    private array $languages = [];
    public function __construct(private readonly WebsiteAccess $access) {}

    /** Live rows of a CMS collection in this site's tenant (reference data such as languages, countries, statuses). */
    public function references(string $collection): Builder
    {
        return DB::connection('mongodb')->table($collection)
            ->where('tenant_id', $this->access->grant()['tenant_id'])
            ->whereNull('deleted_at')->where('is_active', '!=', false);
    }

    /** Reference rows whose status is enabled in the CMS, or that have none. */
    public function enabled(string $collection): Builder
    {
        $ids = $this->access->grant()['statuses']['enabled'] ?? [];

        return $this->references($collection)->where(fn ($query) => $query
            ->whereNull('status_id')->orWhere('status_id', '')->orWhereIn('status_id', $ids));
    }

    /** The requested language, which must be one the key lists; the key's default otherwise. */
    public function language(?string $locale): object
    {
        $settings = $this->access->grant()['website_settings'] ?? [];
        $code = $locale ?: ($settings['default_locale'] ?? null);
        abort_unless(is_string($code) && in_array($code, $settings['locales'] ?? [], true), 422, 'Choose an available language.');

        if (isset($this->languages[$code])) {
            return $this->languages[$code];
        }

        $language = $this->enabled('ref_languages')->where('code', $code)->first();
        abort_unless($language, 422, 'Choose an available language.');

        return $this->languages[$code] = $language;
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

    /** Suggested values for public endpoints; callers explicitly apply each filter. */
    public function filters(string $locale): array
    {
        $grant = $this->access->grant();
        $projectId = $grant['project']['id'] ?? null;
        abort_unless(is_string($projectId) && $projectId !== '', 503, 'Service temporarily unavailable.');
        $countryId = $this->countryId();

        return [
            'project' => [$projectId, '*'],
            'status' => $grant['statuses']['published'],
            'country' => [...($countryId ? [$countryId] : []), '*', null, []],
            'language' => [(string) $this->language($locale)->id, '*', null, []],
        ];
    }

    /** A text field in the requested language: the translations sidecar, then a locale map, then the plain value. */
    public function text(object $record, string $field, string $locale): string
    {
        $translations = (array) ($record->translations ?? []);
        $override = (array) ($translations[$locale] ?? $translations[(string) $this->language($locale)->id] ?? []);
        $value = $override[$field] ?? $record->{$field} ?? '';
        if (is_string($value)) {
            return $value;
        }
        $values = (array) $value;
        return is_string($values[$locale] ?? null) ? $values[$locale] : '';
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
