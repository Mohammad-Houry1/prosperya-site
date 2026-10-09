<?php

namespace App\Models;

use App\Models\Base\ContentEntity;

/** Read-only public profiles from the CMS users collection; no auth behavior. */
class User extends ContentEntity
{
    protected $table = 'users';

    public array $scopeFields = ['project', 'country', 'language', 'role', 'role_ids', 'roles'];

    protected $hidden = ['password', 'remember_token', 'email', 'contact_methods', 'locker'];
}
