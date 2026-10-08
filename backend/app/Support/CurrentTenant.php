<?php

namespace App\Support;

use App\Services\WebsiteAccess;

/** Site version of the CMS helper the copied models call: the website key's tenant. */
final class CurrentTenant
{
    public static function id(mixed $request = null): ?string
    {
        return app(WebsiteAccess::class)->grant()['tenant_id'];
    }
}
