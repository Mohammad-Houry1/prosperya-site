<?php

namespace App\Models;

use App\Models\Base\MongoModel as Model;
use App\Traits\BelongsToTenant;

class MediaFolder extends Model
{
    use BelongsToTenant;

    protected $table = 'media_folders';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'project' => 'array',
        ];
    }
}
