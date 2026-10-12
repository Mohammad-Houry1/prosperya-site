import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptSolution } from '../../src/repositories/marketing.repository.js';

test('solutions use selected public expertise capabilities and outcomes in selection order', () => {
  const solution = adaptSolution({
    solution_capabilities: ['Stale solution capability'],
    outcomes: [{ outcome_title: 'Stale solution outcome' }],
    related_expertise: [
      { id: 'second', expertise_capabilities: ['Second capability', 'Shared capability'], expertise_outcomes: ['Second outcome'] },
      { id: 'first', expertise_capabilities: ['First capability'], expertise_outcomes: ['First outcome', 'Final outcome'] },
    ],
  });
  assert.deepEqual(solution.overviewCapabilities, ['Second capability', 'Shared capability', 'First capability']);
  assert.deepEqual(solution.overviewOutcomes, [[null, 'Second outcome', ''], [null, 'First outcome', ''], [null, 'Final outcome', '']]);
  assert.deepEqual(solution.capabilities, ['Stale solution capability']);
  assert.deepEqual(solution.outcomes, [[undefined, 'Stale solution outcome', '']]);
  assert.deepEqual(solution.expertiseIds, ['second', 'first']);
});

test('selected expertise with explicit empty content does not fall back to stale solution fields', () => {
  const solution = adaptSolution({ solution_capabilities: ['Stale'], outcomes: [{ outcome_title: 'Stale' }],
    related_expertise: [{ id: 'selected', expertise_capabilities: [], expertise_outcomes: [] }] });
  assert.deepEqual(solution.overviewCapabilities, []);
  assert.deepEqual(solution.overviewOutcomes, []);
  assert.deepEqual(solution.capabilities, ['Stale']);
  assert.deepEqual(solution.outcomes, [[undefined, 'Stale', '']]);
});

test('standalone solutions retain their authored capabilities and rich outcome descriptions', () => {
  const solution = adaptSolution({ solution_capabilities: ['Authored capability'],
    outcomes: [{ outcome_image: { url: '/outcome.png' }, outcome_title: 'Authored outcome', outcome_description: '<p>Details</p>' }], related_expertise: [] });
  assert.deepEqual(solution.capabilities, ['Authored capability']);
  assert.deepEqual(solution.outcomes, [[{ url: '/outcome.png' }, 'Authored outcome', '<p>Details</p>']]);
  assert.deepEqual(solution.overviewCapabilities, ['Authored capability']);
  assert.deepEqual(solution.overviewOutcomes, [[{ url: '/outcome.png' }, 'Authored outcome', '<p>Details</p>']]);
});

test('legacy relationship snapshots without public expertise content retain authored solution fields', () => {
  const solution = adaptSolution({ solution_capabilities: ['Authored capability'], outcomes: [], related_expertise: [{ id: 'legacy' }] });
  assert.deepEqual(solution.capabilities, ['Authored capability']);
  assert.deepEqual(solution.outcomes, []);
  assert.deepEqual(solution.overviewCapabilities, ['Authored capability']);
  assert.deepEqual(solution.overviewOutcomes, []);
});
