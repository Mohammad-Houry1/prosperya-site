<?php

namespace App\Models\Base;

use App\Models\Concerns\StoresNativeArrays;
use MongoDB\Laravel\Eloquent\Model;

/**
 * Site version of the CMS's App\Models\Base\MongoModel.
 *
 * The model files in app/Models are copied unchanged from the CMS
 * (`php artisan cms:sync-models`); the classes they extend - this folder -
 * belong to this site and read the CMS database through the website key.
 */
abstract class MongoModel extends Model
{
    // Arrays stay native MongoDB arrays (as the CMS stores them), not JSON strings.
    use StoresNativeArrays;

    protected $connection = 'mongodb';
}
