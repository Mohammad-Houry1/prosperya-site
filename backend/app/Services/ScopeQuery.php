<?php

namespace App\Services;

final class ScopeQuery
{
    public static function matches(string $field, array $ids, bool $shared = false): array
    {
        // Null/empty references belong to the field itself, never to a missing
        // snapshot ID (which would accidentally match unrelated records).
        $referenceIds = array_values(array_filter($ids, 'is_string'));
        $variants = [[$field => ['$in' => $ids]]];
        if ($referenceIds !== []) {
            $variants[] = [$field.'._id' => ['$in' => $referenceIds]];
        }
        if ($field === 'status') {
            $variants[] = ['status_id' => ['$in' => $referenceIds]];
        }
        if ($shared) {
            $variants[] = [$field => null];
            $variants[] = [$field => []];
        }

        return ['$or' => $variants];
    }
}
