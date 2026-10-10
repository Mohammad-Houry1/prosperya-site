import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptExpertise, adaptSolution, adaptCaseStudy, adaptMethodology } from '../../src/repositories/marketing.repository.js';
test('adapters preserve authored CMS content without invented content or metrics', () => {
  assert.equal(adaptExpertise({id:'1',slug:'new',expertise_title:'CMS',sections:[]}).title,'CMS');
  const solution=adaptSolution({id:'2',solution_title:'CMS',solution_capabilities:['A'],outcomes:[],related_expertise:[{id:'1'}]});
  assert.deepEqual(solution.capabilities,['A']);
  assert.deepEqual(solution.expertiseIds,['1']);
  assert.deepEqual(solution.story.metrics,[]);
  const study=adaptCaseStudy({id:'3',case_study_title:'Project',industry_id:'retail',case_study_industry:'Commerce',case_study_metrics:[]});
  assert.equal(study.industry,'retail');
  assert.equal(study.industryName,'Commerce');
  assert.deepEqual(study.detail.quote,[]);
  assert.deepEqual(study.metrics,[]);
});
test('methodology descriptions stay ordered and are not guessed into deliverables', () => {
  assert.deepEqual(adaptMethodology([{methodology_title:'Stage',methodology_buttons:['A'],methodology_descriptions:['One','Two']}])[0].descriptions,['One','Two']);
  assert.deepEqual(adaptMethodology([]),[]);
});

test('expertise keeps its short card title and separate authored full heading', () => {
  const record = adaptExpertise({ expertise_title: 'Connect', expertise_detail_title: 'Systems Integration' });
  assert.equal(record.title, 'Connect');
  assert.equal(record.detailTitle, 'Systems Integration');
  assert.equal(adaptExpertise({ expertise_title: 'Existing title' }).detailTitle, 'Existing title');
  assert.equal(adaptExpertise({ expertise_title: 'Titre FR', expertise_detail_title: '' }).detailTitle, 'Titre FR');
});

test('solution animation data comes from authored fields without invented nodes', () => {
  const solution = adaptSolution({ solution_animation_type: 'workflow', solution_animation_steps: ['One', 'Two'], solution_animation_lanes: ['CMS lane'], solution_animation_centre_label: 'CMS centre' });
  assert.equal(solution.animation.type, 'workflow');
  assert.deepEqual(solution.animation.steps, ['One', 'Two']);
  assert.deepEqual(solution.animation.lanes, ['CMS lane']);
  assert.deepEqual(solution.animation.sources, []);
  assert.equal(solution.animation.centreLabel, 'CMS centre');
  assert.equal(adaptSolution({}).animation.type, '');
});

test('case studies use stable industry records, labelled facts and ordered authored sections', () => {
  const study = adaptCaseStudy({ industry_id: 'industry-id', industry_record: { id: 'industry-id', name: 'Commerce FR' },
    case_study_industry: 'Legacy industry', case_study_chapeau: 'Short introduction', case_study_animation_type: 'network',
    case_study_client: 'Legacy client', case_study_hero_facts: [{ hero_fact_value: '12', hero_fact_label: 'Teams' }],
    content_sections: [{ content_title: 'CMS heading', content_subtitle: 'CMS subtitle', content_description: '<p>CMS body</p>' }],
    technology_stack: [{ technology_name: 'CMS tool', technology_image: { url: '/tool.png' } }],
    sections: [{ section_title: 'Extra', section_subtitle: 'Extra subtitle' }] });
  assert.equal(study.industryName, 'Commerce FR');
  assert.equal(study.chapeau, 'Short introduction');
  assert.equal(study.animationType, 'network');
  assert.deepEqual(study.detail.heroFacts, [['12', 'Teams']]);
  assert.equal(study.contentSections[0].subtitle, 'CMS subtitle');
  assert.equal(study.technologyStack[0].image.url, '/tool.png');
  assert.equal(study.sections[0].subtitle, 'Extra subtitle');
  assert.deepEqual(adaptCaseStudy({}).detail.heroFacts, []);
});
