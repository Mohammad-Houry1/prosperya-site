<?php

namespace App\Models;

use App\Models\Base\ContentEntity;

class SiteData extends ContentEntity
{
    protected $table = 'site_data';

    public string $primaryField = 'name';

    public array $scopeFields = ['project', 'country', 'language'];

    public bool $usesAuthor = false;
}
