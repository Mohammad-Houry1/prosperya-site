<?php

namespace App\Models;

use App\Models\Base\ContentEntity;
use App\Models\Concerns\Trashable;
use Closure;

class Newsletter extends ContentEntity
{
    use Trashable;

    protected $table = 'newsletters';

    public string $primaryField = 'email';

    public array $scopeFields = ['project', 'country', 'language'];

    public array $translatable = [];

    public array $searchable = ['email', 'origin'];

    public array $dependents = [];

    public bool $canCreate = false;

    public bool $canEdit = true;

    public bool $allowCloning = false;

    public bool $export = false;

    public array $requiredMongoIndexes = [
        [
            'keys' => ['tenant_id' => 1, 'website_project_id' => 1, 'email' => 1],
            'unique' => true,
            'partial' => ['deleted_at' => null, 'website_project_id' => ['$type' => 'string']],
        ],
    ];

    protected static function booted(): void
    {
        static::saving(function (self $newsletter): void {
            if ($newsletter->website_project_id) {
                $newsletter->email = mb_strtolower(trim((string) $newsletter->email));
            }
        });
    }

    public array $defaultSort = ['column' => 'created_at', 'direction' => 'desc'];

    public array $fields = [
        ['key' => 'email', 'name' => 'Email', 'sortable' => true],
        ['key' => 'created_at', 'name' => 'Submitted At', 'sortable' => true, 'type' => 'datetime'],
        ['key' => 'origin', 'name' => 'Origin', 'sortable' => true],
        ['key' => 'is_subscribed', 'name' => 'Subscribed', 'sortable' => true, 'type' => 'boolean'],
        ['key' => 'updated_at', 'name' => 'Updated At', 'sortable' => true, 'type' => 'datetime'],
    ];

    public array $filters = [
        ['key' => 'created_at', 'name' => 'Submission Date', 'type' => 'date_range'],
        ['key' => 'is_subscribed', 'name' => 'All Subscription States', 'type' => 'select', 'options' => [
            ['value' => '1', 'label' => 'Subscribed'],
            ['value' => '0', 'label' => 'Unsubscribed'],
        ]],
    ];

    protected function casts(): array
    {
        return [...parent::casts(), 'is_subscribed' => 'boolean'];
    }

    public function validationRules(string $tenantId): array
    {
        $emailRules = ['required', 'email', 'max:255'];
        if ($this->website_project_id) {
            $emailRules[] = function (string $attribute, mixed $value, Closure $fail) use ($tenantId): void {
                $query = self::withoutGlobalScopes()->where('tenant_id', $tenantId)
                    ->where('website_project_id', $this->website_project_id)->whereNull('deleted_at')
                    ->where('email', mb_strtolower(trim((string) $value)));
                if ($this->exists) {
                    $query->where('_id', '!=', $this->getKey());
                }
                if ($query->exists()) {
                    $fail('This email is already subscribed for this website project.');
                }
            };
        }

        return [
            'email' => $emailRules,
            'origin' => ['nullable', 'string', 'max:255'],
            'is_subscribed' => ['required', 'boolean'],
        ];
    }
}
