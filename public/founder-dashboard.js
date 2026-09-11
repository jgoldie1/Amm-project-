'use strict';

const $ = selector => document.querySelector(selector);
const tokenInput = $('#token');
const statusNode = $('#status');

const holoPanels = [
  {title:'AI Core',status:'Stubbs AI · HoloGPT · Middleverse AI',items:['recursive improvement','intent routing','jobs & learning','accessibility optimization'],line:'AI core selected. I can route improvement and operating commands.'},
  {title:'StreetVerse',status:'World · Missions · Economy',items:['Chicago world','missions','vehicles & population','reels & creator commerce'],line:'StreetVerse selected. Focus is playable world, missions, publishing, and economy.'},
  {title:'Business Network',status:'Passport · Directory · SaaS',items:['business onboarding','Black business directory','agent/scout network','digital twin & server package'],line:'Business network selected. I can surface onboarding, sales, and recurring revenue paths.'},
  {title:'Media & Holo',status:'LIVE · PK · Reels · Radio · CTV',items:['holographic media','Omniverse Radio','LIVE/PK','movies & product placement'],line:'Media selected. Creator, broadcast, radio, and holographic distribution are grouped here.'},
  {title:'Money & Ledgers',status:'Commerce · Rewards · Payouts',items:['checkout verification','creator payable balance','agent earnings','get paid to play'],line:'Money layer selected. Payment and payout controls remain server-authoritative.'},
  {title:'Operations',status:'Release · Health · Evidence',items:['deployment state','broken routes','test evidence','rollback readiness'],line:'Operations selected. I will separate planned, tested, deployed, and verified states.'}
];
let holoIndex = 0;

function token() { return tokenInput.value.trim(); }
function headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function list(value) { return String(value || '').split(',').map(v => v.trim()).filter(Boolean); }
function numeric(form, name) { return Math.max(0, Math.min(100, Number(form.get(name)) || 0)); }

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

function renderHoloDashboard() {
  const panel = holoPanels[holoIndex];
  $('#holo-carousel').innerHTML = `<article class="holo-card active"><p class="channel">Holographic layer ${holoIndex + 1}/${holoPanels.length}</p><h3>${escapeHtml(panel.title)}</h3><strong>${escapeHtml(panel.status)}</strong><div class="holo-items">${panel.items.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div></article>`;
  $('#holo-dots').innerHTML = holoPanels.map((_, index) => `<button type="button" class="holo-dot ${index === holoIndex ? 'active' : ''}" data-holo-index="${index}" aria-label="Show holographic page ${index + 1}"></button>`).join('');
  $('#benny-line').textContent = panel.line;
  $('#holo-state').textContent = token() ? 'Holo linked' : 'Holo preview';
}
function moveHolo(direction) { holoIndex = (holoIndex + direction + holoPanels.length) % holoPanels.length; renderHoloDashboard(); }

function renderMetrics(metrics, infrastructure) {
  $('#metrics').innerHTML = Object.entries(metrics).map(([key, value]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(key.replace(/([A-Z])/g, ' $1'))}</span></article>`).join('') +
    `<article><strong>${infrastructure.supabase ? 'Connected' : 'Local fallback'}</strong><span>database mode</span></article>`;
}

function renderPowerUps(payload) {
  const policy = payload.policy || {};
  $('#recursive-mode').textContent = policy.mode || 'policy unavailable';
  $('#power-ups').innerHTML = Object.entries(payload.powerUps || {}).map(([, profile]) => `<article><h3>${escapeHtml(profile.name)}</h3><p>${escapeHtml(profile.role)}</p><p class="power-list">${(profile.powers || []).map(power => `<span>${escapeHtml(power)}</span>`).join('')}</p></article>`).join('') || '<p>No power-up profiles available.</p>';
}

function renderCycle(result) {
  const task = result.task || result.result?.task || {};
  const execution = result.result || result;
  const risk = task.actionRisk || execution.actionRisk || 'unknown';
  const verified = execution.verified === true || execution.status === 'VERIFIED';
  const approval = task.approvalPlan?.required || result.status === 'HUMAN_APPROVAL_REQUIRED';
  const score = result.scoreDelta ?? task.context?.scoreDelta ?? 'n/a';
  const rollback = task.reversible === true ? 'required/available' : 'not reported';
  const reason = result.reason || execution.reason || execution.status || 'cycle returned';
  $('#improvement-result').innerHTML = `<div class="cycle-grid">
    <article><span>Cycle</span><strong>${escapeHtml(result.cycleId || task.id || 'unknown')}</strong></article>
    <article><span>Score delta</span><strong>${escapeHtml(score)}</strong></article>
    <article><span>Risk</span><strong>${escapeHtml(risk)}</strong></article>
    <article><span>Verified</span><strong>${verified ? 'Yes' : 'Not yet'}</strong></article>
    <article><span>Approval</span><strong>${approval ? 'Human required' : 'Not required by policy'}</strong></article>
    <article><span>Rollback</span><strong>${escapeHtml(rollback)}</strong></article>
  </div><p><b>Result:</b> ${escapeHtml(reason)}</p>${task.sandboxChecks?.length ? `<p><b>Sandbox checks:</b> ${task.sandboxChecks.map(escapeHtml).join(' · ')}</p>` : ''}`;
  $('#benny-line').textContent = `Improvement cycle ${result.cycleId || ''} returned. Risk: ${risk}. Verification: ${verified ? 'verified' : 'not yet verified'}.`;
}

async function loadDashboard() {
  if (!token()) throw new Error('Paste your login session token first.');
  localStorage.setItem('tryammFounderToken', token());
  const [dashboard, projectsPayload, powerUps] = await Promise.all([
    api('/api/founder/dashboard'),
    api('/api/content/projects'),
    api('/api/stubbs/power-ups')
  ]);
  renderMetrics(dashboard.metrics, dashboard.infrastructure);
  renderPowerUps(powerUps);
  renderHoloDashboard();
  const projects = projectsPayload.projects || [];
  $('#projects').innerHTML = projects.length ? projects.map(p => `<article class="project"><h3>${escapeHtml(p.title)}</h3><p><b>${escapeHtml(p.status)}</b> · ${escapeHtml(p.contributor_name || 'TRYAMM team')}</p><p>${escapeHtml(p.summary)}</p><button data-project="${escapeHtml(p.id)}">View generated content</button></article>`).join('') : '<p>No development projects yet.</p>';
}

async function loadOutputs(projectId) {
  const payload = await api(`/api/content/projects/${encodeURIComponent(projectId)}/outputs`);
  $('#outputs').innerHTML = (payload.outputs || []).map(o => `<article class="output"><p class="channel">${escapeHtml(o.channel)}</p><h3>${escapeHtml(o.title)}</h3><pre>${escapeHtml(o.body)}</pre></article>`).join('') || '<p>No generated content yet.</p>';
}

$('#holo-prev').addEventListener('click', () => moveHolo(-1));
$('#holo-next').addEventListener('click', () => moveHolo(1));
$('#holo-dots').addEventListener('click', event => { if (event.target.dataset.holoIndex !== undefined) { holoIndex = Number(event.target.dataset.holoIndex); renderHoloDashboard(); } });
$('#benny-refresh').addEventListener('click', () => { renderHoloDashboard(); statusNode.textContent = 'Benny holographic dashboard refreshed.'; });
$('#load').addEventListener('click', () => loadDashboard().catch(showError));
$('#projects').addEventListener('click', event => {
  const projectId = event.target.dataset.project;
  if (projectId) loadOutputs(projectId).catch(showError);
});
$('#improvement-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    if (!token()) throw new Error('Paste your login session token first.');
    const form = new FormData(event.currentTarget);
    $('#improvement-result').innerHTML = '<p>Running guarded improvement cycle…</p>';
    $('#benny-line').textContent = 'Running a guarded improvement cycle. High-impact boundaries remain approval-gated.';
    const body = {
      objective: form.get('objective'), agent: form.get('agent'), targets: list(form.get('targets')), evidenceIds: list(form.get('evidenceIds')),
      changesCode: form.get('changesCode') === 'on', highImpact: form.get('highImpact') === 'on',
      baseline: {quality:numeric(form,'baselineQuality'),reliability:numeric(form,'baselineReliability'),accessibility:numeric(form,'baselineAccessibility'),safety:numeric(form,'baselineSafety')},
      candidate: {quality:numeric(form,'candidateQuality'),reliability:numeric(form,'candidateReliability'),accessibility:numeric(form,'candidateAccessibility'),safety:numeric(form,'candidateSafety')}
    };
    const result = await api('/api/stubbs/improve', { method: 'POST', body: JSON.stringify(body) });
    renderCycle(result);
    statusNode.textContent = `Recursive improvement cycle ${result.cycleId || 'completed'} returned under controlled policy.`;
  } catch (error) { showError(error); }
});
$('#project-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const created = await api('/api/content/projects', { method: 'POST', body: JSON.stringify(body) });
    event.currentTarget.reset();
    statusNode.textContent = `Created ${created.project.title} and ${created.outputs.length} content drafts.`;
    $('#benny-line').textContent = `${created.project.title} was added to the founder development record.`;
    await loadDashboard();
    await loadOutputs(created.project.id);
  } catch (error) { showError(error); }
});
function showError(error) { statusNode.textContent = error.message; $('#benny-line').textContent = `Founder alert: ${error.message}`; }

tokenInput.value = localStorage.getItem('tryammFounderToken') || '';
renderHoloDashboard();
if (tokenInput.value) loadDashboard().catch(showError); else $('#recursive-mode').textContent = 'Authentication required';
