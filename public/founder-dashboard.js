'use strict';

const $ = selector => document.querySelector(selector);
const tokenInput = $('#token');
const statusNode = $('#status');

const STATUS_ORDER = ['LIVE', 'READY', 'BUILDING', 'LOCKED', 'COMING SOON'];
const LEGACY_STATUS_MAP = {
  concept: 'COMING SOON',
  prototype: 'BUILDING',
  alpha: 'BUILDING',
  beta: 'BUILDING',
  live: 'LIVE'
};

function token() { return tokenInput.value.trim(); }
function headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function canonicalStatus(value) {
  const raw = String(value || '').trim();
  const upper = raw.toUpperCase();
  if (STATUS_ORDER.includes(upper)) return upper;
  return LEGACY_STATUS_MAP[raw.toLowerCase()] || 'BUILDING';
}
function statusClass(value) { return canonicalStatus(value).toLowerCase().replace(/\s+/g, '-'); }

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

function renderSystemHealth(projects) {
  const healthNode = $('#system-health');
  const summaryNode = $('#truth-summary');
  if (!projects.length) {
    healthNode.innerHTML = '<p>No recorded project evidence yet. Nothing is promoted to LIVE by assumption.</p>';
    summaryNode.textContent = 'No project evidence loaded; statuses remain unproven.';
    return;
  }

  const counts = Object.fromEntries(STATUS_ORDER.map(status => [status, 0]));
  projects.forEach(project => { counts[canonicalStatus(project.status)] += 1; });
  summaryNode.textContent = STATUS_ORDER.map(status => `${counts[status]} ${status}`).join(' · ');
  healthNode.innerHTML = projects.map(project => {
    const status = canonicalStatus(project.status);
    return `<article class="health-card">
      <div class="health-top"><h3>${escapeHtml(project.title)}</h3><b class="status-chip ${statusClass(status)}">${escapeHtml(status)}</b></div>
      <p>${escapeHtml(project.summary || 'No summary recorded.')}</p>
      <p class="evidence"><strong>Evidence / limitation:</strong> ${escapeHtml(project.limitation || 'No evidence recorded. Do not treat as production proof.')}</p>
      <p class="evidence"><strong>Next milestone:</strong> ${escapeHtml(project.next_milestone || project.nextMilestone || 'Not recorded.')}</p>
    </article>`;
  }).join('');
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
  renderSystemHealth(projects);
  $('#projects').innerHTML = projects.length ? projects.map(p => {
    const status = canonicalStatus(p.status);
    return `<article class="project"><div class="health-top"><h3>${escapeHtml(p.title)}</h3><b class="status-chip ${statusClass(status)}">${escapeHtml(status)}</b></div><p>${escapeHtml(p.contributor_name || 'TRYAMM team')}</p><p>${escapeHtml(p.summary)}</p><button data-project="${escapeHtml(p.id)}">View generated content</button></article>`;
  }).join('') : '<p>No development projects yet.</p>';
}

async function loadOutputs(projectId) {
  const payload = await api(`/api/content/projects/${encodeURIComponent(projectId)}/outputs`);
  $('#outputs').innerHTML = (payload.outputs || []).map(o => `<article class="output"><p class="channel">${escapeHtml(o.channel)}</p><h3>${escapeHtml(o.title)}</h3><pre>${escapeHtml(o.body)}</pre></article>`).join('') || '<p>No generated content yet.</p>';
}

$('#load').addEventListener('click', () => loadDashboard().catch(showError));
$('#projects').addEventListener('click', event => {
  const projectId = event.target.dataset.project;
  if (projectId) loadOutputs(projectId).catch(showError);
});
$('#project-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const body = Object.fromEntries(new FormData(event.currentTarget));
    body.status = canonicalStatus(body.status);
    const created = await api('/api/content/projects', { method: 'POST', body: JSON.stringify(body) });
    event.currentTarget.reset();
    statusNode.textContent = `Created ${created.project.title} and ${created.outputs.length} content drafts.`;
    await loadDashboard();
    await loadOutputs(created.project.id);
  } catch (error) { showError(error); }
});
function showError(error) { statusNode.textContent = error.message; }

tokenInput.value = localStorage.getItem('tryammFounderToken') || '';
if (tokenInput.value) loadDashboard().catch(showError);
