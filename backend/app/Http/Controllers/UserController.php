<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use Illuminate\Http\Request;

class UserController
{
    public function getUsers(Request $request, PublicContent $content, PublicPayload $payload, ?string $slug = null): array
    {
        $params = $request->validate([
            'locale' => ['sometimes', 'string', 'max:20'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1'],
            'role' => ['sometimes', 'string', 'max:255'],
            'roles' => ['sometimes', 'array', 'min:1', 'max:20'],
            'roles.*' => ['required', 'string', 'max:255', 'distinct'],
            'role_id' => ['sometimes', 'string', 'regex:/^[a-f0-9]{24}$/i'],
            'ids' => ['sometimes', 'array', 'min:1', 'max:50'],
            'ids.*' => ['required', 'string', 'regex:/^[a-f0-9]{24}$/i', 'distinct:ignore_case'],
        ]);
        $locale = $content->language($params['locale'] ?? null)->code;
        $filters = $content->filters($locale);
        $query = User::forWebsite()
            ->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)->where('is_approved', '!=', false);

        if (isset($params['ids'])) {
            $query->whereIn('_id', array_map('strtolower', $params['ids']));
        }

        $roles = array_values(array_unique([...($params['roles'] ?? []),
            ...(isset($params['role']) ? [$params['role']] : []),
            ...(isset($params['role_id']) ? [$params['role_id']] : [])]));
        if ($roles !== []) {
            $ids = array_values(array_filter($roles, fn ($value) => preg_match('/^[a-f0-9]{24}$/i', $value)));
            $records = $content->references('roles')->where(function ($q) use ($roles, $ids) {
                $q->whereIn('slug', $roles);
                if ($ids !== []) $q->orWhereIn('_id', $ids);
            })->get(['_id', 'slug']);
            abort_if($records->isEmpty(), 404, 'Role not found.');
            $roleIds = $records->map(fn ($row) => (string) $row->id)->all();
            $roleSlugs = $records->pluck('slug')->filter()->values()->all();
            $query->where(fn ($q) => $q->whereIn('role', [...$roleIds, ...$roleSlugs])
                ->orWhereIn('role_ids', $roleIds)->orWhereIn('roles', [...$roleIds, ...$roleSlugs]));
        }

        $query->select(['_id', 'slug', 'name', 'position', 'bio', 'avatar', 'translations']);
        if ($slug !== null) {
            return ['data' => $payload->user($query->where('slug', $slug)->firstOrFail(), $locale)];
        }
        $page = $query->orderBy('name')->orderBy('_id')->paginate(min(50, (int) ($params['per_page'] ?? 20)));

        return ['data' => $page->getCollection()->map(fn ($row) => $payload->user($row, $locale)),
            'meta' => $payload->pagination($page)];
    }
}
