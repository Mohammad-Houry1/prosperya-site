<?php

namespace Tests\Feature;

use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class ContentModulesTest extends WebsiteTestCase
{
    public function test_module_lists_are_localized_paginated_filtered_and_public_only(): void
    {
        foreach (['testimonials', 'platforms', 'faqs', 'corporate_pages'] as $table) {
            $this->collection($table)->insertMany([
                $this->record(['slug' => 'public', 'name' => ['en' => 'Public', 'fr' => 'Public FR'],
                    'title' => ['fr' => 'Titre'], 'testimonial_description' => ['fr' => 'Avis'],
                    'user_name' => 'Visitor', 'user_company' => 'Company', 'content' => ['fr' => '<p>Réponse</p>'],
                    'logo_image' => ['url' => '/logo.png'], 'internal_secret' => 'never-public']),
                $this->record(['slug' => 'draft', 'status_id' => $this->ids['draft']]),
                $this->record(['slug' => 'project', 'project' => [(string) new ObjectId]]),
                $this->record(['slug' => 'country', 'country' => [(string) new ObjectId]]),
                $this->record(['slug' => 'language', 'language' => [$this->ids['en']]]),
            ]);
            $this->getJson('/api/'.str_replace('_', '-', $table).'?locale=fr&per_page=1')
                ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('meta.total', 1)->assertDontSee('never-public');
        }
        $this->getJson('/api/testimonials?locale=fr')->assertJsonPath('data.0.quote', 'Avis')->assertJsonPath('data.0.company', 'Company');
        $this->getJson('/api/platforms?locale=fr')->assertJsonPath('data.0.logo_image.alt', 'Public FR');
        $this->getJson('/api/faqs?locale=fr')->assertJsonPath('data.0.answer', '<p>Réponse</p>');
        $this->getJson('/api/corporate-pages/public?locale=fr')->assertOk()->assertJsonPath('data.title', 'Titre');
        $this->getJson('/api/platforms?per_page=0')->assertUnprocessable();
    }

    public function test_category_filters_and_linked_faq_answers_use_public_records(): void
    {
        $category = (string) new ObjectId;
        $hidden = (string) new ObjectId;
        $question = (string) new ObjectId;
        foreach (['faq_categories', 'corporate_page_categories'] as $table) {
            $this->collection($table)->insertMany([
                $this->record(['_id' => new ObjectId($category), 'slug' => 'contact', 'name' => ['fr' => 'Contact']]),
                $this->record(['_id' => new ObjectId($hidden), 'slug' => 'hidden', 'status_id' => $this->ids['draft']]),
            ]);
        }
        $this->collection('faqs')->insertMany([
            $this->record(['_id' => new ObjectId($question), 'name' => ['fr' => 'Comment ?'], 'is_question' => true,
                'faq_category' => ['_id' => $category]]),
            $this->record(['question' => $question, 'is_question' => false, 'content' => ['fr' => '<p>Comme ceci.</p>']]),
            $this->record(['question' => $question, 'is_question' => false, 'content' => ['fr' => 'never-public'], 'status_id' => $this->ids['draft']]),
        ]);
        $this->getJson('/api/faqs?locale=fr&category=contact')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.question', 'Comment ?')->assertJsonPath('data.0.answer', '<p>Comme ceci.</p>')->assertDontSee('never-public');
        foreach (['faq-categories', 'corporate-page-categories'] as $path) {
            $this->getJson('/api/'.$path.'?locale=fr')->assertOk()->assertJsonCount(1, 'data');
        }
        foreach (['faqs', 'corporate-pages'] as $path) {
            $this->getJson('/api/'.$path.'?category=hidden')->assertNotFound();
        }
    }

}
