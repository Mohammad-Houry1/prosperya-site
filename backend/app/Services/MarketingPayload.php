<?php

namespace App\Services;

use App\Models\{Approach, Article, CaseStudy, CorporatePage, Expertise, Industry, Page, Platform, Solution, Testimonial, User};
use App\Enums\AnimatedVisualType;
use App\Models\Base\ContentEntity;

/** Allowlisted authored fields; relationship snapshots are never public payloads. */
final class MarketingPayload
{
    private array $related = [];

    private const TEXT = [
        Expertise::class => ['expertise_title', 'expertise_detail_title', 'expertise_tagline', 'expertise_summary', 'expertise_description', 'expertise_metrics_note'],
        Solution::class => ['solution_title', 'solution_tagline', 'solution_description', 'solution_statement', 'solution_lead', 'solution_friction_title', 'solution_metrics_note', 'solution_animation_centre_label', 'solution_animation_result_label', 'solution_animation_signal_label'],
        CaseStudy::class => ['case_study_title', 'case_study_chapeau', 'case_study_client', 'case_study_industry', 'case_study_duration', 'case_study_summary', 'case_study_description', 'case_study_challenge', 'case_study_solution', 'case_study_results', 'case_study_before_title', 'case_study_after_title', 'case_study_metrics_note'],
        Approach::class => ['approach_title', 'approach_description', 'collaboration_title', 'principles_title', 'diagram_client_title', 'diagram_client_description', 'diagram_shared_title', 'diagram_shared_description', 'diagram_company_title', 'diagram_company_description', 'diagram_value_title', 'diagram_value_description'],
        Page::class => ['description', 'content', 'about_title', 'about_story_title', 'about_work_title', 'about_work_description', 'architecture_title', 'architecture_description'],
        CorporatePage::class => ['content', 'about_title', 'about_story_title', 'about_work_title', 'about_work_description'],
    ];

    private const LISTS = [
        Expertise::class => ['expertise_capabilities', 'expertise_outcomes'],
        Solution::class => ['solution_challenges', 'solution_capabilities', 'solution_friction', 'solution_animation_sources', 'solution_animation_lanes', 'solution_animation_steps', 'solution_animation_suppliers', 'solution_animation_hubs', 'solution_animation_channels'],
        CaseStudy::class => ['case_study_challenge_points', 'case_study_before', 'case_study_after', 'case_study_deliverables'],
        Approach::class => ['collaboration_items'],
        Page::class => ['about_focus', 'architecture_column_1', 'architecture_column_2', 'architecture_column_3', 'architecture_column_4'],
        CorporatePage::class => ['about_focus'],
    ];

    private const ROWS = [
        'sections' => ['section_title', 'section_description', 'section_image'],
        'expertise_steps' => ['step_title', 'step_description', 'step_image'],
        'implementation_steps' => ['step_title', 'step_description', 'step_image'],
        'about_steps' => ['step_title', 'step_description', 'step_image'],
        'metrics' => ['metric_value', 'metric_label'],
        'case_study_metrics' => ['metric_value', 'metric_label'],
        'case_study_hero_facts' => ['hero_fact_value', 'hero_fact_label'],
        'content_sections' => ['content_title', 'content_subtitle', 'content_description'],
        'technology_stack' => ['technology_name', 'technology_image'],
        'outcomes' => ['outcome_title', 'outcome_description', 'outcome_image'],
        'how_we_work' => ['work_title', 'work_description', 'work_points', 'work_image'],
        'principles' => ['principle_title', 'principle_description', 'principle_image'],
        'about_principles' => ['principle_title', 'principle_description', 'principle_image'],
        'about_facts' => ['fact_title', 'fact_value', 'fact_image'],
        'methodology' => ['methodology_title', 'methodology_deliverable', 'methodology_buttons', 'methodology_descriptions', 'methodology_image'],
    ];

    private const MODEL_ROWS = [
        Expertise::class => ['sections', 'expertise_steps', 'metrics'],
        Solution::class => ['sections', 'outcomes', 'metrics'],
        CaseStudy::class => ['sections', 'implementation_steps', 'case_study_metrics', 'case_study_hero_facts', 'content_sections', 'technology_stack'],
        Approach::class => ['methodology', 'how_we_work', 'principles'],
        Page::class => ['sections', 'about_steps', 'about_principles', 'about_facts'],
        CorporatePage::class => ['about_steps', 'about_principles', 'about_facts'],
    ];

    private const RELATIONS = [
        Expertise::class => ['related_solutions' => Solution::class, 'related_case_studies' => CaseStudy::class, 'platforms' => Platform::class],
        Solution::class => ['related_expertise' => Expertise::class, 'related_case_studies' => CaseStudy::class, 'related_articles' => Article::class],
        CaseStudy::class => ['related_expertise' => Expertise::class, 'related_solutions' => Solution::class, 'platforms' => Platform::class, 'case_study_testimonial' => Testimonial::class],
        Page::class => ['about_users' => User::class],
        CorporatePage::class => ['about_users' => User::class],
    ];

    public function __construct(private readonly PublicContent $content, private readonly PublicPayload $payload, private readonly WebsiteAccess $access) {}

    public function record(ContentEntity $record, string $locale, bool $relationships = true): array
    {
        $model = $record::class;
        $result = ['id' => (string) $record->id, 'slug' => $record->slug ?? '', 'name' => $record->text('name', $locale),
            'featured' => (bool) $record->featured, 'seo' => $this->payload->seo($record, $locale), 'meta_image' => $this->payload->media($record->meta_image, $locale)];
        foreach (self::TEXT[$model] ?? [] as $field) $result[$field] = $record->text($field, $locale);
        foreach (self::LISTS[$model] ?? [] as $field) $result[$field] = $this->values($record->{$field}, $locale);
        if (in_array($model, [Expertise::class, Solution::class, CaseStudy::class], true)) {
            $field = match ($model) { Expertise::class => 'expertise_animation_type', Solution::class => 'solution_animation_type', default => 'case_study_animation_type' };
            $type = $record->{$field};
            $result[$field] = is_string($type) ? (AnimatedVisualType::tryFrom($type)?->value ?? '') : '';
        }
        foreach (self::MODEL_ROWS[$model] ?? [] as $field) {
            $result[$field] = array_map(function ($row) use ($field, $locale, $model) {
                $row = (object) $row;
                $data = [];
                $keys = self::ROWS[$field];
                if ($model === CaseStudy::class && $field === 'sections') $keys[] = 'section_subtitle';
                foreach ($keys as $key) {
                    $value = $row->{$key} ?? null;
                    $data[$key] = str_ends_with($key, '_image') ? $this->payload->media($value, $locale)
                        : (in_array($key, ['methodology_buttons', 'methodology_descriptions', 'work_points'], true) ? $this->values($value, $locale) : $this->content->text($row, $key, $locale));
                }
                return $data;
            }, array_values((array) $record->{$field}));
        }
        $imageField = match ($model) { Expertise::class => 'expertise_image', Solution::class => 'solution_image', CaseStudy::class => 'case_study_image', Approach::class => 'approach_image', Page::class, CorporatePage::class => 'cover_image', default => null };
        if ($imageField) $result[$imageField] = $this->payload->media($record->{$imageField}, $locale);
        if ($model === CaseStudy::class) {
            $result['case_study_gallery'] = array_values(array_filter(array_map(fn ($media) => $this->payload->media($media, $locale), (array) $record->case_study_gallery)));
            $industryId = $this->payload->referenceId($record->industry);
            $result['industry_record'] = $industryId ? ($this->related(Industry::class, $locale)[$industryId] ?? null) : null;
            if ($industryId) $result['case_study_industry'] = $result['industry_record']['name'] ?? '';
            // Existing free-text industries remain usable until editors select an Industry record.
            $default = $this->access->grant()['website_settings']['default_locale'];
            $result['industry_id'] = $industryId ? ($result['industry_record']['id'] ?? '') : $record->text('case_study_industry', $default);
        }
        if ($relationships) foreach (self::RELATIONS[$model] ?? [] as $field => $target) {
            $value = $record->{$field};
            $ids = array_values(array_filter(array_map(fn ($value) => $this->payload->referenceId($value),
                is_array($value) && array_is_list($value) ? $value : ($value ? [$value] : []))));
            $rows = $ids ? $this->related($target, $locale) : [];
            $result[$field] = array_values(array_filter(array_map(fn ($id) => $rows[$id] ?? null, $ids)));
        }
        return $result;
    }

    private function values(mixed $values, string $locale): array
    {
        return array_values(array_filter(array_map(fn ($value) => $this->content->text((object) ['value' => $value], 'value', $locale), (array) $values), fn ($value) => trim($value) !== ''));
    }

    private function related(string $model, string $locale): array
    {
        $key = $model.':'.$locale;
        if (isset($this->related[$key])) return $this->related[$key];
        if (!collect($this->access->grant()['modules'])->contains('model', class_basename($model))) return $this->related[$key] = [];
        $filters = $this->content->filters($locale);
        $query = $model::forWebsite()->whereIn('project', $filters['project'])->whereIn('status', $filters['status'])
            ->whereIn('country', $filters['country'])->whereIn('language', $filters['language'])
            ->where('is_active', '!=', false)->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        if ($model === User::class) $query->where('is_approved', '!=', false);
        return $this->related[$key] = $query->get()->mapWithKeys(fn ($row) => [(string) $row->id => match ($model) {
            Industry::class => $this->payload->category($row, $locale), Article::class => $this->payload->article($row, $locale), Platform::class => $this->payload->platform($row, $locale), Testimonial::class => $this->payload->testimonial($row, $locale), User::class => $this->payload->user($row, $locale),
            default => $this->record($row, $locale, false),
        }])->all();
    }
}
