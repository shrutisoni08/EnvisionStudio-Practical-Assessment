import test from 'node:test';
import assert from 'node:assert/strict';
import { isOverdue, isOverBudget } from './utils.js';

test('isOverdue', () => {
  const today = '2026-11-05';
  assert.equal(isOverdue({ deadline: null, status: 'active' }, today), false);
  assert.equal(isOverdue({ deadline: 'garbage', status: 'active' }, today), false);
  assert.equal(isOverdue({ deadline: '2026-11-05', status: 'active' }, today), false);
  assert.equal(isOverdue({ deadline: '2026-11-04', status: 'active' }, today), true);
  assert.equal(isOverdue({ deadline: '2026-11-04', status: 'on_hold' }, today), true);
  assert.equal(isOverdue({ deadline: '2026-11-04', status: 'completed' }, today), false);
});

test('isOverBudget', () => {
  assert.equal(isOverBudget({ budget: 50000, spentAmount: 50000 }), false);
  assert.equal(isOverBudget({ budget: 50000, spentAmount: 50001 }), true);
});
