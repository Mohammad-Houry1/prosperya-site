<?php

namespace App\Support;

/**
 * Site version of the CMS helper the copied models call. The site reads the
 * one CMS database in MONGODB_DATABASE, so no model switches connection.
 */
final class DatabaseIsolationMode
{
    public static function current(): ?string
    {
        return null;
    }

    public static function project(): bool
    {
        return false;
    }

    public static function isolated(): bool
    {
        return false;
    }
}
