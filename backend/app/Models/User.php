<?php

namespace App\Models;

use App\Models\Base\ContentEntity;

/** Read-only public profiles from the CMS users collection; no auth behavior. */
class User extends ContentEntity
{
    protected $table = 'users';

    public array $scopeFields = ['project', 'country', 'language', 'role', 'role_ids', 'roles'];

    protected $hidden = ['password', 'remember_token', 'email', 'contact_methods', 'locker'];

    protected $visible = ['_id', 'id', 'slug', 'name', 'position', 'bio', 'avatar', 'company_name', 'translations'];

    public function toArray(): array
    {
        $data = parent::toArray();
        foreach ($data['translations'] ?? [] as $locale => $fields) {
            $data['translations'][$locale] = array_intersect_key((array) $fields,
                array_flip(['name', 'position', 'bio', 'company_name']));
        }
        return $data;
    }
}
