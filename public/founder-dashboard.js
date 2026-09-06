'use strict';

const $ = selector => document.querySelector(selector);
const tokenInput = $('#token');
const statusNode = $('#status');

function token() { return tokenInput.value.trim(); }
function headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

function renderMetrics(metrics, infrastructure) {
  $('#metrics').innerHTML = Object.entries(metrics).map(([key, value]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(key.replace(/([A-Z])/g, ' $1'))}</span></article>`).join('') +
    `<article><strong>${infrastructure.supabase ? 'Connected' : 'Local fallback'}</strong><span>database mode</span></article>`;
}

const STATUS_ORDER = ['LIVE', 'READY', 'BUILDING', 'LOCKED', 'COMING SOON'];

function renderFounderCommand(payload) {
  const systems = Array.isArray(payload.systems) ? payload.systems : [];
  const counts = Object.fromEntries(STATUS_ORDER.map(status => [status, systems.filter(system => system.status === status).length]));
  $('#command-updated').textContent = payload.updatedAt ? `Status manifest updated ${new Date(payload.updatedAt).toLocaleString()}` : '';
  $('#command-summary').innerHTML = STATUS_ORDER.map(status => `<article><strong>${counts[status]}</strong><span>${escapeHtml(status)}</span></article>`).join('');
  $('#command-systems').innerHTML = systems.map(system => `
    <article class="system-card" data-status="${escapeHtml(system.status)}">
      <div class="system-card-head"><h3>${escapeHtml(system.name)}</h3><span class="status-pill">${escapeHtml(system.status)}</span></div>
      <p><strong>Evidence:</strong> ${escapeHtml(system.evidence || 'No evidence attached.')}</p>
      <p><strong>Next:</strong> ${escapeHtml(system.next || 'Attach the next required gate.')}</p>
    </article>`).join('') || '<p>No system status records found.</p>';
}

async function loadFounderCommand() {
  const response = await fetch(`/founder-command-status.json?ts=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Founder Command status failed (${response.status})`);
  renderFounderCommand(await response.json());
}

async function loadDashboard() {
  if (!token()) throw new Error('Paste your login session token first.');
  localStorage.setItem('tryammFounderToken', token());
  const [dashboard, projectsPayload] = await Promise.all([
    api('/api/founder/dashboard'),
    api('/api/content/projects')
  ]);
  renderMetrics(dashboard.metrics, dashboard.infrastructure);
  const projects = projectsPayload.projects || [];
  $('#projects').innerHTML = projects.length ? projects.map(p => `<article class="project"><h3>${escapeHtml(p.title)}</h3><p><b>${escapeHtml(p.status)}</b> · ${escapeHtml(p.contributor_name || 'TRYAMM team')}</p><p>${escapeHtml(p.summary)}</p><button data-project="${escapeHtml(p.id)}">View generated content</button></article>`).join('') : '<p>No development projects yet.</p>';
}

async function loadOutputs(projectId) {
  const payload = await api(`/api/content/projects/${encodeURIComponent(projectId)}/outputs`);
  $('#outputs').innerHTML = (payload.outputs || []).map(o => `<article class="output"><p class="channel">${escapeHtml(o.channel)}</p><h3>${escapeHtml(o.title)}</h3><pre>${escapeHtml(o.body)}</pre></article>`).join('') || '<p>No generated content yet.</p>';
}

$('#refresh-command').addEventListener('click', () => loadFounderCommand().catch(showError));
$('#load').addEventListener('click', () => loadDashboard().catch(showError));
$('#projects').addEventListener('click', event => {
  const projectId = event.target.dataset.project;
  if (projectId) loadOutputs(projectId).catch(showError);
});
$('#project-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const created = await api('/api/content/projects', { method: 'POST', body: JSON.stringify(body) });
    event.currentTarget.reset();
    statusNode.textContent = `Created ${created.project.title} and ${created.outputs.length} content drafts.`;
    await loadDashboard();
    await loadOutputs(created.project.id);
  } catch (error) { showError(error); }
});
function showError(error) { statusNode.textContent = error.message; }

tokenInput.value = localStorage.getItem('tryammFounderToken') || '';
loadFounderCommand().catch(showError);
if (tokenInput.value) loadDashboard().catch(showError);
