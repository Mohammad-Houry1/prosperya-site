import test from 'node:test';
import assert from 'node:assert/strict';
import { createTranslator } from '../../src/i18n/labels.js';
test('only authored labels render; missing and blank labels expose full keys', () => {
  const t = createTranslator('fr', { 'prosperya.nav.work': '', 'prosperya.greeting': 'Bonjour {name}' });
  assert.equal(t('nav.work'), 'prosperya.nav.work');
  assert.equal(t('unknown'), 'prosperya.unknown');
  assert.equal(t('prosperya.unknown'), 'prosperya.unknown');
  assert.equal(t('greeting', { name: 'Alex' }), 'Bonjour Alex');
});
