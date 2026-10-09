<?php

namespace App\Services;

use App\Models\Base\ContentEntity;
use App\Models\Article;
use App\Models\CorporatePage;
use App\Models\Faq;
use App\Models\Platform;
use App\Models\Page;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Support\Str;

/** Explicit public fields, shared by the JSON APIs and server metadata. */
final class PublicPayload
{
    public function __construct(private readonly PublicContent $content) {}

    public function referenceId(mixed $value): ?string
    {
        if (is_array($value) && array_is_list($value)) {
            $value = count($value) === 1 ? $value[0] : null;
        }
        if (is_array($value)) {
            $value = $value['_id'] ?? $value['id'] ?? null;
        }

        return is_string($value) || $value instanceof \MongoDB\BSON\ObjectId ? (string) $value : null;
    }

    public function category(ContentEntity $record, string $locale): array
    {
        return ['id' => (string) $record->id, 'slug' => $record->slug ?? '', 'name' => $record->text('name', $locale)];
    }

    public function user(User $record, string $locale): array
    {
        return ['id' => (string) $record->id, 'slug' => $record->slug ?? '',
            'name' => $record->text('name', $locale), 'position' => $record->text('position', $locale),
            'bio' => $record->text('bio', $locale), 'avatar' => $this->media($record->avatar, $locale)];
    }

    /** About is authored in Pages; linked people are read separately through the public Users API. */
    public function page(Page $page, string $locale): array
    {
        $localizedRows = fn (mixed $rows, array $fields, string $imageField) => array_values(array_map(
            function ($row) use ($fields, $imageField, $locale) {
                $row = (object) $row;
                $result = [];
                foreach ($fields as $field) {
                    $result[$field] = $this->content->text($row, $field, $locale);
                }
                $result[$imageField] = $this->media($row->{$imageField} ?? null, $locale);

                return $result;
            }, (array) $rows));
        $userIds = array_map(fn ($value) => $this->referenceId($value), (array) $page->about_users);

        return ['id' => (string) $page->id, 'slug' => $page->slug,
            'about_title' => $page->text('about_title', $locale) ?: $page->text('name', $locale),
            'description' => $page->text('description', $locale), 'content' => $page->text('content', $locale),
            'cover_image' => $this->media($page->cover_image, $locale),
            'about_story_title' => $page->text('about_story_title', $locale),
            'about_users' => array_values(array_unique(array_map('strtolower', array_filter($userIds,
                fn ($id) => is_string($id) && preg_match('/^[a-f0-9]{24}$/i', $id))))),
            'about_facts' => $localizedRows($page->about_facts, ['fact_title', 'fact_value'], 'fact_image'),
            'about_focus' => array_values(array_filter(array_map(fn ($value) => $this->content->text(
                (object) ['value' => $value], 'value', $locale), (array) $page->about_focus), fn ($value) => trim($value) !== '')),
            'about_principles' => $localizedRows($page->about_principles,
                ['principle_title', 'principle_description'], 'principle_image'),
            'about_work_title' => $page->text('about_work_title', $locale),
            'about_work_description' => $page->text('about_work_description', $locale),
            'about_steps' => $localizedRows($page->about_steps, ['step_title', 'step_description'], 'step_image'),
        ];
    }

    public function testimonial(Testimonial $record, string $locale): array
    {
        $user = is_array($record->user) ? (object) $record->user : (object) [];

        return ['id' => (string) $record->id, 'subject' => $record->text('testimonial_subject', $locale),
            'quote' => html_entity_decode(strip_tags($record->text('testimonial_description', $locale)), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'name' => $record->text('user_name', $locale) ?: $this->content->text($user, 'name', $locale),
            'company' => $record->text('user_company', $locale) ?: $this->content->text($user, 'company_name', $locale)];
    }

    public function platform(Platform $record, string $locale): array
    {
        $name = $record->text('name', $locale);
        $logo = $this->media($record->logo_image, $locale);
        if ($logo && $logo['alt'] === '') {
            $logo['alt'] = $name;
        }

        return ['id' => (string) $record->id, 'slug' => $record->slug ?: Str::slug($record->text('name', $this->content->language(null)->code)),
            'name' => $name, 'logo_image' => $logo];
    }

    public function faq(Faq $record, string $locale, string $linkedAnswer = ''): array
    {
        return ['id' => (string) $record->id, 'question' => $record->text('name', $locale),
            'answer' => $record->text('content', $locale) ?: $linkedAnswer,
            'category_id' => $this->referenceId($record->faq_category)];
    }

    public function corporatePage(CorporatePage $page, string $locale, bool $detail = true): array
    {
        return ['id' => (string) $page->id, 'slug' => $page->slug,
            'title' => $page->text('title', $locale) ?: $page->text('name', $locale),
            'description' => $page->text('description', $locale),
            ...($detail ? ['sections' => array_map(fn ($section) => [
                'title' => $this->content->text((object) $section, 'title', $locale),
                'description' => $this->content->text((object) $section, 'description', $locale),
            ], (array) $page->sections)] : []),
            'meta_image' => $this->media($page->meta_image, $locale), 'seo' => $this->seo($page, $locale),
            'updated_at' => $page->updated_at?->toISOString()];
    }

    /** Keep the public article fields explicit; CMS snapshots are not public records. */
    public function article(Article $article, string $locale, bool $detail = false): array
    {
        return [
            'id' => (string) $article->id,
            'slug' => $article->slug ?? '',
            'title' => $article->text('article_title', $locale) ?: $article->text('name', $locale),
            'excerpt' => $article->text('article_small_description', $locale),
            'featured' => (bool) ($article->featured ?? false),
            'category_id' => $this->referenceId($article->article_category),
            'published_at' => $article->published_at?->toISOString(),
            'cover_image' => $this->media($article->cover_image, $locale),
            'meta_image' => $this->media($article->meta_image, $locale),
            'seo' => $this->seo($article, $locale),
            ...($detail ? ['body' => $article->text('article_description', $locale)] : []),
        ];
    }

    public function seo(ContentEntity $record, string $locale): array
    {
        return ['title' => $record->text('meta_title', $locale),
            'description' => $record->text('meta_description', $locale),
            'keywords' => $record->text('meta_keywords', $locale),
            'url' => is_string($record->meta_url) ? $record->meta_url : '',
            'type' => is_string($record->meta_type) ? $record->meta_type : '',
            'robots' => ($record->noindex === true || $record->noindex === 1) ? 'noindex, follow' : 'index, follow'];
    }

    public function media(mixed $value, string $locale): ?array
    {
        $value = is_string($value) ? ['url' => $value] : (array) $value;
        $url = $value['url'] ?? null;
        if (! is_string($url) || $url === '') {
            return null;
        }
        if (str_starts_with($url, '/') && ! str_starts_with($url, '//')) {
            $url = rtrim((string) config('website.cms_url'), '/').$url;
        }
        if (! filter_var($url, FILTER_VALIDATE_URL) || ! in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'], true)) {
            return null;
        }

        return ['url' => $url, 'alt' => $this->content->text((object) $value, 'alt', $locale),
            'width' => is_numeric($value['width'] ?? null) && $value['width'] > 0 ? (int) $value['width'] : null,
            'height' => is_numeric($value['height'] ?? null) && $value['height'] > 0 ? (int) $value['height'] : null];
    }

    public function pagination($page): array
    {
        return ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
            'per_page' => $page->perPage(), 'total' => $page->total()];
    }
}
