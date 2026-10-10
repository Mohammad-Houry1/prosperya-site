const rows = value => Array.isArray(value) ? value : [];
const text = value => typeof value === 'string' ? value : '';
const ids = value => rows(value).map(row => row.id);
const metrics = value => rows(value).map((row, index) => ({ id: String(index), value: text(row.metric_value), label: text(row.metric_label) }));
export const adaptSections = value => rows(value).map((row, index) => ({ id: String(index), title: text(row.section_title), description: text(row.section_description), image: row.section_image }));

export function adaptExpertise(record) {
  return { ...record, title: text(record.expertise_title), detailTitle: text(record.expertise_detail_title) || text(record.expertise_title),
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
    sections: adaptSections(record.sections),
    story: { statement: text(record.solution_statement), lead: text(record.solution_lead), frictionTitle: text(record.solution_friction_title),
      friction: rows(record.solution_friction), metrics: metrics(record.metrics).map(row => [row.value,row.label]), metricsNote: text(record.solution_metrics_note) } };
}
export function adaptCaseStudy(record) {
  const results = metrics(record.case_study_metrics);
  const testimonial = rows(record.case_study_testimonial)[0];
  return { ...record, name: text(record.case_study_title), title: text(record.case_study_title), category: text(record.case_study_industry),
    industry: text(record.industry_id), industryName: text(record.case_study_industry), description: text(record.case_study_summary),
    image: record.case_study_image ? { ...record.case_study_image, src: record.case_study_image.url } : null,
    expertiseIds: ids(record.related_expertise), platformIds: ids(record.platforms), metrics: results,
    sections: adaptSections(record.sections),
    detail: { industryLabel: text(record.case_study_industry), intro: text(record.case_study_description),
      heroFacts: [[text(record.case_study_client), ''], [text(record.case_study_duration), ''], ...results.map(row=>[row.value,row.label])].filter(([value])=>value),
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
