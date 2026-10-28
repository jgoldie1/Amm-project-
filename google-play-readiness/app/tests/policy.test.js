import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveAgeBand, canUse, canInteract } from '../lib/policy.js';

test('derives child/teen/adult bands', () => {
  const now = new Date('2026-07-20T12:00:00Z');
  assert.equal(deriveAgeBand('2016-07-21', now), 'CHILD');
  assert.equal(deriveAgeBand('2010-07-20', now), 'TEEN');
  assert.equal(deriveAgeBand('2000-01-01', now), 'ADULT');
});

test('adult-only features are blocked for minors', () => {
  assert.equal(canUse('CHILD','marketplace'), false);
  assert.equal(canUse('TEEN','virtual_gifts'), false);
  assert.equal(canUse('ADULT','marketplace'), true);
});

test('adult-minor direct interaction is blocked', () => {
  assert.equal(canInteract('ADULT','TEEN'), false);
  assert.equal(canInteract('TEEN','ADULT'), false);
  assert.equal(canInteract('ADULT','ADULT'), true);
});
