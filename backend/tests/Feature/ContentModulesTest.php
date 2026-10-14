<?php

namespace Tests\Feature;

use MongoDB\BSON\ObjectId;
use Tests\WebsiteTestCase;

class ContentModulesTest extends WebsiteTestCase
{
    public function test_platform_categories_separate_clients_from_we_work_with(): void
    {
        $clients = (string) new ObjectId;
        $partners = (string) new ObjectId;
        $hidden = (string) new ObjectId;
        $this->collection('ref_platform_categories')->insertMany([
            $this->record(['_id' => new ObjectId($clients), 'slug' => 'clients']),
            $this->record(['_id' => new ObjectId($partners), 'slug' => 'we-work-with']),
            $this->record(['_id' => new ObjectId($hidden), 'slug' => 'hidden', 'status_id' => $this->ids['draft']]),
            $this->record(['slug' => 'foreign', 'project' => [(string) new ObjectId]]),
        ]);
        $this->collection('platforms')->insertMany([
            $this->record(['name' => 'Client', 'platform_category' => $clients]),
            $this->record(['name' => 'Partner', 'platform_category' => ['_id' => $partners]]),
            $this->record(['name' => 'Draft', 'platform_category' => $clients, 'status_id' => $this->ids['draft']]),
            $this->record(['name' => 'Uncategorized']),
        ]);
        $this->getJson('/api/platforms?category=clients')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Client');
        $this->getJson('/api/platforms?category=we-work-with')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Partner');
        $this->getJson('/api/platforms?category_id='.$partners)->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Partner');
        foreach (['hidden', 'foreign', 'missing'] as $slug) {
            $this->getJson('/api/platforms?category='.$slug)->assertNotFound();
        }
        $this->getJson('/api/platforms')->assertOk()->assertJsonCount(3, 'data');
    }

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
        $this->getJson('/api/testimonials?locale=fr')->assertJsonPath('data.0.testimonial_description.fr', 'Avis')->assertJsonPath('data.0.user_company', 'Company');
        $this->getJson('/api/platforms?locale=fr')->assertJsonPath('data.0.name.fr', 'Public FR')->assertJsonPath('data.0.logo_image.url', '/logo.png');
        $this->getJson('/api/faqs?locale=fr')->assertJsonPath('data.0.content.fr', '<p>Réponse</p>');
        $this->getJson('/api/corporate-pages/public?locale=fr')->assertOk()->assertJsonPath('data.title.fr', 'Titre');
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
            ->assertJsonPath('data.0.name.fr', 'Comment ?')->assertJsonPath('answers.0.content.fr', '<p>Comme ceci.</p>')->assertDontSee('never-public');
        foreach (['faq-categories', 'corporate-page-categories'] as $path) {
            $this->getJson('/api/'.$path.'?locale=fr')->assertOk()->assertJsonCount(1, 'data');
        }
        foreach (['faqs', 'corporate-pages'] as $path) {
            $this->getJson('/api/'.$path.'?category=hidden')->assertNotFound();
        }
    }

    public function test_split_faq_records_use_question_content_and_linked_answer_content(): void
    {
        $category = (string) new ObjectId;
        $first = (string) new ObjectId;
        $second = (string) new ObjectId;
        $this->collection('faq_categories')->insertOne($this->record(['_id' => new ObjectId($category), 'slug' => 'approach']));
        $this->collection('faqs')->insertMany([
            $this->record(['_id' => new ObjectId($first), 'name' => 'Internal first question label', 'is_question' => true,
                'content' => ['en' => '<p>First question?</p>', 'fr' => '<p>Première question ?</p>'], 'faq_category' => $category, 'order' => 2]),
            $this->record(['_id' => new ObjectId($second), 'name' => 'Internal second question label', 'is_question' => true,
                'content' => ['en' => '<p>Second <strong>question</strong>?</p>'], 'faq_category' => $category, 'order' => 1]),
            $this->record(['name' => 'Answer label', 'is_question' => false, 'question' => $first, 'faq_category' => $category,
                'content' => ['en' => '<p>Answer one.</p>', 'fr' => '<p>Réponse un.</p>'], 'order' => 2]),
            $this->record(['name' => 'Earlier answer label', 'is_question' => false, 'question' => $first,
                'content' => ['en' => '<p>Answer zero.</p>'], 'order' => 1]),
            $this->record(['name' => 'Empty answer', 'is_question' => false, 'question' => $second, 'content' => []]),
            $this->record(['is_question' => false, 'question' => $first, 'content' => ['en' => 'Hidden draft answer'], 'status_id' => $this->ids['draft']]),
        ]);
        $this->getJson('/api/faqs?locale=en&category=approach')->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $second)->assertJsonPath('data.0.content.en', '<p>Second <strong>question</strong>?</p>')
            ->assertJsonMissingPath('data.0.answer')
            ->assertJsonPath('data.1.content.en', '<p>First question?</p>')
            ->assertJsonPath('answers.1.content.en', '<p>Answer zero.</p>')->assertJsonPath('answers.2.content.en', '<p>Answer one.</p>')
            ->assertDontSee('Hidden draft answer');
        $this->getJson('/api/faqs?locale=fr&category=approach')->assertOk()
            ->assertJsonPath('data.1.content.fr', '<p>Première question ?</p>')
            ->assertJsonPath('answers.2.content.fr', '<p>Réponse un.</p>');
    }

}
