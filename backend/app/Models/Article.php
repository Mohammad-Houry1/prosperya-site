<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Article extends CmsModel
{
    protected string $module = 'articles';

    /** The CMS stores the category's id in `article_category`. */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ArticleCategory::class, 'article_category');
    }

    /** The public shape of an article. Add fields deliberately; never return the whole record. */
    public function toWebsite(string $locale, bool $detail = false): array
    {
        return [
            'id' => (string) $this->id,
            'slug' => $this->slug ?? '',
            'title' => $this->text('article_title', $locale) ?: $this->text('name', $locale),
            'excerpt' => $this->text('article_small_description', $locale),
            'featured' => (bool) ($this->featured ?? false),
            'category_id' => $this->article_category,
            'published_at' => $this->published_at?->toISOString(),
            ...($detail ? ['body' => $this->text('article_description', $locale)] : []),
        ];
    }
}
