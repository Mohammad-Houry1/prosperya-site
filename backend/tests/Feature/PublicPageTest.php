<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Services\PublicContent;
use App\Services\PublicPayload;
use App\Services\WebsiteAccess;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Http;
use ReflectionProperty;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class PublicPageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['website.cms_url' => 'https://cms.example.test', 'website.key' => 'fixture-key']);
        Http::fake(['*' => Http::response(['valid' => true, 'tenant_id' => 'fixture-tenant',
            'modules' => [['model' => 'Page', 'slug' => 'pages']],
            'website_settings' => ['default_locale' => 'en', 'locales' => ['en', 'fr']],
            'statuses' => ['published' => []]])]);
        (new ReflectionProperty(app(PublicContent::class), 'languages'))->setValue(app(PublicContent::class), [
            'en' => (object) ['id' => 'en-id', 'code' => 'en'], 'fr' => (object) ['id' => 'fr-id', 'code' => 'fr'],
        ]);
    }

    public function test_about_payload_localizes_public_fields_and_preserves_selected_user_ids_without_profiles(): void
    {
        $page = new Page;
        $id = '6ac8886280862f68e40a2864';
        $page->setRawAttributes(['_id' => '6ac8886280862f68e40a2865', 'slug' => 'about', 'name' => 'About',
            'about_title' => ['en' => 'English heading', 'fr' => 'Titre français'],
            'description' => ['fr' => '<p>Introduction</p>'], 'content' => ['fr' => '<p>Histoire</p>'],
            'cover_image' => ['url' => '/about.webp', 'alt' => ['fr' => 'Notre bureau']],
            'about_users' => [$id, strtoupper($id), 'a-slug', ['_id' => '6ac8886280862f68e40a2866']],
            'about_facts' => [['fact_title' => ['fr' => 'Bureau'], 'fact_value' => ['fr' => 'Beyrouth'],
                'fact_image' => ['url' => 'javascript:alert(1)'], 'internal_note' => 'private']],
            'about_focus' => [['en' => 'English expertise', 'fr' => 'Expertise française'], []],
            'about_principles' => [['principle_title' => ['fr' => 'Clarté'], 'principle_description' => ['fr' => '<p>Un principe.</p>']]],
            'about_work_title' => ['fr' => 'Notre travail'], 'about_work_description' => ['fr' => '<p>Ensemble.</p>'],
            'about_steps' => [['step_title' => ['fr' => 'Étape'], 'step_description' => ['fr' => '<p>Description.</p>']]],
            'author_id' => 'private', 'blocks' => [['secret' => 'private']], 'internal_secret' => 'private']);
        $data = app(PublicPayload::class)->page($page, 'fr');
        $this->assertSame('Titre français', $data['about_title']);
        $this->assertSame('<p>Histoire</p>', $data['content']);
        $this->assertSame('https://cms.example.test/about.webp', $data['cover_image']['url']);
        $this->assertSame('Notre bureau', $data['cover_image']['alt']);
        $this->assertSame([$id, '6ac8886280862f68e40a2866'], $data['about_users']);
        $this->assertSame(['Expertise française'], $data['about_focus']);
        $this->assertSame(['fact_title' => 'Bureau', 'fact_value' => 'Beyrouth', 'fact_image' => null], $data['about_facts'][0]);
        $this->assertSame('<p>Un principe.</p>', $data['about_principles'][0]['principle_description']);
        $this->assertSame('<p>Description.</p>', $data['about_steps'][0]['step_description']);
        foreach (['blocks', 'author_id', 'internal_secret', 'leadership', 'email'] as $private) {
            $this->assertArrayNotHasKey($private, $data);
        }
    }

    public function test_empty_optional_sections_are_empty_arrays_and_media_is_absent(): void
    {
        $page = new Page;
        $page->setRawAttributes(['_id' => '6ac8886280862f68e40a2865', 'slug' => 'about', 'name' => 'Page name']);
        $data = app(PublicPayload::class)->page($page, 'en');
        $this->assertSame('Page name', $data['about_title']);
        $this->assertNull($data['cover_image']);
        foreach (['about_users', 'about_focus', 'about_facts', 'about_principles', 'about_steps'] as $field) {
            $this->assertSame([], $data[$field]);
        }
    }

    public function test_a_website_key_without_pages_permission_cannot_query_pages(): void
    {
        Http::swap(new Factory);
        Http::fake(['*' => Http::response(['valid' => true, 'tenant_id' => 'fixture-tenant',
            'modules' => [], 'statuses' => ['published' => []]])]);
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('This website key does not allow the pages module.');
        app(WebsiteAccess::class)->moduleFor(Page::class);
    }
}
