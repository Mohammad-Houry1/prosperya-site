<?php

namespace App\Traits;

use App\Services\WebsiteAccess;

/** Site version of the CMS trait: rows of the website key's tenant only. */
trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', fn ($query) => $query->where('tenant_id', app(WebsiteAccess::class)->grant()['tenant_id']));
    }
}
