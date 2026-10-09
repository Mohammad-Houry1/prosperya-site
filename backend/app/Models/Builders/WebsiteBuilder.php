<?php

namespace App\Models\Builders;

use App\Services\ScopeQuery;
use Illuminate\Contracts\Support\Arrayable;
use MongoDB\Laravel\Eloquent\Builder;

/** Normal reference filters work with either CMS IDs or embedded snapshots. */
class WebsiteBuilder extends Builder
{
    public function where($column, $operator = null, $value = null, $boolean = 'and')
    {
        $referenceValue = func_num_args() === 2 ? $operator : $value;
        $equality = func_num_args() === 2 || $operator === '=';

        if ($equality && is_string($referenceValue) && $this->isReference($column)
            && in_array($boolean, ['and', 'or'], true)) {
            $this->query->whereRaw(ScopeQuery::matches($column, [$referenceValue]), [], $boolean);

            return $this;
        }

        return parent::where(...func_get_args());
    }

    public function whereIn($column, $values, $boolean = 'and', $not = false)
    {
        $ids = $values instanceof Arrayable ? $values->toArray() : $values;
        if (! $not && $this->isReference($column) && is_array($ids)
            && count(array_filter($ids, fn ($id) => is_string($id) || $id === null || $id === [])) === count($ids)
            && in_array($boolean, ['and', 'or'], true)) {
            $this->query->whereRaw(ScopeQuery::matches($column, array_values($ids)), [], $boolean);
        } else {
            $this->query->whereIn($column, $values, $boolean, $not);
        }

        return $this;
    }

    public function orWhereIn($column, $values)
    {
        return $this->whereIn($column, $values, 'or');
    }

    private function isReference(mixed $column): bool
    {
        if (! is_string($column)) {
            return false;
        }
        if ($column === 'status') {
            return true;
        }
        if (in_array($column, $this->model->scopeFields ?? [], true)) {
            return true;
        }
        foreach ($this->model->fields ?? [] as $field) {
            $type = $field['type'] ?? null;
            $inputType = $field['input']['type'] ?? null;
            if (($field['key'] ?? null) === $column
                && (in_array($type, ['object', 'objects'], true) || in_array($inputType, ['object', 'objects'], true))) {
                return true;
            }
        }
        foreach ($this->model->dependents ?? [] as $dependent) {
            if (($dependent[0] ?? null) === get_class($this->model) && ($dependent[1] ?? null) === $column) {
                return true;
            }
        }

        return false;
    }
}
