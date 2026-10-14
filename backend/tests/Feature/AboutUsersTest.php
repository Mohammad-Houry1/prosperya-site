<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class AboutUsersTest extends WebsiteTestCase
{
    public function test_about_includes_users_queried_directly_from_the_model(): void
    {
        $this->grant['modules'][] = ['id' => (string) new ObjectId, 'slug' => 'users', 'model' => 'User', 'record_scope' => 'all'];
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake(['*' => Http::response($this->grant)]);
        $this->collection('corporate_pages')->insertOne($this->record(['slug' => 'about-prosperya', 'title' => ['fr' => 'À propos']]));
        $this->collection('users')->insertMany([
            $this->record(['name' => 'Public person', 'bio' => ['fr' => 'Biographie'], 'password' => 'private-password']),
            $this->record(['name' => 'Draft person', 'status_id' => $this->ids['draft']]),
            $this->record(['name' => 'Scheduled person', 'published_at' => now()->addDay()]),
            $this->record(['name' => 'Other project', 'project' => [(string) new ObjectId]]),
            $this->record(['name' => 'Unapproved person', 'is_approved' => false]),
            $this->record(['name' => 'Other language', 'language' => [$this->ids['en']]]),
        ]);
        $this->getJson('/api/corporate-pages/about-prosperya?locale=fr')->assertOk()
            ->assertJsonPath('data.title.fr', 'À propos')->assertJsonCount(1, 'users')
            ->assertJsonPath('users.0.name', 'Public person')->assertJsonPath('users.0.bio.fr', 'Biographie')
            ->assertDontSee('private-password');
        Http::assertSentCount(1);
    }

    public function test_about_remains_available_without_the_users_module(): void
    {
        $this->collection('corporate_pages')->insertOne($this->record(['slug' => 'about-prosperya']));
        $this->getJson('/api/corporate-pages/about-prosperya')->assertOk()->assertJsonPath('users', []);
    }
}
