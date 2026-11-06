import { STATUSES, STATUS_LABELS, formatDeadline, formatINR, isOverBudget, isOverdue, todayISO } from '../utils.js';

const STATUS_STYLE = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  completed: 'bg-brand text-white dark:bg-brand-light dark:text-slate-900',
  on_hold: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

export default function ProjectTable({ projects, onStatusChange }) {
  const today = todayISO(); // computed once so every row uses the same "today"

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="px-3.5 py-3 font-semibold">Project</th>
            <th className="px-3.5 py-3 font-semibold">Status</th>
            <th className="px-3.5 py-3 font-semibold">Deadline</th>
            <th className="px-3.5 py-3 text-right font-semibold">Budget</th>
            <th className="px-3.5 py-3 text-right font-semibold">Spent</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const overdue = isOverdue(p, today);
            const over = isOverBudget(p);
            const deadline = formatDeadline(p.deadline);
            return (
              <tr key={p.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className={`px-3.5 py-3 font-semibold ${overdue || over ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-transparent'}`}>
                  {p.title}
                </td>
                <td className="px-3.5 py-3">
                  <select
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_STYLE[p.status]}`}
                    value={p.status}
                    aria-label={`Status of ${p.title}`}
                    onChange={(e) => onStatusChange(p.id, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td className="px-3.5 py-3">
                  {deadline ? (
                    <span className={overdue ? 'font-semibold text-red-700 dark:text-red-300' : ''}>{deadline}</span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">No deadline</span>
                  )}
                  {overdue && <span className="badge bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">Overdue</span>}
                </td>
                <td className="px-3.5 py-3 text-right tabular-nums">{formatINR(p.budget)}</td>
                <td className="px-3.5 py-3 text-right tabular-nums">
                  <span className={over ? 'font-semibold text-red-700 dark:text-red-300' : ''}>{formatINR(p.spentAmount)}</span>
                  {over && (
                    <span className="badge bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      Over by {formatINR(p.spentAmount - p.budget)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
