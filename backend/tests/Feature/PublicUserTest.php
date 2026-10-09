<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use App\Services\WebsiteAccess;
use Illuminate\Support\Facades\Http;
use ReflectionProperty;
use Illuminate\Http\Client\Factory;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class PublicUserTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['website.cms_url' => 'https://cms.example.test', 'website.key' => 'fixture-key']);
        Http::fake(['*' => Http::response(['valid' => true, 'tenant_id' => 'fixture-tenant',
            'modules' => [['model' => 'User', 'slug' => 'users']],
            'website_settings' => ['default_locale' => 'en', 'locales' => ['en', 'fr']],
            'statuses' => ['published' => []]])]);
    }

    public function test_only_public_profile_fields_are_serialized(): void
    {
        $content = app(PublicContent::class);
        (new ReflectionProperty($content, 'languages'))->setValue($content, ['en' => (object) ['id' => 'en-id', 'code' => 'en']]);
        $user = new User;
        $user->setRawAttributes(['_id' => '6ac8886280862f68e40a2864', 'slug' => 'public-profile',
            'name' => 'Public Person', 'position' => 'Engineer', 'bio' => 'Profile',
            'email' => 'private@example.test', 'password' => 'secret', 'role_ids' => ['admin'],
            'remember_token' => 'token', 'locker' => ['private' => true]]);
        $data = (new PublicPayload($content))->user($user, 'en');
        $this->assertSame(['id', 'slug', 'name', 'position', 'bio', 'avatar'], array_keys($data));
        $this->assertSame('Public Person', $data['name']);
        $this->assertNull($data['avatar']);
    }

    public function test_role_filters_are_validated_before_database_access(): void
    {
        $this->getJson('/api/users?roles=admin')->assertUnprocessable()->assertJsonValidationErrors('roles');
        $this->getJson('/api/users?role_id=invalid')->assertUnprocessable()->assertJsonValidationErrors('role_id');
    }

    public function test_users_require_the_users_module(): void
    {
        $this->assertSame('users', app(WebsiteAccess::class)->moduleFor(User::class)['slug']);
    }

    public function test_a_key_without_users_permission_is_denied(): void
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response(['valid' => true, 'tenant_id' => 'fixture-tenant',
            'modules' => [], 'statuses' => ['published' => []]])]);
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('This website key does not allow the users module.');
        app(WebsiteAccess::class)->moduleFor(User::class);
    }

    public function test_role_reference_queries_keep_tenant_and_deletion_safeguards(): void
    {
        $query = User::forWebsite()->where('project', 'project-id')->where('status', 'published-id')
            ->where(fn ($q) => $q->whereIn('role', ['team'])->orWhereIn('role_ids', ['role-id'])
                ->orWhereIn('roles', ['role-id']))->toBase()->toMql();
        $encoded = json_encode($query, JSON_THROW_ON_ERROR);
        foreach (['fixture-tenant', 'deleted_at', 'project._id', 'status_id', 'role_ids._id', 'roles._id'] as $filter) {
            $this->assertStringContainsString($filter, $encoded);
        }
    }
}
