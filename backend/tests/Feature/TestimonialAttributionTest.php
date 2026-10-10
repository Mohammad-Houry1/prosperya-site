<?php
namespace Tests\Feature;
use Illuminate\Support\Facades\Http;
use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;
class TestimonialAttributionTest extends WebsiteTestCase
{
    public function test_selected_user_is_resolved_publicly_and_private_snapshots_are_not_published(): void
    {
        $this->grant['modules'][] = ['id' => (string) new ObjectId, 'slug' => 'users', 'model' => 'User', 'record_scope' => 'all'];
        Http::swap(new \Illuminate\Http\Client\Factory);
        Http::fake(['*' => Http::response($this->grant)]);
        $public = (string) new ObjectId;
        $private = (string) new ObjectId;
        $this->collection('users')->insertMany([
            $this->record(['_id' => new ObjectId($public), 'name' => 'CMS Person', 'company_name' => 'CMS Company', 'password' => 'never-public']),
            $this->record(['_id' => new ObjectId($private), 'name' => 'Private Person', 'status_id' => $this->ids['draft']]),
        ]);
        $this->collection('testimonials')->insertMany([
            $this->record(['order' => 1, 'use_existing_user' => true, 'user' => $public, 'testimonial_description' => 'Public quote']),
            $this->record(['order' => 2, 'use_existing_user' => true, 'user' => ['_id' => $private, 'name' => 'Private Snapshot'], 'testimonial_description' => 'Another quote']),
        ]);
        $this->getJson('/api/testimonials?locale=en')->assertOk()->assertJsonPath('data.0.name', 'CMS Person')
            ->assertJsonPath('data.0.company', 'CMS Company')->assertJsonPath('data.1.name', '')
            ->assertDontSee('Private Snapshot')->assertDontSee('never-public');
    }
    public function test_denied_user_module_keeps_the_public_quote_without_snapshot_attribution(): void
    {
        $this->collection('testimonials')->insertOne($this->record(['use_existing_user' => true,
            'user' => ['_id' => (string) new ObjectId, 'name' => 'Private Snapshot'], 'testimonial_description' => 'Public quote']));
        $this->getJson('/api/testimonials?locale=en')->assertOk()->assertJsonPath('data.0.quote', 'Public quote')
            ->assertJsonPath('data.0.name', '')->assertDontSee('Private Snapshot');
    }
}
