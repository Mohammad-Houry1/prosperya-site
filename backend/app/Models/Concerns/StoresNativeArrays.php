<?php

namespace App\Models\Concerns;

/**
 * Keep array-cast attributes as arrays in the document.
 *
 * Laravel's 'array' cast json_encodes on write, which is correct for a text
 * column and wrong for MongoDB: the field becomes a string, so every query
 * that filters on it matches nothing. The damage is invisible from the
 * application, because the cast decodes the string again on read — the record
 * looks right while vanishing from any listing that filters on that field.
 *
 * MongoDB stores arrays and documents natively, so the encoding step is pure
 * loss. Reads still accept a JSON string, which keeps rows written before this
 * was fixed working.
 */
trait StoresNativeArrays
{
    public function setAttribute($key, $value)
    {
        if ($this->shouldStoreNativeArrayAttribute($key, $value)) {
            $this->attributes[$key] = $value;

            return $this;
        }

        return parent::setAttribute($key, $value);
    }

    protected function castAttribute($key, $value)
    {
        if (is_array($value)) {
            $castType = $this->getCastType($key);

            if (in_array($castType, ['array', 'json', 'collection'], true)) {
                return $value;
            }

            if ($castType === 'object') {
                return (object) $value;
            }
        }

        return parent::castAttribute($key, $value);
    }

    private function shouldStoreNativeArrayAttribute(string $key, mixed $value): bool
    {
        if (! is_array($value)) {
            return false;
        }

        $cast = $this->getCasts()[$key] ?? null;

        if (! is_string($cast)) {
            return false;
        }

        return in_array(strtolower($cast), ['array', 'json', 'object', 'collection'], true);
    }
}
