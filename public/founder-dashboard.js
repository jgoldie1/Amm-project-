'use strict';

const $ = selector => document.querySelector(selector);
const tokenInput = $('#token');
const statusNode = $('#status');

function token() { return tokenInput.value.trim(); }
function headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function humanize(value) { return String(value || '').replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2'); }

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

function renderMetrics(metrics, infrastructure, familyCounts = {}) {
  const combined = {
    ...metrics,
    familyProfiles: familyCounts.members || 0,
    enterpriseLines: familyCounts.enterprises || 0,
    ipAssets: familyCounts.ipAssets || 0,
    successionPlans: familyCounts.successionDirectives || 0
  };
  $('#metrics').innerHTML = Object.entries(combined).map(([key, value]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(humanize(key))}</span></article>`).join('') +
    `<article><strong>${infrastructure.supabase ? 'Connected' : 'Local fallback'}</strong><span>database mode</span></article>`;
}

function renderFamily(overview) {
  const members = overview.members || [];
  $('#family-members').innerHTML = members.length ? members.map(member => {
    const granted = Object.entries(member.rights || {}).filter(([, value]) => value).map(([key]) => humanize(key));
    return `<article class="registry-card"><div class="section-heading"><h3>${escapeHtml(member.displayName)}</h3><span class="badge">${escapeHtml(member.relationship || 'family')}</span></div><p><b>Career:</b> ${escapeHtml(member.careerGoal || 'Open / not assigned')}</p><p><b>Granted rights:</b> ${escapeHtml(granted.join(', ') || 'None')}</p><p class="muted">Career-flexible: ${member.careerFlexible === false ? 'No' : 'Yes'}</p></article>`;
  }).join('') : '<p class="muted">No private family profiles have been entered yet. Add them here rather than hard-coding personal details into public source files.</p>';

  $('#enterprises-list').innerHTML = (overview.enterprises || []).map(item => `<article class="registry-card"><p class="channel">${escapeHtml(humanize(item.category))}</p><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.purpose)}</p></article>`).join('');
  $('#pathways-list').innerHTML = (overview.pathways || []).map(pathway => `<article class="registry-card"><h3>${escapeHtml(pathway.name)}</h3><p>${escapeHtml(pathway.note || (pathway.steps || []).map(humanize).join(' → '))}</p></article>`).join('');
}

async function loadDashboard() {
  if (!token()) throw new Error('Paste your admin login session token first.');
  localStorage.setItem('tryammFounderToken', token());
  const [dashboard, projectsPayload, familyOverview] = await Promise.all([
    api('/api/founder/dashboard'),
    api('/api/content/projects'),
    api('/api/family-enterprise/overview')
  ]);
  renderMetrics(dashboard.metrics, dashboard.infrastructure, familyOverview.counts);
  renderFamily(familyOverview);
  const projects = projectsPayload.projects || [];
  $('#projects').innerHTML = projects.length ? projects.map(p => `<article class="project"><h3>${escapeHtml(p.title)}</h3><p><b>${escapeHtml(p.status)}</b> · ${escapeHtml(p.contributor_name || 'TRYAMM team')}</p><p>${escapeHtml(p.summary)}</p><button data-project="${escapeHtml(p.id)}">View generated content</button></article>`).join('') : '<p>No development projects yet.</p>';
  statusNode.textContent = 'Founder command center loaded.';
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

$('#family-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const form = new FormData(event.currentTarget);
    const body = {
      displayName: form.get('displayName'),
      relationship: form.get('relationship'),
      careerGoal: form.get('careerGoal'),
      careerFlexible: true,
      notes: form.get('notes'),
      rights: {
        beneficiary: form.has('beneficiary'),
        economicOwnership: form.has('economicOwnership'),
        votingControl: form.has('votingControl'),
        managementAuthority: form.has('managementAuthority'),
        educationAccess: form.has('educationAccess'),
        ipRoyaltyRights: form.has('ipRoyaltyRights')
      }
    };
    const created = await api('/api/family-enterprise/members', { method: 'POST', body: JSON.stringify(body) });
    event.currentTarget.reset();
    event.currentTarget.elements.educationAccess.checked = true;
    statusNode.textContent = `Added protected profile for ${created.member.displayName}. No ownership or control was implied beyond selected rights.`;
    await loadDashboard();
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
if (tokenInput.value) loadDashboard().catch(showError);
