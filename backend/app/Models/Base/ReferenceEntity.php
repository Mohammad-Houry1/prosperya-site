<?php

namespace App\Models\Base;

use App\Services\WebsiteAccess;
use Illuminate\Database\Eloquent\Builder;

/**
 * Site version of the CMS's App\Models\Base\ReferenceEntity (statuses,
 * languages, countries, currencies…): the key's tenant, live rows only.
 * Reference data is shared by every project, so it is not project-scoped and
 * needs no module grant.
 */
abstract class ReferenceEntity extends ContentEntity
{
    protected static function websiteScope(Builder $query): void
    {
        $query->where('tenant_id', app(WebsiteAccess::class)->grant()['tenant_id'])->whereNull('deleted_at');
    }
}
