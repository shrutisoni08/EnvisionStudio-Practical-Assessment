import { useCallback, useEffect, useState } from 'react';
import { createProject, fetchProjects, updateProjectStatus } from '../api.js';
import { STATUSES, STATUS_LABELS } from '../utils.js';
import ProjectTable from './ProjectTable.jsx';
import ProjectForm from './ProjectForm.jsx';

const stateBox = 'rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center dark:border-slate-600 dark:bg-slate-900';

export default function ProjectsPage() {
  const [filter, setFilter] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await fetchProjects(filter));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(payload) {
    await createProject(payload); // throws on 400 — the form shows the message
    setShowForm(false);
    await load();
  }

  async function handleStatusChange(id, status) {
    setActionError(null);
    try {
      await updateProjectStatus(id, status);
      await load();
    } catch (e) {
      setActionError(e.message);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 pt-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Deadlines, budgets and status for every client project.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)} aria-expanded={showForm}>
          {showForm ? 'Close form' : 'Add project'}
        </button>
      </header>

      {showForm && <ProjectForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      <div className="mb-3.5 flex items-center gap-2.5">
        <label htmlFor="status-filter" className="text-sm font-medium">Status</label>
        <select id="status-filter" className="field !w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {actionError && (
        <p role="alert" className="mb-3.5 rounded-md bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">{actionError}</p>
      )}

      {loading ? (
        <p className={stateBox} role="status">Loading projects…</p>
      ) : error ? (
        <div className={`${stateBox} !border-red-400 text-red-700 dark:text-red-300`} role="alert">
          <p className="mb-3.5">{error}</p>
          <button className="btn" onClick={load}>Try again</button>
        </div>
      ) : projects.length === 0 ? (
        <div className={stateBox}>
          {filter ? (
            <>
              <p className="mb-3.5">No {STATUS_LABELS[filter].toLowerCase()} projects.</p>
              <button className="btn" onClick={() => setFilter('')}>Show all projects</button>
            </>
          ) : (
            <>
              <p className="mb-3.5">No projects yet.</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add your first project</button>
            </>
          )}
        </div>
      ) : (
        <ProjectTable projects={projects} onStatusChange={handleStatusChange} />
      )}
    </main>
  );
}
