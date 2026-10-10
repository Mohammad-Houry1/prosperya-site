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
