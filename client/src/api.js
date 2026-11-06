// In production the API lives on another origin, set at build time via VITE_API_URL.
// Locally it is empty, so requests go to /api and the Vite dev proxy forwards them.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Thin fetch wrapper. Every failure becomes an Error whose message is shown to the user.
async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  } catch {
    throw new Error('Cannot reach the server. Check that the API is running.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status}).`);
  return data;
}

export const fetchProjects = (status) =>
  request(status ? `/api/projects?status=${encodeURIComponent(status)}` : '/api/projects');

export const createProject = (project) =>
  request('/api/projects', { method: 'POST', body: JSON.stringify(project) });

export const updateProjectStatus = (id, status) =>
  request(`/api/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
