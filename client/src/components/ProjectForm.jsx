import { useState } from 'react';
import { STATUSES, STATUS_LABELS } from '../utils.js';

const EMPTY = { title: '', status: 'active', deadline: '', budget: '', spentAmount: '' };
const label = 'flex flex-col gap-1 text-sm font-semibold';

// Empty input → undefined (server reports "required"); otherwise a real number.
const toNumber = (v) => (v.trim() === '' ? undefined : Number(v));

export default function ProjectForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: values.title,
        status: values.status,
        deadline: values.deadline || null, // blank date → null
        budget: toNumber(values.budget),
        spentAmount: toNumber(values.spentAmount),
      });
    } catch (err) {
      setError(err.message); // server validation message, shown as-is
    } finally {
      setSaving(false);
    }
  }

  return (
    // noValidate: validation is owned by the server, and its messages are what we show.
    <form onSubmit={handleSubmit} noValidate className="mb-6 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-semibold">New project</h2>

      {error && (
        <p role="alert" className="mb-3.5 rounded-md bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>
      )}

      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>
          Title
          <input className="field" value={values.title} onChange={set('title')} />
        </label>
        <label className={label}>
          Status
          <select className="field" value={values.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </label>
        <label className={label}>
          <span>Deadline <span className="font-normal text-slate-500">(optional)</span></span>
          <input className="field" type="date" value={values.deadline} onChange={set('deadline')} />
        </label>
        <label className={label}>
          Budget (₹)
          <input className="field" type="number" inputMode="decimal" value={values.budget} onChange={set('budget')} />
        </label>
        <label className={label}>
          Spent so far (₹)
          <input className="field" type="number" inputMode="decimal" value={values.spentAmount} onChange={set('spentAmount')} />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save project'}</button>
      </div>
    </form>
  );
}
