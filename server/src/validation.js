import { STATUSES } from './constants.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidStatus(value) {
  return typeof value === 'string' && STATUSES.includes(value);
}

/** True only for real calendar dates in YYYY-MM-DD form (rejects 2026-02-31). */
function isValidIsoDate(value) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function checkAmount(value, field, errors) {
  if (value === undefined || value === null || value === '') {
    errors.push({ field, message: `${field} is required.` });
  } else if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push({ field, message: `${field} must be a number.` });
  } else if (value < 0) {
    errors.push({ field, message: `${field} cannot be negative.` });
  }
}

/** Validates a create payload. Returns { errors, value } — value is the cleaned record. */
export function validateNewProject(body) {
  const errors = [];
  const b = body && typeof body === 'object' ? body : {};

  if (typeof b.title !== 'string' || b.title.trim() === '') {
    errors.push({ field: 'title', message: 'title is required and cannot be empty.' });
  }
  if (!isValidStatus(b.status)) {
    errors.push({ field: 'status', message: `status must be one of: ${STATUSES.join(', ')}.` });
  }
  if (b.deadline !== null && b.deadline !== undefined && !isValidIsoDate(b.deadline)) {
    errors.push({ field: 'deadline', message: 'deadline must be a valid date in YYYY-MM-DD format, or null.' });
  }
  checkAmount(b.budget, 'budget', errors);
  checkAmount(b.spentAmount, 'spentAmount', errors);

  return {
    errors,
    value: {
      title: typeof b.title === 'string' ? b.title.trim() : '',
      status: b.status,
      deadline: b.deadline ?? null,
      budget: b.budget,
      spentAmount: b.spentAmount,
    },
  };
}
