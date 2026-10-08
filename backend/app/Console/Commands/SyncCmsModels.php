<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Copies the CMS's model files into app/Models, unchanged.
 *
 * Only the top-level model files are copied. What they extend and use -
 * app/Models/Base, app/Models/Concerns, app/Models/Traits, app/Traits - is
 * this site's own (same names, website-key behaviour) and is never touched.
 * CMS-internal models (accounts, keys, roles, logs, locks, versions) are not
 * copied: a website has no business reading them.
 */
class SyncCmsModels extends Command
{
    protected $signature = 'cms:sync-models {path? : The CMS app/Models folder}';

    protected $description = 'Copy the CMS model files into app/Models';

    private const SKIP = [
        'ActivityLog', 'ApiKey', 'ContentVersion', 'Dashboard', 'EditLock', 'ExportJob', 'Module',
        'PersonalAccessToken', 'ProjectActivityLog', 'ProjectMembership', 'ProjectVersion',
        'ReferenceConfig', 'Role', 'Setting', 'Tenant', 'User',
    ];

    public function handle(): int
    {
        $source = $this->argument('path') ?: config('website.cms_models_path');
        if (! is_string($source) || ! is_dir($source)) {
            $this->error('Give the CMS app/Models folder: php artisan cms:sync-models ../../cloud-cms-engine123/backend/app/Models');

            return self::FAILURE;
        }

        $copied = [];
        foreach (File::files($source) as $file) {
            $name = $file->getFilenameWithoutExtension();
            if ($file->getExtension() !== 'php' || in_array($name, self::SKIP, true)) {
                continue;
            }
            File::copy($file->getPathname(), app_path('Models/'.$file->getFilename()));
            $copied[] = $name;
        }

        $this->info('Copied '.count($copied).' models: '.implode(', ', $copied));

        return self::SUCCESS;
    }
}
