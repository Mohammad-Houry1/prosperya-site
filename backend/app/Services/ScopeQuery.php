<?php

namespace App\Services;

final class ScopeQuery
{
    public static function matches(string $field, array $ids, bool $shared = false): array
    {
        $variants = [[$field => ['$in' => $ids]], [$field.'._id' => ['$in' => $ids]]];
        if ($shared) {
            $variants[] = [$field => null];
            $variants[] = [$field => []];
        }

        return ['$or' => $variants];
    }
}
