import test from 'node:test';
import assert from 'node:assert/strict';
import { validateNewProject } from './validation.js';
import { Project } from './models/Project.js';
import { seedProjects } from './seed-data.js';

const valid = { title: 'X', status: 'active', deadline: null, budget: 10, spentAmount: 0 };

test('accepts a valid project, with or without deadline', () => {
  assert.equal(validateNewProject(valid).errors.length, 0);
  assert.equal(validateNewProject({ ...valid, deadline: '2026-12-15' }).errors.length, 0);
  assert.equal(validateNewProject({ ...valid, spentAmount: 10 }).errors.length, 0); // spent == budget
});

test('rejects invalid input with a field-specific message', () => {
  const cases = [
    [{ ...valid, title: '   ' }, 'title'], [{ ...valid, status: 'done' }, 'status'],
    [{ ...valid, budget: -1 }, 'budget'], [{ ...valid, spentAmount: -5 }, 'spentAmount'],
    [{ ...valid, deadline: '2026-02-31' }, 'deadline'], [{ ...valid, budget: '10' }, 'budget'],
    [{ ...valid, budget: undefined }, 'budget'],
  ];
  for (const [body, field] of cases) {
    const { errors } = validateNewProject(body);
    assert.ok(errors.some((e) => e.field === field), `expected error on ${field}`);
  }
  assert.ok(validateNewProject({}).errors.length >= 4);
});

test('Mongoose schema also rejects bad data (second layer)', () => {
  assert.equal(new Project({ ...valid, status: 'done' }).validateSync().errors.status.message.includes('active'), true);
  assert.ok(new Project({ ...valid, budget: -1 }).validateSync().errors.budget);
  assert.equal(new Project(valid).validateSync(), undefined);
});

test('seed data matches the brief', () => {
  assert.equal(seedProjects.length, 5);
  assert.equal(seedProjects.filter((p) => p.deadline === null).length, 1);
});
