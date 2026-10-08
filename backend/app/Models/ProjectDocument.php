<?php

namespace App\Models;

use App\Services\ScopeQuery;
use App\Services\WebsiteAccess;
use MongoDB\Laravel\Eloquent\Model;

/**
 * A CMS record this site writes (contact submissions). Tenant and project come
 * from the website key, never from the request.
 */
class ProjectDocument extends Model
{
    protected $connection = 'mongodb';

    protected $guarded = ['_id', 'tenant_id', 'project', 'status', 'status_id', 'created_by', 'updated_by', 'author_id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'published_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        $grant = fn (): array => app(WebsiteAccess::class)->grant();
        static::addGlobalScope('ownership', fn ($query) => $query->where('tenant_id', $grant()['tenant_id'])
            ->whereRaw(ScopeQuery::matches('project', [$grant()['project']['id']]))->whereNull('deleted_at'));
        static::creating(function (ProjectDocument $document) use ($grant): void {
            $document->tenant_id = $grant()['tenant_id'];
            $document->project = [$grant()['project']['id']];
        });
    }
}
