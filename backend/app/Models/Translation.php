<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;

class Translation extends ContentEntity
{
    use Trashable;

    protected $table = 'translations';

    public string $primaryField = 'key';

    public array $scopeFields = ['project', 'country', 'language'];

    public bool $usesAuthor = false;
}
