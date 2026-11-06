export const STATUSES = ['active', 'completed', 'on_hold'];
export const STATUS_LABELS = { active: 'Active', completed: 'Completed', on_hold: 'On hold' };

/** Today as YYYY-MM-DD in the viewer's local timezone. */
export function todayISO(now = new Date()) {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Overdue = the deadline day is strictly before today (due today is NOT overdue),
 * the project is not completed, and a valid deadline exists.
 * Both sides are plain YYYY-MM-DD strings, so there is no timezone conversion.
 */
export function isOverdue(project, today = todayISO()) {
  if (!project.deadline || !DATE_ONLY.test(project.deadline)) return false;
  if (project.status === 'completed') return false;
  return project.deadline < today;
}

/** Over budget only when spent is strictly greater than budget (equal = within budget). */
export function isOverBudget(project) {
  return project.spentAmount > project.budget;
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatINR = (n) => inr.format(n);

/** Formats YYYY-MM-DD without going through Date parsing (avoids UTC off-by-one). */
export function formatDeadline(deadline) {
  if (!deadline || !DATE_ONLY.test(deadline)) return null;
  const [y, m, d] = deadline.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
