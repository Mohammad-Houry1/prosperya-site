<?php

namespace App\Models\Concerns;

use App\Models\Base\ContentEntity;
use App\Services\WebsiteAccess;
use Illuminate\Database\Eloquent\Builder;

trait HasWebsiteScope
{
    public static function bootHasWebsiteScope(): void
    {
        static::addGlobalScope('website', fn (Builder $query) => static::websiteScope($query));
        static::creating(function (ContentEntity $model): void {
            $grant = app(WebsiteAccess::class)->grant();
            $model->tenant_id = $grant['tenant_id'];
            $model->project = [$grant['project']['id']];
        });
    }
}
