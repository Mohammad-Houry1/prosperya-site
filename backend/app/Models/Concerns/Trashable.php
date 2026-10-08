<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\SoftDeletes;

/** Site version of the CMS trait (which is Laravel soft deletes): trashed records are hidden. */
trait Trashable
{
    use SoftDeletes;
}
