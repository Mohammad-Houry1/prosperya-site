const rows = value => Array.isArray(value) ? value : [];
const text = value => typeof value === 'string' ? value : '';
const ids = value => rows(value).map(row => row.id);
const metrics = value => rows(value).map((row, index) => ({ id: String(index), value: text(row.metric_value), label: text(row.metric_label) }));
export const adaptSections = value => rows(value).map((row, index) => ({ id: String(index), title: text(row.section_title), subtitle: text(row.section_subtitle), description: text(row.section_description), image: row.section_image }));

export function adaptExpertise(record) {
  return { ...record, title: text(record.expertise_title), detailTitle: text(record.expertise_detail_title) || text(record.expertise_title),
    animationType: text(record.expertise_animation_type),
    tagline: text(record.expertise_tagline), summary: text(record.expertise_summary), description: text(record.expertise_description),
    sections: adaptSections(record.sections), image: record.expertise_image, outcomes: rows(record.expertise_outcomes),
    capabilities: rows(record.expertise_capabilities), steps: rows(record.expertise_steps), metrics: metrics(record.metrics),
    metricsNote: text(record.expertise_metrics_note) };
}
export function adaptSolution(record) {
  return { ...record, title: text(record.solution_title), tagline: text(record.solution_tagline), description: text(record.solution_description),
    image: record.solution_image, pains: rows(record.solution_challenges), capabilities: rows(record.solution_capabilities),
    outcomes: rows(record.outcomes).map(row => [row.outcome_image, text(row.outcome_title), text(row.outcome_description)]),
    expertiseIds: ids(record.related_expertise), caseStudyId: rows(record.related_case_studies)[0]?.id,
    animation: { type: text(record.solution_animation_type), centreLabel: text(record.solution_animation_centre_label),
      resultLabel: text(record.solution_animation_result_label), signalLabel: text(record.solution_animation_signal_label),
      sources: rows(record.solution_animation_sources), lanes: rows(record.solution_animation_lanes), steps: rows(record.solution_animation_steps),
      suppliers: rows(record.solution_animation_suppliers), hubs: rows(record.solution_animation_hubs), channels: rows(record.solution_animation_channels) },
    sections: adaptSections(record.sections),
    story: { statement: text(record.solution_statement), lead: text(record.solution_lead), frictionTitle: text(record.solution_friction_title),
      friction: rows(record.solution_friction), metrics: metrics(record.metrics).map(row => [row.value,row.label]), metricsNote: text(record.solution_metrics_note) } };
}
export function adaptCaseStudy(record) {
  const results = metrics(record.case_study_metrics);
  const testimonial = rows(record.case_study_testimonial)[0];
  const industryName = text(record.industry_record?.name) || text(record.case_study_industry);
  const authoredFacts = rows(record.case_study_hero_facts).map(row => [text(row.hero_fact_value), text(row.hero_fact_label)]).filter(([value, label]) => value || label);
  return { ...record, name: text(record.case_study_title), title: text(record.case_study_title), category: industryName,
    industry: text(record.industry_id), industryName, description: text(record.case_study_summary),
    chapeau: text(record.case_study_chapeau), animationType: text(record.case_study_animation_type),
    contentSections: rows(record.content_sections).map((row, index) => ({ id: 'content-' + (index + 1), title: text(row.content_title), subtitle: text(row.content_subtitle), description: text(row.content_description) })).filter(row => row.title || row.subtitle || row.description),
    technologyStack: rows(record.technology_stack).map((row, index) => ({ id: String(index), name: text(row.technology_name), image: row.technology_image })).filter(row => row.name || row.image?.url),
    image: record.case_study_image ? { ...record.case_study_image, src: record.case_study_image.url } : null,
    expertiseIds: ids(record.related_expertise), platformIds: ids(record.platforms), metrics: results,
    sections: adaptSections(record.sections),
    detail: { industryLabel: industryName, intro: text(record.case_study_description),
      heroFacts: authoredFacts.length ? authoredFacts : [[text(record.case_study_client), ''], [text(record.case_study_duration), ''], ...results.map(row=>[row.value,row.label])].filter(([value])=>value),
      challenge: text(record.case_study_challenge), challengePoints: rows(record.case_study_challenge_points),
      glance: results.map(row=>[null,row.value,row.label,'']), before: rows(record.case_study_before), after: rows(record.case_study_after),
      beforeCaption: text(record.case_study_before_title), afterCaption: text(record.case_study_after_title),
      solutionIntro: text(record.case_study_solution), features: rows(record.case_study_deliverables).map(value=>[null,value]),
      outcomeIntro: text(record.case_study_results), outcomes: results.map(row=>[row.value,row.label]),
      quote: testimonial ? [testimonial.quote,testimonial.name,testimonial.company] : [], metricsNote: text(record.case_study_metrics_note) } };
}
export function adaptMethodology(value) {
  return rows(value).map((row,index) => ({ id: String(index), title: text(row.methodology_title),
    activities: rows(row.methodology_buttons), descriptions: rows(row.methodology_descriptions), image: row.methodology_image }));
}
