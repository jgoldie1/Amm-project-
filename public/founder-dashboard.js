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

function renderOmniSimStatus(payload) {
  const node = $('#omnisim-status');
  const configured = payload.providerConfigured ? 'provider connected' : 'provider not connected';
  node.textContent = `${payload.status} · ${payload.provider} · ${configured}. Simulation output is decision support, not a guaranteed prediction.`;
}

function renderOmniSimPlan(plan) {
  const result = $('#omnisim-result');
  result.innerHTML = `<article class="output"><p class="channel">${escapeHtml(plan.status)} · ${escapeHtml(plan.useCase)}</p><h3>${escapeHtml(plan.question)}</h3><p><b>Branches:</b> ${plan.scenarioBranches.map(escapeHtml).join(' · ')}</p><p><b>Rounds:</b> ${escapeHtml(plan.rounds)} · <b>Actors:</b> ${escapeHtml(plan.actors.length ? plan.actors.join(', ') : 'provider generated')}</p><p><b>Decision flow:</b> ${plan.decisionFlow.map(escapeHtml).join(' → ')}</p><p><b>Guardrail:</b> Human approval is required before production action. Simulated results must remain separate from measured production data.</p></article>`;
}

async function loadOmniSimStatus() {
  const response = await fetch('/api/omnisim/status');
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `OmniSim status failed (${response.status})`);
  renderOmniSimStatus(payload);
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

$('#load').addEventListener('click', () => loadDashboard().catch(showError));
$('#projects').addEventListener('click', event => {
  const projectId = event.target.dataset.project;
  if (projectId) loadOutputs(projectId).catch(showError);
});
$('#omnisim-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    if (!token()) throw new Error('Paste your login session token before creating a simulation plan.');
    const form = new FormData(event.currentTarget);
    const actors = String(form.get('actors') || '').split(',').map(value => value.trim()).filter(Boolean);
    const body = {
      question: form.get('question'),
      seed: form.get('seed'),
      useCase: form.get('useCase'),
      rounds: Number(form.get('rounds') || 12),
      actors
    };
    const payload = await api('/api/omnisim/plan', { method: 'POST', body: JSON.stringify(body) });
    renderOmniSimPlan(payload.plan);
    statusNode.textContent = 'OmniSim planning pass created. No production action has been taken.';
  } catch (error) { showError(error); }
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
loadOmniSimStatus().catch(error => { $('#omnisim-status').textContent = error.message; });
if (tokenInput.value) loadDashboard().catch(showError);