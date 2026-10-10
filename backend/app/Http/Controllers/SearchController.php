<?php

namespace App\Http\Controllers;

use App\Models\{Article, CaseStudy, Expertise, Solution};
use App\Services\{PublicContent, WebsiteAccess};
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use MongoDB\BSON\Regex;

class SearchController
{
    private const TYPES = [
        'expertise' => [Expertise::class, ['expertise_detail_title', 'expertise_title'], 'expertise_summary'],
        'solutions' => [Solution::class, ['solution_title'], 'solution_description'],
        'work' => [CaseStudy::class, ['case_study_title'], 'case_study_summary'],
        'insights' => [Article::class, ['article_title'], 'article_small_description'],
    ];

    public function search(Request $request, PublicContent $content, WebsiteAccess $access): array
    {
        $params = $request->validate(['q' => ['required', 'string', 'max:100'], 'locale' => ['sometimes', 'string', 'max:20'],
            'type' => ['sometimes', Rule::in(array_keys(self::TYPES))], 'page' => ['sometimes', 'integer', 'min:1', 'max:1000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:20']]);
        $term = trim($params['q']);
        Validator::make(['q' => $term], ['q' => ['required', 'string', 'min:2']])->validate();
        $language = $content->language($params['locale'] ?? null);
        $locale = $language->code;
        $filters = $content->filters($locale);
        $regex = new Regex(preg_quote($term), 'i');
        $perPage = (int) ($params['per_page'] ?? 20);
        $page = (int) ($params['page'] ?? 1);
        $skip = ($page - 1) * $perPage;
        $total = 0;
        $results = [];
        foreach (self::TYPES as $type => [$model, $titles, $summary]) {
            if (isset($params['type']) && $params['type'] !== $type) continue;
            if (!collect($access->grant()['modules'])->contains('model', class_basename($model))) continue;
            $query = $model::forWebsite()->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
                ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
                ->where('is_active', '!=', false)->where('slug', 'regex', new Regex('\\S'))
                ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
            // Search only public titles and summaries, using the same locale precedence as PublicContent::text.
            $query->where(function ($q) use ($titles, $summary, $regex, $locale, $language) {
                foreach ([...$titles, $summary] as $field) $q->orWhere(fn ($match) => $this->localizedMatch($match, $field, $regex, $locale, (string) $language->id));
            })->where(function ($q) use ($titles, $locale, $language) {
                foreach ($titles as $field) $q->orWhere(fn ($match) => $this->localizedMatch($match, $field, new Regex('\\S'), $locale, (string) $language->id));
            });
            $count = (clone $query)->count();
            $total += $count;
            if ($skip >= $count) { $skip -= $count; continue; }
            if (count($results) >= $perPage) continue;
            $rows = $query->orderBy('order')->orderBy('_id')->skip($skip)->take($perPage - count($results))
                ->get(['_id', 'slug', 'translations', ...$titles, $summary]);
            $skip = 0;
            foreach ($rows as $row) {
                $title = '';
                foreach ($titles as $field) { $title = trim($row->text($field, $locale)); if ($title !== '') break; }
                $excerpt = html_entity_decode(strip_tags($row->text($summary, $locale)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $excerpt = preg_replace('/\s+/u', ' ', $excerpt) ?? '';
                $results[] = ['id' => (string) $row->id, 'type' => $type, 'slug' => $row->slug, 'title' => $title,
                    'summary' => mb_strimwidth(trim($excerpt), 0, 220, '…', 'UTF-8'), 'href' => '/'.$locale.'/'.$type.'/'.rawurlencode($row->slug)];
            }
        }
        return ['data' => $results, 'meta' => ['current_page' => $page, 'per_page' => $perPage, 'total' => $total, 'last_page' => max(1, (int) ceil($total / $perPage))]];
    }

    private function localizedMatch($query, string $field, Regex $regex, string $locale, string $languageId): void
    {
        $codeOverride = 'translations.'.$locale;
        $idOverride = 'translations.'.$languageId;
        $query->where(fn ($q) => $q->where($codeOverride.'.'.$field, 'regex', $regex)->orWhere($codeOverride.'.'.$field.'.'.$locale, 'regex', $regex))
            ->orWhere(fn ($q) => $q->whereNull($codeOverride)->where(fn ($value) => $value->where($idOverride.'.'.$field, 'regex', $regex)->orWhere($idOverride.'.'.$field.'.'.$locale, 'regex', $regex)))
            ->orWhere(fn ($q) => $q->whereNull($codeOverride.'.'.$field)
                ->where(fn ($sidecar) => $sidecar->whereNotNull($codeOverride)->orWhereNull($idOverride.'.'.$field))
                ->where(fn ($value) => $value->where($field.'.'.$locale, 'regex', $regex)->orWhere($field, 'regex', $regex)));
    }
}
