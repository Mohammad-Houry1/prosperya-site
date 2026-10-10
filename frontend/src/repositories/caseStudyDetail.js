// Keep the established detail layout while using explicit public CMS fields.
export function caseStudyDetail(row) {
  if (!row) return null;
  const card = (value) => value ? { ...value, name: value.title, description: value.summary } : null;
  const metrics = (row.metrics ?? []).filter((metric) => metric.value || metric.label);
  return {
    ...card(row), platforms: row.platforms ?? [], next: card(row.next),
    detail: {
      industryLabel: row.industry, intro: row.description || row.summary,
      heroFacts: [row.client ? [row.client, "client"] : null, row.duration ? [row.duration, "duration"] : null,
        ...metrics.map((metric) => [metric.value, metric.label])].filter(Boolean),
      challenge: row.challenge, challengePoints: row.challenge_points ?? [],
      glance: metrics.map((metric) => ["target", metric.value, metric.label, ""]),
      beforeCaption: row.before_title, afterCaption: row.after_title,
      before: row.before ?? [], after: row.after ?? [], coreName: row.platforms?.[0]?.name,
      solutionIntro: row.solution, features: (row.deliverables ?? []).map((text) => ["check", text]),
      outcomeIntro: row.results, outcomes: metrics.map((metric) => [metric.value, metric.label]),
      metricsNote: row.metrics_note,
      quote: row.testimonial ? [row.testimonial.quote, row.testimonial.name, row.testimonial.company] : [],
      sections: row.sections ?? [], steps: row.implementation_steps ?? [], gallery: row.gallery ?? [],
    },
  };
}
