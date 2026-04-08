const http = require('http');
const { execFileSync } = require('child_process');

const PORT = 4900;
const EXTRA_BUSINESS_PRICE_CENTS = 5000;
const DB_FILE = `${process.env.HOME}/aam_full_system/db/aam.db`;

function q(text) {
  return String(text).replace(/'/g, "''");
}

function dbQuery(sql) {
  try {
    const out = execFileSync('sqlite3', ['-json', DB_FILE, sql], { encoding: 'utf8' });
    return out.trim() ? JSON.parse(out) : [];
  } catch (err) {
    throw new Error(`DB query failed: ${err.message}`);
  }
}

function dbRun(sql) {
  try {
    execFileSync('sqlite3', [DB_FILE, sql], { encoding: 'utf8' });
  } catch (err) {
    throw new Error(`DB run failed: ${err.message}`);
  }
}


function handleMultipartUpload(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });

    const fields = {};
    let savedFile = null;

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('file', (name, file, info) => {
      const originalName = info.filename || ('upload_' + Date.now());
      const safeName = Date.now() + "_" + originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const savePath = path.join(process.env.HOME, "aam_full_system", "uploads", "credit_docs", safeName);

      const stream = fs.createWriteStream(savePath);
      file.pipe(stream);

      savedFile = {
        originalName,
        savePath
      };

      stream.on('error', reject);
    });

    busboy.on('finish', () => {
      resolve({ fields, savedFile });
    });

    busboy.on('error', reject);
    req.pipe(busboy);
  });
}

function renderCreditUploadPage(user = null, message = '') {
  const cases = dbQuery(`
    SELECT cc.id, cl.full_name, cc.bureau, cc.disputed_item
    FROM credit_cases cc
    JOIN credit_clients cl ON cl.id = cc.client_id
    ORDER BY cc.id DESC
  `);

  const docs = dbQuery(`
    SELECT d.id, d.doc_name, d.doc_type, d.analysis_status, d.file_path, d.created_at,
           c.id as case_id
    FROM credit_documents d
    LEFT JOIN credit_cases c ON c.id = d.case_id
    ORDER BY d.id DESC
    LIMIT 25
  `);

  const options = cases.map(c =>
    `<option value="${c.id}">${c.full_name} — ${c.bureau} — ${c.disputed_item}</option>`
  ).join('');

  const docRows = docs.map(d => `
    <tr>
      <td>${d.id}</td>
      <td>${d.doc_name || ''}</td>
      <td>${d.doc_type || ''}</td>
      <td>${d.analysis_status || ''}</td>
      <td>${d.created_at || ''}</td>
      <td><code>${d.file_path || ''}</code></td>
    </tr>
  `).join('');

  return htmlPage('Upload Document', `
    <div class="section">
      <div class="card">
        <h2>Upload Credit Document</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <form method="POST" action="/credit-repair/upload" enctype="multipart/form-data">
          <label>Case</label>
          <select name="case_id">${options}</select>

          <label>Document Type</label>
          <select name="doc_type">
            <option value="credit_report">Credit Report</option>
            <option value="id">ID</option>
            <option value="letter">Letter</option>
            <option value="proof">Proof Document</option>
            <option value="tax_transcript">Tax Transcript</option>
            <option value="income_proof">Income Proof</option>
          </select>

          <label>Notes</label>
          <textarea name="notes" rows="4" placeholder="What is this document for?"></textarea>

          <label>File</label>
          <input type="file" name="file" required>

          <button type="submit">Upload Document</button>
        </form>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Recent Uploaded Documents</h3>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th><th>Path</th></tr></thead>
          <tbody>${docRows || '<tr><td colspan="6">No documents yet.</td></tr>'}</tbody>
        </table>
      </div>
        <script>
      setInterval(async () => {
        try {
          const path = window.location.pathname;
          const parts = path.split('/');
          const sceneId = parts[2];
          if (!sceneId) return;
          const res = await fetch('/api/world-sync/' + sceneId);
          const data = await res.json();
          const el = document.getElementById('liveSyncStatus');
          if (el) {
            el.textContent = 'Live Sync — Presence: ' + data.online_presence + ' | Events: ' + data.event_count + ' | Updated: ' + new Date().toLocaleTimeString();
          }

          const pushRes = await fetch('/api/live-push/' + sceneId);
          const pushData = await pushRes.json();
          const pushEl = document.getElementById('livePushStatus');
          if (pushEl) {
            pushEl.textContent = 'Live Push — Alerts: ' + (pushData.alerts ? pushData.alerts.length : 0) + ' | Notifications: ' + (pushData.notifications ? pushData.notifications.length : 0) + ' | Updated: ' + new Date().toLocaleTimeString();
          }
        } catch (e) {}
      }, 5000);
    </script>
  </div>
  `, user);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const parsed = new URLSearchParams(body);
      const out = {};
      for (const [k, v] of parsed.entries()) out[k] = v;
      resolve(out);
    });
    req.on('error', reject);
  });
}

function htmlPage(title, content) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="description" content="AI-powered marketplace, credit repair, branch growth, and business operating system" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="Powered by All American Marketplace AI" />
  <meta property="og:type" content="website" />
  <title>${title}</title>
  <style>
    body {
 font-family: Arial, sans-serif; background:#0f172a; color:#e2e8f0; margin:0; padding:20px; }
    .topbar,.card { background:#111827; border:1px solid #334155; border-radius:16px; padding:16px; }
    .topbar { margin-bottom:20px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; }
    .section { margin-top:24px; }
    .pill { display:inline-block; padding:6px 10px; background:#1d4ed8; border-radius:999px; margin-right:6px; margin-top:6px; font-size:13px; }
    a,button { color:white; background:#2563eb; border:none; border-radius:10px; padding:10px 14px; text-decoration:none; display:inline-block; margin-right:8px; cursor:pointer; }
    a.secondary { background:#475569; }
    a.danger, button.danger { background:#b91c1c; }
    ul { padding-left:18px; }
    .muted { color:#94a3b8; }
    input,select,textarea { width:100%; box-sizing:border-box; padding:10px; margin:8px 0 12px 0; border-radius:10px; border:1px solid #334155; background:#020617; color:#e2e8f0; }
    .ok { color:#86efac; }

    .portal-shell { min-height:100vh; background:
      radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 32%),
      radial-gradient(circle at top right, rgba(14,165,233,0.12), transparent 26%),
      linear-gradient(180deg,#020617 0%,#0b1220 100%);
    }
    .portal-topbar { position:sticky; top:0; z-index:20; backdrop-filter: blur(12px); background:rgba(2,6,23,0.72); border-bottom:1px solid rgba(51,65,85,0.8); }
    .portal-topbar-inner { max-width:1280px; margin:0 auto; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:18px; }
    .portal-brand { display:flex; align-items:center; gap:14px; min-width:0; }
    .portal-brand-mark { width:48px; height:48px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-weight:800; letter-spacing:1px; background:linear-gradient(135deg,#2563eb,#06b6d4); color:white; box-shadow:0 10px 30px rgba(37,99,235,0.35); }
    .portal-brand-title { font-size:18px; font-weight:700; color:#f8fafc; }
    .portal-brand-sub { font-size:12px; color:#93c5fd; letter-spacing:1px; text-transform:uppercase; }
    .portal-main-nav { display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:center; }
    .portal-main-nav a { color:#cbd5e1; text-decoration:none; padding:10px 14px; border-radius:999px; border:1px solid rgba(51,65,85,0.9); background:rgba(15,23,42,0.72); }
    .portal-main-nav a:hover { background:#1d4ed8; color:white; }
    .portal-actions { display:flex; align-items:center; }
    .portal-admin-btn { background:#f8fafc; color:#0f172a; text-decoration:none; padding:11px 16px; border-radius:12px; font-weight:700; }
    .portal-main { max-width:1280px; margin:0 auto; padding:28px 20px 56px 20px; }
    .portal-hero { display:grid; grid-template-columns:1.35fr .85fr; gap:22px; align-items:stretch; }
    .portal-hero-copy, .portal-hero-panel { background:linear-gradient(180deg,rgba(17,24,39,0.95),rgba(10,15,28,0.95)); border:1px solid rgba(51,65,85,0.95); border-radius:28px; padding:28px; box-shadow:0 18px 60px rgba(0,0,0,0.28); }
    .portal-kicker { font-size:12px; text-transform:uppercase; letter-spacing:1.6px; color:#7dd3fc; margin-bottom:12px; }
    .portal-hero-copy h1, .portal-subhero h1 { font-size:50px; line-height:1.02; margin:0 0 14px 0; color:#f8fafc; }
    .portal-hero-copy p, .portal-subhero p { font-size:17px; line-height:1.72; color:#cbd5e1; max-width:780px; }
    .portal-hero-actions { display:flex; flex-wrap:wrap; gap:14px; margin-top:22px; }
    .portal-hero-actions a { text-decoration:none; padding:13px 18px; border-radius:14px; background:#2563eb; color:white; font-weight:700; }
    .portal-hero-actions a.secondary { background:#1e293b; }
    .signal-card { height:100%; border-radius:22px; background:linear-gradient(180deg,#020617,#0f172a); border:1px solid rgba(30,41,59,0.95); padding:24px; display:flex; flex-direction:column; justify-content:center; }
    .signal-label { font-size:12px; text-transform:uppercase; letter-spacing:1.5px; color:#7dd3fc; }
    .signal-value { margin-top:10px; font-size:34px; font-weight:800; color:#f8fafc; }
    .signal-note { margin-top:10px; color:#94a3b8; line-height:1.65; }
    .portal-status-strip { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:12px; margin-top:18px; }
    .status-chip { background:rgba(15,23,42,0.82); border:1px solid rgba(51,65,85,0.95); border-radius:16px; padding:14px; color:#cbd5e1; text-align:center; }
    .status-chip span { display:block; font-size:24px; font-weight:800; color:#f8fafc; margin-bottom:4px; }
    .portal-gateway-grid, .command-core-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:18px; margin-top:24px; }
    .portal-gateway { display:grid; grid-template-columns:64px 1fr auto; gap:16px; align-items:center; text-decoration:none; padding:22px; border-radius:24px; background:linear-gradient(180deg,rgba(17,24,39,0.96),rgba(12,18,33,0.96)); border:1px solid rgba(51,65,85,0.95); box-shadow:0 14px 40px rgba(0,0,0,0.22); color:#e2e8f0; }
    .portal-gateway:hover { transform:translateY(-2px); border-color:#3b82f6; }
    .portal-gateway-icon { width:64px; height:64px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:28px; background:linear-gradient(135deg,rgba(37,99,235,0.22),rgba(6,182,212,0.22)); color:#7dd3fc; }
    .portal-gateway-copy h3 { margin:0 0 6px 0; font-size:22px; color:#f8fafc; }
    .portal-gateway-copy p { margin:0; color:#94a3b8; line-height:1.6; }
    .portal-gateway-arrow { font-size:24px; color:#60a5fa; }
    .portal-feature-band { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; margin-top:24px; }
    .portal-band-card { background:rgba(15,23,42,0.85); border:1px solid rgba(51,65,85,0.95); border-radius:22px; padding:22px; }
    .portal-band-card h3 { margin:0 0 10px 0; color:#f8fafc; font-size:22px; }
    .portal-band-card p { margin:0; color:#94a3b8; line-height:1.7; }
    .portal-subhero { margin-bottom:20px; padding:10px 0 8px 0; }
    @media (max-width: 1100px) {
      .portal-topbar-inner { flex-wrap:wrap; }
      .portal-hero { grid-template-columns:1fr; }
      .portal-status-strip { grid-template-columns:repeat(3,minmax(0,1fr)); }
      .portal-feature-band { grid-template-columns:1fr; }
    }
    @media (max-width: 700px) {
      .portal-hero-copy h1, .portal-subhero h1 { font-size:34px; }
      .portal-status-strip { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .portal-main-nav { justify-content:flex-start; }
      .portal-gateway { grid-template-columns:56px 1fr; }
      .portal-gateway-arrow { display:none; }
    }


    .app-shell { min-height:100vh; }
    .page-wrap { max-width:1180px; margin:0 auto; padding:24px 16px 48px 16px; }
    .hero-bar { max-width:1180px; margin:0 auto; padding:28px 16px 8px 16px; }
    .eyebrow { font-size:12px; letter-spacing:1.6px; text-transform:uppercase; color:#93c5fd; margin-bottom:10px; }
    .hero-title { font-size:36px; line-height:1.05; margin:0; }
    .hero-subtitle { max-width:760px; color:#94a3b8; font-size:15px; line-height:1.6; margin-top:10px; }
    .clean-nav { max-width:1180px; margin:0 auto; padding:10px 16px 0 16px; display:flex; flex-wrap:wrap; gap:10px; }
    .clean-nav a { background:#1e293b; border:1px solid #334155; border-radius:999px; padding:10px 14px; text-decoration:none; color:#e2e8f0; }
    .clean-nav a:hover { background:#2563eb; }
    .admin-nav a { background:#0f172a; }
    .landing-hero { display:grid; grid-template-columns:1.4fr 1fr; gap:20px; align-items:stretch; margin-top:16px; }
    .landing-copy, .hero-panel { background:#111827; border:1px solid #334155; border-radius:22px; padding:24px; }
    .landing-copy h1 { font-size:42px; line-height:1.02; margin:0 0 14px 0; }
    .landing-copy p { color:#cbd5e1; line-height:1.7; font-size:16px; }
    .hero-actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:18px; }
    .hero-actions a { display:inline-block; padding:12px 18px; border-radius:12px; text-decoration:none; background:#2563eb; color:white; }
    .hero-actions a.secondary { background:#334155; }
    .stats-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
    .stat-card { background:#020617; border:1px solid #1e293b; border-radius:18px; padding:18px; }
    .stat-label { color:#94a3b8; font-size:12px; text-transform:uppercase; letter-spacing:1px; }
    .stat-value { font-size:32px; font-weight:700; margin-top:8px; }
    .stat-note { color:#64748b; font-size:13px; margin-top:6px; }
    .clean-section { margin-top:28px; }
    .section-head h2 { margin:0; font-size:26px; }
    .section-head p { color:#94a3b8; margin:8px 0 0 0; }
    .section-body {
 margin-top:14px; }
    .feature-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }
    .feature-card { background:#111827; border:1px solid #334155; border-radius:20px; padding:20px; box-shadow:0 8px 24px rgba(0,0,0,.18); }
    .feature-card h3 { margin:0 0 10px 0; font-size:20px; }
    .feature-card p { color:#94a3b8; line-height:1.6; }
    .feature-link { display:inline-block; margin-top:10px; padding:10px 14px; background:#2563eb; color:white; border-radius:12px; text-decoration:none; }
    .article-list { display:grid; gap:10px; }
    .article-row { display:block; background:#111827; border:1px solid #334155; border-radius:14px; padding:14px; color:#e2e8f0; text-decoration:none; }
    table { width:100%; border-collapse:collapse; overflow:hidden; border-radius:14px; }
    thead th { background:#0f172a; color:#cbd5e1; text-align:left; padding:12px; border-bottom:1px solid #334155; }
    tbody td { padding:12px; border-bottom:1px solid #1e293b; vertical-align:top; }
    tbody tr:hover { background:rgba(255,255,255,0.02); }
    @media (max-width: 900px) {
      .landing-hero { grid-template-columns:1fr; }
      .landing-copy h1 { font-size:34px; }
      .hero-title { font-size:30px; }
      .stats-grid { grid-template-columns:1fr 1fr; }
    }
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns:1fr; }
      .clean-nav { gap:8px; }
      .clean-nav a { padding:9px 12px; font-size:14px; }
      .feature-grid { grid-template-columns:1fr; }
    }

    .warn { color:#fbbf24; }
    .danger-text { color:#fca5a5; }
    table { width:100%; border-collapse:collapse; }
    th,td { border-bottom:1px solid #334155; text-align:left; padding:10px; vertical-align:top; }
    form.inline { display:inline; }
  
.compact-grid { gap: 14px; }
.compact-card { min-height: 160px; border-radius: 18px; }
.compact-card-head { margin-bottom: 8px; }
.cleaner-main { gap: 20px; }
.clean-hero { padding-bottom: 10px; }
.role-nav a { white-space: nowrap; }


.premium-shell { background: linear-gradient(180deg,#020617 0%,#071226 45%,#0f172a 100%); }
.premium-main { gap: 24px; }
.premium-hero {
  display: grid;
  grid-template-columns: 1.4fr .9fr;
  gap: 20px;
  align-items: stretch;
  padding: 26px;
  border: 1px solid #1e293b;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.88);
  box-shadow: 0 12px 40px rgba(0,0,0,.25);
}
.premium-hero-copy h1 { font-size: 2.3rem; line-height: 1.05; margin: 8px 0 14px 0; }
.premium-cta-row { display:flex; flex-wrap:wrap; gap:12px; margin-top:16px; }
.hero-primary-btn, .hero-secondary-btn, .hero-action-link {
  display:inline-block; padding:12px 16px; border-radius:14px; text-decoration:none;
}
.hero-primary-btn { background:#2563eb; color:white; }
.hero-secondary-btn { background:#111827; color:white; border:1px solid #334155; }
.hero-action-grid {
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap:16px;
}
.hero-action-card {
  border:1px solid #23324a;
  border-radius:20px;
  padding:18px;
  background:rgba(2,6,23,.88);
  box-shadow:0 10px 28px rgba(0,0,0,.2);
}
.hero-action-card h3 { margin-bottom:8px; }
.premium-section {
  border:1px solid #1e293b;
  border-radius:22px;
  overflow:hidden;
  background:rgba(15,23,42,.88);
}
.premium-section-head { padding:18px 20px 0 20px; }
.premium-section-body { padding:18px 20px 20px 20px; }
@media (max-width: 900px) {
  .premium-hero { grid-template-columns: 1fr; }
}


.skip-link {
  position:absolute;
  left:-9999px;
  top:auto;
  width:1px;
  height:1px;
  overflow:hidden;
}
.skip-link:focus {
  left:16px;
  top:16px;
  width:auto;
  height:auto;
  z-index:9999;
  background:#111827;
  color:#fff;
  padding:12px 16px;
  border-radius:12px;
}
html { scroll-behavior: auto; }
body.accessible, .accessible-shell, .accessible-main {
  font-size: 18px;
  line-height: 1.6;
}
a, button, input, select, textarea {
  min-height: 48px;
}
button, .hero-primary-btn, .hero-secondary-btn, .hero-action-link, .feature-link {
  padding-top: 14px !important;
  padding-bottom: 14px !important;
}
:focus {
  outline: 3px solid #60a5fa !important;
  outline-offset: 3px !important;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}

</style>
</head>
<body>
  <div class="topbar">
    <h1>All American Marketplace OS</h1>
    <p class="muted">Marketplace • University • Archive • All American Marketplace Portal</p>
    <div>
      <span class="pill">Live</span>
      <span class="pill">Port 4900</span>
      <span class="pill">SQLite CLI</span>
    </div>
    <div style="margin-top:14px;">
      <a href="/">Dashboard</a>
      <a href="/university">University</a>
      <a href="/marketplace">Marketplace</a>
      <a href="/archive">Archive</a>
      <a href="/business-manager">Business Manager</a>
      <a href="/payments">Payments</a>
      <a href="/credit-repair">Credit Repair</a>
      <a href="/audit-logs">Audit Logs</a>
      <a href="/letters">Letters</a>
      <a href="/compliance">Compliance</a>
      <a href="/search-engine">Search</a>
      <a href="/blog">Blog</a>
      <a href="/barcodes">Barcodes</a>
      <a href="/logistics">Logistics</a>
      <a href="/iot">IoT</a>
      <a href="/wallets">Wallets</a>
      <a href="/receipts">Receipts</a>
      <a href="/books">Books</a>
      <a href="/receipts">Receipts</a>
      <a href="/wallet-transactions">Wallet Tx</a>
      <a href="/barcode-lookup">Barcode Lookup</a>
      <a href="/podcasts">Podcasts</a>
      <a href="/rooms">Group Rooms</a>
      <a href="/credit-repair/upload">Upload Docs</a>
      <a href="/credit-repair/upload">Upload Docs</a>
      <a href="/people/add">Add Person</a>
      <a href="http://127.0.0.1:5000/">Jarvis</a>
      <a class="secondary" href="/health">Health</a>
    </div>
  </div>
  ${content}
</body>
</html>`;
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function getRules() {
  const rows = dbQuery("SELECT key, value FROM rules ORDER BY key");
  const rules = {};
  for (const row of rows) rules[row.key] = row.value;
  return rules;
}

function getPeopleWithBusinesses() {
  const people = dbQuery("SELECT id, name, role FROM people ORDER BY id");
  for (const p of people) {
    p.businesses = dbQuery(`SELECT id, name FROM businesses WHERE person_id = ${Number(p.id)} ORDER BY id`);
  }
  return people;
}

function renderDashboard() {
  const people = getPeopleWithBusinesses();
  const totalBusinesses = people.reduce((sum, p) => sum + p.businesses.length, 0);

  const peopleCards = people.map(person => {
    const businesses = person.businesses.map(b => `<li>${b.name}</li>`).join('');
    return `
      <div class="card">
        <h2><a href="/people/${person.id}">${person.name}</a></h2>
        <p><strong>Role:</strong> ${person.role}</p>
        <p><strong>Businesses:</strong> ${person.businesses.length}</p>
        <ul>${businesses}</ul>
      </div>
    `;
  }).join('');

  return htmlPage('AAM Dashboard', `
    <div class="section">
      <div class="grid">
        <div class="card"><h3>People / Units</h3><p>${people.length}</p></div>
        <div class="card"><h3>Businesses</h3><p>${totalBusinesses}</p></div>
        <div class="card"><h3>Archive</h3><p><a href="/archive">View Notes</a></p></div>
      </div>
    </div>

    <div class="section">
      <h2>Family + Platform Network</h2>
      <div class="grid">${peopleCards}</div>
    </div>
  `);
}

function renderUniversity() {
  const rows = [
    ["Logistics + Freight", "Nekira Frances, dispatch, freight broker, operations"],
    ["Staffing + Wellness", "Tasha Ash, March & Lewis, Sculptify Ltd"],
    ["Insurance + Banking", "Raymond Jarreau, OmniCare 360, infinite banking, FinBank"],
    ["Security + Compliance", "Alton Security, conceal carry, compliance, cyber security"],
    ["Music + Streaming", "BJ, Isaiah, label systems, AI TV, creator promotion"],
    ["Game Development", "Game studio build path and publishing support"],
    ["Fintech", "Aniyah cross-border app, youth finance, crypto/forex/stock learning"],
    ["Creator Tools", "Vocal training, AI mixing, mastering, easy DAW flows"],
    ["Banking + Credit", "El Saturn FinBank, Stubbs / Lyons / Abraham credit products"]
  ].map(t => `<tr><td>${t[0]}</td><td>${t[1]}</td><td>Free for approved members</td></tr>`).join('');

  return htmlPage('All American University', `
    <div class="section">
      <div class="card">
        <h2>All American University</h2>
        <p>Education pipeline for family, community, and approved builders. Learn → build → earn.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>Track</th><th>Focus</th><th>Access</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `);
}

function renderMarketplace() {
  const rows = dbQuery(`
    SELECT b.id, b.name AS business_name, p.id AS person_id, p.name AS person_name, p.role
    FROM businesses b
    JOIN people p ON p.id = b.person_id
    ORDER BY b.id DESC
  `);

  const cards = rows.map(item => `
    <div class="card">
      <h3>${item.business_name}</h3>
      <p><strong>Owner:</strong> <a href="/people/${item.person_id}">${item.person_name}</a></p>
      <p><strong>Role:</strong> ${item.role}</p>
    </div>
  `).join('');

  return htmlPage('Marketplace', `
    <div class="section">
      <div class="card">
        <h2>Marketplace Directory</h2>
        <p>All business lines across the ecosystem.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards}</div>
    </div>
  `);
}

function renderArchive(query = '') {
  const safe = q(query);
  const rows = query
    ? dbQuery(`SELECT id, title, content, created_at FROM archive_notes WHERE title LIKE '%${safe}%' OR content LIKE '%${safe}%' ORDER BY id DESC`)
    : dbQuery(`SELECT id, title, content, created_at FROM archive_notes ORDER BY id DESC`);

  const cards = rows.map(note => `
    <div class="card">
      <h3>${note.title}</h3>
      <p class="muted">${note.created_at}</p>
      <p>${note.content}</p>
    </div>
  `).join('');

  return htmlPage('Archive', `
    <div class="section">
      <div class="grid">
        <div class="card">
          <h2>Archive Search</h2>
          <form method="GET" action="/archive">
            <label>Search notes</label>
            <input type="text" name="q" value="${query.replace(/"/g, '&quot;')}" placeholder="Search archive notes" />
            <button type="submit">Search</button>
          </form>
        </div>
        <div class="card">
          <h2>Add Archive Note</h2>
          <form method="POST" action="/archive/add">
            <label>Title</label>
            <input type="text" name="title" required />
            <label>Content</label>
            <textarea name="content" rows="6" required></textarea>
            <button type="submit">Add Note</button>
          </form>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Archive Notes</h2>
      <div class="grid">${cards || '<div class="card"><p>No archive notes found.</p></div>'}</div>
    </div>
  `);
}

function renderBusinessManager(message = '') {
  const rules = getRules();
  const freeLimit = Number(rules.free_business_limit || 2);
  const people = getPeopleWithBusinesses();

  const options = people.map((p) =>
    `<option value="${p.id}">${p.name} (${p.role})</option>`
  ).join('');

  const tableRows = people.map((p) => {
    const used = p.businesses.filter(b => b.name !== 'Free Business Slot 1' && b.name !== 'Free Business Slot 2').length;
    const remainingFree = Math.max(0, freeLimit - used);
    const status = remainingFree > 0
      ? `<span class="ok">${remainingFree} free left</span>`
      : `<span class="warn">payment required</span>`;

    return `
      <tr>
        <td><a href="/people/${p.id}">${p.name}</a></td>
        <td>${p.role}</td>
        <td>${used}</td>
        <td>${status}</td>
      </tr>
    `;
  }).join('');

  return htmlPage('Business Manager', `
    <div class="section">
      <div class="card">
        <h2>Business Manager</h2>
        <p>First <strong>${freeLimit}</strong> businesses are free, then additional businesses require payment.</p>
        ${message ? `<p class="ok"><strong>${message}</strong></p>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Add Business</h3>
          <form method="POST" action="/business-manager/add">
            <label>Person</label>
            <select name="personId">${options}</select>
            <label>Business Name</label>
            <input type="text" name="businessName" required />
            <button type="submit">Add Business</button>
          </form>
        </div>
        <div class="card">
          <h3>Rule</h3>
          <p><strong>Paid message:</strong> ${rules.paid_message}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Count</th><th>Status</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  `);
}

function renderPersonDetail(personId) {
  const people = dbQuery(`SELECT id, name, role FROM people WHERE id = ${Number(personId)}`);
  if (!people.length) {
    return htmlPage('Person Not Found', `<div class="card"><h2>Person not found</h2></div>`);
  }

  const person = people[0];
  const businesses = dbQuery(`SELECT id, name FROM businesses WHERE person_id = ${Number(personId)} ORDER BY id DESC`);

  const businessRows = businesses.map(b => `
    <tr>
      <td>${b.name}</td>
      <td>
        <form class="inline" method="POST" action="/business/delete">
          <input type="hidden" name="businessId" value="${b.id}" />
          <input type="hidden" name="personId" value="${personId}" />
          <button class="danger" type="submit">Delete</button>
        </form>
      </td>
    </tr>
  `).join('');

  return htmlPage(person.name, `
    <div class="section">
      <div class="card">
        <h2>${person.name}</h2>
        <p><strong>Role:</strong> ${person.role}</p>
        <a href="/business-manager">Back to Business Manager</a>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Add Business</h3>
          <form method="POST" action="/business-manager/add">
            <input type="hidden" name="personId" value="${person.id}" />
            <label>Business Name</label>
            <input type="text" name="businessName" required />
            <button type="submit">Add Business</button>
          </form>
        </div>
        <div class="card">
          <h3>Businesses</h3>
          <table>
            <thead><tr><th>Business</th><th>Action</th></tr></thead>
            <tbody>${businessRows || '<tr><td colspan="2">No businesses yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `);
}

function renderAddPersonPage(message = '') {
  return htmlPage('Add Person', `
    <div class="section">
      <div class="card">
        <h2>Add Person</h2>
        ${message ? `<p class="ok"><strong>${message}</strong></p>` : ''}
        <form method="POST" action="/people/add">
          <label>Name</label>
          <input type="text" name="name" required />
          <label>Role</label>
          <input type="text" name="role" required />
          <button type="submit">Add Person</button>
        </form>
      </div>
    </div>
  `);
}


function money(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

function renderPaymentsPage() {
  const rows = dbQuery(`
    SELECT pay.id, pay.business_name, pay.amount_cents, pay.status, pay.created_at, pay.paid_at,
           p.id AS person_id, p.name AS person_name
    FROM payments pay
    JOIN people p ON p.id = pay.person_id
    ORDER BY pay.id DESC
  `);

  const cards = rows.map(r => `
    <div class="card">
      <h3>${r.business_name}</h3>
      <p><strong>Person:</strong> <a href="/people/${r.person_id}">${r.person_name}</a></p>
      <p><strong>Amount:</strong> ${money(r.amount_cents)}</p>
      <p><strong>Status:</strong> ${r.status}</p>
      <p class="muted">Created: ${r.created_at}</p>
      ${r.paid_at ? `<p class="muted">Paid: ${r.paid_at}</p>` : ''}
      <a href="/payments/${r.id}">View Invoice</a>
      ${r.status !== 'paid' ? `
      <form class="inline" method="POST" action="/payments/mark-paid">
        <input type="hidden" name="paymentId" value="${r.id}">
        <button class="warn" type="submit">Mark Paid</button>
      </form>` : ''}
    </div>
  `).join('');

  return htmlPage('Payments', `
    <div class="section">
      <div class="card">
        <h2>Payments</h2>
        <p>Prototype payment records for extra business creation.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No payments yet.</p></div>'}</div>
    </div>
  `);
}




function renderPaymentDetail(paymentId) {
  const payRows = dbQuery(`SELECT id, person_id, business_name, amount_cents, status, note, created_at, paid_at FROM payments WHERE id = ${Number(paymentId)} LIMIT 1`);
  if (!payRows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Payment not found</h2></div>`);
  }

  const r = payRows[0];
  const personRows = dbQuery(`SELECT id, name FROM people WHERE id = ${Number(r.person_id)} LIMIT 1`);
  const personName = personRows.length ? personRows[0].name : 'Unknown';

  return htmlPage('Payment Invoice', `
    <div class="section">
      <div class="card">
        <h2>Invoice #${r.id}</h2>
        <p><strong>Person:</strong> <a href="/people/${r.person_id}">${personName}</a></p>
        <p><strong>Business:</strong> ${r.business_name}</p>
        <p><strong>Amount:</strong> ${money(r.amount_cents)}</p>
        <p><strong>Status:</strong> ${r.status}</p>
        <p><strong>Note:</strong> ${r.note || 'No note'}</p>
        <p class="muted">Created: ${r.created_at}</p>
        ${r.paid_at ? `<p class="muted">Paid: ${r.paid_at}</p>` : ''}
      </div>
    </div>
  `);
}




function renderBranchDashboard(personId, user = null) {
  const people = dbQuery(`SELECT id, name, role FROM people WHERE id = ${Number(personId)} LIMIT 1`);
  if (!people.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Branch not found</h2></div>`, user);
  }

  const person = people[0];
  const businesses = dbQuery(`SELECT id, name FROM businesses WHERE person_id = ${Number(personId)} ORDER BY id DESC`);
  const payments = dbQuery(`SELECT id, business_name, amount_cents, status, created_at FROM payments WHERE person_id = ${Number(personId)} ORDER BY id DESC LIMIT 10`);
  const notes = dbQuery(`SELECT id, title, created_at FROM archive_notes ORDER BY id DESC LIMIT 10`);

  const businessItems = businesses.map(b => `<li>${b.name}</li>`).join('');
  const paymentItems = payments.map(pay => `<li>#${pay.id} — ${pay.business_name} — ${money(pay.amount_cents)} — ${pay.status}</li>`).join('');
  const noteItems = notes.map(n => `<li>${n.title} — ${n.created_at}</li>`).join('');

  return htmlPage(`${person.name} Branch`, `
    <div class="section">
      <div class="card">
        <h2>${person.name}</h2>
        <p><strong>Role:</strong> ${person.role}</p>
        <a href="/people/${person.id}">Open Person Profile</a>
        <a href="/business-manager">Business Manager</a>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Businesses</h3>
          <ul>${businessItems || '<li>No businesses yet.</li>'}</ul>
        </div>

        <div class="card">
          <h3>Payments</h3>
          <ul>${paymentItems || '<li>No payments yet.</li>'}</ul>
        </div>

        <div class="card">
          <h3>Recent Archive Notes</h3>
          <ul>${noteItems || '<li>No notes yet.</li>'}</ul>
        </div>
      </div>
    </div>
  `, user);
}


function renderCreditRepairPage(user = null, message = '') {
  const clients = dbQuery("SELECT id, full_name, email, phone, created_at FROM credit_clients ORDER BY id DESC");
  const cases = dbQuery(`
    SELECT cc.id, cl.full_name, cc.bureau, cc.disputed_item, cc.case_status, cc.date_opened
    FROM credit_cases cc
    JOIN credit_clients cl ON cl.id = cc.client_id
    ORDER BY cc.id DESC
  `);

  const clientRows = clients.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.full_name}</td>
      <td>${c.email || ''}</td>
      <td>${c.phone || ''}</td>
      <td>${c.created_at}</td>
    </tr>
  `).join('');

  const caseRows = cases.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.full_name}</td>
      <td>${c.bureau}</td>
      <td>${c.disputed_item}</td>
      <td>${c.case_status}</td>
      <td>${c.date_opened}</td>
    </tr>
  `).join('');

  return htmlPage('Credit Repair', `
    <div class="section">
      <div class="card">
        <h2>Credit Repair / Financial Recovery</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <p>Compliant dispute operations workspace for intake, case tracking, letters, and document support.</p>
        <a href="/credit-repair/clients/add">Add Client</a>
        <a href="/credit-repair/cases/add">Add Case</a>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Clients</h3>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Created</th></tr></thead>
            <tbody>${clientRows || '<tr><td colspan="5">No clients yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Cases</h3>
          <table>
            <thead><tr><th>ID</th><th>Client</th><th>Bureau</th><th>Disputed Item</th><th>Status</th><th>Opened</th></tr></thead>
            <tbody>${caseRows || '<tr><td colspan="6">No cases yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}

function renderCreditClientAddPage(user = null, message = '') {
  return htmlPage('Add Credit Client', `
    <div class="section">
      <div class="card">
        <h2>Add Credit Client</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <form method="POST" action="/credit-repair/clients/add">
          <label>Full Name</label>
          <input type="text" name="full_name" required>
          <label>Email</label>
          <input type="email" name="email">
          <label>Phone</label>
          <input type="text" name="phone">
          <label>City</label>
          <input type="text" name="city">
          <label>State</label>
          <input type="text" name="state">
          <label><input type="checkbox" name="consent_signed" value="1"> Consent Signed</label>
          <label><input type="checkbox" name="croa_disclosure_signed" value="1"> CROA Disclosure Signed</label>
          <button type="submit">Create Client</button>
        </form>
      </div>
    </div>
  `, user);
}

function renderCreditCaseAddPage(user = null, message = '') {
  const clients = dbQuery("SELECT id, full_name FROM credit_clients ORDER BY full_name COLLATE NOCASE");
  const options = clients.map(c => `<option value="${c.id}">${c.full_name}</option>`).join('');

  return htmlPage('Add Credit Case', `
    <div class="section">
      <div class="card">
        <h2>Add Credit Case</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <form method="POST" action="/credit-repair/cases/add">
          <label>Client</label>
          <select name="client_id" required>${options}</select>
          <label>Bureau</label>
          <select name="bureau" required>
            <option value="Experian">Experian</option>
            <option value="Equifax">Equifax</option>
            <option value="TransUnion">TransUnion</option>
            <option value="Furnisher Direct">Furnisher Direct</option>
          </select>
          <label>Disputed Item</label>
          <input type="text" name="disputed_item" required>
          <label>Dispute Reason</label>
          <textarea name="dispute_reason" rows="6" required></textarea>
          <label>Due Date</label>
          <input type="date" name="due_date">
          <button type="submit">Create Case</button>
        </form>
      </div>
    </div>
  `, user);
}



function renderCreditUploadPage(user = null, message = '') {
  const cases = dbQuery(`
    SELECT cc.id, cl.full_name, cc.bureau, cc.disputed_item
    FROM credit_cases cc
    JOIN credit_clients cl ON cl.id = cc.client_id
    ORDER BY cc.id DESC
  `);

  const options = cases.map(c =>
    `<option value="${c.id}">${c.full_name} — ${c.bureau} — ${c.disputed_item}</option>`
  ).join('');

  return htmlPage('Upload Document', `
    <div class="section">
      <div class="card">
        <h2>Upload Credit Document</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}

        <form method="POST" action="/credit-repair/upload" enctype="multipart/form-data">
          <label>Case</label>
          <select name="case_id">${options}</select>

          <label>Document Type</label>
          <select name="document_type">
            <option value="credit_report">Credit Report</option>
            <option value="id">ID</option>
            <option value="letter">Letter</option>
            <option value="proof">Proof Document</option>
          </select>

          <label>Upload File</label>
          <input type="file" name="file" required>

          <button type="submit">Upload</button>
        </form>
      </div>
    </div>
  `, user);
}


function renderCreditDocumentReviewPage(docId, user = null, message = '') {
  const rows = dbQuery(`
    SELECT d.id, d.doc_name, d.doc_type, d.file_path, d.notes, d.analysis_status, d.created_at,
           c.id as case_id, c.disputed_item, c.bureau
    FROM credit_documents d
    LEFT JOIN credit_cases c ON c.id = d.case_id
    WHERE d.id = ${Number(docId)}
    LIMIT 1
  `);

  if (!rows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Document not found</h2></div>`, user);
  }

  const d = rows[0];

  return htmlPage('Review Document', `
    <div class="section">
      <div class="card">
        <h2>Review Credit Document #${d.id}</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <p><strong>Name:</strong> ${d.doc_name || ''}</p>
        <p><strong>Type:</strong> ${d.doc_type || ''}</p>
        <p><strong>Status:</strong> ${d.analysis_status || ''}</p>
        <p><strong>Case:</strong> ${d.case_id || ''} ${d.bureau ? '— ' + d.bureau : ''} ${d.disputed_item ? '— ' + d.disputed_item : ''}</p>
        <p><strong>Notes:</strong> ${d.notes || ''}</p>
        <p><strong>Path:</strong> <code>${d.file_path || ''}</code></p>
        <p class="muted"><strong>Created:</strong> ${d.created_at || ''}</p>

        <form method="POST" action="/credit-repair/documents/${d.id}/status">
          <label>Analysis Status</label>
          <select name="analysis_status">
            <option value="uploaded">Uploaded</option>
            <option value="queued">Queued</option>
            <option value="reviewing">Reviewing</option>
            <option value="analyzed">Analyzed</option>
            <option value="ready_for_letter">Ready For Letter</option>
          </select>
          <button type="submit">Update Status</button>
        </form>
      </div>
    </div>
  `, user);
}


function logAudit(action, entityType, entityId, meta = '') {
  dbRun(`INSERT INTO audit_logs (action, entity_type, entity_id, meta)
         VALUES ('${q(action)}','${q(entityType)}',${Number(entityId)||0},'${q(meta)}')`);
}


function renderCreditCaseDetail(caseId, user=null) {
  const c = dbQuery(`SELECT * FROM credit_cases WHERE id=${Number(caseId)} LIMIT 1`)[0];
  if (!c) return htmlPage('Not Found', '<div class="card">Case not found</div>', user);

  const docs = dbQuery(`SELECT id,doc_name,analysis_status FROM credit_documents WHERE case_id=${caseId}`);
  const tasks = dbQuery(`SELECT id,task_title,task_status FROM credit_tasks WHERE case_id=${caseId}`);
  const letters = dbQuery(`SELECT id,letter_type FROM credit_letters WHERE case_id=${caseId}`);

  return htmlPage('Credit Case', `
    <div class="section">
      <div class="card">
        <h2>Case #${c.id}</h2>
        <p><strong>Bureau:</strong> ${c.bureau}</p>
        <p><strong>Item:</strong> ${c.disputed_item}</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Documents</h3>
        <ul>${docs.map(d=>`<li>${d.doc_name} — ${d.analysis_status}</li>`).join('')}</ul>
      </div>

      <div class="card">
        <h3>Tasks</h3>
        <ul>${tasks.map(t=>`<li>${t.task_title} — ${t.task_status}</li>`).join('')}</ul>
      </div>

      <div class="card">
        <h3>Letters</h3>
        <ul>${letters.map(l=>`<li><a href="/letters/${l.id}">${l.letter_type}</a> — Open Letter Viewer</li>`).join('')}</ul>
        <form method="POST" action="/credit-repair/generate-letter/${c.id}">
          <button type="submit">Generate AI Dispute Letter</button>
        </form>
      </div>
    </div>
  `, user);
}



function generateDisputeLetter(caseId) {
  const c = dbQuery(`SELECT * FROM credit_cases WHERE id=${Number(caseId)} LIMIT 1`)[0];
  if (!c) return "Case not found";

  const body = `
RE: Credit Dispute

Bureau: ${c.bureau}
Disputed Item: ${c.disputed_item}

I am formally disputing the above item and requesting investigation of any inaccurate, incomplete, or unverifiable information under applicable credit reporting law.

Reason:
${c.dispute_reason || ''}

Please investigate and provide the results of your reinvestigation.

Sincerely,
Client
`.trim();

  dbRun(`INSERT INTO credit_letters (case_id, letter_type, recipient, letter_body, sent_status)
         VALUES (${Number(caseId)}, 'AI_DISPUTE', '${q(c.bureau || "Credit Bureau")}', '${q(body)}', 'draft')`);

  logAudit('GENERATE_LETTER', 'credit_case', Number(caseId), 'AI dispute letter generated');
  dbRun(`INSERT INTO compliance_events (event_type, subject_type, subject_id, event_notes)
         VALUES ('LETTER_GENERATED', 'credit_case', ${Number(caseId)}, 'AI dispute letter generated')`);

  return body;
}



function renderBranchDashboard(personId) {
  const p = dbQuery(`SELECT * FROM people WHERE id=${personId}`)[0];
  const biz = dbQuery(`SELECT name FROM businesses WHERE person_id=${personId}`);

  return htmlPage('Branch Dashboard', `
    <div class="section">
      <div class="card">
        <h2>${p.name}</h2>
        <p>${p.role}</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Businesses</h3>
        <ul>${biz.map(b=>`<li>${b.name}</li>`).join('')}</ul>
      </div>
    </div>
  `);
}


function renderAuditLogsPage(user = null) {
  const rows = dbQuery("SELECT id, action, entity_type, entity_id, meta, created_at FROM audit_logs ORDER BY id DESC LIMIT 100");

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.action || ''}</td>
      <td>${r.entity_type || ''}</td>
      <td>${r.entity_id || ''}</td>
      <td>${r.meta || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Audit Logs', `
    <div class="section">
      <div class="card">
        <h2>Audit Logs</h2>
        <p>System activity ledger for letters, cases, payments, uploads, and workflow actions.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Meta</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No audit logs yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderLettersPage(user = null) {
  const rows = dbQuery(`
    SELECT id, case_id, letter_type, recipient, sent_status, created_at
    FROM credit_letters
    ORDER BY id DESC
    LIMIT 100
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td><a href="/letters/${r.id}">${r.id}</a></td>
      <td>${r.case_id || ''}</td>
      <td>${r.letter_type || ''}</td>
      <td>${r.recipient || ''}</td>
      <td>${r.sent_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Letters', `
    <div class="section">
      <div class="card">
        <h2>Generated Letters</h2>
        <p>AI-generated and manually managed dispute / compliance letters.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Case</th><th>Type</th><th>Recipient</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No letters yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderLetterDetail(letterId, user = null) {
  const rows = dbQuery(`
    SELECT id, case_id, letter_type, recipient, letter_body, sent_status, created_at
    FROM credit_letters
    WHERE id = ${Number(letterId)}
    LIMIT 1
  `);

  if (!rows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Letter not found</h2></div>`, user);
  }

  const l = rows[0];

  return htmlPage('Letter Viewer', `
    <div class="section">
      <div class="card">
        <h2>Letter #${l.id}</h2>
        <p><strong>Case:</strong> ${l.case_id || ''}</p>
        <p><strong>Type:</strong> ${l.letter_type || ''}</p>
        <p><strong>Recipient:</strong> ${l.recipient || ''}</p>
        <p><strong>Status:</strong> ${l.sent_status || ''}</p>
        <p class="muted"><strong>Created:</strong> ${l.created_at || ''}</p>
        <pre>${l.letter_body || ''}</pre>
      </div>
    </div>
  `, user);
}

function renderCompliancePage(user = null, message = '') {
  const templates = dbQuery("SELECT id, template_name, template_type, created_at FROM compliance_templates ORDER BY id DESC");
  const escalations = dbQuery("SELECT id, source_type, source_id, escalation_reason, escalation_status, created_at FROM escalation_queue ORDER BY id DESC LIMIT 50");
  const events = dbQuery("SELECT id, event_type, subject_type, subject_id, event_notes, created_at FROM compliance_events ORDER BY id DESC LIMIT 50");

  const templateRows = templates.map(t => `
    <tr>
      <td><a href="/compliance/templates/${t.id}">${t.id}</a></td>
      <td>${t.template_name}</td>
      <td>${t.template_type}</td>
      <td>${t.created_at}</td>
    </tr>
  `).join('');

  const escalationRows = escalations.map(e => `
    <tr>
      <td>${e.id}</td>
      <td>${e.source_type}</td>
      <td>${e.source_id}</td>
      <td>${e.escalation_reason}</td>
      <td>${e.escalation_status}</td>
      <td>${e.created_at}</td>
    </tr>
  `).join('');

  const eventRows = events.map(e => `
    <tr>
      <td>${e.id}</td>
      <td>${e.event_type}</td>
      <td>${e.subject_type}</td>
      <td>${e.subject_id}</td>
      <td>${e.event_notes || ''}</td>
      <td>${e.created_at}</td>
    </tr>
  `).join('');

  return htmlPage('Compliance Copilot', `
    <div class="section">
      <div class="card">
        <h2>AI Legal + Compliance Copilot</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <p>This module supports issue spotting, templates, escalation, disclosures, and compliance workflow tracking across the ecosystem.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Templates</h3>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Created</th></tr></thead>
            <tbody>${templateRows || '<tr><td colspan="4">No templates yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Escalation Queue</h3>
          <table>
            <thead><tr><th>ID</th><th>Source</th><th>Source ID</th><th>Reason</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${escalationRows || '<tr><td colspan="6">No escalations yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Compliance Events</h3>
          <table>
            <thead><tr><th>ID</th><th>Event</th><th>Subject</th><th>Subject ID</th><th>Notes</th><th>Created</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="6">No events yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}

function renderComplianceTemplate(templateId, user = null) {
  const rows = dbQuery(`
    SELECT id, template_name, template_type, template_body, created_at
    FROM compliance_templates
    WHERE id = ${Number(templateId)}
    LIMIT 1
  `);

  if (!rows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Template not found</h2></div>`, user);
  }

  const t = rows[0];

  return htmlPage('Compliance Template', `
    <div class="section">
      <div class="card">
        <h2>${t.template_name}</h2>
        <p><strong>Type:</strong> ${t.template_type}</p>
        <p class="muted"><strong>Created:</strong> ${t.created_at}</p>
        <pre>${t.template_body}</pre>
      </div>
    </div>
  `, user);
}


function runSearch(q) {
  const safe = q ? q.replace(/'/g, "''") : '';
  if (!safe) {
    return { people: [], businesses: [], payments: [], branches: [], blogs: [] };
  }

  return {
    people: dbQuery(`SELECT id, name, role FROM people WHERE name LIKE '%${safe}%' OR role LIKE '%${safe}%' ORDER BY id DESC LIMIT 20`),
    businesses: dbQuery(`SELECT b.id, b.name, p.id as person_id, p.name as person_name FROM businesses b JOIN people p ON p.id=b.person_id WHERE b.name LIKE '%${safe}%' ORDER BY b.id DESC LIMIT 20`),
    payments: dbQuery(`SELECT id, person_id, business_name, amount_cents, status FROM payments WHERE business_name LIKE '%${safe}%' ORDER BY id DESC LIMIT 20`),
    branches: dbQuery(`SELECT id, name, role FROM people WHERE name LIKE '%${safe}%' ORDER BY id DESC LIMIT 20`),
    blogs: dbQuery(`SELECT id, title, slug, created_at FROM blog_posts WHERE title LIKE '%${safe}%' OR content LIKE '%${safe}%' ORDER BY id DESC LIMIT 20`)
  };
}

function renderSearchEnginePage(user = null, query = '') {
  const results = runSearch(query);

  const peopleHtml = results.people.map(x => `<li><a href="/people/${x.id}">${x.name}</a> — ${x.role}</li>`).join('');
  const bizHtml = results.businesses.map(x => `<li><a href="/people/${x.person_id}">${x.name}</a> — ${x.person_name}</li>`).join('');
  const paymentsHtml = results.payments.map(x => `<li><a href="/payments/${x.id}">Payment #${x.id}</a> — ${x.business_name} — ${money(x.amount_cents)} — ${x.status}</li>`).join('');
  const branchesHtml = results.branches.map(x => `<li><a href="/branch/${x.id}">${x.name}</a> — ${x.role}</li>`).join('');
  const blogsHtml = results.blogs.map(x => `<li><a href="/blog/${x.slug}">${x.title}</a> — ${x.created_at}</li>`).join('');

  return htmlPage('HoloGPT Search', `
    <div class="section">
      <div class="card">
        <h2>HoloGPT Search Engine</h2>
        <p>Search people, branches, businesses, payments, and blog knowledge from inside your ecosystem.</p>
        <form method="GET" action="/search-engine">
          <input type="text" name="q" value="${(query || '').replace(/"/g,'&quot;')}" placeholder="Search your ecosystem">
          <button type="submit">Search</button>
        </form>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>People</h3>
          <ul>${peopleHtml || '<li>No results</li>'}</ul>
        </div>
        <div class="card">
          <h3>Businesses</h3>
          <ul>${bizHtml || '<li>No results</li>'}</ul>
        </div>
        <div class="card">
          <h3>Payments</h3>
          <ul>${paymentsHtml || '<li>No results</li>'}</ul>
        </div>
        <div class="card">
          <h3>Branches</h3>
          <ul>${branchesHtml || '<li>No results</li>'}</ul>
        </div>
        <div class="card">
          <h3>Blog</h3>
          <ul>${blogsHtml || '<li>No results</li>'}</ul>
        </div>
      </div>
    </div>
  `, user);
}

function renderBlogPage(user = null) {
  const rows = dbQuery("SELECT id, title, slug, created_at FROM blog_posts ORDER BY id DESC");

  const cards = rows.map(r => `
    <div class="card">
      <h3><a href="/blog/${r.slug}">${r.title}</a></h3>
      <p class="muted">${r.created_at}</p>
    </div>
  `).join('');

  return htmlPage('Blog', `
    <div class="section">
      <div class="card">
        <h2>Authority Blog Engine</h2>
        <p>Knowledge pages designed to make the ecosystem richer, more dynamic, and easier to discover.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No blog posts yet.</p></div>'}</div>
    </div>
  `, user);
}

function renderBlogDetail(slug, user = null) {
  const safe = String(slug || '').replace(/'/g, "''");
  const rows = dbQuery(`SELECT id, title, slug, content, created_at FROM blog_posts WHERE slug='${safe}' LIMIT 1`);

  if (!rows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Blog post not found</h2></div>`, user);
  }

  const b = rows[0];

  return htmlPage(b.title, `
    <div class="section">
      <div class="card">
        <h2>${b.title}</h2>
        <p class="muted">${b.created_at}</p>
        <pre>${b.content}</pre>
      </div>
    </div>
  `, user);
}


function renderPodcastsPage(user = null) {
  const podcasts = dbQuery("SELECT id, title, host_name, description, category, created_at FROM podcasts ORDER BY id DESC");
  const ads = dbQuery("SELECT id, ad_title, ad_body, target_url FROM holographic_ads WHERE placement='podcast' ORDER BY id DESC LIMIT 3");

  const cards = podcasts.map(p => `
    <div class="card">
      <h3>${p.title}</h3>
      <p><strong>Host:</strong> ${p.host_name}</p>
      <p><strong>Category:</strong> ${p.category || ''}</p>
      <p>${p.description || ''}</p>
      <p class="muted">${p.created_at || ''}</p>
    </div>
  `).join('');

  const adCards = ads.map(a => `
    <div class="card">
      <h3>${a.ad_title}</h3>
      <p>${a.ad_body || ''}</p>
      <a href="${a.target_url || '#'}">Open</a>
    </div>
  `).join('');

  return htmlPage('Podcasts', `
    <div class="section">
      <div class="card">
        <h2>Podcast Network</h2>
        <p>Podcasts connected to branches, business growth, credit recovery, streaming, and the holographic ad system.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No podcasts yet.</p></div>'}</div>
    </div>
    <div class="section">
      <div class="grid">${adCards || ''}</div>
    </div>
  `, user);
}

function renderRoomsPage(user = null) {
  const rooms = dbQuery("SELECT id, room_name, host_name, topic, room_status, is_private, created_at FROM podcast_rooms ORDER BY id DESC");
  const ads = dbQuery("SELECT id, ad_title, ad_body, target_url FROM holographic_ads WHERE placement IN ('podcast','search','credit') ORDER BY id DESC LIMIT 4");

  const cards = rooms.map(r => `
    <div class="card">
      <h3>${r.room_name}</h3>
      <p><strong>Host:</strong> ${r.host_name}</p>
      <p><strong>Topic:</strong> ${r.topic || ''}</p>
      <p><strong>Status:</strong> ${r.room_status}</p>
      <p><strong>Private:</strong> ${Number(r.is_private) ? 'Yes' : 'No'}</p>
      <p class="muted">${r.created_at || ''}</p>
    </div>
  `).join('');

  const adCards = ads.map(a => `
    <div class="card">
      <h3>${a.ad_title}</h3>
      <p>${a.ad_body || ''}</p>
      <a href="${a.target_url || '#'}">Open</a>
    </div>
  `).join('');

  return htmlPage('Group Rooms', `
    <div class="section">
      <div class="card">
        <h2>Podcast + Group Rooms</h2>
        <p>Live and scheduled audio rooms for creators, branches, business meetings, education, and community traffic.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No rooms yet.</p></div>'}</div>
    </div>
    <div class="section">
      <div class="grid">${adCards || ''}</div>
    </div>
  `, user);
}


function renderBarcodesPage(user = null, message = '') {
  const rows = dbQuery(`
    SELECT id, barcode_value, barcode_type, entity_type, entity_id, label, status, created_at
    FROM barcode_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td><code>${r.barcode_value}</code></td>
      <td>${r.barcode_type}</td>
      <td>${r.entity_type}</td>
      <td>${r.entity_id}</td>
      <td>${r.label || ''}</td>
      <td>${r.status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Barcode Registry', `
    <div class="section">
      <div class="card">
        <h2>Barcode Registry</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <p>Barcode system for books, wallets, podcasts, products, receipts, logistics assets, and future robotics/manufacturing tracking.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Add Barcode</h3>
          <form method="POST" action="/barcodes/add">
            <label>Barcode Value</label>
            <input type="text" name="barcode_value" required>

            <label>Barcode Type</label>
            <select name="barcode_type">
              <option value="CODE128">CODE128</option>
              <option value="QR">QR</option>
              <option value="EAN13">EAN13</option>
              <option value="UPC">UPC</option>
            </select>

            <label>Entity Type</label>
            <input type="text" name="entity_type" placeholder="book / wallet / product / receipt / asset" required>

            <label>Entity ID</label>
            <input type="number" name="entity_id" required>

            <label>Label</label>
            <input type="text" name="label">

            <button type="submit">Add Barcode</button>
          </form>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Barcode</th><th>Type</th><th>Entity</th><th>Entity ID</th><th>Label</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="8">No barcodes yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderBarcodeLookupPage(user = null, query = '', message = '') {
  const safe = String(query || '').replace(/'/g, "''");
  const rows = query
    ? dbQuery(`
        SELECT id, barcode_value, barcode_type, entity_type, entity_id, label, status, created_at
        FROM barcode_registry
        WHERE barcode_value LIKE '%${safe}%' OR label LIKE '%${safe}%'
        ORDER BY id DESC
        LIMIT 25
      `)
    : [];

  const scans = dbQuery(`
    SELECT id, barcode_value, scan_context, scanned_by, result_status, created_at
    FROM barcode_scans
    ORDER BY id DESC
    LIMIT 25
  `);

  const resultRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td><code>${r.barcode_value}</code></td>
      <td>${r.entity_type}</td>
      <td>${r.entity_id}</td>
      <td>${r.label || ''}</td>
      <td>${r.status}</td>
    </tr>
  `).join('');

  const scanRows = scans.map(s => `
    <tr>
      <td>${s.id}</td>
      <td><code>${s.barcode_value}</code></td>
      <td>${s.scan_context || ''}</td>
      <td>${s.scanned_by || ''}</td>
      <td>${s.result_status}</td>
      <td>${s.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Barcode Lookup', `
    <div class="section">
      <div class="card">
        <h2>Barcode Lookup</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <form method="GET" action="/barcode-lookup">
          <input type="text" name="q" value="${(query || '').replace(/"/g,'&quot;')}" placeholder="Enter barcode or label">
          <button type="submit">Lookup</button>
        </form>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Results</h3>
          <table>
            <thead><tr><th>ID</th><th>Barcode</th><th>Entity</th><th>Entity ID</th><th>Label</th><th>Status</th></tr></thead>
            <tbody>${resultRows || '<tr><td colspan="6">No results</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Recent Scans</h3>
          <table>
            <thead><tr><th>ID</th><th>Barcode</th><th>Context</th><th>Scanned By</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${scanRows || '<tr><td colspan="6">No scans yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}


function renderLogisticsPage(user = null) {
  const hubs = dbQuery("SELECT id, hub_name, city, state, hub_type, status FROM logistics_hubs ORDER BY id DESC");
  const vehicles = dbQuery("SELECT id, vehicle_name, vehicle_type, plate_or_asset_tag, status FROM logistics_vehicles ORDER BY id DESC");
  const shipments = dbQuery(`
    SELECT s.id, s.shipment_code, s.shipment_type, s.destination_label, s.shipment_status,
           v.vehicle_name
    FROM logistics_shipments s
    LEFT JOIN logistics_vehicles v ON v.id = s.assigned_vehicle_id
    ORDER BY s.id DESC
  `);

  const hubRows = hubs.map(h => `<tr><td>${h.id}</td><td>${h.hub_name}</td><td>${h.city || ''}</td><td>${h.state || ''}</td><td>${h.hub_type}</td><td>${h.status}</td></tr>`).join('');
  const vehicleRows = vehicles.map(v => `<tr><td>${v.id}</td><td>${v.vehicle_name}</td><td>${v.vehicle_type}</td><td>${v.plate_or_asset_tag || ''}</td><td>${v.status}</td></tr>`).join('');
  const shipmentRows = shipments.map(s => `<tr><td>${s.id}</td><td>${s.shipment_code}</td><td>${s.shipment_type}</td><td>${s.destination_label || ''}</td><td>${s.vehicle_name || ''}</td><td>${s.shipment_status}</td></tr>`).join('');

  return htmlPage('Logistics Control', `
    <div class="section">
      <div class="card">
        <h2>Logistics Control Layer</h2>
        <p>Freight, delivery, hubs, vehicles, dispatch, and future robotics/manufacturing logistics tracking.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Hubs</h3>
          <table>
            <thead><tr><th>ID</th><th>Hub</th><th>City</th><th>State</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>${hubRows || '<tr><td colspan="6">No hubs yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Vehicles</h3>
          <table>
            <thead><tr><th>ID</th><th>Vehicle</th><th>Type</th><th>Asset Tag</th><th>Status</th></tr></thead>
            <tbody>${vehicleRows || '<tr><td colspan="5">No vehicles yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Shipments</h3>
          <table>
            <thead><tr><th>ID</th><th>Code</th><th>Type</th><th>Destination</th><th>Vehicle</th><th>Status</th></tr></thead>
            <tbody>${shipmentRows || '<tr><td colspan="6">No shipments yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}

function renderIotPage(user = null) {
  const devices = dbQuery("SELECT id, device_name, device_type, linked_entity_type, linked_entity_id, device_status FROM iot_devices ORDER BY id DESC");
  const telemetry = dbQuery(`
    SELECT t.id, d.device_name, t.metric_name, t.metric_value, t.alert_level, t.created_at
    FROM iot_telemetry t
    JOIN iot_devices d ON d.id = t.device_id
    ORDER BY t.id DESC
    LIMIT 100
  `);

  const deviceRows = devices.map(d => `<tr><td>${d.id}</td><td>${d.device_name}</td><td>${d.device_type}</td><td>${d.linked_entity_type || ''}</td><td>${d.linked_entity_id || ''}</td><td>${d.device_status}</td></tr>`).join('');
  const telemetryRows = telemetry.map(t => `<tr><td>${t.id}</td><td>${t.device_name}</td><td>${t.metric_name}</td><td>${t.metric_value}</td><td>${t.alert_level}</td><td>${t.created_at || ''}</td></tr>`).join('');

  return htmlPage('IoT Control', `
    <div class="section">
      <div class="card">
        <h2>IoT Device + Telemetry Layer</h2>
        <p>Connected sensors for hubs, vehicles, assets, warehouses, manufacturing, robotics, and future metaverse-linked devices.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Devices</h3>
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Entity</th><th>Entity ID</th><th>Status</th></tr></thead>
            <tbody>${deviceRows || '<tr><td colspan="6">No devices yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Telemetry</h3>
          <table>
            <thead><tr><th>ID</th><th>Device</th><th>Metric</th><th>Value</th><th>Alert</th><th>Created</th></tr></thead>
            <tbody>${telemetryRows || '<tr><td colspan="6">No telemetry yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}


function renderWalletsPage(user = null) {
  const rows = dbQuery(`
    SELECT id, owner_type, owner_id, wallet_name, balance_cents, created_at
    FROM wallets
    ORDER BY id DESC
  `);

  const tableRows = rows.map(w => `
    <tr>
      <td>${w.id}</td>
      <td>${w.owner_type}</td>
      <td>${w.owner_id}</td>
      <td>${w.wallet_name}</td>
      <td>${money(w.balance_cents || 0)}</td>
      <td>${w.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Wallets', `
    <div class="section">
      <div class="card">
        <h2>Wallet Control</h2>
        <p>Wallet foundation for balances, future purchases, receipts, payouts, and ecosystem finance.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Owner Type</th><th>Owner ID</th><th>Wallet</th><th>Balance</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No wallets yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderReceiptsPage(user = null) {
  const rows = dbQuery(`
    SELECT id, payer_type, payer_id, amount_cents, receipt_type, reference_type, reference_id, receipt_status, created_at
    FROM receipts
    ORDER BY id DESC
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.payer_type}</td>
      <td>${r.payer_id}</td>
      <td>${money(r.amount_cents || 0)}</td>
      <td>${r.receipt_type}</td>
      <td>${r.reference_type || ''}</td>
      <td>${r.reference_id || ''}</td>
      <td>${r.receipt_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Receipts', `
    <div class="section">
      <div class="card">
        <h2>Receipts</h2>
        <p>Receipt history for book sales, services, memberships, future marketplace orders, and wallet-linked activity.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Payer Type</th><th>Payer ID</th><th>Amount</th><th>Type</th><th>Ref Type</th><th>Ref ID</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="9">No receipts yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderBooksPage(user = null) {
  const rows = dbQuery(`
    SELECT id, title, author_name, description, book_type, price_cents, access_level, created_at
    FROM books
    ORDER BY id DESC
  `);

  const cards = rows.map(b => `
    <div class="card">
      <h3>${b.title}</h3>
      <p><strong>Author:</strong> ${b.author_name}</p>
      <p><strong>Type:</strong> ${b.book_type}</p>
      <p><strong>Access:</strong> ${b.access_level}</p>
      <p><strong>Price:</strong> ${money(b.price_cents || 0)}</p>
      <p>${b.description || ''}</p>
      <p class="muted">${b.created_at || ''}</p>
    </div>
  `).join('');

  return htmlPage('Books', `
    <div class="section">
      <div class="card">
        <h2>Book Store / Reader Foundation</h2>
        <p>Books, paid access, future audiobook hooks, reading rooms, and education commerce inside the ecosystem.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No books yet.</p></div>'}</div>
    </div>
  `, user);
}


function renderAccountsPage(user = null) {
  const rows = dbQuery("SELECT id, username, role, display_name, account_status, created_at FROM user_accounts ORDER BY id DESC");
  const tableRows = rows.map(a => `<tr><td>${a.id}</td><td>${a.username}</td><td>${a.role}</td><td>${a.display_name || ''}</td><td>${a.account_status}</td><td>${a.created_at || ''}</td></tr>`).join('');
  return htmlPage('User Accounts', `
    <div class="section"><div class="card"><h2>User Accounts</h2><p>Persistent account registry and session foundation for branch, content, commerce, and admin access.</p></div></div>
    <div class="section"><div class="card">
      <table>
        <thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${tableRows || '<tr><td colspan="6">No accounts yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}

function renderUploadPoliciesPage(user = null) {
  const rows = dbQuery("SELECT id, policy_name, max_bytes, allowed_extensions, created_at FROM upload_policies ORDER BY id DESC");
  const tableRows = rows.map(r => `<tr><td>${r.id}</td><td>${r.policy_name}</td><td>${r.max_bytes}</td><td>${r.allowed_extensions}</td><td>${r.created_at || ''}</td></tr>`).join('');
  return htmlPage('Upload Policies', `
    <div class="section"><div class="card"><h2>Upload Policies</h2><p>File size limits and allowed file types for documents, books, audio, and future media uploads.</p></div></div>
    <div class="section"><div class="card">
      <table>
        <thead><tr><th>ID</th><th>Policy</th><th>Max Bytes</th><th>Allowed Extensions</th><th>Created</th></tr></thead>
        <tbody>${tableRows || '<tr><td colspan="5">No policies yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}

function renderStreamsPage(user = null) {
  const channels = dbQuery("SELECT id, channel_name, host_name, channel_type, stream_status, created_at FROM live_stream_channels ORDER BY id DESC");
  const events = dbQuery("SELECT id, room_id, event_type, event_notes, created_at FROM live_room_events ORDER BY id DESC LIMIT 50");

  const channelRows = channels.map(c => `<tr><td>${c.id}</td><td>${c.channel_name}</td><td>${c.host_name}</td><td>${c.channel_type}</td><td>${c.stream_status}</td><td>${c.created_at || ''}</td></tr>`).join('');
  const eventRows = events.map(e => `<tr><td>${e.id}</td><td>${e.room_id}</td><td>${e.event_type}</td><td>${e.event_notes || ''}</td><td>${e.created_at || ''}</td></tr>`).join('');

  return htmlPage('Live Streams / Rooms', `
    <div class="section"><div class="card"><h2>Real-Time Media Stack Foundation</h2><p>Channel registry and event timeline for podcast rooms, hybrid rooms, holographic streaming, and future live media control.</p></div></div>
    <div class="section"><div class="grid">
      <div class="card">
        <h3>Channels</h3>
        <table>
          <thead><tr><th>ID</th><th>Channel</th><th>Host</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${channelRows || '<tr><td colspan="6">No channels yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div></div>
    <div class="section"><div class="grid">
      <div class="card">
        <h3>Room Events</h3>
        <table>
          <thead><tr><th>ID</th><th>Room ID</th><th>Event</th><th>Notes</th><th>Created</th></tr></thead>
          <tbody>${eventRows || '<tr><td colspan="5">No room events yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div></div>
  `, user);
}

function renderScenesPage(user = null) {
  const rows = dbQuery("SELECT id, scene_name, scene_type, scene_url, linked_world_id, scene_status, created_at FROM scene_registry ORDER BY id DESC");
  const cards = rows.map(s => `
    <div class="card">
      <h3><a href="/scenes/${s.id}">${s.scene_name}</a></h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>World:</strong> ${s.linked_world_id || ''}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <p><strong>Scene File:</strong> <code>${s.scene_url || ''}</code></p>
      <p class="muted">${s.created_at || ''}</p>
    </div>
  `).join('');

  return htmlPage('3D Scenes', `
    <div class="section"><div class="card"><h2>3D Frontend Scene Registry</h2><p>Scene registry for metaverse, middleverse, multiverse, logistics overlays, robotics dashboards, and creator halls.</p></div></div>
    <div class="section"><div class="grid">${cards || '<div class="card"><p>No scenes yet.</p></div>'}</div></div>
  `, user);
}


function renderReceiptDetailPage(receiptId, user = null) {
  const rows = dbQuery(`
    SELECT id, payer_type, payer_id, amount_cents, receipt_type, reference_type, reference_id, receipt_status, receipt_note, created_at
    FROM receipts
    WHERE id=${Number(receiptId)}
    LIMIT 1
  `);

  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Receipt not found</h2></div>`, user);

  const r = rows[0];
  return htmlPage('Receipt Detail', `
    <div class="section">
      <div class="card">
        <h2>Receipt #${r.id}</h2>
        <p><strong>Payer Type:</strong> ${r.payer_type}</p>
        <p><strong>Payer ID:</strong> ${r.payer_id}</p>
        <p><strong>Amount:</strong> ${money(r.amount_cents || 0)}</p>
        <p><strong>Type:</strong> ${r.receipt_type}</p>
        <p><strong>Reference:</strong> ${r.reference_type || ''} ${r.reference_id || ''}</p>
        <p><strong>Status:</strong> ${r.receipt_status}</p>
        <p><strong>Note:</strong> ${r.receipt_note || ''}</p>
        <p class="muted">${r.created_at || ''}</p>
      </div>
    </div>
  `, user);
}

function renderEnhancedBookReaderPage(bookId, user = null, message = '') {
  const books = dbQuery(`SELECT id, title, author_name, description, price_cents, access_level FROM books WHERE id=${Number(bookId)} LIMIT 1`);
  if (!books.length) return htmlPage('Not Found', `<div class="card"><h2>Book not found</h2></div>`, user);

  const b = books[0];
  const chapters = dbQuery(`SELECT id, chapter_title, chapter_order, content, is_free FROM book_chapters WHERE book_id=${Number(bookId)} ORDER BY chapter_order, id`);
  const ent = dbQuery(`SELECT id FROM book_entitlements WHERE user_type='admin' AND user_id=1 AND book_id=${Number(bookId)} LIMIT 1`);
  const unlocked = ent.length > 0;

  const chapterHtml = chapters.map(c => {
    const allowed = unlocked || Number(c.is_free) === 1;
    return `
      <div class="card">
        <h3>${c.chapter_title}</h3>
        <pre>${allowed ? (c.content || '') : 'Locked chapter. Purchase required.'}</pre>
      </div>
    `;
  }).join('');

  const buyBox = unlocked
    ? `<p class="ok"><strong>Book unlocked.</strong></p>`
    : `<form method="POST" action="/books/purchase/${b.id}">
         <button type="submit">Purchase for ${money(b.price_cents || 0)}</button>
       </form>`;

  return htmlPage('Book Reader', `
    <div class="section">
      <div class="card">
        <h2>${b.title}</h2>
        ${message ? `<p class="ok">${message}</p>` : ''}
        <p><strong>Author:</strong> ${b.author_name}</p>
        <p><strong>Price:</strong> ${money(b.price_cents || 0)}</p>
        <p>${b.description || ''}</p>
        ${buyBox}
      </div>
    </div>
    <div class="section">
      <div class="grid">${chapterHtml}</div>
    </div>
  `, user);
}


const crypto = require('crypto');

function hashPassword(raw) {
  return crypto.createHash('sha256').update(String(raw || '')).digest('hex');
}

function makeSessionToken() {
  return crypto.randomBytes(24).toString('hex');
}

function validateUploadPolicy(policyName, filename, fileSizeBytes) {
  const rows = dbQuery(`SELECT policy_name, max_bytes, allowed_extensions FROM upload_policies WHERE policy_name='${q(policyName)}' LIMIT 1`);
  if (!rows.length) return { ok: false, reason: 'Missing upload policy' };

  const policy = rows[0];
  const ext = filename.includes('.') ? '.' + filename.split('.').pop().toLowerCase() : '';
  const allowed = String(policy.allowed_extensions || '').split(',').map(x => x.trim().toLowerCase());

  if (!allowed.includes(ext)) {
    return { ok: false, reason: `File type not allowed: ${ext}` };
  }

  if (Number(fileSizeBytes || 0) > Number(policy.max_bytes || 0)) {
    return { ok: false, reason: 'File exceeds size limit' };
  }

  return { ok: true, reason: 'ok' };
}

function renderSecurityPage(user = null) {
  const accounts = dbQuery("SELECT id, username, role, account_status, created_at FROM user_accounts ORDER BY id DESC");
  const sessions = dbQuery("SELECT id, user_id, session_token, session_status, created_at FROM persistent_sessions ORDER BY id DESC LIMIT 50");

  const accountRows = accounts.map(a => `<tr><td>${a.id}</td><td>${a.username}</td><td>${a.role}</td><td>${a.account_status}</td><td>${a.created_at || ''}</td></tr>`).join('');
  const sessionRows = sessions.map(s => `<tr><td>${s.id}</td><td>${s.user_id}</td><td><code>${s.session_token}</code></td><td>${s.session_status}</td><td>${s.created_at || ''}</td></tr>`).join('');

  return htmlPage('Security Center', `
    <div class="section">
      <div class="card">
        <h2>Security + Session Foundation</h2>
        <p>Password hashing helper, session tokens, upload validation policy, and admin visibility for account security.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Accounts</h3>
          <table>
            <thead><tr><th>ID</th><th>User</th><th>Role</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${accountRows || '<tr><td colspan="5">No accounts yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Sessions</h3>
          <table>
            <thead><tr><th>ID</th><th>User ID</th><th>Token</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${sessionRows || '<tr><td colspan="5">No sessions yet.</td></tr>'}</tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);
}


function renderSceneDetail(sceneId, user = null) {
  const rows = dbQuery(`SELECT id, scene_name, scene_type, scene_url, linked_world_id, scene_status, created_at FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = rows[0];
  return htmlPage('Scene Detail', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>World:</strong> ${s.linked_world_id || ''}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <p><strong>Scene File:</strong> <code>${s.scene_url || ''}</code></p>
        <p class="muted">${s.created_at || ''}</p>
      </div>
    </div>
  `, user);
}

function renderRoboticsAssetDetail(assetId, user = null) {
  const rows = dbQuery(`SELECT id, asset_name, asset_type, control_status, linked_hub_id, last_command, created_at FROM robotics_assets WHERE id=${Number(assetId)} LIMIT 1`);
  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Robotics asset not found</h2></div>`, user);

  const a = rows[0];
  return htmlPage('Robotics Asset Detail', `
    <div class="section">
      <div class="card">
        <h2>${a.asset_name}</h2>
        <p><strong>Type:</strong> ${a.asset_type}</p>
        <p><strong>Status:</strong> ${a.control_status}</p>
        <p><strong>Hub:</strong> ${a.linked_hub_id || ''}</p>
        <p><strong>Last Command:</strong> ${a.last_command || ''}</p>
        <p class="muted">${a.created_at || ''}</p>
      </div>
    </div>
  `, user);
}

function renderManufacturingJobDetail(jobId, user = null) {
  const rows = dbQuery(`SELECT id, job_name, job_type, material_type, job_status, output_path, created_at FROM manufacturing_jobs WHERE id=${Number(jobId)} LIMIT 1`);
  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Manufacturing job not found</h2></div>`, user);

  const j = rows[0];
  return htmlPage('Manufacturing Job Detail', `
    <div class="section">
      <div class="card">
        <h2>${j.job_name}</h2>
        <p><strong>Type:</strong> ${j.job_type}</p>
        <p><strong>Material:</strong> ${j.material_type || ''}</p>
        <p><strong>Status:</strong> ${j.job_status}</p>
        <p><strong>Output Path:</strong> ${j.output_path || ''}</p>
        <p class="muted">${j.created_at || ''}</p>
      </div>
    </div>
  `, user);
}


const fs = require('fs');

function renderSceneViewerPage(user = null) {
  const rows = dbQuery("SELECT id, scene_name, scene_type, scene_url, scene_status FROM scene_registry ORDER BY id DESC");

  const cards = rows.map(s => `
    <div class="card">
      <h3><a href="/scene-viewer/${s.id}">${s.scene_name}</a></h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <p><code>${s.scene_url || ''}</code></p>
    </div>
  `).join('');

  return htmlPage('Scene Viewer', `
    <div class="section">
      <div class="card">
        <h2>Scene Viewer</h2>
        <p>This is the first immersive bridge layer. It previews scene definitions and prepares the platform for real 3D rendering and holographic UI overlays.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No scenes yet.</p></div>'}</div>
    </div>
  `, user);
}

function renderSceneViewerDetail(sceneId, user = null) {
  const rows = dbQuery(`SELECT id, scene_name, scene_type, scene_url, linked_world_id, scene_status, created_at FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!rows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = rows[0];
  let sceneJson = 'Scene file not found.';
  try {
    if (s.scene_url) {
      const rel = String(s.scene_url).replace(/^\/+/, '');
      sceneJson = fs.readFileSync(rel, 'utf8');
    }
  } catch (err) {
    sceneJson = `Scene file read error: ${err.message}`;
  }

  return htmlPage('Scene Preview', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>World:</strong> ${s.linked_world_id || ''}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <p><strong>Scene URL:</strong> <code>${s.scene_url || ''}</code></p>
        <p class="muted">${s.created_at || ''}</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <h3>Scene JSON Preview</h3>
        <pre>${sceneJson}</pre>
      </div>
    </div>
  `, user);
}

function renderRoboticsCommandsPage(user = null) {
  const rows = dbQuery(`
    SELECT l.id, a.asset_name, l.command_name, l.command_status, l.command_notes, l.created_at
    FROM robotics_command_log l
    JOIN robotics_assets a ON a.id = l.asset_id
    ORDER BY l.id DESC
    LIMIT 100
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.asset_name}</td>
      <td>${r.command_name}</td>
      <td>${r.command_status}</td>
      <td>${r.command_notes || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Robotics Commands', `
    <div class="section">
      <div class="card">
        <h2>Robotics Command Log</h2>
        <p>Tracks robot, drone, printer, and future manufacturing control commands.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Asset</th><th>Command</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No commands yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderManufacturingLogPage(user = null) {
  const rows = dbQuery(`
    SELECT l.id, j.job_name, l.event_name, l.event_status, l.event_notes, l.created_at
    FROM manufacturing_job_log l
    JOIN manufacturing_jobs j ON j.id = l.job_id
    ORDER BY l.id DESC
    LIMIT 100
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.job_name}</td>
      <td>${r.event_name}</td>
      <td>${r.event_status}</td>
      <td>${r.event_notes || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Manufacturing Log', `
    <div class="section">
      <div class="card">
        <h2>Manufacturing Job Log</h2>
        <p>Tracks print, nano fabrication, and 12D manufacturing workflow events.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Job</th><th>Event</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No manufacturing events yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderQuantumHoloPage(user = null) {
  const gens = dbQuery("SELECT id, generator_name, generator_type, dimension_mode, render_profile, generator_status, created_at FROM holographic_generators ORDER BY id DESC");
  const links = dbQuery(`
    SELECT l.id, s.scene_name, g.generator_name, i.engine_name, h.engine_name as game_engine, l.link_status
    FROM engine_scene_links l
    LEFT JOIN scene_registry s ON s.id = l.scene_id
    LEFT JOIN holographic_generators g ON g.id = l.generator_id
    LEFT JOIN immersive_engines i ON i.id = l.immersive_engine_id
    LEFT JOIN hybrid_game_engines h ON h.id = l.game_engine_id
    ORDER BY l.id DESC
  `);

  const genCards = gens.map(g => `
    <div class="card">
      <h3>${g.generator_name}</h3>
      <p><strong>Type:</strong> ${g.generator_type}</p>
      <p><strong>Dimension:</strong> ${g.dimension_mode}</p>
      <p><strong>Render Profile:</strong> ${g.render_profile || ''}</p>
      <p><strong>Status:</strong> ${g.generator_status}</p>
      <p class="muted">${g.created_at || ''}</p>
    </div>
  `).join('');

  const linkRows = links.map(l => `
    <tr>
      <td>${l.id}</td>
      <td>${l.scene_name || ''}</td>
      <td>${l.generator_name || ''}</td>
      <td>${l.engine_name || ''}</td>
      <td>${l.game_engine || ''}</td>
      <td>${l.link_status}</td>
    </tr>
  `).join('');

  return htmlPage('Quantum Holographic Layer', `
    <div class="section">
      <div class="card">
        <h2>Quantum 3D / 5D Holographic Generator Layer</h2>
        <p>This is the orchestration layer for holographic generation, immersive scenes, mixed reality overlays, and hybrid game-world linking.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${genCards || '<div class="card"><p>No generators yet.</p></div>'}</div>
    </div>
    <div class="section">
      <div class="card">
        <h3>Scene Engine Links</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Generator</th><th>Immersive Engine</th><th>Game Engine</th><th>Status</th></tr></thead>
          <tbody>${linkRows || '<tr><td colspan="6">No links yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderImmersiveEnginesPage(user = null) {
  const rows = dbQuery("SELECT id, engine_name, engine_mode, target_stack, engine_status, created_at FROM immersive_engines ORDER BY id DESC");
  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.engine_name}</td>
      <td>${r.engine_mode}</td>
      <td>${r.target_stack || ''}</td>
      <td>${r.engine_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Immersive Engines', `
    <div class="section">
      <div class="card">
        <h2>AR / VR / Mixed Reality Engines</h2>
        <p>Engine registry for augmented reality, virtual reality, and mixed reality execution profiles.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Engine</th><th>Mode</th><th>Target</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No immersive engines yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderHybridGamesPage(user = null) {
  const rows = dbQuery("SELECT id, engine_name, game_type, latency_profile, engine_status, created_at FROM hybrid_game_engines ORDER BY id DESC");
  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.engine_name}</td>
      <td>${r.game_type}</td>
      <td>${r.latency_profile || ''}</td>
      <td>${r.engine_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Hybrid Games Engine', `
    <div class="section">
      <div class="card">
        <h2>Quantum Hybrid Games Engine</h2>
        <p>Game-world engine registry for competitive rooms, creator worlds, and hybrid interactive experiences.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Engine</th><th>Game Type</th><th>Latency Profile</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No hybrid game engines yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderPerformanceProfilesPage(user = null) {
  const rows = dbQuery("SELECT id, profile_name, profile_type, optimization_target, profile_status, created_at FROM performance_profiles ORDER BY id DESC");
  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.profile_name}</td>
      <td>${r.profile_type}</td>
      <td>${r.optimization_target || ''}</td>
      <td>${r.profile_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Performance Profiles', `
    <div class="section">
      <div class="card">
        <h2>Quantum Speed Accelerator + Quantum Lag Buster</h2>
        <p>Performance control registry for scene loading, world transitions, stream responsiveness, and interactive experience optimization.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Profile</th><th>Type</th><th>Optimization Target</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No performance profiles yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}

function renderNanotechPage(user = null) {
  const rows = dbQuery("SELECT id, asset_name, asset_type, control_profile, asset_status, created_at FROM nanotech_registry ORDER BY id DESC");
  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.asset_name}</td>
      <td>${r.asset_type}</td>
      <td>${r.control_profile || ''}</td>
      <td>${r.asset_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Nanotech Registry', `
    <div class="section">
      <div class="card">
        <h2>Nanotech Registry</h2>
        <p>Nanotech registry for future fabrication, advanced materials, healing material concepts, and nano-scale manufacturing integration.</p>
      </div>
    </div>
    <div class="section">
      <div class="card">
        <table>
          <thead><tr><th>ID</th><th>Asset</th><th>Type</th><th>Control Profile</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="6">No nanotech assets yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderSceneRuntimeIndex(user = null) {
  const scenes = dbQuery("SELECT id, scene_name, scene_type, scene_status FROM scene_registry ORDER BY id ASC");

  const cards = scenes.map(s => `
    <div class="card">
      <h3><a href="/scene-runtime/${s.id}">${s.scene_name}</a></h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <a href="/scene-runtime/${s.id}">Open Runtime</a>
    </div>
  `).join('');

  return htmlPage('Scene Runtime', `
    <div class="section">
      <div class="card">
        <h2>Interactive Scene Runtime</h2>
        <p>This is the first live immersive runtime layer. It connects scene previews, portals, media panels, and optimization profiles into a navigable world shell.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No scenes available.</p></div>'}</div>
    </div>
  `, user);
}

function renderSceneRuntimeDetail(sceneId, user = null) {
  const sceneRows = dbQuery(`SELECT id, scene_name, scene_type, scene_url, scene_status FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!sceneRows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = sceneRows[0];

  const portals = dbQuery(`
    SELECT p.id, p.portal_name, p.target_scene_id, sr.scene_name as target_scene_name, p.portal_status
    FROM scene_portals p
    LEFT JOIN scene_registry sr ON sr.id = p.target_scene_id
    WHERE p.source_scene_id=${Number(sceneId)}
    ORDER BY p.id ASC
  `);

  const panels = dbQuery(`
    SELECT id, panel_title, panel_type, target_path, panel_status
    FROM scene_media_panels
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `);

  const perf = dbQuery("SELECT profile_name, profile_type, optimization_target, profile_status FROM performance_profiles ORDER BY id ASC");
  const links = dbQuery(`
    SELECT g.generator_name, g.dimension_mode, i.engine_name, h.engine_name as game_engine
    FROM engine_scene_links l
    LEFT JOIN holographic_generators g ON g.id = l.generator_id
    LEFT JOIN immersive_engines i ON i.id = l.immersive_engine_id
    LEFT JOIN hybrid_game_engines h ON h.id = l.game_engine_id
    WHERE l.scene_id=${Number(sceneId)}
    LIMIT 1
  `);

  const runtime = links.length ? links[0] : {};

  const portalCards = portals.map(p => `
    <div class="card">
      <h3>${p.portal_name}</h3>
      <p><strong>Status:</strong> ${p.portal_status}</p>
      <p><strong>Target:</strong> ${p.target_scene_name || ('Scene ' + p.target_scene_id)}</p>
      <a href="/scene-runtime/${p.target_scene_id}">Enter Portal</a>
    </div>
  `).join('');

  const panelCards = panels.map(m => `
    <div class="card">
      <h3>${m.panel_title}</h3>
      <p><strong>Type:</strong> ${m.panel_type}</p>
      <p><strong>Status:</strong> ${m.panel_status}</p>
      <a href="${m.target_path || '#'}">Open Panel</a>
    </div>
  `).join('');

  const perfRows = perf.map(r => `
    <tr>
      <td>${r.profile_name}</td>
      <td>${r.profile_type}</td>
      <td>${r.optimization_target || ''}</td>
      <td>${r.profile_status}</td>
    </tr>
  `).join('');

  return htmlPage('Scene Runtime Detail', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <p><strong>Scene File:</strong> <code>${s.scene_url || ''}</code></p>
        <p><strong>Holo Generator:</strong> ${runtime.generator_name || ''}</p>
        <p><strong>Dimension Mode:</strong> ${runtime.dimension_mode || ''}</p>
        <p><strong>Immersive Engine:</strong> ${runtime.engine_name || ''}</p>
        <p><strong>Game Engine:</strong> ${runtime.game_engine || ''}</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        ${portalCards || '<div class="card"><p>No portals configured.</p></div>'}
      </div>
    </div>

    <div class="section">
      <div class="grid">
        ${panelCards || '<div class="card"><p>No media panels configured.</p></div>'}
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Quantum Performance Layer</h3>
        <table>
          <thead><tr><th>Profile</th><th>Type</th><th>Target</th><th>Status</th></tr></thead>
          <tbody>${perfRows || '<tr><td colspan="4">No performance profiles found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderLive3DIndex(user = null) {
  const scenes = dbQuery("SELECT id, scene_name, scene_type, scene_status FROM scene_registry ORDER BY id ASC");

  const cards = scenes.map(s => `
    <div class="card">
      <h3><a href="/live-3d/${s.id}">${s.scene_name}</a></h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <a href="/live-3d/${s.id}">Launch Scene</a>
    </div>
  `).join('');

  return htmlPage('Live 3D Worlds', `
    <div class="section">
      <div class="card">
        <h2>Live 3D World Launcher</h2>
        <p>This is the first visual immersive layer. It presents scenes as a live rendered world shell with portals, control panels, and quantum optimization summaries.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No scenes available.</p></div>'}</div>
    </div>
  `, user);
}

function renderLive3DScene(sceneId, user = null) {
  const sceneRows = dbQuery(`SELECT id, scene_name, scene_type, scene_status FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!sceneRows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = sceneRows[0];

  const portals = dbQuery(`
    SELECT p.id, p.portal_name, p.target_scene_id, sr.scene_name as target_scene_name
    FROM scene_portals p
    LEFT JOIN scene_registry sr ON sr.id = p.target_scene_id
    WHERE p.source_scene_id=${Number(sceneId)}
    ORDER BY p.id ASC
  `);

  const panels = dbQuery(`
    SELECT id, panel_title, panel_type, target_path
    FROM scene_media_panels
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `);

  const perf = dbQuery("SELECT profile_name, profile_type FROM performance_profiles ORDER BY id ASC");
  const engineRows = dbQuery(`
    SELECT g.generator_name, g.dimension_mode, i.engine_name, h.engine_name as game_engine
    FROM engine_scene_links l
    LEFT JOIN holographic_generators g ON g.id = l.generator_id
    LEFT JOIN immersive_engines i ON i.id = l.immersive_engine_id
    LEFT JOIN hybrid_game_engines h ON h.id = l.game_engine_id
    WHERE l.scene_id=${Number(sceneId)}
    LIMIT 1
  `);
  const engine = engineRows.length ? engineRows[0] : {};

  const portalButtons = portals.map(p => `
    <a href="/live-3d/${p.target_scene_id}" style="margin:6px;">${p.portal_name} → ${p.target_scene_name || ('Scene ' + p.target_scene_id)}</a>
  `).join('');

  const panelButtons = panels.map(m => `
    <a href="${m.target_path || '#'}" class="secondary" style="margin:6px;">${m.panel_title}</a>
  `).join('');

  const perfPills = perf.map(r => `<span class="pill">${r.profile_name}</span>`).join('');

  const sceneObjects = [
    { left: '8%', top: '18%', label: 'Portal Node' },
    { left: '38%', top: '34%', label: 'Media Panel' },
    { left: '67%', top: '22%', label: 'Commerce Node' },
    { left: '24%', top: '68%', label: 'Holo Display' },
    { left: '72%', top: '66%', label: 'Quantum Engine' }
  ].map(o => `
    <div style="
      position:absolute;
      left:${o.left};
      top:${o.top};
      width:120px;
      height:120px;
      border-radius:24px;
      border:1px solid #60a5fa;
      background:rgba(37,99,235,0.14);
      display:flex;
      align-items:center;
      justify-content:center;
      text-align:center;
      padding:8px;
      box-shadow:0 0 24px rgba(96,165,250,0.25);
      backdrop-filter:blur(2px);
    ">
      <div>
        <div style="font-size:13px; font-weight:bold;">${o.label}</div>
      </div>
    </div>
  `).join('');

  return htmlPage('Live 3D Scene', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <p><strong>Generator:</strong> ${engine.generator_name || ''}</p>
        <p><strong>Dimension:</strong> ${engine.dimension_mode || ''}</p>
        <p><strong>Immersive Engine:</strong> ${engine.engine_name || ''}</p>
        <p><strong>Game Engine:</strong> ${engine.game_engine || ''}</p>
        <div>${perfPills || ''}</div>
      </div>
    </div>

    <div class="section">
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="
          position:relative;
          width:100%;
          min-height:520px;
          background:
            radial-gradient(circle at center, rgba(59,130,246,0.20), rgba(2,6,23,0.95) 55%),
            linear-gradient(180deg, #020617 0%, #0f172a 100%);
        ">
          <div style="
            position:absolute;
            inset:0;
            background-image:
              linear-gradient(rgba(96,165,250,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96,165,250,0.08) 1px, transparent 1px);
            background-size: 40px 40px;
          "></div>

          <div style="
            position:absolute;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
            width:260px;
            height:260px;
            border-radius:50%;
            border:1px solid rgba(125,211,252,0.45);
            box-shadow:0 0 80px rgba(56,189,248,0.22);
          "></div>

          ${sceneObjects}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Portals</h3>
          <div>${portalButtons || '<p>No portals configured.</p>'}</div>
        </div>
        <div class="card">
          <h3>Embedded Panels</h3>
          <div>${panelButtons || '<p>No media panels configured.</p>'}</div>
        </div>
      </div>
    </div>
  `, user);
}


function renderAvatarsPage(user = null) {
  const rows = dbQuery("SELECT id, avatar_name, avatar_role, style_profile, linked_user_type, linked_user_id, created_at FROM avatar_profiles ORDER BY id DESC");

  const cards = rows.map(a => `
    <div class="card">
      <h3>${a.avatar_name}</h3>
      <p><strong>Role:</strong> ${a.avatar_role}</p>
      <p><strong>Style:</strong> ${a.style_profile || ''}</p>
      <p><strong>Linked User:</strong> ${a.linked_user_type} ${a.linked_user_id}</p>
      <p class="muted">${a.created_at || ''}</p>
    </div>
  `).join('');

  return htmlPage('Avatar Profiles', `
    <div class="section">
      <div class="card">
        <h2>Avatar Profiles</h2>
        <p>Avatar registry for immersive identity, role-based world presence, creator view, and future holographic interaction.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No avatars yet.</p></div>'}</div>
    </div>
  `, user);
}

function renderImmersiveFeedPage(user = null) {
  const feed = dbQuery(`
    SELECT f.id, s.scene_name, f.activity_type, f.activity_title, f.activity_path, f.activity_status, f.created_at
    FROM immersive_activity_feed f
    LEFT JOIN scene_registry s ON s.id = f.scene_id
    ORDER BY f.id DESC
  `);

  const visits = dbQuery(`
    SELECT v.id, s.scene_name, a.avatar_name, v.visit_type, v.visit_notes, v.created_at
    FROM scene_visit_log v
    LEFT JOIN scene_registry s ON s.id = v.scene_id
    LEFT JOIN avatar_profiles a ON a.id = v.avatar_id
    ORDER BY v.id DESC
    LIMIT 50
  `);

  const travel = dbQuery(`
    SELECT t.id, p.portal_name, a.avatar_name, t.source_scene_id, t.target_scene_id, t.travel_status, t.created_at
    FROM portal_travel_log t
    LEFT JOIN scene_portals p ON p.id = t.portal_id
    LEFT JOIN avatar_profiles a ON a.id = t.avatar_id
    ORDER BY t.id DESC
    LIMIT 50
  `);

  const feedRows = feed.map(f => `
    <tr>
      <td>${f.id}</td>
      <td>${f.scene_name || ''}</td>
      <td>${f.activity_type}</td>
      <td>${f.activity_title}</td>
      <td>${f.activity_path ? `<a href="${f.activity_path}">Open</a>` : ''}</td>
      <td>${f.activity_status}</td>
      <td>${f.created_at || ''}</td>
    </tr>
  `).join('');

  const visitRows = visits.map(v => `
    <tr>
      <td>${v.id}</td>
      <td>${v.scene_name || ''}</td>
      <td>${v.avatar_name || ''}</td>
      <td>${v.visit_type}</td>
      <td>${v.visit_notes || ''}</td>
      <td>${v.created_at || ''}</td>
    </tr>
  `).join('');

  const travelRows = travel.map(t => `
    <tr>
      <td>${t.id}</td>
      <td>${t.portal_name || ''}</td>
      <td>${t.avatar_name || ''}</td>
      <td>${t.source_scene_id || ''}</td>
      <td>${t.target_scene_id || ''}</td>
      <td>${t.travel_status}</td>
      <td>${t.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Immersive Feed', `
    <div class="section">
      <div class="card">
        <h2>Immersive Activity Feed</h2>
        <p>This tracks what can happen in the worlds now: panels, entries, portal travel, and future avatar-driven activity.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>World Activities</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Type</th><th>Title</th><th>Path</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${feedRows || '<tr><td colspan="7">No activities yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Scene Visits</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Visit Type</th><th>Notes</th><th>Created</th></tr></thead>
          <tbody>${visitRows || '<tr><td colspan="6">No visits yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Portal Travel</h3>
        <table>
          <thead><tr><th>ID</th><th>Portal</th><th>Avatar</th><th>From</th><th>To</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${travelRows || '<tr><td colspan="7">No portal travel yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderMotionWorldsIndex(user = null) {
  const scenes = dbQuery("SELECT id, scene_name, scene_type, scene_status FROM scene_registry ORDER BY id ASC");

  const cards = scenes.map(s => `
    <div class="card">
      <h3><a href="/motion-worlds/${s.id}">${s.scene_name}</a></h3>
      <p><strong>Type:</strong> ${s.scene_type}</p>
      <p><strong>Status:</strong> ${s.scene_status}</p>
      <a href="/motion-worlds/${s.id}">Launch Motion World</a>
    </div>
  `).join('');

  return htmlPage('Motion Worlds', `
    <div class="section">
      <div class="card">
        <h2>Motion Worlds</h2>
        <p>This adds animated visual motion, a world HUD, portal glow cues, and the first world-state sync foundation.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards || '<div class="card"><p>No scenes available.</p></div>'}</div>
    </div>
  `, user);
}

function renderMotionWorldDetail(sceneId, user = null) {
  const sceneRows = dbQuery(`SELECT id, scene_name, scene_type, scene_status FROM scene_registry WHERE id=${Number(sceneId)} LIMIT 1`);
  if (!sceneRows.length) return htmlPage('Not Found', `<div class="card"><h2>Scene not found</h2></div>`, user);

  const s = sceneRows[0];

  const hud = dbQuery(`
    SELECT hud_name, hud_value, hud_status
    FROM world_hud_panels
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `);

  const sync = dbQuery(`
    SELECT sync_key, sync_value, sync_status
    FROM world_state_sync
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `);

  const portals = dbQuery(`
    SELECT p.portal_name, p.target_scene_id, sr.scene_name as target_scene_name
    FROM scene_portals p
    LEFT JOIN scene_registry sr ON sr.id = p.target_scene_id
    WHERE p.source_scene_id=${Number(sceneId)}
    ORDER BY p.id ASC
  `);

  const panelButtons = dbQuery(`
    SELECT panel_title, target_path
    FROM scene_media_panels
    WHERE scene_id=${Number(sceneId)}
    ORDER BY id ASC
  `).map(p => `<a href="${p.target_path || '#'}" class="secondary" style="margin:6px;">${p.panel_title}</a>`).join('');

  const hudHtml = hud.map(h => `<div class="pill">${h.hud_name}: ${h.hud_value}</div>`).join('');
  const syncRows = sync.map(r => `<tr><td>${r.sync_key}</td><td>${r.sync_value || ''}</td><td>${r.sync_status}</td></tr>`).join('');
  const portalButtons = portals.map(p => `<a href="/motion-worlds/${p.target_scene_id}" style="margin:6px;">${p.portal_name} → ${p.target_scene_name || ('Scene ' + p.target_scene_id)}</a>`).join('');

  return htmlPage('Motion World Detail', `
    <div class="section">
      <div class="card">
        <h2>${s.scene_name}</h2>
        <p><strong>Type:</strong> ${s.scene_type}</p>
        <p><strong>Status:</strong> ${s.scene_status}</p>
        <div>${hudHtml || ''}</div>
      </div>
    </div>

    <div class="section">
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="
          position:relative;
          width:100%;
          min-height:560px;
          background:
            radial-gradient(circle at center, rgba(56,189,248,0.18), rgba(2,6,23,0.96) 55%),
            linear-gradient(180deg, #020617 0%, #0f172a 100%);
          overflow:hidden;
        ">
          <style>
            @keyframes floatNode {
              0% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-16px) scale(1.04); }
              100% { transform: translateY(0px) scale(1); }
            }
            @keyframes pulsePortal {
              0% { box-shadow: 0 0 12px rgba(96,165,250,0.25); }
              50% { box-shadow: 0 0 36px rgba(96,165,250,0.65); }
              100% { box-shadow: 0 0 12px rgba(96,165,250,0.25); }
            }
            @keyframes driftGrid {
              0% { background-position: 0 0, 0 0; }
              100% { background-position: 40px 40px, 40px 40px; }
            }
          </style>

          <div style="
            position:absolute;
            inset:0;
            background-image:
              linear-gradient(rgba(96,165,250,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(96,165,250,0.08) 1px, transparent 1px);
            background-size:40px 40px;
            animation:driftGrid 8s linear infinite;
          "></div>

          <div style="position:absolute; left:8%; top:16%; width:120px; height:120px; border-radius:24px; border:1px solid #60a5fa; background:rgba(37,99,235,0.16); display:flex; align-items:center; justify-content:center; text-align:center; animation:floatNode 4s ease-in-out infinite;">
            <div>World Node</div>
          </div>

          <div style="position:absolute; left:38%; top:28%; width:150px; height:150px; border-radius:999px; border:1px solid #7dd3fc; background:rgba(14,165,233,0.14); display:flex; align-items:center; justify-content:center; text-align:center; animation:pulsePortal 2.5s ease-in-out infinite;">
            <div>Portal Core</div>
          </div>

          <div style="position:absolute; left:70%; top:20%; width:130px; height:130px; border-radius:24px; border:1px solid #60a5fa; background:rgba(37,99,235,0.16); display:flex; align-items:center; justify-content:center; text-align:center; animation:floatNode 5s ease-in-out infinite;">
            <div>Media Node</div>
          </div>

          <div style="position:absolute; left:22%; top:68%; width:130px; height:130px; border-radius:24px; border:1px solid #38bdf8; background:rgba(8,145,178,0.16); display:flex; align-items:center; justify-content:center; text-align:center; animation:floatNode 4.5s ease-in-out infinite;">
            <div>Commerce Node</div>
          </div>

          <div style="position:absolute; left:66%; top:66%; width:140px; height:140px; border-radius:24px; border:1px solid #22d3ee; background:rgba(6,182,212,0.16); display:flex; align-items:center; justify-content:center; text-align:center; animation:floatNode 3.8s ease-in-out infinite;">
            <div>Quantum Layer</div>
          </div>

          <div style="position:absolute; right:20px; top:20px; width:260px; background:rgba(2,6,23,0.76); border:1px solid #334155; border-radius:18px; padding:14px;">
            <h3 style="margin-top:0;">World HUD</h3>
            <div>${hudHtml || '<span class="pill">No HUD panels</span>'}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Portal Travel</h3>
          <div>${portalButtons || '<p>No portals configured.</p>'}</div>
        </div>
        <div class="card">
          <h3>Embedded Panels</h3>
          <div>${panelButtons || '<p>No embedded panels configured.</p>'}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>World State Sync</h3>
        <table>
          <thead><tr><th>Key</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>${syncRows || '<tr><td colspan="3">No sync rows found.</td></tr>'}</tbody>
        </table>
        <p id="liveSyncStatus" class="muted" style="margin-top:12px;">Live Sync — waiting for refresh...</p>
        <p id="livePushStatus" class="muted" style="margin-top:8px;">Live Push — waiting for notifications...</p>
        <p id="liveSocketStatus" class="muted" style="margin-top:8px;">Live Socket — waiting for stream...</p>
        <div id="liveEventFeed" style="margin-top:12px; max-height:180px; overflow:auto; border:1px solid #334155; border-radius:12px; padding:10px; background:#020617;">
          <div class="muted">No live events yet.</div>
        </div>
      </div>
    </div>
  `, user);
}


function renderWorldSyncPage(user = null) {
  const presence = dbQuery(`
    SELECT p.id, a.avatar_name, s.scene_name, p.presence_status, p.presence_note, p.created_at
    FROM world_presence p
    LEFT JOIN avatar_profiles a ON a.id = p.avatar_id
    LEFT JOIN scene_registry s ON s.id = p.scene_id
    ORDER BY p.id DESC
    LIMIT 100
  `);

  const memberships = dbQuery(`
    SELECT m.id, a.avatar_name, m.room_type, m.room_ref_id, m.membership_status, m.created_at
    FROM world_room_membership m
    LEFT JOIN avatar_profiles a ON a.id = m.avatar_id
    ORDER BY m.id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT e.id, s.scene_name, a.avatar_name, e.event_type, e.event_payload, e.event_status, e.created_at
    FROM world_event_bus e
    LEFT JOIN scene_registry s ON s.id = e.scene_id
    LEFT JOIN avatar_profiles a ON a.id = e.avatar_id
    ORDER BY e.id DESC
    LIMIT 100
  `);

  const channels = dbQuery(`
    SELECT id, channel_name, channel_type, scene_id, sync_status, created_at
    FROM sync_channels
    ORDER BY id DESC
    LIMIT 100
  `);

  const presenceRows = presence.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.presence_status}</td>
      <td>${r.presence_note || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const membershipRows = memberships.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.room_type}</td>
      <td>${r.room_ref_id || ''}</td>
      <td>${r.membership_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.event_type}</td>
      <td><code>${r.event_payload || ''}</code></td>
      <td>${r.event_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const channelRows = channels.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.channel_name}</td>
      <td>${r.channel_type}</td>
      <td>${r.scene_id || ''}</td>
      <td>${r.sync_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('World Sync', `
    <div class="section">
      <div class="card">
        <h2>Multi-User World Sync Foundation</h2>
        <p>This is the backbone for future real-time immersive worlds: presence, membership, event bus activity, and scene sync channels.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Presence</h3>
        <table>
          <thead><tr><th>ID</th><th>Avatar</th><th>Scene</th><th>Status</th><th>Note</th><th>Created</th></tr></thead>
          <tbody>${presenceRows || '<tr><td colspan="6">No presence rows yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Room Memberships</h3>
        <table>
          <thead><tr><th>ID</th><th>Avatar</th><th>Room Type</th><th>Room Ref</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${membershipRows || '<tr><td colspan="6">No memberships yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>World Event Bus</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${eventRows || '<tr><td colspan="7">No events yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Sync Channels</h3>
        <table>
          <thead><tr><th>ID</th><th>Channel</th><th>Type</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${channelRows || '<tr><td colspan="6">No sync channels yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderLiveSyncPage(user = null) {
  const channels = dbQuery(`
    SELECT id, channel_name, channel_type, scene_id, sync_status, created_at
    FROM sync_channels
    ORDER BY id DESC
  `);

  const snapshots = dbQuery(`
    SELECT rs.id, rs.scene_id, s.scene_name, rs.snapshot_type, rs.snapshot_payload, rs.snapshot_status, rs.created_at
    FROM refresh_snapshots rs
    LEFT JOIN scene_registry s ON s.id = rs.scene_id
    ORDER BY rs.id DESC
    LIMIT 100
  `);

  const channelRows = channels.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.channel_name}</td>
      <td>${c.channel_type}</td>
      <td>${c.scene_id || ''}</td>
      <td>${c.sync_status}</td>
      <td>${c.created_at || ''}</td>
    </tr>
  `).join('');

  const snapshotRows = snapshots.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.scene_name || ('Scene ' + (s.scene_id || ''))}</td>
      <td>${s.snapshot_type}</td>
      <td><code>${s.snapshot_payload || ''}</code></td>
      <td>${s.snapshot_status}</td>
      <td>${s.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Live Sync', `
    <div class="section">
      <div class="card">
        <h2>Live Refresh + Sync Layer</h2>
        <p>This is the first near-real-time layer. It adds refresh snapshots, sync visibility, and polling-ready world status data.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Sync Channels</h3>
        <table>
          <thead><tr><th>ID</th><th>Channel</th><th>Type</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${channelRows || '<tr><td colspan="6">No sync channels yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Refresh Snapshots</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${snapshotRows || '<tr><td colspan="6">No snapshots yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderWorldCommsPage(user = null) {
  const messages = dbQuery(`
    SELECT m.id, s.scene_name, a.avatar_name, m.message_type, m.message_text, m.message_status, m.created_at
    FROM world_messages m
    LEFT JOIN scene_registry s ON s.id = m.scene_id
    LEFT JOIN avatar_profiles a ON a.id = m.avatar_id
    ORDER BY m.id DESC
    LIMIT 100
  `);

  const announcements = dbQuery(`
    SELECT sa.id, s.scene_name, sa.title, sa.body, sa.announcement_status, sa.created_at
    FROM scene_announcements sa
    LEFT JOIN scene_registry s ON s.id = sa.scene_id
    ORDER BY sa.id DESC
    LIMIT 100
  `);

  const bridges = dbQuery(`
    SELECT id, room_type, room_ref_id, scene_id, bridge_status, created_at
    FROM room_world_bridge
    ORDER BY id DESC
    LIMIT 100
  `);

  const msgRows = messages.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.message_type}</td>
      <td>${r.message_text}</td>
      <td>${r.message_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const annRows = announcements.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.title}</td>
      <td>${r.body}</td>
      <td>${r.announcement_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const bridgeRows = bridges.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.room_type}</td>
      <td>${r.room_ref_id || ''}</td>
      <td>${r.scene_id || ''}</td>
      <td>${r.bridge_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('World Communications', `
    <div class="section">
      <div class="card">
        <h2>World Communications Layer</h2>
        <p>This is the social and coordination layer for immersive worlds: messages, announcements, and room-to-world bridging.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>World Messages</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Type</th><th>Message</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${msgRows || '<tr><td colspan="7">No world messages yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Scene Announcements</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Title</th><th>Body</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${annRows || '<tr><td colspan="6">No announcements yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Room ↔ World Bridge</h3>
        <table>
          <thead><tr><th>ID</th><th>Room Type</th><th>Room Ref</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${bridgeRows || '<tr><td colspan="6">No bridges yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderLivePushPage(user = null) {
  const channels = dbQuery(`
    SELECT id, channel_name, channel_scope, scene_id, push_status, created_at
    FROM push_channels
    ORDER BY id DESC
  `);

  const queue = dbQuery(`
    SELECT q.id, p.channel_name, a.avatar_name, q.notification_type, q.notification_title, q.notification_body, q.delivery_status, q.created_at
    FROM notification_queue q
    LEFT JOIN push_channels p ON p.id = q.channel_id
    LEFT JOIN avatar_profiles a ON a.id = q.avatar_id
    ORDER BY q.id DESC
    LIMIT 100
  `);

  const alerts = dbQuery(`
    SELECT sa.id, s.scene_name, sa.alert_type, sa.alert_title, sa.alert_body, sa.alert_status, sa.created_at
    FROM scene_alerts sa
    LEFT JOIN scene_registry s ON s.id = sa.scene_id
    ORDER BY sa.id DESC
    LIMIT 100
  `);

  const channelRows = channels.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.channel_name}</td>
      <td>${r.channel_scope}</td>
      <td>${r.scene_id || ''}</td>
      <td>${r.push_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const queueRows = queue.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.channel_name || ''}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.notification_type}</td>
      <td>${r.notification_title}</td>
      <td>${r.notification_body || ''}</td>
      <td>${r.delivery_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const alertRows = alerts.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.alert_type}</td>
      <td>${r.alert_title}</td>
      <td>${r.alert_body || ''}</td>
      <td>${r.alert_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Live Push', `
    <div class="section">
      <div class="card">
        <h2>Live Push Foundation</h2>
        <p>This is the bridge from polling to event delivery: push channels, queued notifications, and scene alerts.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Push Channels</h3>
        <table>
          <thead><tr><th>ID</th><th>Channel</th><th>Scope</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${channelRows || '<tr><td colspan="6">No push channels yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Notification Queue</h3>
        <table>
          <thead><tr><th>ID</th><th>Channel</th><th>Avatar</th><th>Type</th><th>Title</th><th>Body</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${queueRows || '<tr><td colspan="8">No notifications yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Scene Alerts</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Type</th><th>Title</th><th>Body</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${alertRows || '<tr><td colspan="7">No alerts yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderSocketSyncPage(user = null) {
  const connections = dbQuery(`
    SELECT c.id, c.socket_key, a.avatar_name, s.scene_name, c.connection_status, c.created_at
    FROM socket_connections c
    LEFT JOIN avatar_profiles a ON a.id = c.avatar_id
    LEFT JOIN scene_registry s ON s.id = c.scene_id
    ORDER BY c.id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT e.id, e.socket_key, s.scene_name, a.avatar_name, e.event_type, e.event_payload, e.event_status, e.created_at
    FROM socket_event_log e
    LEFT JOIN avatar_profiles a ON a.id = e.avatar_id
    LEFT JOIN scene_registry s ON s.id = e.scene_id
    ORDER BY e.id DESC
    LIMIT 100
  `);

  const states = dbQuery(`
    SELECT sws.id, s.scene_name, sws.state_key, sws.state_value, sws.state_status, sws.created_at
    FROM shared_world_state sws
    LEFT JOIN scene_registry s ON s.id = sws.scene_id
    ORDER BY sws.id DESC
    LIMIT 100
  `);

  const connRows = connections.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.socket_key}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.connection_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.socket_key || ''}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.avatar_name || ''}</td>
      <td>${r.event_type}</td>
      <td><code>${r.event_payload || ''}</code></td>
      <td>${r.event_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const stateRows = states.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.state_key}</td>
      <td>${r.state_value || ''}</td>
      <td>${r.state_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Socket Sync', `
    <div class="section">
      <div class="card">
        <h2>Socket Sync Foundation</h2>
        <p>This is the true live-state backbone: connection registry, socket events, and shared world state.</p>
        <a href="http://127.0.0.1:5090/health">World Socket Health</a>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Socket Connections</h3>
        <table>
          <thead><tr><th>ID</th><th>Socket</th><th>Avatar</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${connRows || '<tr><td colspan="6">No socket connections yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Socket Event Log</h3>
        <table>
          <thead><tr><th>ID</th><th>Socket</th><th>Scene</th><th>Avatar</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${eventRows || '<tr><td colspan="8">No socket events yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Shared World State</h3>
        <table>
          <thead><tr><th>ID</th><th>Scene</th><th>Key</th><th>Value</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${stateRows || '<tr><td colspan="6">No shared state yet.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderWorldStatePage(user = null) {
  const avatars = dbQuery(`
    SELECT ap.id, ap.avatar_id, a.avatar_name, s.scene_name, ap.pos_x, ap.pos_y, ap.pos_z, ap.facing, ap.movement_status, ap.updated_at
    FROM avatar_positions ap
    LEFT JOIN avatar_profiles a ON a.id = ap.avatar_id
    LEFT JOIN scene_registry s ON s.id = ap.scene_id
    ORDER BY ap.id DESC
  `);

  const objects = dbQuery(`
    SELECT o.id, s.scene_name, o.object_name, o.object_type, o.pos_x, o.pos_y, o.pos_z, o.object_state, o.interaction_status, o.updated_at
    FROM shared_world_objects o
    LEFT JOIN scene_registry s ON s.id = o.scene_id
    ORDER BY o.id DESC
  `);

  const interactions = dbQuery(`
    SELECT i.id, s.scene_name, a.avatar_name, o.object_name, i.interaction_type, i.interaction_payload, i.interaction_status, i.created_at
    FROM object_interaction_log i
    LEFT JOIN scene_registry s ON s.id = i.scene_id
    LEFT JOIN avatar_profiles a ON a.id = i.avatar_id
    LEFT JOIN shared_world_objects o ON o.id = i.object_id
    ORDER BY i.id DESC
    LIMIT 100
  `);

  const avatarRows = avatars.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.avatar_name || ''}</td><td>${r.scene_name || ''}</td>
      <td>${r.pos_x}</td><td>${r.pos_y}</td><td>${r.pos_z}</td>
      <td>${r.facing || ''}</td><td>${r.movement_status}</td><td>${r.updated_at || ''}</td>
    </tr>
  `).join('');

  const objectRows = objects.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.object_name}</td><td>${r.object_type}</td>
      <td>${r.pos_x}</td><td>${r.pos_y}</td><td>${r.pos_z}</td>
      <td>${r.object_state || ''}</td><td>${r.interaction_status}</td><td>${r.updated_at || ''}</td>
    </tr>
  `).join('');

  const interactionRows = interactions.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.avatar_name || ''}</td><td>${r.object_name || ''}</td>
      <td>${r.interaction_type}</td><td><code>${r.interaction_payload || ''}</code></td>
      <td>${r.interaction_status}</td><td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('World State', `
    <div class="section"><div class="card"><h2>Avatar Movement + Shared Object State</h2><p>This is the shared interactive world layer: avatar positions, object states, and interaction history.</p></div></div>

    <div class="section"><div class="card">
      <h3>Avatar Positions</h3>
      <table>
        <thead><tr><th>ID</th><th>Avatar</th><th>Scene</th><th>X</th><th>Y</th><th>Z</th><th>Facing</th><th>Status</th><th>Updated</th></tr></thead>
        <tbody>${avatarRows || '<tr><td colspan="9">No avatar rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Shared World Objects</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Type</th><th>X</th><th>Y</th><th>Z</th><th>State</th><th>Status</th><th>Updated</th></tr></thead>
        <tbody>${objectRows || '<tr><td colspan="10">No object rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Object Interactions</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Object</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${interactionRows || '<tr><td colspan="8">No interactions yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}


function renderWorldControlPage(user = null) {
  const sceneCommands = dbQuery(`
    SELECT sc.id, s.scene_name, sc.command_type, sc.command_payload, sc.command_status, sc.created_at
    FROM scene_command_queue sc
    LEFT JOIN scene_registry s ON s.id = sc.scene_id
    ORDER BY sc.id DESC
    LIMIT 100
  `);

  const avatarActions = dbQuery(`
    SELECT aa.id, s.scene_name, a.avatar_name, aa.action_type, aa.action_payload, aa.action_status, aa.created_at
    FROM avatar_action_queue aa
    LEFT JOIN scene_registry s ON s.id = aa.scene_id
    LEFT JOIN avatar_profiles a ON a.id = aa.avatar_id
    ORDER BY aa.id DESC
    LIMIT 100
  `);

  const objectCommands = dbQuery(`
    SELECT oc.id, s.scene_name, o.object_name, oc.command_type, oc.command_payload, oc.command_status, oc.created_at
    FROM object_command_queue oc
    LEFT JOIN scene_registry s ON s.id = oc.scene_id
    LEFT JOIN shared_world_objects o ON o.id = oc.object_id
    ORDER BY oc.id DESC
    LIMIT 100
  `);

  const sceneRows = sceneCommands.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.command_type}</td><td><code>${r.command_payload || ''}</code></td><td>${r.command_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const avatarRows = avatarActions.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.avatar_name || ''}</td><td>${r.action_type}</td><td><code>${r.action_payload || ''}</code></td><td>${r.action_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const objectRows = objectCommands.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.object_name || ''}</td><td>${r.command_type}</td><td><code>${r.command_payload || ''}</code></td><td>${r.command_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Control', `
    <div class="section"><div class="card"><h2>Multiplayer Control Layer</h2><p>This is the admin orchestration layer for scene commands, avatar actions, and object commands.</p></div></div>

    <div class="section"><div class="card">
      <h3>Scene Commands</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${sceneRows || '<tr><td colspan="6">No scene commands yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Avatar Actions</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Avatar</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${avatarRows || '<tr><td colspan="7">No avatar actions yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Object Commands</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Object</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${objectRows || '<tr><td colspan="7">No object commands yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}


function renderWorldExecutionPage(user = null) {
  const rows = dbQuery(`
    SELECT sal.id, s.scene_name, sal.source_type, sal.source_id, sal.applied_key, sal.applied_value, sal.apply_status, sal.created_at
    FROM state_application_log sal
    LEFT JOIN scene_registry s ON s.id = sal.scene_id
    ORDER BY sal.id DESC
    LIMIT 200
  `);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.scene_name || ''}</td>
      <td>${r.source_type}</td>
      <td>${r.source_id || ''}</td>
      <td>${r.applied_key}</td>
      <td><code>${r.applied_value || ''}</code></td>
      <td>${r.apply_status}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('World Execution', `
    <div class="section"><div class="card">
      <h2>World Execution Layer</h2>
      <p>This page shows which commands and actions were actually applied into live shared world state.</p>
    </div></div>

    <div class="section"><div class="card">
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Source Type</th><th>Source ID</th><th>Applied Key</th><th>Applied Value</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${tableRows || '<tr><td colspan="8">No applied state yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}


function renderWorldPersistencePage(user = null) {
  const sessions = dbQuery(`
    SELECT ws.id, sr.scene_name, ws.session_name, ws.session_status, ws.started_at, ws.ended_at
    FROM world_sessions ws
    LEFT JOIN scene_registry sr ON sr.id = ws.scene_id
    ORDER BY ws.id DESC
    LIMIT 100
  `);

  const checkpoints = dbQuery(`
    SELECT sc.id, sr.scene_name, sc.checkpoint_name, sc.checkpoint_payload, sc.checkpoint_status, sc.created_at
    FROM scene_checkpoints sc
    LEFT JOIN scene_registry sr ON sr.id = sc.scene_id
    ORDER BY sc.id DESC
    LIMIT 100
  `);

  const replay = dbQuery(`
    SELECT rt.id, sr.scene_name, rt.event_source, rt.event_ref_id, rt.replay_payload, rt.replay_status, rt.created_at
    FROM replay_timeline rt
    LEFT JOIN scene_registry sr ON sr.id = rt.scene_id
    ORDER BY rt.id DESC
    LIMIT 100
  `);

  const recovery = dbQuery(`
    SELECT rs.id, sr.scene_name, rs.snapshot_name, rs.snapshot_payload, rs.snapshot_status, rs.created_at
    FROM recovery_snapshots rs
    LEFT JOIN scene_registry sr ON sr.id = rs.scene_id
    ORDER BY rs.id DESC
    LIMIT 100
  `);

  const sRows = sessions.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.session_name}</td><td>${r.session_status}</td><td>${r.started_at || ''}</td><td>${r.ended_at || ''}</td></tr>
  `).join('');

  const cRows = checkpoints.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.checkpoint_name}</td><td><code>${r.checkpoint_payload || ''}</code></td><td>${r.checkpoint_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const rRows = replay.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.event_source}</td><td>${r.event_ref_id || ''}</td><td><code>${r.replay_payload || ''}</code></td><td>${r.replay_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const recRows = recovery.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.snapshot_name}</td><td><code>${r.snapshot_payload || ''}</code></td><td>${r.snapshot_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Persistence', `
    <div class="section"><div class="card">
      <h2>World Persistence + Replay Layer</h2>
      <p>This layer records sessions, stores checkpoints, tracks replay history, and keeps recovery snapshots for each world.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>World Sessions</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Session</th><th>Status</th><th>Started</th><th>Ended</th></tr></thead>
        <tbody>${sRows || '<tr><td colspan="6">No sessions yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Scene Checkpoints</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${cRows || '<tr><td colspan="6">No checkpoints yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Replay Timeline</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Source</th><th>Ref</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${rRows || '<tr><td colspan="7">No replay rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Recovery Snapshots</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${recRows || '<tr><td colspan="6">No recovery snapshots yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}


function renderWorldAutomationPage(user = null) {
  const rules = dbQuery(`
    SELECT war.id, sr.scene_name, war.rule_name, war.trigger_type, war.action_type, war.rule_payload, war.rule_status, war.created_at
    FROM world_automation_rules war
    LEFT JOIN scene_registry sr ON sr.id = war.scene_id
    ORDER BY war.id DESC
    LIMIT 100
  `);

  const jobs = dbQuery(`
    SELECT wj.id, sr.scene_name, wj.job_name, wj.job_type, wj.job_payload, wj.job_status, wj.created_at, wj.completed_at
    FROM world_jobs wj
    LEFT JOIN scene_registry sr ON sr.id = wj.scene_id
    ORDER BY wj.id DESC
    LIMIT 100
  `);

  const logs = dbQuery(`
    SELECT wol.id, sr.scene_name, wol.source_type, wol.source_id, wol.orchestration_event, wol.orchestration_payload, wol.orchestration_status, wol.created_at
    FROM world_orchestration_log wol
    LEFT JOIN scene_registry sr ON sr.id = wol.scene_id
    ORDER BY wol.id DESC
    LIMIT 100
  `);

  const ruleRows = rules.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.rule_name}</td><td>${r.trigger_type}</td><td>${r.action_type}</td><td><code>${r.rule_payload || ''}</code></td><td>${r.rule_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const jobRows = jobs.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.job_name}</td><td>${r.job_type}</td><td><code>${r.job_payload || ''}</code></td><td>${r.job_status}</td><td>${r.created_at || ''}</td><td>${r.completed_at || ''}</td></tr>
  `).join('');

  const logRows = logs.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.source_type}</td><td>${r.source_id || ''}</td><td>${r.orchestration_event}</td><td><code>${r.orchestration_payload || ''}</code></td><td>${r.orchestration_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Automation', `
    <div class="section"><div class="card">
      <h2>World Automation + Orchestration</h2>
      <p>This layer automates scene behaviors, runs world jobs, and records orchestration events across immersive worlds.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>Automation Rules</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Rule</th><th>Trigger</th><th>Action</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${ruleRows || '<tr><td colspan="8">No automation rules yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>World Jobs</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Job</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th><th>Completed</th></tr></thead>
        <tbody>${jobRows || '<tr><td colspan="8">No world jobs yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Orchestration Log</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Source</th><th>Source ID</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${logRows || '<tr><td colspan="8">No orchestration events yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}


function renderWorldEconomyPage(user = null) {
  const assets = dbQuery(`
    SELECT wa.id, sr.scene_name, wa.asset_name, wa.asset_type, wa.asset_rarity, wa.asset_status, wa.created_at
    FROM world_assets wa
    LEFT JOIN scene_registry sr ON sr.id = wa.scene_id
    ORDER BY wa.id DESC
    LIMIT 200
  `);

  const ownership = dbQuery(`
    SELECT ao.id, wa.asset_name, ao.owner_type, ao.owner_id, ao.ownership_status, ao.acquired_at
    FROM asset_ownership ao
    LEFT JOIN world_assets wa ON wa.id = ao.asset_id
    ORDER BY ao.id DESC
    LIMIT 200
  `);

  const inventory = dbQuery(`
    SELECT wi.id, wi.owner_type, wi.owner_id, wa.asset_name, wi.quantity, wi.inventory_status, wi.updated_at
    FROM world_inventory wi
    LEFT JOIN world_assets wa ON wa.id = wi.asset_id
    ORDER BY wi.id DESC
    LIMIT 200
  `);

  const transfers = dbQuery(`
    SELECT atl.id, wa.asset_name, atl.from_owner_type, atl.from_owner_id, atl.to_owner_type, atl.to_owner_id, atl.transfer_type, atl.transfer_status, atl.created_at
    FROM asset_transfer_log atl
    LEFT JOIN world_assets wa ON wa.id = atl.asset_id
    ORDER BY atl.id DESC
    LIMIT 200
  `);

  const assetRows = assets.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.asset_name}</td><td>${r.asset_type}</td><td>${r.asset_rarity || ''}</td><td>${r.asset_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const ownershipRows = ownership.map(r => `
    <tr><td>${r.id}</td><td>${r.asset_name || ''}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.ownership_status}</td><td>${r.acquired_at || ''}</td></tr>
  `).join('');

  const inventoryRows = inventory.map(r => `
    <tr><td>${r.id}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.asset_name || ''}</td><td>${r.quantity}</td><td>${r.inventory_status}</td><td>${r.updated_at || ''}</td></tr>
  `).join('');

  const transferRows = transfers.map(r => `
    <tr><td>${r.id}</td><td>${r.asset_name || ''}</td><td>${r.from_owner_type || ''}</td><td>${r.from_owner_id || ''}</td><td>${r.to_owner_type}</td><td>${r.to_owner_id}</td><td>${r.transfer_type}</td><td>${r.transfer_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Economy', `
    <div class="section"><div class="card">
      <h2>World Economy + Ownership</h2>
      <p>This layer handles assets, ownership, inventory, and transfers across immersive worlds.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>World Assets</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Asset</th><th>Type</th><th>Rarity</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${assetRows || '<tr><td colspan="7">No assets yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Asset Ownership</h3>
      <table>
        <thead><tr><th>ID</th><th>Asset</th><th>Owner Type</th><th>Owner ID</th><th>Status</th><th>Acquired</th></tr></thead>
        <tbody>${ownershipRows || '<tr><td colspan="6">No ownership rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>World Inventory</h3>
      <table>
        <thead><tr><th>ID</th><th>Owner Type</th><th>Owner ID</th><th>Asset</th><th>Qty</th><th>Status</th><th>Updated</th></tr></thead>
        <tbody>${inventoryRows || '<tr><td colspan="7">No inventory rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Asset Transfer Log</h3>
      <table>
        <thead><tr><th>ID</th><th>Asset</th><th>From Type</th><th>From ID</th><th>To Type</th><th>To ID</th><th>Transfer</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${transferRows || '<tr><td colspan="9">No transfer rows yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}


function renderWorldStorefrontsPage(user = null) {
  const storefronts = dbQuery(`
    SELECT ws.id, sr.scene_name, ws.storefront_name, ws.storefront_type, ws.owner_type, ws.owner_id, ws.storefront_status, ws.created_at
    FROM world_storefronts ws
    LEFT JOIN scene_registry sr ON sr.id = ws.scene_id
    ORDER BY ws.id DESC
    LIMIT 200
  `);

  const products = dbQuery(`
    SELECT sp.id, ws.storefront_name, sp.product_name, sp.product_type, sp.price_cents, sp.inventory_count, sp.product_status, sp.created_at
    FROM storefront_products sp
    LEFT JOIN world_storefronts ws ON ws.id = sp.storefront_id
    ORDER BY sp.id DESC
    LIMIT 200
  `);

  const orders = dbQuery(`
    SELECT wco.id, ws.storefront_name, wco.buyer_type, wco.buyer_id, wco.order_total_cents, wco.order_status, wco.created_at
    FROM world_cart_orders wco
    LEFT JOIN world_storefronts ws ON ws.id = wco.storefront_id
    ORDER BY wco.id DESC
    LIMIT 200
  `);

  const activity = dbQuery(`
    SELECT sal.id, ws.storefront_name, sal.activity_type, sal.activity_payload, sal.activity_status, sal.created_at
    FROM storefront_activity_log sal
    LEFT JOIN world_storefronts ws ON ws.id = sal.storefront_id
    ORDER BY sal.id DESC
    LIMIT 200
  `);

  const storefrontRows = storefronts.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.storefront_name}</td><td>${r.storefront_type}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.storefront_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const productRows = products.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.product_name}</td><td>${r.product_type}</td><td>${r.price_cents}</td><td>${r.inventory_count}</td><td>${r.product_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const orderRows = orders.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.buyer_type}</td><td>${r.buyer_id}</td><td>${r.order_total_cents}</td><td>${r.order_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const activityRows = activity.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.activity_type}</td><td><code>${r.activity_payload || ''}</code></td><td>${r.activity_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Storefronts', `
    <div class="section"><div class="card">
      <h2>World Marketplace + Storefronts</h2>
      <p>This layer connects immersive worlds to storefront ownership, product listings, and order activity.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>Storefronts</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Type</th><th>Owner Type</th><th>Owner ID</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${storefrontRows || '<tr><td colspan="8">No storefronts yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Products</h3>
      <table>
        <thead><tr><th>ID</th><th>Storefront</th><th>Product</th><th>Type</th><th>Price</th><th>Inventory</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${productRows || '<tr><td colspan="8">No products yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Orders</h3>
      <table>
        <thead><tr><th>ID</th><th>Storefront</th><th>Buyer Type</th><th>Buyer ID</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${orderRows || '<tr><td colspan="7">No orders yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Storefront Activity</h3>
      <table>
        <thead><tr><th>ID</th><th>Storefront</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${activityRows || '<tr><td colspan="6">No storefront activity yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}


function renderWorldSettlementsPage(user = null) {
  const settlements = dbQuery(`
    SELECT wos.id, sr.scene_name, wos.world_order_id, wos.buyer_type, wos.buyer_id, wos.amount_cents, wos.receipt_id, wos.wallet_tx_id, wos.settlement_status, wos.created_at
    FROM world_order_settlements wos
    LEFT JOIN scene_registry sr ON sr.id = wos.scene_id
    ORDER BY wos.id DESC
    LIMIT 200
  `);

  const commerce = dbQuery(`
    SELECT wcl.id, sr.scene_name, wcl.source_type, wcl.source_id, wcl.commerce_event, wcl.commerce_payload, wcl.commerce_status, wcl.created_at
    FROM world_commerce_log wcl
    LEFT JOIN scene_registry sr ON sr.id = wcl.scene_id
    ORDER BY wcl.id DESC
    LIMIT 200
  `);

  const receiptRows = settlements.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.world_order_id}</td><td>${r.buyer_type}</td><td>${r.buyer_id}</td><td>${r.amount_cents}</td><td>${r.receipt_id || ''}</td><td>${r.wallet_tx_id || ''}</td><td>${r.settlement_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const commerceRows = commerce.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.source_type}</td><td>${r.source_id || ''}</td><td>${r.commerce_event}</td><td><code>${r.commerce_payload || ''}</code></td><td>${r.commerce_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Settlements', `
    <div class="section"><div class="card">
      <h2>World Commerce Settlements</h2>
      <p>This layer bridges immersive world orders into receipts, wallet transactions, and settlement records.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>Settlement Records</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Order</th><th>Buyer Type</th><th>Buyer ID</th><th>Amount</th><th>Receipt</th><th>Wallet Tx</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${receiptRows || '<tr><td colspan="10">No settlements yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Commerce Log</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Source Type</th><th>Source ID</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${commerceRows || '<tr><td colspan="8">No commerce events yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}


function renderWorldAccessPage(user = null) {
  const entitlements = dbQuery(`
    SELECT we.id, sr.scene_name, we.entitlement_name, we.entitlement_type, we.asset_id, we.entitlement_status, we.created_at
    FROM world_entitlements we
    LEFT JOIN scene_registry sr ON sr.id = we.scene_id
    ORDER BY we.id DESC
    LIMIT 200
  `);

  const passes = dbQuery(`
    SELECT wap.id, sr.scene_name, wap.owner_type, wap.owner_id, wap.entitlement_id, wap.pass_status, wap.created_at
    FROM world_access_passes wap
    LEFT JOIN scene_registry sr ON sr.id = wap.scene_id
    ORDER BY wap.id DESC
    LIMIT 200
  `);

  const logs = dbQuery(`
    SELECT wal.id, sr.scene_name, wal.owner_type, wal.owner_id, wal.access_type, wal.access_result, wal.access_payload, wal.created_at
    FROM world_access_log wal
    LEFT JOIN scene_registry sr ON sr.id = wal.scene_id
    ORDER BY wal.id DESC
    LIMIT 200
  `);

  const entRows = entitlements.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.entitlement_name}</td><td>${r.entitlement_type}</td><td>${r.asset_id || ''}</td><td>${r.entitlement_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const passRows = passes.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.entitlement_id || ''}</td><td>${r.pass_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const logRows = logs.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name || ''}</td><td>${r.owner_type}</td><td>${r.owner_id}</td><td>${r.access_type}</td><td>${r.access_result}</td><td><code>${r.access_payload || ''}</code></td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('World Access', `
    <div class="section"><div class="card">
      <h2>World Access + Entitlements</h2>
      <p>This layer controls premium access, entitlement grants, and access validation inside immersive worlds.</p>
    </div></div>

    <div class="section"><div class="card">
      <h3>Entitlements</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Name</th><th>Type</th><th>Asset</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${entRows || '<tr><td colspan="7">No entitlements yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Access Passes</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Owner Type</th><th>Owner ID</th><th>Entitlement</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${passRows || '<tr><td colspan="7">No access passes yet.</td></tr>'}</tbody>
      </table>
    </div></div>

    <div class="section"><div class="card">
      <h3>Access Log</h3>
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Owner Type</th><th>Owner ID</th><th>Access Type</th><th>Result</th><th>Payload</th><th>Created</th></tr></thead>
        <tbody>${logRows || '<tr><td colspan="8">No access log yet.</td></tr>'}</tbody>
      </table>
    </div></div>
  `, user);
}


function safeRowsHtml(rows, fallback, renderer) {
  if (!rows || !rows.length) return fallback;
  return rows.map(renderer).join('');
}

function publicNav() {
  return `
    <div class="section">
      <div class="card">
        <a href="/">Home</a>
        <a href="/world-explorer">World Explorer</a>
        <a href="/storefront-explorer">Storefront Explorer</a>
        <a href="/wallet-center">Wallet Center</a>
        <a href="/access-center">Access Center</a>
        <a href="/creator-hub">Creator Hub</a>
        <a href="/blog">Blog</a>
        <a href="/books">Books</a>
      </div>
    </div>
  `;
}


function renderPublicHomePage(user = null) {
  const worlds = dbQuery(`SELECT id, scene_name, scene_type, scene_status FROM scene_registry ORDER BY id DESC LIMIT 6`);
  const storefronts = dbQuery(`SELECT id, storefront_name, storefront_type, storefront_status FROM world_storefronts ORDER BY id DESC LIMIT 6`);
  const books = dbQuery(`SELECT id, title, price_cents FROM books ORDER BY id DESC LIMIT 6`);
  const blogs = dbQuery(`SELECT id, title, slug FROM blog_posts ORDER BY id DESC LIMIT 6`);

  const walletCount = dbQuery(`SELECT count(*) as c FROM wallets`)[0]?.c || 0;
  const worldCount = dbQuery(`SELECT count(*) as c FROM scene_registry`)[0]?.c || 0;
  const storeCount = dbQuery(`SELECT count(*) as c FROM world_storefronts`)[0]?.c || 0;
  const bookCount = dbQuery(`SELECT count(*) as c FROM books`)[0]?.c || 0;

  const stats = `
    <div class="stats-grid">
      ${statCard('Worlds', worldCount, 'Immersive environments')}
      ${statCard('Storefronts', storeCount, 'Commerce surfaces')}
      ${statCard('Books', bookCount, 'Knowledge + media')}
      ${statCard('Wallets', walletCount, 'Finance foundation')}
    </div>
  `;

  const hero = `
    <div class="landing-hero">
      <div class="landing-copy">
        <div class="eyebrow">Holographic Commerce + Worlds + Finance</div>
        <h1>Build, explore, sell, create, and control your digital ecosystem.</h1>
        <p>
          The All American Marketplace system connects immersive worlds, storefronts, books, wallet rails,
          access systems, creator tools, logistics, and live operations into one platform.
        </p>
        <div class="hero-actions">
          <a href="/world-explorer">Explore Worlds</a>
          <a href="/storefront-explorer" class="secondary">Browse Storefronts</a>
        </div>
      </div>
      <div class="hero-panel">
        ${stats}
      </div>
    </div>
  `;

  const worldCards = worlds.map(w => featureCard(
    w.scene_name || 'World',
    `Type: ${w.scene_type || 'N/A'} · Status: ${w.scene_status || 'N/A'}`,
    `/motion-worlds/${w.id}`,
    'Enter World'
  )).join('');

  const storeCards = storefronts.map(s => featureCard(
    s.storefront_name || 'Storefront',
    `Type: ${s.storefront_type || 'N/A'} · Status: ${s.storefront_status || 'N/A'}`,
    `/world-storefronts`,
    'View Storefronts'
  )).join('');

  const bookCards = books.map(b => featureCard(
    b.title || 'Book',
    `Price: $${((Number(b.price_cents || 0))/100).toFixed(2)}`,
    `/books/read/${b.id}`,
    'Read'
  )).join('');

  const articleList = blogs.length
    ? `<div class="article-list">` + blogs.map(b => `<a href="/blog/${b.slug}" class="article-row">${b.title || 'Article'}</a>`).join('') + `</div>`
    : `<div class="muted">No articles yet.</div>`;

  const content = `
    ${hero}
    ${cleanSection('Featured Worlds', `<div class="feature-grid">${worldCards || '<div class="muted">No worlds yet.</div>'}</div>`, 'Explore immersive environments and live world systems.')}
    ${cleanSection('Featured Storefronts', `<div class="feature-grid">${storeCards || '<div class="muted">No storefronts yet.</div>'}</div>`, 'Commerce surfaces connected to the immersive economy.')}
    ${cleanSection('Books + Knowledge', `<div class="feature-grid">${bookCards || '<div class="muted">No books yet.</div>'}</div>`, 'Knowledge, content, and media inside the ecosystem.')}
    ${cleanSection('Latest Articles', articleList, 'Updates, knowledge, and public-facing content.')}
  `;

  return uiShell(
    'All American Marketplace Holographic Ecosystem',
    content,
    user,
    {
      publicMode: true,
      subtitle: 'A unified platform for immersive worlds, digital commerce, creators, logistics, finance, and access control.'
    }
  );
}



function renderWorldExplorerPage(user = null) {
  const worlds = dbQuery(`
    SELECT sr.id, sr.scene_name, sr.scene_type, sr.scene_status,
           (SELECT count(*) FROM avatar_positions ap WHERE ap.scene_id = sr.id) as avatar_count,
           (SELECT count(*) FROM shared_world_objects so WHERE so.scene_id = sr.id) as object_count
    FROM scene_registry sr
    ORDER BY sr.id DESC
  `);

  const cards = worlds.map(w => `
    <div class="feature-card">
      <h3>${w.scene_name || ''}</h3>
      <p>Type: ${w.scene_type || ''}</p>
      <p>Status: ${w.scene_status || ''}</p>
      <p>Avatars: ${w.avatar_count || 0} · Objects: ${w.object_count || 0}</p>
      <a href="/motion-worlds/${w.id}" class="feature-link">Open World</a>
    </div>
  `).join('');

  return uiShell('World Explorer', `
    ${cleanSection('Explore Worlds', `<div class="feature-grid">${cards || '<div class="muted">No worlds yet.</div>'}</div>`, 'A cleaner view of immersive spaces and available worlds.')}
  `, user, { publicMode: true, subtitle: 'Browse active immersive worlds without the admin clutter.' });
}



function renderStorefrontExplorerPage(user = null) {
  const rows = dbQuery(`
    SELECT ws.id, ws.storefront_name, ws.storefront_type, ws.storefront_status,
           (SELECT count(*) FROM storefront_products sp WHERE sp.storefront_id = ws.id) as product_count
    FROM world_storefronts ws
    ORDER BY ws.id DESC
  `);

  const cards = rows.map(r => `
    <div class="feature-card">
      <h3>${r.storefront_name || ''}</h3>
      <p>Type: ${r.storefront_type || ''}</p>
      <p>Status: ${r.storefront_status || ''}</p>
      <p>Products: ${r.product_count || 0}</p>
      <a href="/world-storefronts" class="feature-link">View Commerce Layer</a>
    </div>
  `).join('');

  return uiShell('Storefront Explorer', `
    ${cleanSection('Commerce Surfaces', `<div class="feature-grid">${cards || '<div class="muted">No storefronts yet.</div>'}</div>`, 'Browse available storefronts connected to the world economy.')}
  `, user, { publicMode: true, subtitle: 'A cleaner storefront browsing experience.' });
}



function renderWalletCenterPage(user = null) {
  const wallets = dbQuery(`SELECT id, COALESCE(wallet_name, 'Primary Wallet') AS wallet_name, COALESCE(wallet_status, 'active') AS wallet_status FROM wallets ORDER BY id DESC LIMIT 12`);
  const tx = dbQuery(`SELECT id, wallet_id, tx_type, amount_cents, note, created_at FROM wallet_transactions ORDER BY id DESC LIMIT 20`);

  const walletCards = wallets.map(w => `
    <div class="feature-card">
      <h3>${w.wallet_name || 'Wallet'}</h3>
      <p>Status: ${w.wallet_status || ''}</p>
      <a href="/wallet-transactions" class="feature-link">View Transactions</a>
    </div>
  `).join('');

  const txRows = tx.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.wallet_id || ''}</td>
      <td>${r.tx_type || ''}</td>
      <td>${r.amount_cents || 0}</td>
      <td>${r.note || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return uiShell('Wallet Center', `
    ${cleanSection('Wallets', `<div class="feature-grid">${walletCards || '<div class="muted">No wallets yet.</div>'}</div>`, 'Financial surfaces and wallet identities.')}
    ${cleanSection('Recent Transactions', `
      <table>
        <thead><tr><th>ID</th><th>Wallet</th><th>Type</th><th>Amount</th><th>Note</th><th>Created</th></tr></thead>
        <tbody>${txRows || '<tr><td colspan="6">No transactions yet.</td></tr>'}</tbody>
      </table>
    `, 'A cleaner transaction overview.')}
  `, user, { publicMode: true, subtitle: 'Wallets, transaction flows, and finance surfaces.' });
}



function renderAccessCenterPage(user = null) {
  const entitlements = dbQuery(`SELECT id, entitlement_name, entitlement_type, entitlement_status FROM world_entitlements ORDER BY id DESC LIMIT 20`);
  const passes = dbQuery(`SELECT id, scene_id, owner_type, owner_id, entitlement_id, pass_status FROM world_access_passes ORDER BY id DESC LIMIT 20`);

  const entitlementCards = entitlements.map(e => `
    <div class="feature-card">
      <h3>${e.entitlement_name || ''}</h3>
      <p>Type: ${e.entitlement_type || ''}</p>
      <p>Status: ${e.entitlement_status || ''}</p>
    </div>
  `).join('');

  const passRows = passes.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.scene_id || ''}</td>
      <td>${p.owner_type || ''} #${p.owner_id || ''}</td>
      <td>${p.entitlement_id || ''}</td>
      <td>${p.pass_status || ''}</td>
    </tr>
  `).join('');

  return uiShell('Access Center', `
    ${cleanSection('Entitlements', `<div class="feature-grid">${entitlementCards || '<div class="muted">No entitlements yet.</div>'}</div>`, 'Premium access and scene-entry rights.')}
    ${cleanSection('Access Passes', `
      <table>
        <thead><tr><th>ID</th><th>Scene</th><th>Owner</th><th>Entitlement</th><th>Status</th></tr></thead>
        <tbody>${passRows || '<tr><td colspan="5">No access passes yet.</td></tr>'}</tbody>
      </table>
    `, 'Current granted passes and access links.')}
  `, user, { publicMode: true, subtitle: 'Scene access, entitlement grants, and premium rights.' });
}



function renderCreatorHubPage(user = null) {
  const podcasts = dbQuery(`SELECT id, title, COALESCE(host_name, 'Unknown Host') AS host_name, COALESCE(status, 'active') AS status FROM podcasts ORDER BY id DESC LIMIT 12`);
  const rooms = dbQuery(`SELECT id, room_name, room_status FROM podcast_rooms ORDER BY id DESC LIMIT 12`);
  const beatProfiles = dbQuery(`SELECT id, beat_name, beat_mode, bpm, beat_status FROM quantum_beat_profiles ORDER BY id DESC LIMIT 12`);

  const cards = [
    ...podcasts.map(p => `
      <div class="feature-card">
        <h3>${p.title || 'Podcast'}</h3>
        <p>Host: ${p.host_name || ''}</p>
        <p>Status: ${p.status || ''}</p>
      </div>
    `),
    ...rooms.map(r => `
      <div class="feature-card">
        <h3>${r.room_name || 'Room'}</h3>
        <p>Status: ${r.room_status || ''}</p>
      </div>
    `),
    ...beatProfiles.map(b => `
      <div class="feature-card">
        <h3>${b.beat_name || 'Quantum Beat TM'}</h3>
        <p>Mode: ${b.beat_mode || ''}</p>
        <p>BPM: ${b.bpm || ''} · Status: ${b.beat_status || ''}</p>
      </div>
    `)
  ].join('');

  return uiShell('Creator Hub', `
    ${cleanSection('Creator Systems', `<div class="feature-grid">${cards || '<div class="muted">No creator systems yet.</div>'}</div>`, 'Stages, rooms, podcasts, and branded event foundations.')}
  `, user, { publicMode: true, subtitle: 'A cleaner creator-facing experience.' });
}



function hardenPublicSession(req) {
  return {
    is_public: true,
    session_mode: 'public_view',
    safe_time: new Date().toISOString()
  };
}


function uiShell(title, content, user = null, options = {}) {
  const publicMode = options.publicMode !== false;
  const nav = publicMode ? cleanPublicNav() : cleanAdminNav();
  return htmlPage(title, `
    <div class="app-shell">
      <div class="hero-bar">
        <div>
          <div class="eyebrow">${publicMode ? 'All American Marketplace' : 'Admin Control'}</div>
          <h1 class="hero-title">${title}</h1>
          ${options.subtitle ? `<p class="hero-subtitle">${options.subtitle}</p>` : ''}
        </div>
      </div>
      ${nav}
      <div class="page-wrap">
        ${content}
      </div>
    </div>
  `, user);
}

function cleanPublicNav() {
  return `
    <div class="clean-nav">
      <a href="/">Home</a>
      <a href="/world-explorer">Worlds</a>
      <a href="/storefront-explorer">Storefronts</a>
      <a href="/books">Books</a>
      <a href="/wallet-center">Wallet</a>
      <a href="/access-center">Access</a>
      <a href="/creator-hub">Creators</a>
          <a href="/heirs-ecosystem">Heirs</a>
      <a href="/progress">Progress</a>
          <a href="/heir-login">Heir Login</a>
          <a href="/role-hub">Role Hub</a>
          <a href="/member-home">Member Home</a>
          <a href="/public-home">Public Home</a>
          <a href="/watch">Watch</a>
          <a href="/join">Join</a>
          <a href="/build">Build</a>
          <a href="/learn">Learn</a>
          <a href="/heir-logout">Logout</a>
          <a href="/heir-payouts">Payouts</a>
          <a href="/executive-dashboard">Executive</a>
          <a href="/payout-automation">Automation</a>
          <a href="/heir-storefronts">Ownership</a>
      <a href="/blog">Blog</a>
    </div>
  `;
}

function cleanAdminNav() {
  return `
    <div class="clean-nav admin-nav">
      <a href="/world-state">World State</a>
      <a href="/world-control">World Control</a>
      <a href="/world-execution">Execution</a>
      <a href="/world-persistence">Persistence</a>
      <a href="/world-automation">Automation</a>
      <a href="/world-economy">Economy</a>
      <a href="/world-storefronts">Storefronts</a>
      <a href="/world-settlements">Settlements</a>
      <a href="/world-access">Access</a>
      <a href="/wallet-transactions">Wallet Tx</a>
      <a href="/compliance">Compliance</a>
    </div>
  `;
}

function statCard(label, value, note='') {
  return `
    <div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      ${note ? `<div class="stat-note">${note}</div>` : ''}
    </div>
  `;
}

function cleanSection(title, body, subtitle='') {
  return `
    <section class="clean-section">
      <div class="section-head">
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="section-body">${body}</div>
    </section>
  `;
}

function featureCard(title, body, href='', cta='Open') {
  return `
    <div class="feature-card">
      <h3>${title}</h3>
      <p>${body}</p>
      ${href ? `<a href="${href}" class="feature-link">${cta}</a>` : ''}
    </div>
  `;
}


function renderProgressPage(user = null) {
  const metrics = {
    scenes: dbQuery(`SELECT count(*) as c FROM scene_registry`)[0]?.c || 0,
    storefronts: dbQuery(`SELECT count(*) as c FROM world_storefronts`)[0]?.c || 0,
    products: dbQuery(`SELECT count(*) as c FROM storefront_products`)[0]?.c || 0,
    worldOrders: dbQuery(`SELECT count(*) as c FROM world_cart_orders`)[0]?.c || 0,
    settlements: dbQuery(`SELECT count(*) as c FROM world_order_settlements`)[0]?.c || 0,
    wallets: dbQuery(`SELECT count(*) as c FROM wallets`)[0]?.c || 0,
    walletTx: dbQuery(`SELECT count(*) as c FROM wallet_transactions`)[0]?.c || 0,
    receipts: dbQuery(`SELECT count(*) as c FROM receipts`)[0]?.c || 0,
    assets: dbQuery(`SELECT count(*) as c FROM world_assets`)[0]?.c || 0,
    transfers: dbQuery(`SELECT count(*) as c FROM asset_transfer_log`)[0]?.c || 0,
    entitlements: dbQuery(`SELECT count(*) as c FROM world_entitlements`)[0]?.c || 0,
    accessPasses: dbQuery(`SELECT count(*) as c FROM world_access_passes`)[0]?.c || 0,
    holoMessages: dbQuery(`SELECT count(*) as c FROM holographic_messages`)[0]?.c || 0,
    droneJobs: dbQuery(`SELECT count(*) as c FROM drone_service_jobs`)[0]?.c || 0,
    beatProfiles: dbQuery(`SELECT count(*) as c FROM quantum_beat_profiles`)[0]?.c || 0,
    beatEvents: dbQuery(`SELECT count(*) as c FROM quantum_beat_events`)[0]?.c || 0,
    books: dbQuery(`SELECT count(*) as c FROM books`)[0]?.c || 0,
    blogPosts: dbQuery(`SELECT count(*) as c FROM blog_posts`)[0]?.c || 0,
    podcasts: dbQuery(`SELECT count(*) as c FROM podcasts`)[0]?.c || 0,
    rooms: dbQuery(`SELECT count(*) as c FROM podcast_rooms`)[0]?.c || 0,
    creditCases: dbQuery(`SELECT count(*) as c FROM credit_cases`)[0]?.c || 0,
    complianceEvents: dbQuery(`SELECT count(*) as c FROM compliance_events`)[0]?.c || 0,
    roboticsAssets: dbQuery(`SELECT count(*) as c FROM robotics_assets`)[0]?.c || 0,
    manufacturingJobs: dbQuery(`SELECT count(*) as c FROM manufacturing_jobs`)[0]?.c || 0
  };

  const totalSignals =
    metrics.scenes + metrics.storefronts + metrics.products + metrics.worldOrders +
    metrics.settlements + metrics.wallets + metrics.walletTx + metrics.receipts +
    metrics.assets + metrics.transfers + metrics.entitlements + metrics.accessPasses +
    metrics.holoMessages + metrics.droneJobs + metrics.beatProfiles + metrics.beatEvents +
    metrics.books + metrics.blogPosts + metrics.podcasts + metrics.rooms +
    metrics.creditCases + metrics.complianceEvents + metrics.roboticsAssets + metrics.manufacturingJobs;

  let completionBand = 'Foundation';
  if (totalSignals >= 150) completionBand = 'Advanced Foundation';
  if (totalSignals >= 300) completionBand = 'Integrated Platform';
  if (totalSignals >= 500) completionBand = 'Expansion Ready';

  const serviceCards = `
    <div class="stats-grid">
      ${statCard('Dashboard', '4900', 'App shell online')}
      ${statCard('Jarvis', '5000', 'AI core online')}
      ${statCard('World Socket', '5090', 'Live world bridge')}
      ${statCard('Platform Stage', completionBand, 'Current build maturity')}
    </div>
  `;

  const buildCards = `
    <div class="stats-grid">
      ${statCard('Worlds', metrics.scenes)}
      ${statCard('Storefronts', metrics.storefronts)}
      ${statCard('Products', metrics.products)}
      ${statCard('World Orders', metrics.worldOrders)}
      ${statCard('Settlements', metrics.settlements)}
      ${statCard('Wallet Tx', metrics.walletTx)}
      ${statCard('Assets', metrics.assets)}
      ${statCard('Transfers', metrics.transfers)}
      ${statCard('Access Passes', metrics.accessPasses)}
      ${statCard('Holo Messages', metrics.holoMessages)}
      ${statCard('Drone Jobs', metrics.droneJobs)}
      ${statCard('Quantum Beat Events', metrics.beatEvents)}
      ${statCard('Books', metrics.books)}
      ${statCard('Blog Posts', metrics.blogPosts)}
      ${statCard('Podcasts', metrics.podcasts)}
      ${statCard('Rooms', metrics.rooms)}
      ${statCard('Credit Cases', metrics.creditCases)}
      ${statCard('Compliance Events', metrics.complianceEvents)}
      ${statCard('Robotics Assets', metrics.roboticsAssets)}
      ${statCard('Manufacturing Jobs', metrics.manufacturingJobs)}
    </div>
  `;

  const milestoneRows = [
    ['Core app shell', 'Complete'],
    ['World runtime foundation', metrics.scenes > 0 ? 'Complete' : 'In Progress'],
    ['Commerce/storefront foundation', metrics.storefronts > 0 ? 'Complete' : 'In Progress'],
    ['Settlement bridge', metrics.settlements > 0 ? 'Complete' : 'In Progress'],
    ['Access/entitlement layer', metrics.accessPasses > 0 ? 'Complete' : 'In Progress'],
    ['Holographic communications layer', metrics.holoMessages > 0 ? 'Complete' : 'In Progress'],
    ['Drone service foundation', metrics.droneJobs > 0 ? 'Complete' : 'In Progress'],
    ['Quantum Beat TM foundation', metrics.beatProfiles > 0 ? 'Complete' : 'In Progress'],
    ['Creator/media foundation', (metrics.podcasts + metrics.rooms) > 0 ? 'Complete' : 'In Progress'],
    ['Books/wallet/receipt layer', (metrics.books + metrics.wallets + metrics.receipts) > 0 ? 'Complete' : 'In Progress'],
    ['Robotics/manufacturing foundation', (metrics.roboticsAssets + metrics.manufacturingJobs) > 0 ? 'Complete' : 'In Progress'],
    ['Public-facing frontend cleanup', 'Complete']
  ].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');

  const content = `
    ${cleanSection('Live Platform Status', serviceCards, 'This page makes your progress visible in one place.')}
    ${cleanSection('Build Counts', buildCards, 'Counts across the major platform layers.')}
    ${cleanSection('Milestones', `
      <table>
        <thead><tr><th>Milestone</th><th>Status</th></tr></thead>
        <tbody>${milestoneRows}</tbody>
      </table>
    `, 'A cleaner progress tracker for what is already built.')}
    ${cleanSection('What This Means', `
      <div class="feature-grid">
        ${featureCard('You can see progress now', 'This page gives you visible counts and milestone status instead of guessing.')}
        ${featureCard('Backend foundation is strong', 'World state, commerce, settlements, access, and control systems are in place.')}
        ${featureCard('Frontend is improving', 'The public shell is cleaner and now has a dedicated progress screen.')}
        ${featureCard('Next phase is real user flows', 'Signup, member dashboards, creator flows, and richer consumer UX come next.')}
      </div>
    `)}
  `;

  return uiShell('Platform Progress', content, user, {
    publicMode: true,
    subtitle: 'A visible progress screen for the All American Marketplace ecosystem.'
  });
}


function portalHeader() {
  return `
    <header class="portal-topbar">
      <div class="portal-topbar-inner">
        <div class="portal-brand">
          <div class="portal-brand-mark">AAM</div>
          <div class="portal-brand-copy">
            <div class="portal-brand-title">All American Marketplace</div>
            <div class="portal-brand-sub">Holographic Ecosystem</div>
          </div>
        </div>

        <nav class="portal-main-nav">
          <a href="/">Portal</a>
          <a href="/world-explorer">Worlds</a>
          <a href="/storefront-explorer">Marketplace</a>
          <a href="/wallet-center">Vault</a>
          <a href="/creator-hub">Creators</a>
          <a href="/heirs-ecosystem">Heirs</a>
          <a href="/progress">Progress</a>
          <a href="/heir-login">Heir Login</a>
          <a href="/role-hub">Role Hub</a>
          <a href="/member-home">Member Home</a>
          <a href="/public-home">Public Home</a>
          <a href="/watch">Watch</a>
          <a href="/join">Join</a>
          <a href="/build">Build</a>
          <a href="/learn">Learn</a>
          <a href="/heir-logout">Logout</a>
          <a href="/heir-payouts">Payouts</a>
          <a href="/executive-dashboard">Executive</a>
          <a href="/payout-automation">Automation</a>
          <a href="/heir-storefronts">Ownership</a>
        </nav>

        <div class="portal-actions">
          <a href="/command-core" class="portal-admin-btn">Command Core</a>
        </div>
      </div>
    </header>
  `;
}

function portalHeroBlock() {
  return `
    <section class="portal-hero">
      <div class="portal-hero-copy">
        <div class="portal-kicker">Immersive Commerce • Worlds • Finance • Creator Systems</div>
        <h1>Enter the All American Marketplace Portal</h1>
        <p>
          A unified system for immersive worlds, digital commerce, wallets, books, creator media,
          access control, logistics, automation, and live operational command.
        </p>
        <div class="portal-hero-actions">
          <a href="/world-explorer">Enter Worlds</a>
          <a href="/storefront-explorer" class="secondary">Open Marketplace</a>
        </div>
      </div>
      <div class="portal-hero-panel">
        <div class="signal-card">
          <div class="signal-label">System Mode</div>
          <div class="signal-value">Integrated Platform</div>
          <div class="signal-note">Worlds • Commerce • Access • Creator • Ops</div>
        </div>
      </div>
    </section>
  `;
}

function portalGateway(title, subtitle, href, icon='◆') {
  return `
    <a href="${href}" class="portal-gateway">
      <div class="portal-gateway-icon">${icon}</div>
      <div class="portal-gateway-copy">
        <h3>${title}</h3>
        <p>${subtitle}</p>
      </div>
      <div class="portal-gateway-arrow">→</div>
    </a>
  `;
}

function renderPortalHomePage(user = null) {
  const sceneCount = dbQuery(`SELECT count(*) as c FROM scene_registry`)[0]?.c || 0;
  const storefrontCount = dbQuery(`SELECT count(*) as c FROM world_storefronts`)[0]?.c || 0;
  const txCount = dbQuery(`SELECT count(*) as c FROM wallet_transactions`)[0]?.c || 0;
  const creatorCount =
    (dbQuery(`SELECT count(*) as c FROM podcasts`)[0]?.c || 0) +
    (dbQuery(`SELECT count(*) as c FROM podcast_rooms`)[0]?.c || 0);

  const gateways = `
    <div class="portal-gateway-grid">
      ${portalGateway('Enter Worlds', 'Explore immersive districts, motion worlds, avatar spaces, and live world systems.', '/world-explorer', '◎')}
      ${portalGateway('Marketplace', 'Browse storefronts, commerce surfaces, books, products, and order flows.', '/storefront-explorer', '▣')}
      ${portalGateway('Vault', 'View wallets, receipts, settlements, and financial activity across the platform.', '/wallet-center', '◈')}
      ${portalGateway('Creator Signal', 'Access podcasts, rooms, creator systems, and Quantum Beat TM foundations.', '/creator-hub', '◉')}
      ${portalGateway('Access Grid', 'Review entitlements, passes, and premium access layers.', '/access-center', '◇')}
      ${portalGateway('Command Core', 'Open the deeper control systems for worlds, compliance, logistics, and admin operations.', '/command-core', '✦')}
    </div>
  `;

  const statusStrip = `
    <section class="portal-status-strip">
      <div class="status-chip"><span>${sceneCount}</span> Worlds</div>
      <div class="status-chip"><span>${storefrontCount}</span> Storefronts</div>
      <div class="status-chip"><span>${txCount}</span> Wallet Transactions</div>
      <div class="status-chip"><span>${creatorCount}</span> Creator Signals</div>
      <div class="status-chip"><span>5090</span> Live World Socket</div>
      <div class="status-chip"><span>Stable</span> Platform State</div>
    </section>
  `;

  const featureBands = `
    <section class="portal-feature-band">
      <div class="portal-band-card">
        <h3>World Engine</h3>
        <p>Live world state, scene commands, avatar movement, object interactions, checkpoints, recovery, and orchestration.</p>
      </div>
      <div class="portal-band-card">
        <h3>Commerce Engine</h3>
        <p>Storefronts, products, world orders, settlement records, receipts, wallet transactions, and ownership flows.</p>
      </div>
      <div class="portal-band-card">
        <h3>Creator Engine</h3>
        <p>Books, blogs, podcasts, rooms, media foundations, voice concepts, and Quantum Beat TM event architecture.</p>
      </div>
    </section>
  `;

  return htmlPage('All American Marketplace Portal', `
    <div class="portal-shell">
      ${portalHeader()}
      <main class="portal-main">
        ${portalHeroBlock()}
        ${statusStrip}
        ${gateways}
        ${featureBands}
      </main>
    </div>
  `, user);
}

function renderCommandCorePage(user = null) {
  const cards = `
    <div class="command-core-grid">
      ${portalGateway('World State', 'Inspect shared world state, avatars, objects, and synchronization.', '/world-state', '◎')}
      ${portalGateway('World Control', 'Operational control over worlds and execution systems.', '/world-control', '◌')}
      ${portalGateway('World Execution', 'Commands, actions, and execution tracking.', '/world-execution', '✦')}
      ${portalGateway('World Persistence', 'Sessions, checkpoints, replay, and recovery.', '/world-persistence', '◈')}
      ${portalGateway('Automation', 'World rules, jobs, and orchestration events.', '/world-automation', '◇')}
      ${portalGateway('World Economy', 'Assets, ownership, inventory, and transfers.', '/world-economy', '▣')}
      ${portalGateway('Storefronts', 'Storefronts, products, orders, and activity.', '/world-storefronts', '◉')}
      ${portalGateway('Settlements', 'Settlement records, receipt bridge, and commerce log.', '/world-settlements', '◍')}
      ${portalGateway('World Access', 'Entitlements, passes, and access logs.', '/world-access', '◆')}
      ${portalGateway('Wallet Transactions', 'Financial transaction detail and wallet movement.', '/wallet-transactions', '◈')}
      ${portalGateway('Compliance', 'Compliance events, escalation, and templates.', '/compliance', '▦')}
      ${portalGateway('Logistics + IoT', 'Operational logistics, IoT, robotics, and manufacturing layers.', '/logistics', '⬢')}
    </div>
  `;

  return htmlPage('Command Core', `
    <div class="portal-shell">
      ${portalHeader()}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Admin + Operations + Deep Systems</div>
          <h1>Command Core</h1>
          <p>Control-center access for the deeper operational layers of the platform.</p>
        </section>
        ${cards}
      </main>
    </div>
  `, user);
}


function renderHeirsPage(user = null) {
  const rows = dbQuery("SELECT * FROM heirs_registry ORDER BY id DESC");

  const list = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.role}</td>
      <td>${r.division}</td>
      <td>${r.access_level}</td>
      <td>${r.created_at}</td>
    </tr>
  `).join('');

  return htmlPage('Heirs Network', `
    <div class="section">
      <div class="card">
        <h2>Heirs Network</h2>
        <p>All assigned heirs with system roles and divisions.</p>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Role</th><th>Division</th><th>Access</th><th>Created</th>
            </tr>
          </thead>
          <tbody>${list}</tbody>
        </table>
      </div>
    </div>
  `, user);
}


function renderHeirsEcosystemPage(user = null) {
  const heirs = dbQuery(`
    SELECT hr.id, hr.name, hr.role, hr.division, hr.access_level,
           (SELECT count(*) FROM heir_wallets hw WHERE hw.heir_id=hr.id) as wallet_count,
           (SELECT count(*) FROM heir_creator_profiles hcp WHERE hcp.heir_id=hr.id) as creator_count,
           (SELECT count(*) FROM heir_storefront_links hsl WHERE hsl.heir_id=hr.id) as storefront_count,
           (SELECT IFNULL(sum(amount_cents),0) FROM heir_earnings he WHERE he.heir_id=hr.id) as total_earnings
    FROM heirs_registry hr
    ORDER BY hr.id DESC
  `);

  const cards = heirs.map(h => `
    <div class="feature-card">
      <h3>${h.name}</h3>
      <p><strong>Role:</strong> ${h.role || ''}</p>
      <p><strong>Division:</strong> ${h.division || ''}</p>
      <p><strong>Access:</strong> ${h.access_level || ''}</p>
      <p><strong>Wallets:</strong> ${h.wallet_count || 0}</p>
      <p><strong>Creator Profiles:</strong> ${h.creator_count || 0}</p>
      <p><strong>Storefront Links:</strong> ${h.storefront_count || 0}</p>
      <p><strong>Total Earnings:</strong> $${((Number(h.total_earnings || 0))/100).toFixed(2)}</p>
    </div>
  `).join('');

  return htmlPage('Heirs Ecosystem', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Family • Ownership • Roles • Earnings</div>
          <h1>Heirs Ecosystem</h1>
          <p>All heirs connected to wallets, creator systems, storefront pathways, and earnings structure.</p>
        </section>
        <div class="feature-grid">${cards || '<div class="muted">No heirs found.</div>'}</div>
      </main>
    </div>
  `, user);
}

function renderHeirOperationsPage(user = null) {
  const earnings = dbQuery(`
    SELECT he.id, hr.name, he.earning_type, he.amount_cents, he.source_type, he.earning_status, he.created_at
    FROM heir_earnings he
    LEFT JOIN heirs_registry hr ON hr.id = he.heir_id
    ORDER BY he.id DESC
    LIMIT 200
  `);

  const perms = dbQuery(`
    SELECT hpm.id, hr.name, hpm.permission_name, hpm.permission_scope, hpm.permission_status, hpm.created_at
    FROM heir_permissions_matrix hpm
    LEFT JOIN heirs_registry hr ON hr.id = hpm.heir_id
    ORDER BY hpm.id DESC
    LIMIT 200
  `);

  const creators = dbQuery(`
    SELECT hcp.id, hr.name, hcp.creator_type, hcp.creator_status, hcp.created_at
    FROM heir_creator_profiles hcp
    LEFT JOIN heirs_registry hr ON hr.id = hcp.heir_id
    ORDER BY hcp.id DESC
    LIMIT 200
  `);

  const storefronts = dbQuery(`
    SELECT hsl.id, hr.name, hsl.storefront_name, hsl.storefront_type, hsl.link_status, hsl.created_at
    FROM heir_storefront_links hsl
    LEFT JOIN heirs_registry hr ON hr.id = hsl.heir_id
    ORDER BY hsl.id DESC
    LIMIT 200
  `);

  const earningsRows = earnings.map(r => `
    <tr><td>${r.id}</td><td><a href="/heir-storefronts/${r.heir_id || ''}">${r.name || ''}</a></td><td>${r.earning_type || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.source_type || ''}</td><td>${r.earning_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const permRows = perms.map(r => `
    <tr><td>${r.id}</td><td>${r.name || ''}</td><td>${r.permission_name || ''}</td><td>${r.permission_scope || ''}</td><td>${r.permission_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const creatorRows = creators.map(r => `
    <tr><td>${r.id}</td><td>${r.name || ''}</td><td>${r.creator_type || ''}</td><td>${r.creator_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const storefrontRows = storefronts.map(r => `
    <tr><td>${r.id}</td><td>${r.name || ''}</td><td>${r.storefront_name || ''}</td><td>${r.storefront_type || ''}</td><td>${r.link_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Heir Operations', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Operations • Earnings • Permissions • Creator Systems</div>
          <h1>Heir Operations</h1>
          <p>Operational view of revenue, permissions, creator profiles, and storefront links for the heirs network.</p>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Earnings</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Amount</th><th>Source</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${earningsRows || '<tr><td colspan="7">No earnings yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Permissions</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Permission</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${permRows || '<tr><td colspan="6">No permissions yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Creator Profiles</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Creator Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${creatorRows || '<tr><td colspan="5">No creator profiles yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Storefront Links</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Storefront</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${storefrontRows || '<tr><td colspan="6">No storefront links yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}


function renderHeirLoginPage(user = null, message = '') {
  return htmlPage('Heir Login', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Heirs Network Access</div>
          <h1>Heir Login</h1>
          <p>Enter your heir username and PIN to open your member dashboard.</p>
        </section>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-card" style="max-width:560px;">
              ${message ? `<p class="ok">${message}</p>` : ''}
              <form method="POST" action="/heir-login">
                <label>Username</label>
                <input name="username" placeholder="jacobie" aria-label="Username" />
                <label>PIN</label>
                <input name="pin_code" placeholder="1234" type="password" aria-label="PIN code" />
                <button type="submit">Open Dashboard</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}


function renderSecureHeirLoginPage(user = null, message = '') {
  return htmlPage('Heir Login', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Secure Heirs Access</div>
          <h1>Heir Login</h1>
          <p>Secure sign-in for heir accounts.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>
        <section class="clean-section">
          <div class="section-body">
            <div class="feature-card" style="max-width:560px;">
              <form method="POST" action="/heir-login">
                <label>Username</label>
                <input name="username" placeholder="jacobie" aria-label="Username" />
                <label>PIN</label>
                <input name="pin_code" placeholder="1234" type="password" aria-label="PIN code" />
                <button type="submit">Secure Login</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}

function renderHeirMemberPage(heirId, user = null) {
  const heirRows = dbQuery(`SELECT id, name, role, division, access_level, created_at FROM heirs_registry WHERE id=${Number(heirId)} LIMIT 1`);
  if (!heirRows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Heir not found</h2></div>`, user);
  }

  const h = heirRows[0];
  const wallets = dbQuery(`SELECT id, wallet_name, wallet_status, created_at FROM heir_wallets WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);
  const earnings = dbQuery(`SELECT id, earning_type, amount_cents, source_type, earning_status, created_at FROM heir_earnings WHERE heir_id=${Number(heirId)} ORDER BY id DESC LIMIT 50`);
  const creators = dbQuery(`SELECT id, creator_name, creator_type, creator_status, created_at FROM heir_creator_profiles WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);
  const storefronts = dbQuery(`SELECT id, storefront_name, storefront_type, link_status, created_at FROM heir_storefront_links WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);
  const perms = dbQuery(`SELECT id, permission_name, permission_scope, permission_status, created_at FROM heir_permissions_matrix WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);
  const rules = dbQuery(`SELECT id, rule_name, revenue_type, split_percent, rule_status, created_at FROM heir_revenue_rules WHERE heir_id=${Number(heirId)} ORDER BY id DESC`);

  const totalEarnings = earnings.reduce((sum, row) => sum + Number(row.amount_cents || 0), 0);

  return htmlPage(`${h.name} Dashboard`, `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Heir Member Dashboard</div>
          <h1>${h.name}</h1>
          <p>${h.role || ''} · ${h.division || ''} · Access: ${h.access_level || ''}</p>
        </section>

        <div class="stats-grid">
          ${typeof statCard === 'function' ? statCard('Wallets', wallets.length) : ''}
          ${typeof statCard === 'function' ? statCard('Creator Profiles', creators.length) : ''}
          ${typeof statCard === 'function' ? statCard('Storefront Links', storefronts.length) : ''}
          ${typeof statCard === 'function' ? statCard('Total Earnings', '$' + (totalEarnings / 100).toFixed(2)) : ''}
        </div>

        <section class="clean-section">
          <div class="section-head"><h2>Wallets</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${wallets.map(r => `<tr><td>${r.id}</td><td>${r.wallet_name || ''}</td><td>${r.wallet_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="4">No wallets yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Earnings</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Source</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${earnings.map(r => `<tr><td>${r.id}</td><td>${r.earning_type || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.source_type || ''}</td><td>${r.earning_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="6">No earnings yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Revenue Split Rules</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Revenue Type</th><th>Split %</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${rules.map(r => `<tr><td>${r.id}</td><td>${r.rule_name || ''}</td><td>${r.revenue_type || ''}</td><td>${r.split_percent || 0}</td><td>${r.rule_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="6">No rules yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Creator Profiles</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${creators.map(r => `<tr><td>${r.id}</td><td>${r.creator_name || ''}</td><td>${r.creator_type || ''}</td><td>${r.creator_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="5">No creator profiles yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Storefront Links</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Storefront</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${storefronts.map(r => `<tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.storefront_type || ''}</td><td>${r.link_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="5">No storefront links yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Permissions</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Permission</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                ${perms.map(r => `<tr><td>${r.id}</td><td>${r.permission_name || ''}</td><td>${r.permission_scope || ''}</td><td>${r.permission_status || ''}</td><td>${r.created_at || ''}</td></tr>`).join('') || '<tr><td colspan="5">No permissions yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Quick Actions</h2></div>
          <div class="section-body">
            <div class="feature-grid">
              ${heirRoleActions(h.role || '', h.division || '', h.id)}
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}


function heirRoleActions(role = '', division = '', heirId = 0) {
  const r = String(role || '').toLowerCase();
  const d = String(division || '').toLowerCase();
  let cards = [];

  cards.push(`
    <div class="feature-card">
      <h3>My Earnings</h3>
      <p>Review posted earnings, totals, and revenue rules for this heir account.</p>
      <a href="/heir-dashboard/${heirId}" class="feature-link">Open Earnings View</a>
    </div>
  `);

  if (r.includes('security') || d.includes('jacobie vision') || d.includes('alton security')) {
    cards.push(`
      <div class="feature-card">
        <h3>Security Console</h3>
        <p>Access cybersecurity, audit, and security-related operating surfaces.</p>
        <a href="/command-core" class="feature-link">Open Command Core</a>
      </div>
    `);
  }

  if (r.includes('entertainment') || d.includes('anyone can be a star')) {
    cards.push(`
      <div class="feature-card">
        <h3>Creator Stage</h3>
        <p>Use creator tools, stage systems, and media-related flows tied to your division.</p>
        <a href="/creator-hub" class="feature-link">Open Creator Hub</a>
      </div>
    `);
  }

  if (r.includes('voice') || d.includes('aniyah app')) {
    cards.push(`
      <div class="feature-card">
        <h3>Voice + Coaching Tools</h3>
        <p>Open coaching, recording, and voice-centered experiences for the Aniyah system.</p>
        <a href="/creator-hub" class="feature-link">Open Voice Tools</a>
      </div>
    `);
  }

  if (r.includes('family node') || r.includes('network node') || r.includes('next gen') || d.includes('heirs network')) {
    cards.push(`
      <div class="feature-card">
        <h3>Heirs Network</h3>
        <p>View the broader family network, branch structure, and inherited platform pathways.</p>
        <a href="/heirs-ecosystem" class="feature-link">Open Heirs Network</a>
      </div>
    `);
  }

  cards.push(`
    <div class="feature-card">
      <h3>Wallet Center</h3>
      <p>Review wallet activity, balances, and related financial system visibility.</p>
      <a href="/wallet-center" class="feature-link">Open Wallet Center</a>
    </div>
  `);

  cards.push(`
    <div class="feature-card">
      <h3>Update PIN</h3>
      <p>Change the default PIN for this heir account and improve account safety.</p>
      <a href="/heir-pin/${heirId}" class="feature-link">Update PIN</a>
    </div>
  `);

  cards.push(`
    <div class="feature-card">
      <h3>Ownership View</h3>
      <p>Review heir storefront ownership and assigned commercial surfaces.</p>
      <a href="/heir-storefronts" class="feature-link">Open Ownership View</a>
    </div>
  `);

  cards.push(`
    <div class="feature-card">
      <h3>Payout Cycles</h3>
      <p>Review payout cycles and payout operations for the heirs network.</p>
      <a href="/payout-cycles" class="feature-link">Open Payout Cycles</a>
    </div>
  `);

  return cards.join('');
}

function renderHeirPinPage(heirId, user = null, message = '') {
  const rows = dbQuery(`SELECT id, name FROM heirs_registry WHERE id=${Number(heirId)} LIMIT 1`);
  if (!rows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Heir not found</h2></div>`, user);
  }
  const h = rows[0];

  return htmlPage('Heir PIN Update', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Account Safety</div>
          <h1>${h.name} PIN Update</h1>
          <p>Replace the default PIN with a new one for this heir account.</p>
        </section>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-card" style="max-width:560px;">
              ${message ? `<p class="ok">${message}</p>` : ''}
              <form method="POST" action="/heir-pin/${h.id}">
                <label>New PIN</label>
                <input name="new_pin" placeholder="4321" type="password" />
                <button type="submit">Save New PIN</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}


function renderHeirPayoutsPage(user = null) {
  const runs = dbQuery(`
    SELECT id, payout_name, source_revenue_cents, payout_status, created_at
    FROM heir_payout_runs
    ORDER BY id DESC
    LIMIT 50
  `);

  const items = dbQuery(`
    SELECT hpi.id, hpi.payout_run_id, hr.name, hpi.source_type, hpi.source_amount_cents,
           hpi.split_percent, hpi.payout_amount_cents, hpi.payout_status, hpi.created_at
    FROM heir_payout_items hpi
    LEFT JOIN heirs_registry hr ON hr.id = hpi.heir_id
    ORDER BY hpi.id DESC
    LIMIT 200
  `);

  const mirror = dbQuery(`
    SELECT hwm.id, hr.name, hwm.heir_wallet_id, hwm.tx_type, hwm.amount_cents, hwm.tx_status, hwm.created_at
    FROM heir_wallet_mirror_tx hwm
    LEFT JOIN heirs_registry hr ON hr.id = hwm.heir_id
    ORDER BY hwm.id DESC
    LIMIT 200
  `);

  const runRows = runs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.payout_name || ''}</td>
      <td>$${((Number(r.source_revenue_cents || 0))/100).toFixed(2)}</td>
      <td>${r.payout_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const itemRows = items.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.payout_run_id}</td>
      <td>${r.name || ''}</td>
      <td>${r.source_type || ''}</td>
      <td>$${((Number(r.source_amount_cents || 0))/100).toFixed(2)}</td>
      <td>${r.split_percent || 0}%</td>
      <td>$${((Number(r.payout_amount_cents || 0))/100).toFixed(2)}</td>
      <td>${r.payout_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const mirrorRows = mirror.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name || ''}</td>
      <td>${r.heir_wallet_id || ''}</td>
      <td>${r.tx_type || ''}</td>
      <td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td>
      <td>${r.tx_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Heir Payouts', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Revenue Split Execution</div>
          <h1>Heir Payouts</h1>
          <p>Revenue split runs, payout items, and wallet mirror records for heirs.</p>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Payout Runs</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Source Revenue</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${runRows || '<tr><td colspan="5">No payout runs yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Payout Items</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Run</th><th>Heir</th><th>Type</th><th>Source</th><th>Split</th><th>Payout</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${itemRows || '<tr><td colspan="9">No payout items yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Wallet Mirror Transactions</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Heir</th><th>Wallet</th><th>Type</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${mirrorRows || '<tr><td colspan="7">No wallet mirror transactions yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}


function renderHeirStorefrontsPage(user = null) {
  const rows = dbQuery(`
    SELECT hso.id, hr.name, hso.storefront_name, hso.ownership_percent, hso.ownership_status, hso.created_at
    FROM heir_storefront_ownership hso
    LEFT JOIN heirs_registry hr ON hr.id = hso.heir_id
    ORDER BY hso.id DESC
    LIMIT 200
  `);

  const body = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name || ''}</td>
      <td>${r.storefront_name || ''}</td>
      <td>${r.ownership_percent || 0}%</td>
      <td>${r.ownership_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Heir Storefront Ownership', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Ownership Layer</div>
          <h1>Heir Storefront Ownership</h1>
          <p>Visible ownership assignments for heir-linked storefronts.</p>
        </section>

        <section class="clean-section">
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Heir</th><th>Storefront</th><th>Ownership</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${body || '<tr><td colspan="6">No ownership records yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}

function renderPayoutCyclesPage(user = null, message = '') {
  const cycles = dbQuery(`
    SELECT id, cycle_name, cycle_type, cycle_status, created_at
    FROM payout_cycles
    ORDER BY id DESC
    LIMIT 100
  `);

  const runs = dbQuery(`
    SELECT pcr.id, pc.cycle_name, pcr.payout_run_id, pcr.run_status, pcr.created_at
    FROM payout_cycle_runs pcr
    LEFT JOIN payout_cycles pc ON pc.id = pcr.cycle_id
    ORDER BY pcr.id DESC
    LIMIT 100
  `);

  const cycleRows = cycles.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.cycle_name || ''}</td>
      <td>${r.cycle_type || ''}</td>
      <td>${r.cycle_status || ''}</td>
      <td>${r.created_at || ''}</td>
      <td>
        <form method="POST" action="/payout-cycles/run/${r.id}">
          <button type="submit">Run Cycle</button>
        </form>
      </td>
    </tr>
  `).join('');

  const runRows = runs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.cycle_name || ''}</td>
      <td>${r.payout_run_id || ''}</td>
      <td>${r.run_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Payout Cycles', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Payout Operations</div>
          <h1>Payout Cycles</h1>
          <p>Run and track payout cycles for heirs.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Cycles</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>${cycleRows || '<tr><td colspan="6">No cycles yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Cycle Runs</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Cycle</th><th>Payout Run</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${runRows || '<tr><td colspan="5">No cycle runs yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}


function renderHeirStorefrontDetailPage(heirId, user = null, message = '') {
  const heirRows = dbQuery(`SELECT id, name, role, division FROM heirs_registry WHERE id=${Number(heirId)} LIMIT 1`);
  if (!heirRows.length) {
    return htmlPage('Not Found', `<div class="card"><h2>Heir not found</h2></div>`, user);
  }
  const h = heirRows[0];

  const ownership = dbQuery(`
    SELECT id, storefront_name, ownership_percent, ownership_status, created_at
    FROM heir_storefront_ownership
    WHERE heir_id=${Number(heirId)}
    ORDER BY id DESC
  `);

  const linked = dbQuery(`
    SELECT id, storefront_name, storefront_type, link_status, created_at
    FROM heir_storefront_links
    WHERE heir_id=${Number(heirId)}
    ORDER BY id DESC
  `);

  const ownRows = ownership.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.ownership_percent || 0}%</td><td>${r.ownership_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const linkRows = linked.map(r => `
    <tr><td>${r.id}</td><td>${r.storefront_name || ''}</td><td>${r.storefront_type || ''}</td><td>${r.link_status || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage(`${h.name} Storefront Detail`, `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Heir Commercial Detail</div>
          <h1>${h.name}</h1>
          <p>${h.role || ''} · ${h.division || ''}</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Storefront Ownership</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Storefront</th><th>Ownership</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${ownRows || '<tr><td colspan="5">No ownership yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Storefront Links</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Storefront</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${linkRows || '<tr><td colspan="5">No linked storefronts yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-grid">
              <div class="feature-card">
                <h3>Run Payout For This Heir</h3>
                <p>Trigger a manual payout record using active split rules for this heir.</p>
                <form method="POST" action="/heir-payout-run/${h.id}">
                  <button type="submit">Run Heir Payout</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}

function renderPayoutAutomationPage(user = null, message = '') {
  const rules = dbQuery(`
    SELECT id, rule_name, cycle_type, target_type, target_id, rule_status, created_at
    FROM payout_automation_rules
    ORDER BY id DESC
  `);

  const runs = dbQuery(`
    SELECT par.id, parule.rule_name, par.payout_run_id, par.run_status, par.created_at
    FROM payout_automation_runs par
    LEFT JOIN payout_automation_rules parule ON parule.id = par.automation_rule_id
    ORDER BY par.id DESC
    LIMIT 100
  `);

  const ruleRows = rules.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.rule_name || ''}</td>
      <td>${r.cycle_type || ''}</td>
      <td>${r.target_type || ''}</td>
      <td>${r.rule_status || ''}</td>
      <td>${r.created_at || ''}</td>
      <td>
        <form method="POST" action="/payout-automation/run/${r.id}">
          <button type="submit">Run Automation</button>
        </form>
      </td>
    </tr>
  `).join('');

  const runRows = runs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.rule_name || ''}</td>
      <td>${r.payout_run_id || ''}</td>
      <td>${r.run_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Payout Automation', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Automation + Scheduling</div>
          <h1>Payout Automation</h1>
          <p>Run and review automated payout operations.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Automation Rules</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Cycle</th><th>Target</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>${ruleRows || '<tr><td colspan="7">No automation rules yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Automation Runs</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Rule</th><th>Payout Run</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${runRows || '<tr><td colspan="5">No automation runs yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}


function renderExecutiveDashboardPage(user = null, message = '') {
  const heirCount = dbQuery(`SELECT count(*) as c FROM heirs_registry`)[0]?.c || 0;
  const payoutRuns = dbQuery(`SELECT count(*) as c FROM heir_payout_runs`)[0]?.c || 0;
  const payoutItems = dbQuery(`SELECT count(*) as c FROM heir_payout_items`)[0]?.c || 0;
  const analyticsCount = dbQuery(`SELECT count(*) as c FROM storefront_analytics`)[0]?.c || 0;
  const scheduleJobs = dbQuery(`SELECT count(*) as c FROM scheduled_payout_jobs`)[0]?.c || 0;
  const scheduleRuns = dbQuery(`SELECT count(*) as c FROM scheduled_payout_job_runs`)[0]?.c || 0;

  const totals = dbQuery(`
    SELECT
      IFNULL(SUM(total_earnings_cents),0) as earnings,
      IFNULL(SUM(total_wallet_mirror_cents),0) as wallet_mirror,
      IFNULL(SUM(total_payout_cents),0) as payouts,
      IFNULL(SUM(balance_cents),0) as balances
    FROM (
      SELECT *
      FROM heir_balance_snapshots
      WHERE id IN (SELECT MAX(id) FROM heir_balance_snapshots GROUP BY heir_id)
    )
  `)[0] || {};

  const topStorefronts = dbQuery(`
    SELECT storefront_name, views_count, orders_count, revenue_cents
    FROM storefront_analytics
    ORDER BY revenue_cents DESC, orders_count DESC
    LIMIT 8
  `);

  const topHeirs = dbQuery(`
    SELECT hr.id, hr.name, hbs.balance_cents
    FROM heir_balance_snapshots hbs
    LEFT JOIN heirs_registry hr ON hr.id = hbs.heir_id
    WHERE hbs.id IN (SELECT MAX(id) FROM heir_balance_snapshots GROUP BY heir_id)
    ORDER BY hbs.balance_cents DESC
    LIMIT 8
  `);

  const storefrontRows = topStorefronts.map(r => `
    <tr>
      <td>${r.storefront_name || ''}</td>
      <td>${r.views_count || 0}</td>
      <td>${r.orders_count || 0}</td>
      <td>$${((Number(r.revenue_cents || 0))/100).toFixed(2)}</td>
    </tr>
  `).join('');

  const heirRows = topHeirs.map(r => `
    <tr>
      <td><a href="/heir-finance/${r.id}">${r.name || ''}</a></td>
      <td>$${((Number(r.balance_cents || 0))/100).toFixed(2)}</td>
    </tr>
  `).join('');

  return htmlPage('Executive Dashboard', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Executive Command</div>
          <h1>Executive Dashboard</h1>
          <p>High-level financial, payout, heir, and storefront intelligence across the platform.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <div class="stats-grid">
          ${typeof statCard === 'function' ? statCard('Heirs', heirCount) : ''}
          ${typeof statCard === 'function' ? statCard('Payout Runs', payoutRuns) : ''}
          ${typeof statCard === 'function' ? statCard('Payout Items', payoutItems) : ''}
          ${typeof statCard === 'function' ? statCard('Analytics Rows', analyticsCount) : ''}
          ${typeof statCard === 'function' ? statCard('Schedule Jobs', scheduleJobs) : ''}
          ${typeof statCard === 'function' ? statCard('Schedule Runs', scheduleRuns) : ''}
          ${typeof statCard === 'function' ? statCard('Total Earnings', '$' + ((Number(totals.earnings || 0))/100).toFixed(2)) : ''}
          ${typeof statCard === 'function' ? statCard('Total Balances', '$' + ((Number(totals.balances || 0))/100).toFixed(2)) : ''}
        </div>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-grid">
              <div class="feature-card">
                <h3>Refresh Balance Snapshots</h3>
                <p>Create fresh heir balance snapshots from earnings, payouts, and wallet mirror activity.</p>
                <form method="POST" action="/executive/refresh-balances">
                  <button type="submit">Refresh Balances</button>
                </form>
              </div>

              <div class="feature-card">
                <h3>Open Heir Finance</h3>
                <p>Review the finance layer and per-heir balance details.</p>
                <a href="/heir-finance" class="feature-link">Open Heir Finance</a>
              </div>

              <div class="feature-card">
                <h3>Open Analytics</h3>
                <p>Review storefront performance visibility.</p>
                <a href="/storefront-analytics" class="feature-link">Open Analytics</a>
              </div>

              <div class="feature-card">
                <h3>Open Scheduled Jobs</h3>
                <p>Review scheduled payout job records and runs.</p>
                <a href="/scheduled-payout-jobs" class="feature-link">Open Scheduled Jobs</a>
              </div>
            </div>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Top Storefronts</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>Storefront</th><th>Views</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>${storefrontRows || '<tr><td colspan="4">No storefront analytics yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Top Heir Balances</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>Heir</th><th>Balance</th></tr></thead>
              <tbody>${heirRows || '<tr><td colspan="2">No heir balances yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}


const path = require('path');

function loadSecurityEnv() {
  try {
    const envPath = path.join(process.cwd(), 'config', 'security.env');
    if (!fs.existsSync(envPath)) return {};
    const raw = fs.readFileSync(envPath, 'utf8');
    const out = {};
    raw.split('\n').forEach(line => {
      const s = line.trim();
      if (!s || s.startsWith('#') || !s.includes('=')) return;
      const i = s.indexOf('=');
      out[s.slice(0, i).trim()] = s.slice(i + 1).trim();
    });
    return out;
  } catch (e) {
    return {};
  }
}

const __SECURITY_ENV = loadSecurityEnv();
const APP_SESSION_SECRET = __SECURITY_ENV.APP_SESSION_SECRET || 'fallback_dev_secret_replace_me';

function sha256Hex(v) {
  return crypto.createHash('sha256').update(String(v)).digest('hex');
}

function randomToken(size = 24) {
  return crypto.randomBytes(size).toString('hex');
}

function makePinHash(pin, salt) {
  return sha256Hex(String(salt) + String(pin));
}

function logSecurityEvent(eventType, subjectType = 'system', subjectId = 0, notes = '') {
  dbRun(`INSERT INTO security_audit_log (event_type, subject_type, subject_id, event_notes)
         VALUES ('${q(eventType)}', '${q(subjectType)}', ${Number(subjectId || 0)}, '${q(notes || '')}')`);
}

function getCookieMap(req) {
  const raw = req.headers.cookie || '';
  const map = {};
  raw.split(';').forEach(pair => {
    const s = pair.trim();
    if (!s || !s.includes('=')) return;
    const i = s.indexOf('=');
    map[s.slice(0, i).trim()] = decodeURIComponent(s.slice(i + 1).trim());
  });
  return map;
}

function setCookie(res, name, value, maxAge = 28800) {
  const cookie = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
  const existing = res.getHeader ? res.getHeader('Set-Cookie') : null;
  if (!existing) res.setHeader('Set-Cookie', [cookie]);
  else if (Array.isArray(existing)) res.setHeader('Set-Cookie', [...existing, cookie]);
  else res.setHeader('Set-Cookie', [existing, cookie]);
}

function clearCookie(res, name) {
  setCookie(res, name, '', 0);
}

function createSecureHeirSession(heirId) {
  const sessionToken = randomToken(20);
  const sessionSecret = sha256Hex(APP_SESSION_SECRET + ':' + sessionToken);
  dbRun(`INSERT INTO heir_sessions (heir_id, session_token, session_secret, session_status)
         VALUES (${Number(heirId)}, '${q(sessionToken)}', '${q(sessionSecret)}', 'active')`);
  return sessionToken;
}

function getActiveHeirSession(req) {
  const cookies = getCookieMap(req);
  const token = cookies.heir_session || '';
  if (!token) return null;
  const secret = sha256Hex(APP_SESSION_SECRET + ':' + token);
  const rows = dbQuery(`
    SELECT hs.id, hs.heir_id, hs.session_status, ha.username, ha.role_name
    FROM heir_sessions hs
    LEFT JOIN heir_accounts ha ON ha.heir_id = hs.heir_id
    WHERE hs.session_token='${q(token)}'
      AND hs.session_secret='${q(secret)}'
      AND hs.session_status='active'
    ORDER BY hs.id DESC
    LIMIT 1
  `);
  return rows.length ? rows[0] : null;
}

function requireHeirRole(req, res, allowedRoles = []) {
  const session = getActiveHeirSession(req);
  if (!session) {
    redirect(res, '/heir-login?msg=Please%20log%20in');
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(String(session.role_name || ''))) {
    redirect(res, '/heir-dashboard/' + Number(session.heir_id) + '?msg=Access%20denied');
    return null;
  }
  return session;
}

function recordLoginAttempt(username, status, req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local');
  dbRun(`INSERT INTO login_attempts (username, attempt_status, ip_address)
         VALUES ('${q(username || '')}', '${q(status)}', '${q(ip)}')`);
}

function isRateLimited(username) {
  const rows = dbQuery(`
    SELECT count(*) as c
    FROM login_attempts
    WHERE username='${q(username || '')}'
      AND attempt_status='failed'
      AND created_at >= datetime('now', '-15 minutes')
  `);
  return rows.length ? Number(rows[0].c || 0) >= 5 : false;
}


function getPortalSession(req) {
  try {
    if (typeof getActiveHeirSession === 'function') {
      const s = getActiveHeirSession(req);
      if (s) return { kind: 'heir', ...s };
    }
  } catch (e) {}
  return { kind: 'public', role_name: 'public' };
}

function renderPortalNavForSession(req) {
  const session = getPortalSession(req);
  const role = String(session.role_name || 'public');

  const publicLinks = [
    ['/', 'Home'],
    ['/world-explorer', 'Worlds'],
    ['/storefront-explorer', 'Storefronts'],
    ['/creator-hub', 'Creators'],
    ['/heir-login', 'Login']
  ];

  const heirLinks = [
    ['/heir-dashboard/' + Number(session.heir_id || 1), 'My Dashboard'],
    ['/wallet-center', 'Wallet'],
    ['/access-center', 'Access'],
    ['/heirs-ecosystem', 'Heirs'],
    ['/heir-logout', 'Logout']
  ];

  const creatorLinks = [
    ['/creator-hub', 'Creator Hub'],
    ['/storefront-explorer', 'Storefronts'],
    ['/heir-dashboard/' + Number(session.heir_id || 1), 'My Dashboard'],
    ['/heir-logout', 'Logout']
  ];

  const adminLinks = [
    ['/executive-dashboard', 'Executive'],
    ['/heir-finance', 'Finance'],
    ['/heir-payouts', 'Payouts'],
    ['/payout-automation', 'Automation'],
    ['/payout-cycles', 'Cycles'],
    ['/storefront-analytics', 'Analytics'],
    ['/scheduled-payout-jobs', 'Schedules'],
    ['/heir-storefronts', 'Ownership'],
    ['/command-core', 'Command'],
    ['/progress', 'Progress'],
    ['/heir-logout', 'Logout']
  ];

  let links = publicLinks;
  if (role === 'creator') links = creatorLinks;
  else if (role === 'security_admin' || role === 'systems_admin') links = adminLinks;
  else if (role !== 'public') links = heirLinks;

  return `
    <nav class="portal-main-nav role-nav">
      ${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
    </nav>
  `;
}

function renderRoleHubPage(req, user = null) {
  const session = getPortalSession(req);
  const role = String(session.role_name || 'public');

  const roleLabel =
    role === 'security_admin' ? 'Security Admin' :
    role === 'systems_admin' ? 'Systems Admin' :
    role === 'creator' ? 'Creator' :
    role === 'heir' ? 'Heir Member' : 'Public Visitor';

  const cards = [];

  if (role === 'public') {
    cards.push(
      ['World Explorer', '/world-explorer', 'Explore world surfaces and public experiences.'],
      ['Storefront Explorer', '/storefront-explorer', 'Browse storefront pathways and commercial surfaces.'],
      ['Creator Hub', '/creator-hub', 'Discover creator-facing experiences.'],
      ['Heir Login', '/heir-login', 'Sign in to a protected member experience.']
    );
  } else if (role === 'creator') {
    cards.push(
      ['My Dashboard', '/heir-dashboard/' + Number(session.heir_id || 1), 'View your personal creator-linked dashboard.'],
      ['Creator Hub', '/creator-hub', 'Open your media and creator tools.'],
      ['Storefront Explorer', '/storefront-explorer', 'View storefront-linked creator surfaces.'],
      ['Logout', '/heir-logout', 'End the current secure session.']
    );
  } else if (role === 'security_admin' || role === 'systems_admin') {
    cards.push(
      ['Executive Dashboard', '/executive-dashboard', 'View top-level platform command and finance visibility.'],
      ['Heir Finance', '/heir-finance', 'Review heir balances and payout detail.'],
      ['Payout Automation', '/payout-automation', 'Run and review automation payout operations.'],
      ['Storefront Analytics', '/storefront-analytics', 'Review storefront performance visibility.'],
      ['Command Core', '/command-core', 'Open the operator command layer.'],
      ['Progress', '/progress', 'Track platform build and status.']
    );
  } else {
    cards.push(
      ['My Dashboard', '/heir-dashboard/' + Number(session.heir_id || 1), 'View your personal heir dashboard.'],
      ['Wallet Center', '/wallet-center', 'Open wallet and account visibility.'],
      ['Access Center', '/access-center', 'Review access-related surfaces.'],
      ['Heirs Ecosystem', '/heirs-ecosystem', 'Open the heirs network view.'],
      ['Logout', '/heir-logout', 'End the current secure session.']
    );
  }

  return htmlPage('Role Hub', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Role-Based Experience</div>
          <h1>${roleLabel}</h1>
          <p>This hub shows a cleaner view based on the active session role.</p>
        </section>
        <div class="feature-grid">
          ${cards.map(([title, href, desc]) => `
            <div class="feature-card">
              <h3>${title}</h3>
              <p>${desc}</p>
              <a href="${href}" class="feature-link">Open</a>
            </div>
          `).join('')}
        </div>
      </main>
    </div>
  `, user);
}


function compactFeatureCard(title, desc, href, cta = 'Open') {
  return `
    <div class="feature-card compact-card">
      <div class="compact-card-head">
        <h3>${title}</h3>
      </div>
      <p>${desc}</p>
      <a href="${href}" class="feature-link">${cta}</a>
    </div>
  `;
}

function renderSchedulerCommandPage(req, user = null, message = '') {
  const jobs = dbQuery(`
    SELECT id, job_name, cycle_type, target_type, next_run_label, job_status, created_at
    FROM scheduled_payout_jobs
    ORDER BY id DESC
  `);

  const runs = dbQuery(`
    SELECT sel.id, spj.job_name, sel.payout_run_id, sel.execution_mode, sel.execution_notes, sel.execution_status, sel.created_at
    FROM scheduled_payout_execution_log sel
    LEFT JOIN scheduled_payout_jobs spj ON spj.id = sel.job_id
    ORDER BY sel.id DESC
    LIMIT 100
  `);

  const jobRows = jobs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.job_name || ''}</td>
      <td>${r.cycle_type || ''}</td>
      <td>${r.target_type || ''}</td>
      <td>${r.next_run_label || ''}</td>
      <td>${r.job_status || ''}</td>
      <td>${r.created_at || ''}</td>
      <td>
        <form method="POST" action="/scheduler/run/${r.id}">
          <button type="submit">Run</button>
        </form>
      </td>
    </tr>
  `).join('');

  const runRows = runs.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.job_name || ''}</td>
      <td>${r.payout_run_id || ''}</td>
      <td>${r.execution_mode || ''}</td>
      <td>${r.execution_notes || ''}</td>
      <td>${r.execution_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Scheduler Command', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Automation Operations</div>
          <h1>Scheduler Command</h1>
          <p>Run scheduled payout jobs and review execution history.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <div class="feature-grid compact-grid">
          ${compactFeatureCard('Executive Dashboard', 'Open high-level platform intelligence and finance command.', '/executive-dashboard')}
          ${compactFeatureCard('Heir Finance', 'Review heir balances and payout-linked finance detail.', '/heir-finance')}
          ${compactFeatureCard('Storefront Analytics', 'Review storefront revenue, orders, and visibility.', '/storefront-analytics')}
          ${compactFeatureCard('Payout Automation', 'Review automation rules and automation runs.', '/payout-automation')}
        </div>

        <section class="clean-section">
          <div class="section-head"><h2>Scheduled Jobs</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Cycle</th><th>Target</th><th>Next Run</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>${jobRows || '<tr><td colspan="8">No jobs yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>

        <section class="clean-section">
          <div class="section-head"><h2>Execution History</h2></div>
          <div class="section-body">
            <table>
              <thead><tr><th>ID</th><th>Job</th><th>Payout Run</th><th>Mode</th><th>Notes</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>${runRows || '<tr><td colspan="7">No execution history yet.</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `, user);
}


function safeWalletPreviewRows() {
  try {
    return dbQuery("SELECT id, COALESCE(wallet_name, 'Primary Wallet') AS wallet_name, COALESCE(wallet_status, 'active') AS wallet_status FROM wallets ORDER BY id DESC LIMIT 12");
  } catch (e) {
    return [];
  }
}

function safePodcastPreviewRows() {
  try {
    return dbQuery("SELECT id, title, COALESCE(host_name, 'Unknown Host') AS host_name, COALESCE(status, 'active') AS status FROM podcasts ORDER BY id DESC LIMIT 12");
  } catch (e) {
    return [];
  }
}


function getRequestMeta(req) {
  return {
    ip: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local'),
    ua: String(req.headers['user-agent'] || 'unknown')
  };
}

function fingerprintRequest(meta) {
  const base = meta.ip + "|" + meta.ua;
  return sha256Hex(base);
}

function logRequestFingerprint(sessionId, meta) {
  const hash = fingerprintRequest(meta);
  dbRun(`INSERT INTO request_fingerprints (session_id, ip_address, user_agent, fingerprint_hash)
         VALUES (${Number(sessionId||0)}, '${q(meta.ip)}', '${q(meta.ua)}', '${q(hash)}')`);
}

function detectAnomaly(meta, username) {
  const rows = dbQuery(`
    SELECT count(*) as c
    FROM ip_activity_log
    WHERE ip_address='${q(meta.ip)}'
      AND created_at >= datetime('now','-5 minutes')
  `);
  const count = rows.length ? Number(rows[0].c||0) : 0;

  if (count > 20) {
    dbRun(`INSERT INTO anomaly_events (event_type, risk_level, subject_id, notes)
           VALUES ('high_frequency', 'high', 0, 'IP flood detected')`);
    return true;
  }
  return false;
}

function logIPActivity(meta, action, username='') {
  dbRun(`INSERT INTO ip_activity_log (ip_address, action_type, username)
         VALUES ('${q(meta.ip)}', '${q(action)}', '${q(username)}')`);
}


function renderJoinPage(req, user = null, message = '') {
  const tiers = dbQuery(`
    SELECT id, tier_name, tier_code, price_cents, tier_type
    FROM membership_tiers
    WHERE tier_status='active'
    ORDER BY price_cents ASC, id ASC
  `);

  const cards = tiers.map(t => `
    <div class="feature-card compact-card">
      <div class="compact-card-head"><h3>${t.tier_name}</h3></div>
      <p><strong>$${((Number(t.price_cents || 0))/100).toFixed(2)}</strong></p>
      <p>Tier code: ${t.tier_code}</p>
      <p>Type: ${t.tier_type}</p>
      <form method="POST" action="/checkout">
        <input type="hidden" name="tier_code" value="${t.tier_code}" />
        <button type="submit">Choose ${t.tier_name}</button>
      </form>
    </div>
  `).join('');

  return htmlPage('Join the Ecosystem', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Join / Buy-In</div>
          <h1>Enter the Ecosystem</h1>
          <p>Choose an access tier to unlock your place in the platform economy.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>
        <div class="feature-grid compact-grid">
          ${cards}
        </div>
      </main>
    </div>
  `, user);
}

function renderCheckoutPage(req, user = null, tierCode = '', message = '') {
  const rows = dbQuery(`
    SELECT tier_name, tier_code, price_cents, tier_type
    FROM membership_tiers
    WHERE tier_code='${q(tierCode)}'
    LIMIT 1
  `);

  if (!rows.length) {
    return htmlPage('Checkout', `<div class="card"><h2>Tier not found</h2></div>`, user);
  }

  const t = rows[0];
  return htmlPage('Checkout', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Checkout</div>
          <h1>${t.tier_name}</h1>
          <p>Simulated checkout for access unlocking.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <section class="clean-section">
          <div class="section-body">
            <div class="feature-card" style="max-width:560px;">
              <p><strong>Tier:</strong> ${t.tier_name}</p>
              <p><strong>Price:</strong> $${((Number(t.price_cents || 0))/100).toFixed(2)}</p>
              <p><strong>Type:</strong> ${t.tier_type}</p>

              <form method="POST" action="/checkout/complete">
                <input type="hidden" name="tier_code" value="${t.tier_code}" />
                <label>Heir Username</label>
                <input name="username" placeholder="jacobie" aria-label="Username" />
                <button type="submit">Complete Buy-In</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  `, user);
}

function renderBuildPage(req, user = null) {
  return htmlPage('Build', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Build / Earn</div>
          <h1>Build</h1>
          <p>Creator, storefront, and ownership-driven pathways for earning inside the ecosystem.</p>
        </section>
        <div class="feature-grid">
          ${compactFeatureCard('Creator Hub', 'Build creator presence and media pathways.', '/creator-hub')}
          ${compactFeatureCard('Storefront Explorer', 'Review commercial surfaces and storefront layers.', '/storefront-explorer')}
          ${compactFeatureCard('Heirs Ecosystem', 'See identity, ownership, and network participation.', '/heirs-ecosystem')}
          ${compactFeatureCard('Role Hub', 'Return to the role-based platform experience.', '/role-hub')}
        </div>
      </main>
    </div>
  `, user);
}

function renderLearnPage(req, user = null) {
  return htmlPage('Learn', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">University / Learn</div>
          <h1>Learn</h1>
          <p>Training, onboarding, and future All American Marketplace University pathways.</p>
        </section>
        <div class="feature-grid">
          ${compactFeatureCard('Join the Ecosystem', 'Start with the ecosystem access path.', '/join')}
          ${compactFeatureCard('Role Hub', 'See role-based access and next steps.', '/role-hub')}
          ${compactFeatureCard('Public Home', 'Return to the public-facing experience.', '/public-home')}
          ${compactFeatureCard('Member Home', 'Open the logged-in member experience.', '/member-home')}
        </div>
      </main>
    </div>
  `, user);
}

function renderWatchPage(req, user = null) {
  return htmlPage('Watch', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main">
        <section class="portal-subhero">
          <div class="portal-kicker">Watch / Streaming</div>
          <h1>Watch</h1>
          <p>Holographic streaming, podcasts, creator rooms, and future immersive media surfaces.</p>
        </section>
        <div class="feature-grid">
          ${compactFeatureCard('Creator Hub', 'Open creator-facing media surfaces.', '/creator-hub')}
          ${compactFeatureCard('Public Home', 'Return to the main public experience.', '/public-home')}
          ${compactFeatureCard('Join', 'Join the ecosystem to unlock deeper access.', '/join')}
          ${compactFeatureCard('Role Hub', 'See your role-aware next steps.', '/role-hub')}
        </div>
      </main>
    </div>
  `, user);
}


function renderEngineBridgePage(req, user = null, message = '') {
  const engines = dbQuery(`
    SELECT id, engine_name, engine_code, engine_type, render_mode, engine_status, created_at
    FROM engine_registry
    ORDER BY id ASC
  `);

  const jobs = dbQuery(`
    SELECT id, engine_code, workflow_name, workflow_type, scene_id, job_status, created_at
    FROM engine_workflow_jobs
    ORDER BY id DESC
    LIMIT 100
  `);

  const builds = dbQuery(`
    SELECT id, engine_code, build_name, target_platform, build_status, created_at
    FROM engine_build_runs
    ORDER BY id DESC
    LIMIT 100
  `);

  const holo = dbQuery(`
    SELECT id, profile_name, dimension_mode, render_density, profile_status, created_at
    FROM holographic_generator_profiles
    ORDER BY id DESC
  `);

  const runtime = dbQuery(`
    SELECT id, runtime_name, runtime_type, device_scope, runtime_status, created_at
    FROM immersive_runtime_profiles
    ORDER BY id DESC
  `);

  const accel = dbQuery(`
    SELECT id, profile_name, profile_code, acceleration_type, optimization_scope, profile_status, created_at
    FROM acceleration_profiles
    ORDER BY id DESC
  `);

  const ai = dbQuery(`
    SELECT id, profile_name, ai_family, orchestration_scope, profile_status, created_at
    FROM ai_orchestration_profiles
    ORDER BY id DESC
  `);

  const planes = dbQuery(`
    SELECT id, plane_name, plane_code, plane_scope, plane_status, created_at
    FROM metaverse_control_planes
    ORDER BY id DESC
  `);

  const engineRows = engines.map(r => `
    <tr><td>${r.id}</td><td>${r.engine_name}</td><td>${r.engine_code}</td><td>${r.engine_type}</td><td>${r.render_mode || ''}</td><td>${r.engine_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const jobRows = jobs.map(r => `
    <tr><td>${r.id}</td><td>${r.engine_code}</td><td>${r.workflow_name}</td><td>${r.workflow_type}</td><td>${r.scene_id || ''}</td><td>${r.job_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const buildRows = builds.map(r => `
    <tr><td>${r.id}</td><td>${r.engine_code}</td><td>${r.build_name}</td><td>${r.target_platform}</td><td>${r.build_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const holoRows = holo.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.dimension_mode || ''}</td><td>${r.render_density || ''}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const runtimeRows = runtime.map(r => `
    <tr><td>${r.id}</td><td>${r.runtime_name}</td><td>${r.runtime_type}</td><td>${r.device_scope || ''}</td><td>${r.runtime_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const accelRows = accel.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.profile_code}</td><td>${r.acceleration_type}</td><td>${r.optimization_scope || ''}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const aiRows = ai.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.ai_family}</td><td>${r.orchestration_scope || ''}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const planeRows = planes.map(r => `
    <tr><td>${r.id}</td><td>${r.plane_name}</td><td>${r.plane_code}</td><td>${r.plane_scope || ''}</td><td>${r.plane_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Unified Engine Bridge', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Engine + Universe Control</div>
          <h1>Unified Engine Bridge</h1>
          <p>Control layer for Web, Unity, Unreal, hybrid holographic, AR/VR/MR, metaverse, middleverse, and multiverse orchestration.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <div class="feature-grid compact-grid">
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Metaverse Plane', 'Interactive world surface control.', '/engine-bridge') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Middleverse Plane', 'Commerce, streaming, identity, and logic control.', '/engine-bridge') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Multiverse Plane', 'Expansion into multiple sectors and worlds.', '/engine-bridge') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Scheduler Command', 'Run execution and orchestration workflows.', '/scheduler-command') : ''}
        </div>

        <section class="clean-section"><div class="section-head"><h2>Engine Registry</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Type</th><th>Render</th><th>Status</th><th>Created</th></tr></thead><tbody>${engineRows || '<tr><td colspan="7">No engines yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Workflow Jobs</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Engine</th><th>Name</th><th>Type</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead><tbody>${jobRows || '<tr><td colspan="7">No workflow jobs yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Build Runs</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Engine</th><th>Build</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${buildRows || '<tr><td colspan="6">No builds yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Holographic Profiles</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Dimension</th><th>Density</th><th>Status</th><th>Created</th></tr></thead><tbody>${holoRows || '<tr><td colspan="6">No profiles yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Immersive Runtime Profiles</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Device Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${runtimeRows || '<tr><td colspan="6">No runtime profiles yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Acceleration Profiles</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Type</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${accelRows || '<tr><td colspan="7">No acceleration profiles yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>AI Orchestration Profiles</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Family</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${aiRows || '<tr><td colspan="6">No AI profiles yet.</td></tr>'}</tbody></table></div></section>
        <section class="clean-section"><div class="section-head"><h2>Control Planes</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${planeRows || '<tr><td colspan="6">No control planes yet.</td></tr>'}</tbody></table></div></section>
      </main>
    </div>
  `, user);
}


function renderVisualStreamingPage(req, user = null, message = '') {
  const scenes = dbQuery(`
    SELECT id, scene_name, scene_code, scene_type, visual_mode, access_tier, scene_status, created_at
    FROM visual_world_scenes
    ORDER BY id ASC
  `);

  const channels = dbQuery(`
    SELECT c.id, h.name as heir_name, c.channel_name, c.channel_code, c.channel_type, c.access_tier, c.channel_status, c.created_at
    FROM creator_stream_channels c
    LEFT JOIN heirs_registry h ON h.id = c.heir_id
    ORDER BY c.id ASC
  `);

  const sessions = dbQuery(`
    SELECT s.id, c.channel_name, s.session_title, s.session_type, s.scene_id, s.session_status, s.created_at
    FROM creator_live_sessions s
    LEFT JOIN creator_stream_channels c ON c.id = s.channel_id
    ORDER BY s.id DESC
    LIMIT 100
  `);

  const tips = dbQuery(`
    SELECT t.id, hf.name as from_name, ht.name as to_name, c.channel_name, t.amount_cents, t.tip_status, t.created_at
    FROM stream_tip_events t
    LEFT JOIN heirs_registry hf ON hf.id = t.from_heir_id
    LEFT JOIN heirs_registry ht ON ht.id = t.to_heir_id
    LEFT JOIN creator_stream_channels c ON c.id = t.channel_id
    ORDER BY t.id DESC
    LIMIT 100
  `);

  const sceneRows = scenes.map(r => `
    <tr><td>${r.id}</td><td>${r.scene_name}</td><td>${r.scene_code}</td><td>${r.scene_type}</td><td>${r.visual_mode || ''}</td><td>${r.access_tier || ''}</td><td>${r.scene_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const channelRows = channels.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.channel_name}</td><td>${r.channel_code}</td><td>${r.channel_type}</td><td>${r.access_tier || ''}</td><td>${r.channel_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const sessionRows = sessions.map(r => `
    <tr><td>${r.id}</td><td>${r.channel_name || ''}</td><td>${r.session_title}</td><td>${r.session_type}</td><td>${r.scene_id || ''}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const tipRows = tips.map(r => `
    <tr><td>${r.id}</td><td>${r.from_name || ''}</td><td>${r.to_name || ''}</td><td>${r.channel_name || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.tip_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Visual World + Streaming', `
    <div class="portal-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main cleaner-main">
        <section class="portal-subhero clean-hero">
          <div class="portal-kicker">Visual + Streaming Activation</div>
          <h1>Visual World + Streaming</h1>
          <p>Control the visual world layer, creator channels, live sessions, and streaming monetization scaffolds.</p>
          ${message ? `<p class="ok">${message}</p>` : ''}
        </section>

        <div class="feature-grid compact-grid">
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Engine Bridge', 'Control Unity, Unreal, Web, and holo orchestration.', '/engine-bridge') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Join', 'Drive access tier conversion and monetization.', '/join') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Watch', 'Open streaming and attention surfaces.', '/watch') : ''}
          ${typeof compactFeatureCard === 'function' ? compactFeatureCard('Build', 'Creator and storefront participation layer.', '/build') : ''}
        </div>

        <section class="clean-section"><div class="section-head"><h2>Visual World Scenes</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Type</th><th>Visual Mode</th><th>Access Tier</th><th>Status</th><th>Created</th></tr></thead><tbody>${sceneRows || '<tr><td colspan="8">No scenes yet.</td></tr>'}</tbody></table></div></section>

        <section class="clean-section"><div class="section-head"><h2>Creator Stream Channels</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Heir</th><th>Name</th><th>Code</th><th>Type</th><th>Access Tier</th><th>Status</th><th>Created</th></tr></thead><tbody>${channelRows || '<tr><td colspan="8">No channels yet.</td></tr>'}</tbody></table></div></section>

        <section class="clean-section"><div class="section-head"><h2>Live Sessions</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>Channel</th><th>Title</th><th>Type</th><th>Scene</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="7">No live sessions yet.</td></tr>'}</tbody></table></div></section>

        <section class="clean-section"><div class="section-head"><h2>Stream Tip Events</h2></div><div class="section-body"><table><thead><tr><th>ID</th><th>From</th><th>To</th><th>Channel</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead><tbody>${tipRows || '<tr><td colspan="7">No tips yet.</td></tr>'}</tbody></table></div></section>
      </main>
    </div>
  `, user);
}


function premiumSection(title, body) {
  return `
    <section class="premium-section">
      <div class="premium-section-head">
        <h2>${title}</h2>
      </div>
      <div class="premium-section-body">
        ${body}
      </div>
    </section>
  `;
}

function heroActionCard(title, desc, href, cta = 'Open') {
  return `
    <div class="hero-action-card">
      <h3>${title}</h3>
      <p>${desc}</p>
      <a href="${href}" class="hero-action-link">${cta}</a>
    </div>
  `;
}

function renderPremiumPublicHome(req, user = null) {
  const sceneCount = dbQuery(`SELECT count(*) as c FROM visual_world_scenes`)[0]?.c || 0;
  const channelCount = dbQuery(`SELECT count(*) as c FROM creator_stream_channels`)[0]?.c || 0;
  const storefrontCount = dbQuery(`SELECT count(*) as c FROM heir_storefront_ownership`)[0]?.c || 0;
  const heirCount = dbQuery(`SELECT count(*) as c FROM heirs_registry`)[0]?.c || 0;

  const streamRows = dbQuery(`
    SELECT c.id, c.channel_name, c.channel_type, c.access_tier, h.name as heir_name
    FROM creator_stream_channels c
    LEFT JOIN heirs_registry h ON h.id = c.heir_id
    ORDER BY c.id ASC
    LIMIT 6
  `);

  const streamCards = streamRows.map(r => `
    <div class="feature-card compact-card">
      <div class="compact-card-head"><h3>${r.channel_name}</h3></div>
      <p>Host: ${r.heir_name || 'Unknown'}</p>
      <p>Type: ${r.channel_type || ''}</p>
      <p>Tier: ${r.access_tier || ''}</p>
      <a href="/watch" class="feature-link">Watch Channel</a>
    </div>
  `).join('');

  return htmlPage('All American Marketplace', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Living Economy Platform</div>
            <h1>Stream. Join. Build. Earn. Own.</h1>
            <p>The All American Marketplace Holographic Streaming Ecosystem brings together worlds, creators, commerce, ownership, heirs, payouts, and immersive growth in one platform.</p>
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join the Ecosystem</a>
              <a href="/watch" class="hero-secondary-btn">Watch Live</a>
              <a href="/build" class="hero-secondary-btn">Build & Earn</a>
              <a href="/learn" class="hero-secondary-btn">Learn More</a>
            </div>
          </div>
          <div class="premium-hero-stats">
            ${typeof statCard === 'function' ? statCard('Worlds', sceneCount) : ''}
            ${typeof statCard === 'function' ? statCard('Channels', channelCount) : ''}
            ${typeof statCard === 'function' ? statCard('Storefronts', storefrontCount) : ''}
            ${typeof statCard === 'function' ? statCard('Heirs', heirCount) : ''}
          </div>
        </section>

        ${premiumSection('Choose Your Path', `
          <div class="hero-action-grid">
            ${heroActionCard('Watch', 'Enter the streaming, podcast, and event layer that drives attention into the ecosystem.', '/watch', 'Enter Watch')}
            ${heroActionCard('Join', 'Buy into the ecosystem and unlock access, roles, and participation pathways.', '/join', 'Start Join Flow')}
            ${heroActionCard('Build', 'Creators, storefront owners, and heirs use this layer to build value and earnings.', '/build', 'Open Build')}
            ${heroActionCard('Learn', 'Training, onboarding, and future university pathways to help users grow.', '/learn', 'Open Learn')}
          </div>
        `)}

        ${premiumSection('Live Creator Surfaces', `
          <div class="feature-grid compact-grid">
            ${streamCards || '<div class="muted">No channels yet.</div>'}
          </div>
        `)}

        ${premiumSection('Why This Platform Wins', `
          <div class="feature-grid compact-grid">
            ${heroActionCard('Streaming + Commerce', 'Creators can drive attention and conversion in one stack.', '/watch')}
            ${heroActionCard('Ownership + Identity', 'Heirs, roles, access, and ownership are built into the platform.', '/role-hub')}
            ${heroActionCard('Finance + Payouts', 'Executive finance, analytics, payouts, and scheduling are integrated.', '/executive-dashboard')}
            ${heroActionCard('World + Engine Bridge', 'Metaverse, middleverse, multiverse, and engine orchestration sit behind one control plane.', '/engine-bridge')}
          </div>
        `)}
      </main>
    </div>
  `, user);
}

function renderPremiumWatchPage(req, user = null, message = '') {
  const channels = dbQuery(`
    SELECT c.id, c.channel_name, c.channel_type, c.access_tier, h.name as heir_name
    FROM creator_stream_channels c
    LEFT JOIN heirs_registry h ON h.id = c.heir_id
    ORDER BY c.id ASC
  `);

  const liveSessions = dbQuery(`
    SELECT s.id, c.channel_name, s.session_title, s.session_type, s.session_status, s.created_at
    FROM creator_live_sessions s
    LEFT JOIN creator_stream_channels c ON c.id = s.channel_id
    ORDER BY s.id DESC
    LIMIT 20
  `);

  const conversionEvents = dbQuery(`
    SELECT sce.id, c.channel_name, sce.event_name, sce.event_type, sce.target_tier_code, sce.event_status
    FROM streaming_conversion_events sce
    LEFT JOIN creator_stream_channels c ON c.id = sce.channel_id
    ORDER BY sce.id DESC
    LIMIT 20
  `);

  const channelCards = channels.map(r => `
    <div class="hero-action-card">
      <h3>${r.channel_name}</h3>
      <p>Host: ${r.heir_name || 'Unknown'}</p>
      <p>Type: ${r.channel_type || ''}</p>
      <p>Access Tier: ${r.access_tier || ''}</p>
      <div class="premium-cta-row">
        <a href="/join" class="hero-primary-btn">Unlock Access</a>
        <a href="/build" class="hero-secondary-btn">Become a Creator</a>
      </div>
    </div>
  `).join('');

  const sessionRows = liveSessions.map(r => `
    <tr><td>${r.id}</td><td>${r.channel_name || ''}</td><td>${r.session_title}</td><td>${r.session_type}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const conversionRows = conversionEvents.map(r => `
    <tr><td>${r.id}</td><td>${r.channel_name || ''}</td><td>${r.event_name}</td><td>${r.event_type}</td><td>${r.target_tier_code || ''}</td><td>${r.event_status}</td></tr>
  `).join('');

  return htmlPage('Watch', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Attention Engine</div>
            <h1>Watch the Ecosystem Live</h1>
            <p>Streaming, podcast, coaching, performance, and future holographic live experiences all connect to your join, build, and monetization flows.</p>
            ${message ? `<p class="ok">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join to Unlock</a>
              <a href="/build" class="hero-secondary-btn">Become a Creator</a>
            </div>
          </div>
        </section>

        ${premiumSection('Featured Channels', `
          <div class="hero-action-grid">
            ${channelCards || '<div class="muted">No channels yet.</div>'}
          </div>
        `)}

        ${premiumSection('Live Session Queue', `
          <table>
            <thead><tr><th>ID</th><th>Channel</th><th>Title</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${sessionRows || '<tr><td colspan="6">No sessions yet.</td></tr>'}</tbody>
          </table>
        `)}

        ${premiumSection('Streaming Conversion Funnels', `
          <table>
            <thead><tr><th>ID</th><th>Channel</th><th>Event</th><th>Type</th><th>Target Tier</th><th>Status</th></tr></thead>
            <tbody>${conversionRows || '<tr><td colspan="6">No conversion events yet.</td></tr>'}</tbody>
          </table>
        `)}
      </main>
    </div>
  `, user);
}


function renderConnectSystemPage(req, user = null, message = '') {
  const domains = dbQuery(`
    SELECT d.id, h.name as heir_name, d.domain_name, d.domain_type, d.connection_status, d.created_at
    FROM connected_domains d
    LEFT JOIN heirs_registry h ON h.id = d.heir_id
    ORDER BY d.id DESC
    LIMIT 100
  `);

  const stores = dbQuery(`
    SELECT s.id, h.name as heir_name, s.storefront_name, s.storefront_url, s.storefront_type, s.connection_status, s.created_at
    FROM connected_storefronts s
    LEFT JOIN heirs_registry h ON h.id = s.heir_id
    ORDER BY s.id DESC
    LIMIT 100
  `);

  const wallets = dbQuery(`
    SELECT w.id, h.name as heir_name, w.wallet_label, w.wallet_address, w.wallet_network, w.connection_status, w.created_at
    FROM connected_wallets w
    LEFT JOIN heirs_registry h ON h.id = w.heir_id
    ORDER BY w.id DESC
    LIMIT 100
  `);

  const profiles = dbQuery(`
    SELECT o.id, h.name as heir_name, o.profile_type, o.brand_name, o.primary_goal, o.onboarding_status, o.created_at
    FROM onboarding_profiles o
    LEFT JOIN heirs_registry h ON h.id = o.heir_id
    ORDER BY o.id DESC
    LIMIT 100
  `);

  const steps = dbQuery(`
    SELECT s.id, h.name as heir_name, s.step_code, s.step_name, s.step_status, s.created_at
    FROM onboarding_steps s
    LEFT JOIN heirs_registry h ON h.id = s.heir_id
    ORDER BY s.id DESC
    LIMIT 200
  `);

  const events = dbQuery(`
    SELECT e.id, h.name as heir_name, e.event_type, e.event_payload, e.event_status, e.created_at
    FROM brand_connection_events e
    LEFT JOIN heirs_registry h ON h.id = e.heir_id
    ORDER BY e.id DESC
    LIMIT 200
  `);

  const domainRows = domains.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.domain_name}</td><td>${r.domain_type}</td><td>${r.connection_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const storeRows = stores.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.storefront_name}</td><td>${r.storefront_url || ''}</td><td>${r.storefront_type}</td><td>${r.connection_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const walletRows = wallets.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.wallet_label}</td><td>${r.wallet_address || ''}</td><td>${r.wallet_network}</td><td>${r.connection_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const profileRows = profiles.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.profile_type}</td><td>${r.brand_name || ''}</td><td>${r.primary_goal || ''}</td><td>${r.onboarding_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const stepRows = steps.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.step_code}</td><td>${r.step_name}</td><td>${r.step_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.event_type}</td><td>${r.event_payload || ''}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Connect Your Brand', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Connection Layer</div>
            <h1>Connect Your Brand</h1>
            <p>Bring your domain, storefront, wallet, creator role, and brand into the All American Marketplace Holographic Streaming Ecosystem.</p>
            ${message ? `<p class="ok">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join First</a>
              <a href="/watch" class="hero-secondary-btn">Watch & Discover</a>
              <a href="/build" class="hero-secondary-btn">Build & Earn</a>
              <a href="/learn" class="hero-secondary-btn">Learn the System</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('What This Does', `
          <div class="hero-action-grid">
            ${typeof heroActionCard === 'function' ? heroActionCard('Connect Domains', 'Let brands plug their domain into your ecosystem.', '/connect-system') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Connect Storefronts', 'Bring external stores into the marketplace network.', '/connect-system') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Connect Wallets', 'Attach wallet identity and monetization flows.', '/connect-system') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Activate Onboarding', 'Turn every brand into a guided ecosystem participant.', '/connect-system') : ''}
          </div>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Connected Domains', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Domain</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${domainRows || '<tr><td colspan="6">No domains yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Connected Storefronts', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Name</th><th>URL</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${storeRows || '<tr><td colspan="7">No storefronts yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Connected Wallets', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Label</th><th>Address</th><th>Network</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${walletRows || '<tr><td colspan="7">No wallets yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Onboarding Profiles', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Type</th><th>Brand</th><th>Goal</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${profileRows || '<tr><td colspan="7">No onboarding profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Onboarding Steps', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Code</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${stepRows || '<tr><td colspan="6">No onboarding steps yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Connection Events', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="6">No events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}


function getOnboardingDestination(heirId) {
  const rows = dbQuery(`
    SELECT op.profile_type, pp.destination_route
    FROM onboarding_profiles op
    LEFT JOIN onboarding_path_presets pp ON pp.profile_type = op.profile_type
    WHERE op.heir_id=${Number(heirId)}
    ORDER BY op.id DESC
    LIMIT 1
  `);
  if (rows.length && rows[0].destination_route) return String(rows[0].destination_route);
  return '/role-hub';
}

function logConversionFlow(heirId, flowName, stepCode, stepResult='completed', notes='') {
  dbRun(`INSERT INTO conversion_flow_events (heir_id, flow_name, step_code, step_result, event_notes)
         VALUES (${Number(heirId||0)}, '${q(flowName)}', '${q(stepCode)}', '${q(stepResult)}', '${q(notes)}')`);
}

function renderConversionControlPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT o.id, h.name as heir_name, o.profile_type, o.brand_name, o.primary_goal, o.onboarding_status
    FROM onboarding_profiles o
    LEFT JOIN heirs_registry h ON h.id = o.heir_id
    ORDER BY o.id DESC
    LIMIT 100
  `);

  const steps = dbQuery(`
    SELECT s.id, h.name as heir_name, s.step_code, s.step_name, s.step_status, s.created_at
    FROM onboarding_steps s
    LEFT JOIN heirs_registry h ON h.id = s.heir_id
    ORDER BY s.id DESC
    LIMIT 200
  `);

  const events = dbQuery(`
    SELECT c.id, h.name as heir_name, c.flow_name, c.step_code, c.step_result, c.event_notes, c.created_at
    FROM conversion_flow_events c
    LEFT JOIN heirs_registry h ON h.id = c.heir_id
    ORDER BY c.id DESC
    LIMIT 200
  `);

  const profileRows = profiles.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.profile_type || ''}</td><td>${r.brand_name || ''}</td><td>${r.primary_goal || ''}</td><td>${r.onboarding_status || ''}</td></tr>
  `).join('');

  const stepRows = steps.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.step_code}</td><td>${r.step_name}</td><td>${r.step_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.flow_name}</td><td>${r.step_code}</td><td>${r.step_result}</td><td>${r.event_notes || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Conversion Flow Control', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Conversion + Onboarding</div>
            <h1>Conversion Flow Control</h1>
            <p>Clean onboarding steps, tighter connect-system routing, and simpler user paths from join to build.</p>
            ${message ? `<p class="ok">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join</a>
              <a href="/connect-system" class="hero-secondary-btn">Connect</a>
              <a href="/build" class="hero-secondary-btn">Build</a>
              <a href="/learn" class="hero-secondary-btn">Learn</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Path Summary', `
          <div class="hero-action-grid">
            ${typeof heroActionCard === 'function' ? heroActionCard('Join → Connect', 'Move new users from buy-in to connected brand setup.', '/join') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Connect → Build', 'Route brands into storefront and creator tools.', '/connect-system') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Watch → Join', 'Convert streaming attention into ecosystem entry.', '/watch') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Learn → Build', 'Train users and move them into creator or seller paths.', '/learn') : ''}
          </div>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Onboarding Profiles', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Type</th><th>Brand</th><th>Goal</th><th>Status</th></tr></thead>
            <tbody>${profileRows || '<tr><td colspan="6">No profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Onboarding Steps', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Code</th><th>Name</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${stepRows || '<tr><td colspan="6">No steps yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Conversion Events', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Flow</th><th>Step</th><th>Result</th><th>Notes</th><th>Created</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="7">No events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}


function renderPaymentControlPage(req, user = null, message = '') {
  const providers = dbQuery(`
    SELECT id, provider_name, provider_type, provider_mode, provider_status, created_at
    FROM payment_provider_profiles
    ORDER BY id ASC
  `);

  const billing = dbQuery(`
    SELECT b.id, h.name as heir_name, b.customer_ref, b.billing_email, b.billing_status, b.created_at
    FROM billing_customer_profiles b
    LEFT JOIN heirs_registry h ON h.id = b.heir_id
    ORDER BY b.id DESC
    LIMIT 100
  `);

  const sessions = dbQuery(`
    SELECT s.id, h.name as heir_name, s.tier_code, s.provider_name, s.session_ref, s.amount_cents, s.session_status, s.created_at
    FROM payment_sessions s
    LEFT JOIN heirs_registry h ON h.id = s.heir_id
    ORDER BY s.id DESC
    LIMIT 100
  `);

  const txs = dbQuery(`
    SELECT t.id, h.name as heir_name, t.provider_name, t.payment_session_id, t.checkout_order_id, t.tx_ref, t.amount_cents, t.currency_code, t.tx_status, t.created_at
    FROM payment_transactions t
    LEFT JOIN heirs_registry h ON h.id = t.heir_id
    ORDER BY t.id DESC
    LIMIT 100
  `);

  const hooks = dbQuery(`
    SELECT id, provider_name, event_type, event_status, created_at
    FROM payment_webhook_events
    ORDER BY id DESC
    LIMIT 100
  `);

  const recs = dbQuery(`
    SELECT id, transaction_id, reconciliation_type, reconciliation_status, reconciliation_notes, created_at
    FROM payment_reconciliation_log
    ORDER BY id DESC
    LIMIT 100
  `);

  const providerRows = providers.map(r => `
    <tr><td>${r.id}</td><td>${r.provider_name}</td><td>${r.provider_type}</td><td>${r.provider_mode}</td><td>${r.provider_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const billingRows = billing.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.customer_ref || ''}</td><td>${r.billing_email || ''}</td><td>${r.billing_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const sessionRows = sessions.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.tier_code}</td><td>${r.provider_name}</td><td>${r.session_ref || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const txRows = txs.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.provider_name}</td><td>${r.payment_session_id || ''}</td><td>${r.checkout_order_id || ''}</td><td>${r.tx_ref || ''}</td><td>$${((Number(r.amount_cents || 0))/100).toFixed(2)}</td><td>${r.currency_code}</td><td>${r.tx_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const hookRows = hooks.map(r => `
    <tr><td>${r.id}</td><td>${r.provider_name}</td><td>${r.event_type}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const recRows = recs.map(r => `
    <tr><td>${r.id}</td><td>${r.transaction_id || ''}</td><td>${r.reconciliation_type}</td><td>${r.reconciliation_status}</td><td>${r.reconciliation_notes || ''}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Payment Control', `
    <div class="portal-shell premium-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main class="portal-main premium-main">
        <section class="premium-hero">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Payment Control</div>
            <h1>Payment Integration Prep</h1>
            <p>Prepare the platform for real payment processors, transaction tracking, webhook ingestion, and reconciliation.</p>
            ${message ? `<p class="ok">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join</a>
              <a href="/monetization-control" class="hero-secondary-btn">Monetization</a>
              <a href="/conversion-control" class="hero-secondary-btn">Conversion</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Providers', `
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${providerRows || '<tr><td colspan="6">No providers yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Billing Customer Profiles', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Customer Ref</th><th>Email</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${billingRows || '<tr><td colspan="6">No billing profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Payment Sessions', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Tier</th><th>Provider</th><th>Session Ref</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${sessionRows || '<tr><td colspan="8">No payment sessions yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Transactions', `
          <table>
            <thead><tr><th>ID</th><th>Heir</th><th>Provider</th><th>Session</th><th>Checkout Order</th><th>TX Ref</th><th>Amount</th><th>Currency</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${txRows || '<tr><td colspan="10">No transactions yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Webhook Events', `
          <table>
            <thead><tr><th>ID</th><th>Provider</th><th>Event Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${hookRows || '<tr><td colspan="5">No webhook events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Reconciliation Log', `
          <table>
            <thead><tr><th>ID</th><th>Transaction ID</th><th>Type</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead>
            <tbody>${recRows || '<tr><td colspan="6">No reconciliation rows yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}


function renderAccessibilityPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT a.id, h.name as heir_name, a.profile_name, a.text_scale, a.contrast_mode, a.motion_mode, a.input_mode, a.navigation_mode, a.profile_status, a.created_at
    FROM accessibility_profiles a
    LEFT JOIN heirs_registry h ON h.id = a.heir_id
    ORDER BY a.id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT e.id, h.name as heir_name, e.event_type, e.event_notes, e.event_status, e.created_at
    FROM accessibility_events e
    LEFT JOIN heirs_registry h ON h.id = e.heir_id
    ORDER BY e.id DESC
    LIMIT 100
  `);

  const profileRows = profiles.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.heir_name || ''}</td>
      <td>${r.profile_name || ''}</td>
      <td>${r.text_scale || ''}</td>
      <td>${r.contrast_mode || ''}</td>
      <td>${r.motion_mode || ''}</td>
      <td>${r.input_mode || ''}</td>
      <td>${r.navigation_mode || ''}</td>
      <td>${r.profile_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.heir_name || ''}</td>
      <td>${r.event_type}</td>
      <td>${r.event_notes || ''}</td>
      <td>${r.event_status || ''}</td>
      <td>${r.created_at || ''}</td>
    </tr>
  `).join('');

  return htmlPage('Accessibility', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero accessible-hero" aria-labelledby="accessibility-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Accessibility + Inclusion</div>
            <h1 id="accessibility-title">Accessibility Control</h1>
            <p>Large text, reduced motion, higher contrast, simpler navigation, and one-hand-friendly interaction patterns.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/join" class="hero-primary-btn">Join</a>
              <a href="/watch" class="hero-secondary-btn">Watch</a>
              <a href="/build" class="hero-secondary-btn">Build</a>
              <a href="/learn" class="hero-secondary-btn">Learn</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Accessibility Principles', `
          <div class="hero-action-grid">
            ${typeof heroActionCard === 'function' ? heroActionCard('Large Text', 'Bigger text scale improves readability and one-hand use.', '/accessibility') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('High Contrast', 'Stronger contrast helps low-vision users.', '/accessibility') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Reduced Motion', 'Less motion helps users sensitive to animation.', '/accessibility') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Simplified Navigation', 'Cleaner movement through the platform reduces overload.', '/accessibility') : ''}
          </div>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Accessibility Profiles', `
          <table aria-label="Accessibility Profiles">
            <thead>
              <tr>
                <th>ID</th><th>Heir</th><th>Profile</th><th>Text</th><th>Contrast</th><th>Motion</th><th>Input</th><th>Navigation</th><th>Status</th><th>Created</th>
              </tr>
            </thead>
            <tbody>${profileRows || '<tr><td colspan="10">No accessibility profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Accessibility Events', `
          <table aria-label="Accessibility Events">
            <thead>
              <tr>
                <th>ID</th><th>Heir</th><th>Event</th><th>Notes</th><th>Status</th><th>Created</th>
              </tr>
            </thead>
            <tbody>${eventRows || '<tr><td colspan="6">No accessibility events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}


function renderAvatarRigPage(req, user = null, message = '') {
  const chars = dbQuery(`
    SELECT a.id, h.name as heir_name, a.character_name, a.character_type, a.style_mode, a.avatar_status, a.created_at
    FROM avatar_characters a
    LEFT JOIN heirs_registry h ON h.id = a.heir_id
    ORDER BY a.id DESC
    LIMIT 100
  `);

  const uploads = dbQuery(`
    SELECT u.id, a.character_name, u.upload_type, u.file_path, u.upload_status, u.created_at
    FROM avatar_profile_uploads u
    LEFT JOIN avatar_characters a ON a.id = u.character_id
    ORDER BY u.id DESC
    LIMIT 100
  `);

  const rigs = dbQuery(`
    SELECT r.id, a.character_name, r.rig_type, r.rig_mode, r.holographic_mode, r.facial_capture_mode, r.export_status, r.created_at
    FROM avatar_rig_profiles r
    LEFT JOIN avatar_characters a ON a.id = r.character_id
    ORDER BY r.id DESC
    LIMIT 100
  `);

  const holo = dbQuery(`
    SELECT h.id, a.character_name, h.holo_profile_name, h.dimensional_mode, h.projection_mode, h.interaction_mode, h.holo_status, h.created_at
    FROM avatar_holographic_profiles h
    LEFT JOIN avatar_characters a ON a.id = h.character_id
    ORDER BY h.id DESC
    LIMIT 100
  `);

  const jobs = dbQuery(`
    SELECT j.id, a.character_name, j.workflow_name, j.workflow_type, j.job_status, j.created_at
    FROM avatar_workflow_jobs j
    LEFT JOIN avatar_characters a ON a.id = j.character_id
    ORDER BY j.id DESC
    LIMIT 200
  `);

  const deploy = dbQuery(`
    SELECT d.id, a.character_name, d.target_name, d.target_type, d.deployment_status, d.created_at
    FROM avatar_deployment_targets d
    LEFT JOIN avatar_characters a ON a.id = d.character_id
    ORDER BY d.id DESC
    LIMIT 200
  `);

  const charRows = chars.map(r => `
    <tr><td>${r.id}</td><td>${r.heir_name || ''}</td><td>${r.character_name}</td><td>${r.character_type}</td><td>${r.style_mode || ''}</td><td>${r.avatar_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const uploadRows = uploads.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.upload_type}</td><td>${r.file_path || ''}</td><td>${r.upload_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const rigRows = rigs.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.rig_type}</td><td>${r.rig_mode}</td><td>${r.holographic_mode}</td><td>${r.facial_capture_mode}</td><td>${r.export_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const holoRows = holo.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.holo_profile_name}</td><td>${r.dimensional_mode}</td><td>${r.projection_mode}</td><td>${r.interaction_mode}</td><td>${r.holo_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const jobRows = jobs.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.workflow_name}</td><td>${r.workflow_type}</td><td>${r.job_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const deployRows = deploy.map(r => `
    <tr><td>${r.id}</td><td>${r.character_name || ''}</td><td>${r.target_name}</td><td>${r.target_type}</td><td>${r.deployment_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Avatar Rig Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="avatar-rig-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Character + Rig Pipeline</div>
            <h1 id="avatar-rig-title">Avatar Rig Control</h1>
            <p>Create open-world characters, intake front and side profile uploads, prepare 3D / 5D-style holographic rigs, and deploy them to metaverse, middleverse, and multiverse targets.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/engine-bridge" class="hero-primary-btn">Engine Bridge</a>
              <a href="/visual-streaming" class="hero-secondary-btn">Visual Streaming</a>
              <a href="/watch" class="hero-secondary-btn">Watch</a>
              <a href="/build" class="hero-secondary-btn">Build</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Avatar Pipeline Purpose', `
          <div class="hero-action-grid">
            ${typeof heroActionCard === 'function' ? heroActionCard('Profile Intake', 'Capture front and side character references for rig workflows.', '/avatar-rig-control') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('3D Rig Prep', 'Prepare character records for humanoid rigging and export.', '/avatar-rig-control') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('5D Holo Prep', 'Prepare holographic rig profiles for immersive character use.', '/avatar-rig-control') : ''}
            ${typeof heroActionCard === 'function' ? heroActionCard('Universe Deployment', 'Track deployment targets across metaverse, middleverse, and multiverse.', '/avatar-rig-control') : ''}
          </div>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Avatar Characters', `
          <table aria-label="Avatar Characters">
            <thead><tr><th>ID</th><th>Heir</th><th>Name</th><th>Type</th><th>Style</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${charRows || '<tr><td colspan="7">No avatar characters yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Profile Uploads', `
          <table aria-label="Avatar Profile Uploads">
            <thead><tr><th>ID</th><th>Character</th><th>Upload Type</th><th>File</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${uploadRows || '<tr><td colspan="6">No uploads yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Rig Profiles', `
          <table aria-label="Avatar Rig Profiles">
            <thead><tr><th>ID</th><th>Character</th><th>Rig Type</th><th>Rig Mode</th><th>Holographic</th><th>Facial Capture</th><th>Export</th><th>Created</th></tr></thead>
            <tbody>${rigRows || '<tr><td colspan="8">No rig profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Holographic Profiles', `
          <table aria-label="Avatar Holographic Profiles">
            <thead><tr><th>ID</th><th>Character</th><th>Name</th><th>Dimension</th><th>Projection</th><th>Interaction</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${holoRows || '<tr><td colspan="8">No holographic profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Workflow Jobs', `
          <table aria-label="Avatar Workflow Jobs">
            <thead><tr><th>ID</th><th>Character</th><th>Name</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${jobRows || '<tr><td colspan="6">No workflow jobs yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Deployment Targets', `
          <table aria-label="Avatar Deployment Targets">
            <thead><tr><th>ID</th><th>Character</th><th>Target</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${deployRows || '<tr><td colspan="6">No deployment targets yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}


function renderWeb3DClientPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, render_mode, control_mode, environment_mode, profile_status, created_at
    FROM web3d_client_profiles
    ORDER BY id DESC
    LIMIT 50
  `);

  const nodes = dbQuery(`
    SELECT id, node_name, node_type, pos_x, pos_y, pos_z, scale_value, node_status, created_at
    FROM web3d_scene_nodes
    ORDER BY id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT id, event_type, event_payload, event_status, created_at
    FROM web3d_runtime_events
    ORDER BY id DESC
    LIMIT 100
  `);

  const profileRows = profiles.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.render_mode}</td><td>${r.control_mode}</td><td>${r.environment_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const nodeRows = nodes.map(r => `
    <tr><td>${r.id}</td><td>${r.node_name}</td><td>${r.node_type}</td><td>${r.pos_x}</td><td>${r.pos_y}</td><td>${r.pos_z}</td><td>${r.scale_value}</td><td>${r.node_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const eventRows = events.map(r => `
    <tr><td>${r.id}</td><td>${r.event_type}</td><td>${r.event_payload || ''}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Web 3D Client', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="web3d-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Rendered Client Layer</div>
            <h1 id="web3d-title">Web 3D World Client</h1>
            <p>This is the first visible rendered world prototype bridge for the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/world3d" class="hero-primary-btn">Open 3D World</a>
              <a href="/world-experience-control" class="hero-secondary-btn">World Experience</a>
              <a href="/engine-bridge" class="hero-secondary-btn">Engine Bridge</a>
              <a href="/avatar-rig-control" class="hero-secondary-btn">Avatar Rig</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Client Profiles', `
          <table aria-label="Web 3D Client Profiles">
            <thead><tr><th>ID</th><th>Name</th><th>Render</th><th>Control</th><th>Environment</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${profileRows || '<tr><td colspan="7">No client profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Scene Nodes', `
          <table aria-label="Web 3D Scene Nodes">
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>X</th><th>Y</th><th>Z</th><th>Scale</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${nodeRows || '<tr><td colspan="9">No scene nodes yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Runtime Events', `
          <table aria-label="Web 3D Runtime Events">
            <thead><tr><th>ID</th><th>Type</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${eventRows || '<tr><td colspan="5">No runtime events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}


function readCesiumToken() {
  try {
    const fs = require('fs');
    const envPath = 'config/cesium.env';
    if (!fs.existsSync(envPath)) return '';
    const raw = fs.readFileSync(envPath, 'utf8');
    const line = raw.split('\n').find(x => x.trim().startsWith('CESIUM_ION_TOKEN='));
    if (!line) return '';
    return line.split('=').slice(1).join('=').trim();
  } catch (e) {
    return '';
  }
}

function renderRealWorldClientPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, engine_name, terrain_mode, imagery_mode, streaming_mode, profile_status, created_at
    FROM realworld_engine_profiles
    ORDER BY id DESC
    LIMIT 50
  `);

  const locations = dbQuery(`
    SELECT id, location_name, longitude, latitude, height, location_type, location_status, created_at
    FROM realworld_locations
    ORDER BY id DESC
    LIMIT 100
  `);

  const profileRows = profiles.map(r => `
    <tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.engine_name}</td><td>${r.terrain_mode}</td><td>${r.imagery_mode}</td><td>${r.streaming_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  const locationRows = locations.map(r => `
    <tr><td>${r.id}</td><td>${r.location_name}</td><td>${r.longitude}</td><td>${r.latitude}</td><td>${r.height}</td><td>${r.location_type}</td><td>${r.location_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Real World Engine', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="realworld-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Geospatial Engine Layer</div>
            <h1 id="realworld-title">Real World Engine</h1>
            <p>This route controls the Earth-scale rendering foundation. It complements your Web 3D world by adding real geospatial terrain and world positioning.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/realworld" class="hero-primary-btn">Open Real World Engine</a>
              <a href="/world3d" class="hero-secondary-btn">Open Web 3D</a>
              <a href="/engine-bridge" class="hero-secondary-btn">Engine Bridge</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Engine Profiles', `
          <table aria-label="Real World Engine Profiles">
            <thead><tr><th>ID</th><th>Name</th><th>Engine</th><th>Terrain</th><th>Imagery</th><th>Streaming</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${profileRows || '<tr><td colspan="8">No real world engine profiles yet.</td></tr>'}</tbody>
          </table>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Anchor Locations', `
          <table aria-label="Real World Locations">
            <thead><tr><th>ID</th><th>Name</th><th>Lon</th><th>Lat</th><th>Height</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${locationRows || '<tr><td colspan="8">No real world locations yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}


function renderRealWorldCityRegistryPage(req, user = null, message = '') {
  const rows = dbQuery(`
    SELECT id, city_name, state_name, region_name, longitude, latitude, height, destination_route, city_status, created_at
    FROM realworld_city_registry
    ORDER BY region_name, state_name, city_name
    LIMIT 300
  `);

  const cityRows = rows.map(r => `
    <tr><td>${r.id}</td><td>${r.city_name}</td><td>${r.state_name || ''}</td><td>${r.region_name || ''}</td><td>${r.longitude}</td><td>${r.latitude}</td><td>${r.height}</td><td>${r.destination_route}</td><td>${r.city_status}</td><td>${r.created_at || ''}</td></tr>
  `).join('');

  return htmlPage('Real World City Registry', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="city-registry-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Dynamic City Expansion</div>
            <h1 id="city-registry-title">Real World City Registry</h1>
            <p>This registry lets the platform grow into a broader Earth-scale location network and makes it easier to add cities later.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/realworld" class="hero-primary-btn">Open Real World Engine</a>
              <a href="/realworld-client" class="hero-secondary-btn">Real World Client</a>
              <a href="/world3d" class="hero-secondary-btn">Web 3D</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('City Registry', `
          <table aria-label="Real World City Registry">
            <thead><tr><th>ID</th><th>City</th><th>State</th><th>Region</th><th>Lon</th><th>Lat</th><th>Height</th><th>Route</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${cityRows || '<tr><td colspan="10">No city rows yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}


function renderPropertyMarketPage(req, user = null, message = '') {
  const parcels = dbQuery(`
    SELECT id, parcel_name, region_name, parcel_type, parcel_status, owner_type, owner_id, parcel_price_cents, created_at
    FROM land_parcels
    ORDER BY id DESC
    LIMIT 100
  `);

  const buildings = dbQuery(`
    SELECT b.id, b.building_name, b.building_type, b.floor_count, b.occupancy_mode, b.building_status, p.parcel_name, b.created_at
    FROM building_registry b
    LEFT JOIN land_parcels p ON p.id = b.parcel_id
    ORDER BY b.id DESC
    LIMIT 100
  `);

  const listings = dbQuery(`
    SELECT l.id, l.listing_name, l.listing_type, l.listing_category, l.price_cents, l.listing_status, b.building_name, p.parcel_name, l.created_at
    FROM property_market_listings l
    LEFT JOIN building_registry b ON b.id = l.building_id
    LEFT JOIN land_parcels p ON p.id = l.parcel_id
    ORDER BY l.id DESC
    LIMIT 100
  `);

  const parcelRows = parcels.map(r => `<tr><td>${r.id}</td><td>${r.parcel_name}</td><td>${r.region_name || ''}</td><td>${r.parcel_type}</td><td>${r.parcel_status}</td><td>${r.owner_type}</td><td>${r.parcel_price_cents}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const buildingRows = buildings.map(r => `<tr><td>${r.id}</td><td>${r.building_name}</td><td>${r.parcel_name || ''}</td><td>${r.building_type}</td><td>${r.floor_count}</td><td>${r.occupancy_mode}</td><td>${r.building_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const listingRows = listings.map(r => `<tr><td>${r.id}</td><td>${r.listing_name}</td><td>${r.building_name || r.parcel_name || ''}</td><td>${r.listing_type}</td><td>${r.listing_category}</td><td>${r.price_cents}</td><td>${r.listing_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Property Market', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="property-market-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Metaverse Real Estate Layer</div>
            <h1 id="property-market-title">Property + Building Marketplace</h1>
            <p>Manage land, buildings, blueprint records, and rental or sale listings for the metaverse economy.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/property-market" class="hero-primary-btn">Property Market</a>
              <a href="/realworld" class="hero-secondary-btn">Real World</a>
              <a href="/world3d" class="hero-secondary-btn">Web 3D</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Land Parcels', `<table aria-label="Land Parcels"><thead><tr><th>ID</th><th>Parcel</th><th>Region</th><th>Type</th><th>Status</th><th>Owner</th><th>Price</th><th>Created</th></tr></thead><tbody>${parcelRows || '<tr><td colspan="8">No parcels yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Building Registry', `<table aria-label="Building Registry"><thead><tr><th>ID</th><th>Building</th><th>Parcel</th><th>Type</th><th>Floors</th><th>Occupancy</th><th>Status</th><th>Created</th></tr></thead><tbody>${buildingRows || '<tr><td colspan="8">No buildings yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Property Listings', `<table aria-label="Property Listings"><thead><tr><th>ID</th><th>Listing</th><th>Target</th><th>Type</th><th>Category</th><th>Price</th><th>Status</th><th>Created</th></tr></thead><tbody>${listingRows || '<tr><td colspan="8">No property listings yet.</td></tr>'}</tbody></table>`) : ''}
      </main>
    </div>
  `, user);
}


function normalizeMissionUnlock(meta) {
  const map = {
    'Explore the Marketplace Hub': ['connect_unlock', 'Marketplace Access', '/connect-system'],
    'Visit the Creator Stage': ['watch_unlock', 'Creator Access', '/watch'],
    'Enter the World Gate': ['engine_unlock', 'Engine Access', '/engine-bridge'],
    'Meet NPC Alpha': ['accessibility_unlock', 'Accessibility Access', '/accessibility'],
    'Meet NPC Beta': ['avatar_unlock', 'Avatar Access', '/avatar-rig-control'],
    'Claim Property Route': ['property_unlock', 'Property Access', '/property-market'],
    'Expand the City Network': ['city_unlock', 'City Access', '/realworld-city-registry']
  };
  return map[meta] || ['world_unlock', meta || 'World Access', '/world-experience-control'];
}


function renderGameplayProgressionPage(req, user = null, message = '') {
  const players = dbQuery(`
    SELECT id, player_name, player_type, xp_points, level_rank, zone_unlocked_count, profile_status, created_at
    FROM player_progress_profiles
    ORDER BY xp_points DESC, level_rank DESC, id DESC
    LIMIT 100
  `);

  const missions = dbQuery(`
    SELECT id, player_name, mission_name, mission_type, completion_status, reward_type, reward_value, created_at
    FROM mission_completion_log
    ORDER BY id DESC
    LIMIT 200
  `);

  const rewards = dbQuery(`
    SELECT id, player_name, reward_type, reward_value, claim_status, created_at
    FROM reward_claim_log
    ORDER BY id DESC
    LIMIT 200
  `);

  const saves = dbQuery(`
    SELECT id, player_name, current_zone, current_city, current_property, mission_focus, save_status, created_at
    FROM world_session_saves
    ORDER BY id DESC
    LIMIT 200
  `);

  const unlocks = dbQuery(`
    SELECT id, unlock_name, unlock_type, unlock_target, unlock_status, created_at
    FROM progression_unlock_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const playerRows = players.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.player_type}</td><td>${r.xp_points}</td><td>${r.level_rank}</td><td>${r.zone_unlocked_count}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const missionRows = missions.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.mission_name}</td><td>${r.mission_type || ''}</td><td>${r.completion_status}</td><td>${r.reward_type || ''}</td><td>${r.reward_value || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const rewardRows = rewards.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.reward_type}</td><td>${r.reward_value || ''}</td><td>${r.claim_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const saveRows = saves.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.current_zone || ''}</td><td>${r.current_city || ''}</td><td>${r.current_property || ''}</td><td>${r.mission_focus || ''}</td><td>${r.save_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const unlockRows = unlocks.map(r => `<tr><td>${r.id}</td><td>${r.unlock_name}</td><td>${r.unlock_type}</td><td>${r.unlock_target}</td><td>${r.unlock_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Gameplay Progression', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="progression-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Persistent Gameplay Layer</div>
            <h1 id="progression-title">Gameplay Progression</h1>
            <p>This page adds persistent progression, mission completion, reward claims, save-state tracking, and unlock routing for the world shell.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/gameplay-progression" class="hero-primary-btn">Gameplay Progression</a>
              <a href="/gameplay-control" class="hero-secondary-btn">Gameplay Control</a>
              <a href="/world3d" class="hero-secondary-btn">Open World</a>
              <a href="/property-market" class="hero-secondary-btn">Property</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Player Progress', `<table aria-label="Player Progress"><thead><tr><th>ID</th><th>Player</th><th>Type</th><th>XP</th><th>Level</th><th>Zones</th><th>Status</th><th>Created</th></tr></thead><tbody>${playerRows || '<tr><td colspan="8">No players yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Mission Completion', `<table aria-label="Mission Completion"><thead><tr><th>ID</th><th>Player</th><th>Mission</th><th>Type</th><th>Status</th><th>Reward Type</th><th>Reward Value</th><th>Created</th></tr></thead><tbody>${missionRows || '<tr><td colspan="8">No mission completions yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Reward Claims', `<table aria-label="Reward Claims"><thead><tr><th>ID</th><th>Player</th><th>Reward Type</th><th>Reward Value</th><th>Status</th><th>Created</th></tr></thead><tbody>${rewardRows || '<tr><td colspan="6">No reward claims yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('World Session Saves', `<table aria-label="World Session Saves"><thead><tr><th>ID</th><th>Player</th><th>Zone</th><th>City</th><th>Property</th><th>Mission Focus</th><th>Status</th><th>Created</th></tr></thead><tbody>${saveRows || '<tr><td colspan="8">No session saves yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Unlock Registry', `<table aria-label="Unlock Registry"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${unlockRows || '<tr><td colspan="6">No unlocks yet.</td></tr>'}</tbody></table>`) : ''}
      </main>
    </div>
  `, user);
}


function renderGameplayAssetsPage(req, user = null, message = '') {
  const inventory = dbQuery(`
    SELECT id, player_name, item_name, item_type, quantity, item_status, created_at
    FROM player_inventory
    ORDER BY id DESC
    LIMIT 200
  `);

  const assets = dbQuery(`
    SELECT id, player_name, asset_name, asset_type, linked_route, asset_status, created_at
    FROM player_owned_assets
    ORDER BY id DESC
    LIMIT 200
  `);

  const claims = dbQuery(`
    SELECT id, player_name, parcel_name, building_name, claim_type, claim_status, created_at
    FROM player_property_claims
    ORDER BY id DESC
    LIMIT 200
  `);

  const badges = dbQuery(`
    SELECT id, player_name, city_name, badge_name, badge_type, badge_status, created_at
    FROM city_progress_badges
    ORDER BY id DESC
    LIMIT 200
  `);

  const inventoryRows = inventory.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.item_name}</td><td>${r.item_type}</td><td>${r.quantity}</td><td>${r.item_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const assetRows = assets.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.asset_name}</td><td>${r.asset_type}</td><td>${r.linked_route}</td><td>${r.asset_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const claimRows = claims.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.parcel_name || ''}</td><td>${r.building_name || ''}</td><td>${r.claim_type}</td><td>${r.claim_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const badgeRows = badges.map(r => `<tr><td>${r.id}</td><td>${r.player_name}</td><td>${r.city_name}</td><td>${r.badge_name}</td><td>${r.badge_type}</td><td>${r.badge_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Gameplay Assets', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="assets-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Ownership + Progress Layer</div>
            <h1 id="assets-title">Gameplay Assets</h1>
            <p>This page adds inventory, owned assets, property claims, and city badges to strengthen the world progression loop.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/gameplay-assets" class="hero-primary-btn">Gameplay Assets</a>
              <a href="/gameplay-progression" class="hero-secondary-btn">Progression</a>
              <a href="/property-market" class="hero-secondary-btn">Property</a>
              <a href="/realworld-city-registry" class="hero-secondary-btn">Cities</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Player Inventory', `<table aria-label="Player Inventory"><thead><tr><th>ID</th><th>Player</th><th>Item</th><th>Type</th><th>Qty</th><th>Status</th><th>Created</th></tr></thead><tbody>${inventoryRows || '<tr><td colspan="7">No inventory yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Owned Assets', `<table aria-label="Owned Assets"><thead><tr><th>ID</th><th>Player</th><th>Asset</th><th>Type</th><th>Route</th><th>Status</th><th>Created</th></tr></thead><tbody>${assetRows || '<tr><td colspan="7">No assets yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Property Claims', `<table aria-label="Property Claims"><thead><tr><th>ID</th><th>Player</th><th>Parcel</th><th>Building</th><th>Claim</th><th>Status</th><th>Created</th></tr></thead><tbody>${claimRows || '<tr><td colspan="7">No property claims yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('City Progress Badges', `<table aria-label="City Progress Badges"><thead><tr><th>ID</th><th>Player</th><th>City</th><th>Badge</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>${badgeRows || '<tr><td colspan="7">No city badges yet.</td></tr>'}</tbody></table>`) : ''}
      </main>
    </div>
  `, user);
}


function renderGameplayActionsPage(req, user = null, message = '') {
  const missions = dbQuery(`
    SELECT id, mission_name, mission_type, reward_type, reward_value, mission_status, created_at
    FROM world_mission_profiles
    ORDER BY id DESC
    LIMIT 100
  `);

  const cities = dbQuery(`
    SELECT id, city_name, state_name, region_name, destination_route, city_status, created_at
    FROM realworld_city_registry
    ORDER BY region_name, state_name, city_name
    LIMIT 200
  `);

  const properties = dbQuery(`
    SELECT b.id, b.building_name, p.parcel_name, b.building_status
    FROM building_registry b
    LEFT JOIN land_parcels p ON p.id = b.parcel_id
    ORDER BY b.id DESC
    LIMIT 200
  `);

  const recentActions = dbQuery(`
    SELECT id, event_type, event_subject, event_payload, event_status, created_at
    FROM world_interaction_events
    ORDER BY id DESC
    LIMIT 100
  `);

  const missionOptions = missions.map(m => `<option value="${m.id}">${m.mission_name}</option>`).join('');
  const cityOptions = cities.map(c => `<option value="${c.city_name}">${c.city_name}, ${c.state_name || ''}</option>`).join('');
  const propertyOptions = properties.map(p => `<option value="${p.building_name}">${p.building_name} (${p.parcel_name || 'No Parcel'})</option>`).join('');
  const actionRows = recentActions.map(r => `<tr><td>${r.id}</td><td>${r.event_type}</td><td>${r.event_subject || ''}</td><td>${r.event_payload || ''}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Gameplay Live Actions', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="live-actions-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Interactive Gameplay Actions</div>
            <h1 id="live-actions-title">Gameplay Live Actions</h1>
            <p>Use live action forms to accept missions, complete missions, claim rewards, claim property, save sessions, and earn city badges.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/gameplay-live-actions" class="hero-primary-btn">Gameplay Live Actions</a>
              <a href="/gameplay-assets" class="hero-secondary-btn">Assets</a>
              <a href="/gameplay-progression" class="hero-secondary-btn">Progression</a>
              <a href="/world3d" class="hero-secondary-btn">Open World</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Mission Actions', `
          <form method="POST" action="/gameplay-actions/mission-complete">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>Mission</label>
            <select name="mission_id" aria-label="Mission">${missionOptions}</select>
            <button type="submit">Complete Mission</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Reward Claim', `
          <form method="POST" action="/gameplay-actions/reward-claim">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>Reward Type</label>
            <input name="reward_type" value="access" aria-label="Reward Type" />
            <label>Reward Value</label>
            <input name="reward_value" value="world_unlock" aria-label="Reward Value" />
            <button type="submit">Claim Reward</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Property Claim', `
          <form method="POST" action="/gameplay-actions/property-claim">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>Building</label>
            <select name="building_name" aria-label="Building">${propertyOptions}</select>
            <button type="submit">Claim Property</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('City Badge', `
          <form method="POST" action="/gameplay-actions/city-badge">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>City</label>
            <select name="city_name" aria-label="City">${cityOptions}</select>
            <button type="submit">Earn City Badge</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Save Session', `
          <form method="POST" action="/gameplay-actions/save-session">
            <label>Player Name</label>
            <input name="player_name" value="Jacobie" aria-label="Player Name" />
            <label>Zone</label>
            <input name="current_zone" value="Marketplace District" aria-label="Current Zone" />
            <label>City</label>
            <input name="current_city" value="Chicago" aria-label="Current City" />
            <label>Property</label>
            <input name="current_property" value="Chicago Tower One" aria-label="Current Property" />
            <label>Mission Focus</label>
            <input name="mission_focus" value="Claim Property Route" aria-label="Mission Focus" />
            <button type="submit">Save Session</button>
          </form>
        `) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Recent Gameplay Events', `
          <table aria-label="Recent Gameplay Events">
            <thead><tr><th>ID</th><th>Type</th><th>Subject</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${actionRows || '<tr><td colspan="6">No recent events yet.</td></tr>'}</tbody>
          </table>
        `) : ''}
      </main>
    </div>
  `, user);
}


function renderFomoEnginePage(req, user = null) {
  const drops = dbQuery(`SELECT * FROM fomo_drop_registry ORDER BY id DESC LIMIT 50`);
  const items = dbQuery(`SELECT * FROM limited_item_supply ORDER BY id DESC LIMIT 50`);
  const sales = dbQuery(`SELECT * FROM flash_sale_events ORDER BY id DESC LIMIT 50`);
  const activity = dbQuery(`SELECT * FROM purchase_activity_log ORDER BY id DESC LIMIT 100`);

  const dropRows = drops.map(r => `<tr><td>${r.id}</td><td>${r.drop_name}</td><td>${r.drop_type}</td><td>${r.drop_status}</td></tr>`).join('');
  const itemRows = items.map(r => `<tr><td>${r.id}</td><td>${r.item_name}</td><td>${r.remaining_supply}/${r.total_supply}</td><td>${r.price_cents}</td></tr>`).join('');
  const saleRows = sales.map(r => `<tr><td>${r.id}</td><td>${r.event_name}</td><td>${r.discount_percent}%</td></tr>`).join('');
  const activityRows = activity.map(r => `<tr><td>${r.item_name}</td><td>${r.action_type}</td><td>${r.created_at}</td></tr>`).join('');

  return htmlPage('FOMO Engine', `
    <main class="portal-main">
      <h1>FOMO Engine</h1>

      <h2>Drops</h2>
      <table><tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th></tr>${dropRows}</table>

      <h2>Limited Items</h2>
      <table><tr><th>ID</th><th>Name</th><th>Supply</th><th>Price</th></tr>${itemRows}</table>

      <h2>Flash Sales</h2>
      <table><tr><th>ID</th><th>Name</th><th>Discount</th></tr>${saleRows}</table>

      <h2>Live Activity</h2>
      <table><tr><th>Item</th><th>Action</th><th>Time</th></tr>${activityRows}</table>
    </main>
  `, user);
}


function renderInternationalExpansionPage(req, user = null, message = '') {
  const countries = dbQuery(`
    SELECT id, country_name, region_name, expansion_priority, linked_route, country_status, created_at
    FROM global_country_registry
    ORDER BY region_name, country_name
    LIMIT 300
  `);

  const states = dbQuery(`
    SELECT id, state_name, region_name, expansion_priority, linked_route, state_status, created_at
    FROM usa_state_registry
    ORDER BY region_name, state_name
    LIMIT 300
  `);

  const strategies = dbQuery(`
    SELECT id, territory_name, territory_type, strategy_name, revenue_focus, priority_status, created_at
    FROM region_expansion_strategy
    ORDER BY id DESC
    LIMIT 300
  `);

  const countryRows = countries.map(r => `<tr><td>${r.id}</td><td>${r.country_name}</td><td>${r.region_name || ''}</td><td>${r.expansion_priority}</td><td>${r.linked_route || ''}</td><td>${r.country_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const stateRows = states.map(r => `<tr><td>${r.id}</td><td>${r.state_name}</td><td>${r.region_name || ''}</td><td>${r.expansion_priority}</td><td>${r.linked_route || ''}</td><td>${r.state_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const strategyRows = strategies.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type}</td><td>${r.strategy_name || ''}</td><td>${r.revenue_focus || ''}</td><td>${r.priority_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('International Expansion', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="international-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Global Expansion Layer</div>
            <h1 id="international-title">International Expansion Registry</h1>
            <p>Add and manage countries, US states, and region revenue strategies for metaverse, middleverse, and multiverse growth.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/international-expansion" class="hero-primary-btn">International Expansion</a>
              <a href="/realworld" class="hero-secondary-btn">Real World</a>
              <a href="/realworld-city-registry" class="hero-secondary-btn">City Registry</a>
              <a href="/world-selector" class="hero-secondary-btn">World Selector</a>
            </div>
          </div>
        </section>

        ${typeof premiumSection === 'function' ? premiumSection('Countries', `<table aria-label="Countries"><thead><tr><th>ID</th><th>Country</th><th>Region</th><th>Priority</th><th>Route</th><th>Status</th><th>Created</th></tr></thead><tbody>${countryRows || '<tr><td colspan="7">No countries yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('US States', `<table aria-label="US States"><thead><tr><th>ID</th><th>State</th><th>Region</th><th>Priority</th><th>Route</th><th>Status</th><th>Created</th></tr></thead><tbody>${stateRows || '<tr><td colspan="7">No states yet.</td></tr>'}</tbody></table>`) : ''}

        ${typeof premiumSection === 'function' ? premiumSection('Expansion Strategies', `<table aria-label="Expansion Strategies"><thead><tr><th>ID</th><th>Territory</th><th>Type</th><th>Strategy</th><th>Revenue Focus</th><th>Status</th><th>Created</th></tr></thead><tbody>${strategyRows || '<tr><td colspan="7">No strategies yet.</td></tr>'}</tbody></table>`) : ''}
      </main>
    </div>
  `, user);
}


function renderTerritoryActivationPage(req, user = null, message = '') {
  const territories = dbQuery(`
    SELECT id, territory_name, territory_type, region, launch_phase, monetization_focus, priority_level, activation_status, created_at
    FROM territory_registry
    ORDER BY territory_type, region, territory_name
    LIMIT 500
  `);

  const activationLog = dbQuery(`
    SELECT id, territory_name, territory_type, previous_phase, new_phase, previous_status, new_status, activation_notes, created_at
    FROM territory_activation_log
    ORDER BY id DESC
    LIMIT 200
  `);

  const profiles = dbQuery(`
    SELECT id, profile_name, rollout_mode, territory_scope, monetization_mode, profile_status, created_at
    FROM rollout_control_profiles
    ORDER BY id DESC
    LIMIT 50
  `);

  const territoryOptions = territories.map(t => `<option value="${t.id}">${t.territory_name} (${t.territory_type})</option>`).join('');
  const territoryRows = territories.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type}</td><td>${r.region || ''}</td><td>${r.launch_phase}</td><td>${r.monetization_focus || ''}</td><td>${r.priority_level}</td><td>${r.activation_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const logRows = activationLog.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type || ''}</td><td>${r.previous_phase || ''}</td><td>${r.new_phase || ''}</td><td>${r.previous_status || ''}</td><td>${r.new_status || ''}</td><td>${r.activation_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const profileRows = profiles.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.rollout_mode}</td><td>${r.territory_scope}</td><td>${r.monetization_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Territory Activation Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="territory-activation-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Time Machine Rollout Control</div>
            <h1 id="territory-activation-title">Territory Activation Control</h1>
            <p>Move territories through future, launch, live, and archived phases while keeping a full activation history.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/territory-activation" class="hero-primary-btn">Territory Activation</a>
              <a href="/international-expansion" class="hero-secondary-btn">International</a>
              <a href="/world-selector" class="hero-secondary-btn">World Selector</a>
              <a href="/realworld" class="hero-secondary-btn">Realworld</a>
            </div>
          </div>
        </section>

        <section>
          <form method="POST" action="/territory-activation/update">
            <label>Territory</label>
            <select name="territory_id" aria-label="Territory">${territoryOptions}</select>

            <label>New Phase</label>
            <select name="new_phase" aria-label="New Phase">
              <option value="future">future</option>
              <option value="launch">launch</option>
              <option value="live">live</option>
              <option value="archived">archived</option>
            </select>

            <label>New Status</label>
            <select name="new_status" aria-label="New Status">
              <option value="inactive">inactive</option>
              <option value="launch_ready">launch_ready</option>
              <option value="active">active</option>
              <option value="archived">archived</option>
            </select>

            <label>Notes</label>
            <input name="activation_notes" value="territory rollout update" aria-label="Activation Notes" />

            <button type="submit">Update Territory</button>
          </form>
        </section>

        <section><table aria-label="Rollout Control Profiles"><thead><tr><th>ID</th><th>Name</th><th>Mode</th><th>Scope</th><th>Monetization</th><th>Status</th><th>Created</th></tr></thead><tbody>${profileRows || '<tr><td colspan="7">No rollout profiles yet.</td></tr>'}</tbody></table></section>

        <section><table aria-label="Territories"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Region</th><th>Phase</th><th>Monetization</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>${territoryRows || '<tr><td colspan="9">No territories yet.</td></tr>'}</tbody></table></section>

        <section><table aria-label="Territory Activation Log"><thead><tr><th>ID</th><th>Territory</th><th>Type</th><th>Prev Phase</th><th>New Phase</th><th>Prev Status</th><th>New Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${logRows || '<tr><td colspan="9">No activation events yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderTerritoryBridgePage(req, user = null, message = '') {
  const bridgeRowsData = dbQuery(`
    SELECT id, territory_name, territory_type, creator_market_enabled, property_market_enabled, premium_world_enabled, monetization_status, rollout_notes, created_at
    FROM territory_monetization_bridge
    ORDER BY id DESC
    LIMIT 300
  `);

  const summaryRowsData = dbQuery(`
    SELECT id, territory_name, territory_type, current_phase, activation_status, monetization_status, summary_notes, created_at
    FROM territory_activation_summary
    ORDER BY id DESC
    LIMIT 300
  `);

  const bridgeRows = bridgeRowsData.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type || ''}</td><td>${r.creator_market_enabled}</td><td>${r.property_market_enabled}</td><td>${r.premium_world_enabled}</td><td>${r.monetization_status}</td><td>${r.rollout_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const summaryRows = summaryRowsData.map(r => `<tr><td>${r.id}</td><td>${r.territory_name}</td><td>${r.territory_type || ''}</td><td>${r.current_phase || ''}</td><td>${r.activation_status || ''}</td><td>${r.monetization_status || ''}</td><td>${r.summary_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Territory Monetization Bridge', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="territory-bridge-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Territory Rollout + Monetization Bridge</div>
            <h1 id="territory-bridge-title">Territory Monetization Bridge</h1>
            <p>See which territories are ready for creator marketplace, property market, and premium world activation, and how rollout phase connects to revenue planning.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/territory-bridge" class="hero-primary-btn">Territory Bridge</a>
              <a href="/territory-activation" class="hero-secondary-btn">Territory Activation</a>
              <a href="/international-expansion" class="hero-secondary-btn">International</a>
              <a href="/world-selector" class="hero-secondary-btn">World Selector</a>
            </div>
          </div>
        </section>

        <section><table aria-label="Territory Monetization Bridge"><thead><tr><th>ID</th><th>Territory</th><th>Type</th><th>Creator</th><th>Property</th><th>Premium</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${bridgeRows || '<tr><td colspan="9">No territory bridge rows yet.</td></tr>'}</tbody></table></section>

        <section><table aria-label="Territory Activation Summary"><thead><tr><th>ID</th><th>Territory</th><th>Type</th><th>Phase</th><th>Activation</th><th>Monetization</th><th>Notes</th><th>Created</th></tr></thead><tbody>${summaryRows || '<tr><td colspan="8">No activation summaries yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderWorldEraMobilityPage(req, user = null, message = '') {
  const eras = dbQuery(`
    SELECT id, era_name, era_type, era_status, description, created_at
    FROM world_era_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const snapshots = dbQuery(`
    SELECT id, snapshot_name, linked_era, territory_name, snapshot_status, snapshot_notes, created_at
    FROM world_snapshot_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const mobility = dbQuery(`
    SELECT id, mobility_name, mobility_type, era_scope, territory_scope, mobility_status, created_at
    FROM mobility_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const routes = dbQuery(`
    SELECT id, route_name, route_type, start_point, end_point, linked_mobility_type, era_scope, route_status, created_at
    FROM route_network_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const eraRows = eras.map(r => `<tr><td>${r.id}</td><td>${r.era_name}</td><td>${r.era_type}</td><td>${r.era_status}</td><td>${r.description || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const snapshotRows = snapshots.map(r => `<tr><td>${r.id}</td><td>${r.snapshot_name}</td><td>${r.linked_era}</td><td>${r.territory_name || ''}</td><td>${r.snapshot_status}</td><td>${r.snapshot_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const mobilityRows = mobility.map(r => `<tr><td>${r.id}</td><td>${r.mobility_name}</td><td>${r.mobility_type}</td><td>${r.era_scope}</td><td>${r.territory_scope}</td><td>${r.mobility_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const routeRows = routes.map(r => `<tr><td>${r.id}</td><td>${r.route_name}</td><td>${r.route_type}</td><td>${r.start_point || ''}</td><td>${r.end_point || ''}</td><td>${r.linked_mobility_type || ''}</td><td>${r.era_scope}</td><td>${r.route_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('World Era + Mobility', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="world-era-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Time Machine World Layer</div>
            <h1 id="world-era-title">World Era + Mobility Control</h1>
            <p>Manage past, present, and future worlds, saved world snapshots, and movement systems like cars, boats, planes, flying vehicles, and horses.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/world-era-mobility" class="hero-primary-btn">World Era + Mobility</a>
              <a href="/territory-bridge" class="hero-secondary-btn">Territory Bridge</a>
              <a href="/realworld" class="hero-secondary-btn">Realworld</a>
              <a href="/world3d" class="hero-secondary-btn">World3D</a>
            </div>
          </div>
        </section>

        <section><table aria-label="World Eras"><thead><tr><th>ID</th><th>Era</th><th>Type</th><th>Status</th><th>Description</th><th>Created</th></tr></thead><tbody>${eraRows || '<tr><td colspan="6">No eras yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="World Snapshots"><thead><tr><th>ID</th><th>Snapshot</th><th>Era</th><th>Territory</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${snapshotRows || '<tr><td colspan="7">No snapshots yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Mobility Registry"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Era</th><th>Territory</th><th>Status</th><th>Created</th></tr></thead><tbody>${mobilityRows || '<tr><td colspan="7">No mobility rows yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Route Network Registry"><thead><tr><th>ID</th><th>Route</th><th>Type</th><th>Start</th><th>End</th><th>Mobility</th><th>Era</th><th>Status</th><th>Created</th></tr></thead><tbody>${routeRows || '<tr><td colspan="9">No routes yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderRevenueEnginePage(req, user = null) {
  const activity = dbQuery(`
    SELECT activity_text, created_at
    FROM live_activity_feed
    ORDER BY id DESC
    LIMIT 50
  `);

  const rows = activity.map(r =>
    `<tr><td>${r.activity_text}</td><td>${r.created_at || ''}</td></tr>`
  ).join('');

  return htmlPage('Revenue Engine', `
    <main class="portal-main">
      <h1>Live Revenue Engine</h1>
      <p>Real-time activity + monetization simulation layer</p>

      <table>
        <tr><th>Activity</th><th>Time</th></tr>
        ${rows || '<tr><td colspan="2">No activity yet</td></tr>'}
      </table>
    </main>
  `, user);
}


function renderPlatformAnalyticsPage(req, user = null, message = '') {
  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM platform_usage_metrics
    ORDER BY id DESC
    LIMIT 100
  `);

  const sessions = dbQuery(`
    SELECT id, username, session_type, territory_name, world_name, session_status, created_at
    FROM platform_user_sessions
    ORDER BY id DESC
    LIMIT 200
  `);

  const activity = dbQuery(`
    SELECT id, username, route_name, activity_type, territory_name, world_name, created_at
    FROM platform_user_activity
    ORDER BY id DESC
    LIMIT 200
  `);

  const presence = dbQuery(`
    SELECT id, username, territory_name, world_name, presence_type, presence_status, created_at
    FROM holoverse_presence
    ORDER BY id DESC
    LIMIT 200
  `);

  const metricRows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const sessionRows = sessions.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.session_type}</td><td>${r.territory_name}</td><td>${r.world_name}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const activityRows = activity.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.route_name || ''}</td><td>${r.activity_type}</td><td>${r.territory_name}</td><td>${r.world_name}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const presenceRows = presence.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.territory_name}</td><td>${r.world_name}</td><td>${r.presence_type}</td><td>${r.presence_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Platform Analytics', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="platform-analytics-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Usage Intelligence</div>
            <h1 id="platform-analytics-title">Platform Analytics</h1>
            <p>Track sessions, activity, usage metrics, and holoverse presence across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Usage Metrics"><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${metricRows || '<tr><td colspan="5">No metrics yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="User Sessions"><thead><tr><th>ID</th><th>User</th><th>Type</th><th>Territory</th><th>World</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="7">No sessions yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="User Activity"><thead><tr><th>ID</th><th>User</th><th>Route</th><th>Type</th><th>Territory</th><th>World</th><th>Created</th></tr></thead><tbody>${activityRows || '<tr><td colspan="7">No activity yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Holoverse Presence"><thead><tr><th>ID</th><th>User</th><th>Territory</th><th>World</th><th>Presence</th><th>Status</th><th>Created</th></tr></thead><tbody>${presenceRows || '<tr><td colspan="7">No presence yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderHoloGptControlPage(req, user = null, message = '') {
  const sessions = dbQuery(`
    SELECT id, username, interface_mode, session_status, created_at
    FROM holo_gpt_sessions
    ORDER BY id DESC
    LIMIT 200
  `);

  const events = dbQuery(`
    SELECT id, username, event_type, event_payload, event_status, created_at
    FROM holo_gpt_events
    ORDER BY id DESC
    LIMIT 200
  `);

  const sessionRows = sessions.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.interface_mode}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.event_type}</td><td>${r.event_payload || ''}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Holo GPT Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="hologpt-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Holoverse Assistant Layer</div>
            <h1 id="hologpt-title">Holo GPT Control</h1>
            <p>Track holographic assistant sessions, prompts, events, and interface usage.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Holo GPT Sessions"><thead><tr><th>ID</th><th>User</th><th>Mode</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="5">No holo sessions yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Holo GPT Events"><thead><tr><th>ID</th><th>User</th><th>Event</th><th>Payload</th><th>Status</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="6">No holo events yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderTransactionEnginePage(req, user = null, message = '') {
  const txs = dbQuery(`
    SELECT id, transaction_ref, username, creator_name, item_name, gross_amount_cents, platform_fee_cents, seller_net_cents, transaction_status, created_at
    FROM transaction_engine
    ORDER BY id DESC
    LIMIT 200
  `);

  const payouts = dbQuery(`
    SELECT id, creator_name, source_transaction_id, payout_amount_cents, payout_method, payout_status, created_at
    FROM payout_queue
    ORDER BY id DESC
    LIMIT 200
  `);

  const runs = dbQuery(`
    SELECT id, payout_run_name, total_payouts, total_amount_cents, run_status, created_at
    FROM payout_runs
    ORDER BY id DESC
    LIMIT 100
  `);

  const txRows = txs.map(r => `<tr><td>${r.id}</td><td>${r.transaction_ref || ''}</td><td>${r.username || ''}</td><td>${r.creator_name || ''}</td><td>${r.item_name || ''}</td><td>${r.gross_amount_cents}</td><td>${r.platform_fee_cents}</td><td>${r.seller_net_cents}</td><td>${r.transaction_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const payoutRows = payouts.map(r => `<tr><td>${r.id}</td><td>${r.creator_name || ''}</td><td>${r.source_transaction_id || ''}</td><td>${r.payout_amount_cents}</td><td>${r.payout_method}</td><td>${r.payout_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const runRows = runs.map(r => `<tr><td>${r.id}</td><td>${r.payout_run_name || ''}</td><td>${r.total_payouts}</td><td>${r.total_amount_cents}</td><td>${r.run_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Transaction Engine', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="transaction-engine-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Money Flow Core</div>
            <h1 id="transaction-engine-title">Transaction Engine</h1>
            <p>Track transactions, payouts, platform fees, and payout runs across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Transactions"><thead><tr><th>ID</th><th>Ref</th><th>User</th><th>Creator</th><th>Item</th><th>Gross</th><th>Fee</th><th>Net</th><th>Status</th><th>Created</th></tr></thead><tbody>${txRows || '<tr><td colspan="10">No transactions yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Payout Queue"><thead><tr><th>ID</th><th>Creator</th><th>Tx ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Created</th></tr></thead><tbody>${payoutRows || '<tr><td colspan="7">No payouts yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Payout Runs"><thead><tr><th>ID</th><th>Run</th><th>Total Payouts</th><th>Total Amount</th><th>Status</th><th>Created</th></tr></thead><tbody>${runRows || '<tr><td colspan="6">No payout runs yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderScalingControlPage(req, user = null, message = '') {
  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM scaling_metrics
    ORDER BY id DESC
    LIMIT 200
  `);

  const metricRows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Scaling Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="scaling-control-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Growth Loop Metrics</div>
            <h1 id="scaling-control-title">Scaling Control</h1>
            <p>Track transaction volume, payout volume, fee capture, and system monetization growth signals.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Scaling Metrics"><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${metricRows || '<tr><td colspan="5">No scaling metrics yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderAssetLibraryPage(req, user = null, message = '') {
  const assets = dbQuery(`
    SELECT id, asset_name, asset_type, asset_category, file_path, mime_type, linked_world, linked_territory, creator_name, asset_status, created_at
    FROM asset_library
    ORDER BY id DESC
    LIMIT 300
  `);

  const usage = dbQuery(`
    SELECT id, asset_name, usage_type, linked_route, linked_system, usage_status, created_at
    FROM asset_usage_map
    ORDER BY id DESC
    LIMIT 300
  `);

  const queue = dbQuery(`
    SELECT id, asset_name, asset_type, target_folder, ingest_status, ingest_notes, created_at
    FROM asset_ingest_queue
    ORDER BY id DESC
    LIMIT 100
  `);

  const assetRows = assets.map(r => `<tr><td>${r.id}</td><td>${r.asset_name}</td><td>${r.asset_type}</td><td>${r.asset_category || ''}</td><td>${r.file_path || ''}</td><td>${r.mime_type || ''}</td><td>${r.linked_world || ''}</td><td>${r.linked_territory || ''}</td><td>${r.creator_name || ''}</td><td>${r.asset_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const usageRows = usage.map(r => `<tr><td>${r.id}</td><td>${r.asset_name}</td><td>${r.usage_type}</td><td>${r.linked_route || ''}</td><td>${r.linked_system || ''}</td><td>${r.usage_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const queueRows = queue.map(r => `<tr><td>${r.id}</td><td>${r.asset_name || ''}</td><td>${r.asset_type || ''}</td><td>${r.target_folder || ''}</td><td>${r.ingest_status}</td><td>${r.ingest_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Asset Library', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="asset-library-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Universal Media + Document Layer</div>
            <h1 id="asset-library-title">Asset Library</h1>
            <p>Manage images, video, music, documents, and other uploaded assets across worlds, territories, creator systems, and holoverse experiences.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/asset-library" class="hero-primary-btn">Asset Library</a>
              <a href="/platform-analytics" class="hero-secondary-btn">Analytics</a>
              <a href="/creator-marketplace" class="hero-secondary-btn">Marketplace</a>
              <a href="/world3d" class="hero-secondary-btn">World3D</a>
            </div>
          </div>
        </section>

        <section><table aria-label="Asset Library"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Category</th><th>Path</th><th>MIME</th><th>World</th><th>Territory</th><th>Creator</th><th>Status</th><th>Created</th></tr></thead><tbody>${assetRows || '<tr><td colspan="11">No assets yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Asset Usage Map"><thead><tr><th>ID</th><th>Asset</th><th>Usage</th><th>Route</th><th>System</th><th>Status</th><th>Created</th></tr></thead><tbody>${usageRows || '<tr><td colspan="7">No usage rows yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Asset Ingest Queue"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Folder</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${queueRows || '<tr><td colspan="7">No ingest queue rows yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderAssetGapAuditPage(req, user = null, message = '') {
  const gaps = dbQuery(`
    SELECT id, gap_name, gap_group, priority_level, linked_system, fix_status, created_at
    FROM asset_gap_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const gapRows = gaps.map(r => `<tr><td>${r.id}</td><td>${r.gap_name}</td><td>${r.gap_group}</td><td>${r.priority_level}</td><td>${r.linked_system || ''}</td><td>${r.fix_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Asset Gap Audit', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="asset-gap-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Asset Completion Audit</div>
            <h1 id="asset-gap-title">Asset Gap Audit</h1>
            <p>Track what is still missing for media, documents, creator asset flow, previews, and live world asset use.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Asset Gap Audit"><thead><tr><th>ID</th><th>Gap</th><th>Group</th><th>Priority</th><th>System</th><th>Status</th><th>Created</th></tr></thead><tbody>${gapRows || '<tr><td colspan="7">No asset gaps yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderSystemConfigPage(req, user = null, message = '') {
  const configs = dbQuery(`
    SELECT id, config_name, config_value, config_group, config_status, created_at
    FROM system_config_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const roles = dbQuery(`
    SELECT id, username, role_name, role_scope, role_status, created_at
    FROM admin_role_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const configRows = configs.map(r => `<tr><td>${r.id}</td><td>${r.config_name}</td><td>${r.config_value || ''}</td><td>${r.config_group}</td><td>${r.config_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const roleRows = roles.map(r => `<tr><td>${r.id}</td><td>${r.username || ''}</td><td>${r.role_name}</td><td>${r.role_scope}</td><td>${r.role_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('System Config', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="system-config-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Platform Hardening</div>
            <h1 id="system-config-title">System Config + Roles</h1>
            <p>Track feature flags, rollout settings, payout mode, analytics mode, upload mode, and user roles.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="System Config"><thead><tr><th>ID</th><th>Name</th><th>Value</th><th>Group</th><th>Status</th><th>Created</th></tr></thead><tbody>${configRows || '<tr><td colspan="6">No configs yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Admin Role Registry"><thead><tr><th>ID</th><th>User</th><th>Role</th><th>Scope</th><th>Status</th><th>Created</th></tr></thead><tbody>${roleRows || '<tr><td colspan="6">No roles yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderUploadControlPage(req, user = null, message = '') {
  const policies = dbQuery(`
    SELECT id, asset_type, allowed_extensions, max_size_mb, target_folder, policy_status, created_at
    FROM upload_policy_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const events = dbQuery(`
    SELECT id, filename, asset_type, uploader_name, upload_status, upload_notes, created_at
    FROM upload_event_log
    ORDER BY id DESC
    LIMIT 200
  `);

  const backups = dbQuery(`
    SELECT id, backup_name, backup_type, backup_path, backup_status, created_at
    FROM backup_registry
    ORDER BY id DESC
    LIMIT 100
  `);

  const policyRows = policies.map(r => `<tr><td>${r.id}</td><td>${r.asset_type}</td><td>${r.allowed_extensions || ''}</td><td>${r.max_size_mb}</td><td>${r.target_folder || ''}</td><td>${r.policy_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${r.filename || ''}</td><td>${r.asset_type}</td><td>${r.uploader_name || ''}</td><td>${r.upload_status}</td><td>${r.upload_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const backupRows = backups.map(r => `<tr><td>${r.id}</td><td>${r.backup_name}</td><td>${r.backup_type}</td><td>${r.backup_path || ''}</td><td>${r.backup_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Upload + Backup Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="upload-control-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Upload + Recovery Layer</div>
            <h1 id="upload-control-title">Upload + Backup Control</h1>
            <p>Track upload policies, upload events, and backup history across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Upload Policies"><thead><tr><th>ID</th><th>Type</th><th>Extensions</th><th>Max MB</th><th>Folder</th><th>Status</th><th>Created</th></tr></thead><tbody>${policyRows || '<tr><td colspan="7">No upload policies yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Upload Event Log"><thead><tr><th>ID</th><th>Filename</th><th>Type</th><th>Uploader</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="7">No upload events yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Backup Registry"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Path</th><th>Status</th><th>Created</th></tr></thead><tbody>${backupRows || '<tr><td colspan="6">No backups yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderHoloSearchPage(req, user = null, message = '') {
  const indexRowsData = dbQuery(`
    SELECT id, source_type, source_name, source_route, source_group, search_keywords, search_summary, index_status, created_at
    FROM holo_search_index
    ORDER BY id DESC
    LIMIT 300
  `);

  const queryRowsData = dbQuery(`
    SELECT id, query_text, username, query_scope, result_count, query_status, created_at
    FROM holo_search_queries
    ORDER BY id DESC
    LIMIT 200
  `);

  const cacheRowsData = dbQuery(`
    SELECT id, query_text, matched_source_name, matched_route, matched_group, cache_status, created_at
    FROM holo_search_result_cache
    ORDER BY id DESC
    LIMIT 300
  `);

  const indexRows = indexRowsData.map(r => `<tr><td>${r.id}</td><td>${r.source_type}</td><td>${r.source_name}</td><td>${r.source_route || ''}</td><td>${r.source_group}</td><td>${r.search_keywords || ''}</td><td>${r.search_summary || ''}</td><td>${r.index_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const queryRows = queryRowsData.map(r => `<tr><td>${r.id}</td><td>${r.query_text}</td><td>${r.username || ''}</td><td>${r.query_scope}</td><td>${r.result_count}</td><td>${r.query_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const cacheRows = cacheRowsData.map(r => `<tr><td>${r.id}</td><td>${r.query_text}</td><td>${r.matched_source_name || ''}</td><td>${r.matched_route || ''}</td><td>${r.matched_group || ''}</td><td>${r.cache_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Holo Search', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="holo-search-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Holographic Search Layer</div>
            <h1 id="holo-search-title">Holo Search Engine</h1>
            <p>Search routes, systems, worlds, assets, analytics, and business layers across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/holo-search" class="hero-primary-btn">Holo Search</a>
              <a href="/platform-gap-audit" class="hero-secondary-btn">Gap Audit</a>
              <a href="/asset-library" class="hero-secondary-btn">Assets</a>
              <a href="/platform-analytics" class="hero-secondary-btn">Analytics</a>
            </div>
          </div>
        </section>

        <section><table aria-label="Search Index"><thead><tr><th>ID</th><th>Type</th><th>Name</th><th>Route</th><th>Group</th><th>Keywords</th><th>Summary</th><th>Status</th><th>Created</th></tr></thead><tbody>${indexRows || '<tr><td colspan="9">No search index rows yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Search Queries"><thead><tr><th>ID</th><th>Query</th><th>User</th><th>Scope</th><th>Results</th><th>Status</th><th>Created</th></tr></thead><tbody>${queryRows || '<tr><td colspan="7">No search queries yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Search Result Cache"><thead><tr><th>ID</th><th>Query</th><th>Matched Name</th><th>Route</th><th>Group</th><th>Status</th><th>Created</th></tr></thead><tbody>${cacheRows || '<tr><td colspan="7">No search cache rows yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderPlatformGapAuditPage(req, user = null, message = '') {
  const gaps = dbQuery(`
    SELECT id, gap_name, gap_group, priority_level, linked_route, gap_status, created_at
    FROM platform_gap_registry
    ORDER BY id DESC
    LIMIT 300
  `);

  const gapRows = gaps.map(r => `<tr><td>${r.id}</td><td>${r.gap_name}</td><td>${r.gap_group}</td><td>${r.priority_level}</td><td>${r.linked_route || ''}</td><td>${r.gap_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Platform Gap Audit', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="platform-gap-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Completion Audit</div>
            <h1 id="platform-gap-title">Platform Gap Audit</h1>
            <p>Track the most important remaining platform gaps, their priority, and where they connect.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Platform Gap Audit"><thead><tr><th>ID</th><th>Gap</th><th>Group</th><th>Priority</th><th>Route</th><th>Status</th><th>Created</th></tr></thead><tbody>${gapRows || '<tr><td colspan="7">No platform gaps yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderQuantumAcceleratorPage(req, user = null, message = '') {
  const caches = dbQuery(`
    SELECT id, cache_name, cache_scope, cache_key, cache_status, refresh_strategy, created_at
    FROM quantum_cache_registry
    ORDER BY id DESC
    LIMIT 200
  `);

  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM acceleration_metrics
    ORDER BY id DESC
    LIMIT 100
  `);

  const cacheRows = caches.map(r => `<tr><td>${r.id}</td><td>${r.cache_name}</td><td>${r.cache_scope}</td><td>${r.cache_key || ''}</td><td>${r.cache_status}</td><td>${r.refresh_strategy}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const metricRows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Quantum Accelerator', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="quantum-accelerator-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Acceleration Layer</div>
            <h1 id="quantum-accelerator-title">Quantum Speed Accelerator</h1>
            <p>Track warm caches, refresh strategies, and acceleration metrics across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
            <div class="premium-cta-row">
              <a href="/quantum-accelerator" class="hero-primary-btn">Quantum Accelerator</a>
              <a href="/orchestration-control" class="hero-secondary-btn">Orchestration</a>
              <a href="/holo-search" class="hero-secondary-btn">Holo Search</a>
              <a href="/platform-analytics" class="hero-secondary-btn">Analytics</a>
            </div>
          </div>
        </section>

        <section><table aria-label="Quantum Cache Registry"><thead><tr><th>ID</th><th>Name</th><th>Scope</th><th>Key</th><th>Status</th><th>Refresh</th><th>Created</th></tr></thead><tbody>${cacheRows || '<tr><td colspan="7">No cache rows yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Acceleration Metrics"><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${metricRows || '<tr><td colspan="5">No metrics yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderOrchestrationControlPage(req, user = null, message = '') {
  const jobs = dbQuery(`
    SELECT id, job_name, job_group, priority_level, linked_route, execution_status, execution_notes, created_at
    FROM orchestration_job_queue
    ORDER BY id DESC
    LIMIT 200
  `);

  const recs = dbQuery(`
    SELECT id, recommendation_name, recommendation_group, target_system, target_route, recommendation_priority, recommendation_status, created_at
    FROM recommendation_queue
    ORDER BY id DESC
    LIMIT 200
  `);

  const links = dbQuery(`
    SELECT id, source_system, target_system, link_type, link_strength, link_status, created_at
    FROM cross_system_link_map
    ORDER BY id DESC
    LIMIT 200
  `);

  const jobRows = jobs.map(r => `<tr><td>${r.id}</td><td>${r.job_name}</td><td>${r.job_group}</td><td>${r.priority_level}</td><td>${r.linked_route || ''}</td><td>${r.execution_status}</td><td>${r.execution_notes || ''}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const recRows = recs.map(r => `<tr><td>${r.id}</td><td>${r.recommendation_name}</td><td>${r.recommendation_group}</td><td>${r.target_system || ''}</td><td>${r.target_route || ''}</td><td>${r.recommendation_priority}</td><td>${r.recommendation_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const linkRows = links.map(r => `<tr><td>${r.id}</td><td>${r.source_system}</td><td>${r.target_system}</td><td>${r.link_type}</td><td>${r.link_strength}</td><td>${r.link_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Orchestration Control', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="orchestration-control-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Googleplex-Scale Coordination Layer</div>
            <h1 id="orchestration-control-title">Orchestration Control</h1>
            <p>Track priority jobs, next-best recommendations, and cross-system links across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="Orchestration Job Queue"><thead><tr><th>ID</th><th>Job</th><th>Group</th><th>Priority</th><th>Route</th><th>Status</th><th>Notes</th><th>Created</th></tr></thead><tbody>${jobRows || '<tr><td colspan="8">No jobs yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Recommendation Queue"><thead><tr><th>ID</th><th>Recommendation</th><th>Group</th><th>Target System</th><th>Route</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>${recRows || '<tr><td colspan="8">No recommendations yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="Cross System Link Map"><thead><tr><th>ID</th><th>Source</th><th>Target</th><th>Type</th><th>Strength</th><th>Status</th><th>Created</th></tr></thead><tbody>${linkRows || '<tr><td colspan="7">No links yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderQuantumMailPage(req, user = null, message = '') {
  const accounts = dbQuery(`
    SELECT id, display_name, mail_address, account_type, account_status, created_at
    FROM quantum_mail_accounts
    ORDER BY id DESC
    LIMIT 100
  `);

  const messages = dbQuery(`
    SELECT id, mailbox_owner, folder_name, sender_address, recipient_address, subject_line, message_status, created_at
    FROM quantum_mail_messages
    ORDER BY id DESC
    LIMIT 200
  `);

  const drafts = dbQuery(`
    SELECT id, mailbox_owner, recipient_address, subject_line, draft_status, created_at
    FROM quantum_mail_drafts
    ORDER BY id DESC
    LIMIT 100
  `);

  const attachments = dbQuery(`
    SELECT id, message_id, asset_name, asset_path, attachment_status, created_at
    FROM quantum_mail_attachments
    ORDER BY id DESC
    LIMIT 100
  `);

  const accountRows = accounts.map(r => `<tr><td>${r.id}</td><td>${r.display_name}</td><td>${r.mail_address}</td><td>${r.account_type}</td><td>${r.account_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const messageRows = messages.map(r => `<tr><td>${r.id}</td><td>${r.mailbox_owner}</td><td>${r.folder_name}</td><td>${r.sender_address || ''}</td><td>${r.recipient_address || ''}</td><td>${r.subject_line || ''}</td><td>${r.message_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const draftRows = drafts.map(r => `<tr><td>${r.id}</td><td>${r.mailbox_owner}</td><td>${r.recipient_address || ''}</td><td>${r.subject_line || ''}</td><td>${r.draft_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const attachmentRows = attachments.map(r => `<tr><td>${r.id}</td><td>${r.message_id || ''}</td><td>${r.asset_name || ''}</td><td>${r.asset_path || ''}</td><td>${r.attachment_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('OmniMail', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="quantum-mail-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Communication Layer</div>
            <h1 id="quantum-mail-title">OmniMail</h1>
            <p>Manage mail accounts, inbox messages, drafts, folders, and linked asset attachments across the platform.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="OmniMail Accounts"><thead><tr><th>ID</th><th>Name</th><th>Address</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>${accountRows || '<tr><td colspan="6">No accounts yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="OmniMail Messages"><thead><tr><th>ID</th><th>Owner</th><th>Folder</th><th>Sender</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Created</th></tr></thead><tbody>${messageRows || '<tr><td colspan="8">No messages yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="OmniMail Drafts"><thead><tr><th>ID</th><th>Owner</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Created</th></tr></thead><tbody>${draftRows || '<tr><td colspan="6">No drafts yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="OmniMail Attachments"><thead><tr><th>ID</th><th>Message ID</th><th>Asset</th><th>Path</th><th>Status</th><th>Created</th></tr></thead><tbody>${attachmentRows || '<tr><td colspan="6">No attachments yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderQuantumMailAdminPage(req, user = null, message = '') {
  const folders = dbQuery(`
    SELECT id, mailbox_owner, folder_name, folder_type, folder_status, created_at
    FROM quantum_mail_folders
    ORDER BY id DESC
    LIMIT 200
  `);

  const metrics = dbQuery(`
    SELECT id, metric_name, metric_value, metric_scope, created_at
    FROM quantum_mail_metrics
    ORDER BY id DESC
    LIMIT 100
  `);

  const folderRows = folders.map(r => `<tr><td>${r.id}</td><td>${r.mailbox_owner}</td><td>${r.folder_name}</td><td>${r.folder_type}</td><td>${r.folder_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const metricRows = metrics.map(r => `<tr><td>${r.id}</td><td>${r.metric_name}</td><td>${r.metric_value}</td><td>${r.metric_scope}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('OmniMail Admin', `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="portal-shell premium-shell accessible-shell">
      ${typeof portalHeader === 'function' ? portalHeader() : ''}
      <main id="main-content" class="portal-main premium-main accessible-main">
        <section class="premium-hero" aria-labelledby="quantum-mail-admin-title">
          <div class="premium-hero-copy">
            <div class="portal-kicker">Mail Operations</div>
            <h1 id="quantum-mail-admin-title">OmniMail Admin</h1>
            <p>Track folders, mail metrics, and operational visibility for the OmniMail layer.</p>
            ${message ? `<p class="ok" role="status">${message}</p>` : ''}
          </div>
        </section>

        <section><table aria-label="OmniMail Folders"><thead><tr><th>ID</th><th>Owner</th><th>Folder</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>${folderRows || '<tr><td colspan="6">No folders yet.</td></tr>'}</tbody></table></section>
        <section><table aria-label="OmniMail Metrics"><thead><tr><th>ID</th><th>Metric</th><th>Value</th><th>Scope</th><th>Created</th></tr></thead><tbody>${metricRows || '<tr><td colspan="5">No metrics yet.</td></tr>'}</tbody></table></section>
      </main>
    </div>
  `, user);
}


function renderNeuroControlPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, interface_type, control_mode, signal_source, safety_mode, profile_status, created_at
    FROM neuro_interface_profiles
    ORDER BY id DESC LIMIT 100
  `);
  const sessions = dbQuery(`
    SELECT id, profile_name, session_type, input_channel, output_action, session_status, created_at
    FROM neuro_signal_sessions
    ORDER BY id DESC LIMIT 200
  `);

  const profileRows = profiles.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.interface_type}</td><td>${r.control_mode}</td><td>${r.signal_source}</td><td>${r.safety_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const sessionRows = sessions.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.session_type}</td><td>${r.input_channel}</td><td>${r.output_action}</td><td>${r.session_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Neuro Control', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Neuro Control</h1><p>${message || 'Safe non-invasive assistive control profiles.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Mode</th><th>Signal</th><th>Safety</th><th>Status</th><th>Created</th></tr></thead><tbody>${profileRows || '<tr><td colspan="8">No neuro profiles</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Profile</th><th>Session</th><th>Input</th><th>Output</th><th>Status</th><th>Created</th></tr></thead><tbody>${sessionRows || '<tr><td colspan="7">No sessions</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}


function renderHoloJourneyPage(req, user = null, message = '') {
  const profiles = dbQuery(`
    SELECT id, profile_name, generation_mode, output_style, holographic_mode, profile_status, created_at
    FROM holojourney_generation_profiles
    ORDER BY id DESC LIMIT 100
  `);
  const queue = dbQuery(`
    SELECT id, job_name, prompt_text, output_format, output_target, job_status, created_at
    FROM holojourney_render_queue
    ORDER BY id DESC LIMIT 200
  `);

  const profileRows = profiles.map(r => `<tr><td>${r.id}</td><td>${r.profile_name}</td><td>${r.generation_mode}</td><td>${r.output_style}</td><td>${r.holographic_mode}</td><td>${r.profile_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const queueRows = queue.map(r => `<tr><td>${r.id}</td><td>${r.job_name}</td><td>${r.prompt_text || ''}</td><td>${r.output_format}</td><td>${r.output_target}</td><td>${r.job_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('HoloJourney TV', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>HoloJourney TV</h1><p>${message || 'Holographic generation profiles and render queue.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Name</th><th>Mode</th><th>Style</th><th>Holo</th><th>Status</th><th>Created</th></tr></thead><tbody>${profileRows || '<tr><td colspan="7">No profiles</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Job</th><th>Prompt</th><th>Format</th><th>Target</th><th>Status</th><th>Created</th></tr></thead><tbody>${queueRows || '<tr><td colspan="7">No jobs</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}


function renderCreatorTVPage(req, user = null, message = '') {
  const channels = dbQuery(`
    SELECT id, channel_name, channel_owner, channel_type, visibility_mode, monetization_mode, channel_status, created_at
    FROM creator_tv_channels
    ORDER BY id DESC LIMIT 100
  `);

  const programs = dbQuery(`
    SELECT id, channel_name, program_name, program_type, ai_assist_mode, holographic_mode, program_status, created_at
    FROM creator_tv_programs
    ORDER BY id DESC LIMIT 200
  `);

  const channelRows = channels.map(r => `<tr><td>${r.id}</td><td>${r.channel_name}</td><td>${r.channel_owner}</td><td>${r.channel_type}</td><td>${r.visibility_mode}</td><td>${r.monetization_mode}</td><td>${r.channel_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const programRows = programs.map(r => `<tr><td>${r.id}</td><td>${r.channel_name}</td><td>${r.program_name}</td><td>${r.program_type}</td><td>${r.ai_assist_mode}</td><td>${r.holographic_mode}</td><td>${r.program_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Creator TV', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Creator TV</h1><p>${message || 'Creator channels and scheduled AI/holographic programs.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Channel</th><th>Owner</th><th>Type</th><th>Visibility</th><th>Monetization</th><th>Status</th><th>Created</th></tr></thead><tbody>${channelRows || '<tr><td colspan="8">No channels</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Channel</th><th>Program</th><th>Type</th><th>AI</th><th>Holo</th><th>Status</th><th>Created</th></tr></thead><tbody>${programRows || '<tr><td colspan="8">No programs</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}


function renderStreamingNetworkPage(req, user = null, message = '') {
  const networks = dbQuery(`
    SELECT id, network_name, network_type, delivery_mode, latency_profile, network_status, created_at
    FROM streaming_network_registry
    ORDER BY id DESC LIMIT 100
  `);

  const events = dbQuery(`
    SELECT id, event_name, event_group, linked_channel, audience_mode, event_status, created_at
    FROM streaming_event_log
    ORDER BY id DESC LIMIT 200
  `);

  const networkRows = networks.map(r => `<tr><td>${r.id}</td><td>${r.network_name}</td><td>${r.network_type}</td><td>${r.delivery_mode}</td><td>${r.latency_profile}</td><td>${r.network_status}</td><td>${r.created_at || ''}</td></tr>`).join('');
  const eventRows = events.map(r => `<tr><td>${r.id}</td><td>${r.event_name}</td><td>${r.event_group}</td><td>${r.linked_channel || ''}</td><td>${r.audience_mode}</td><td>${r.event_status}</td><td>${r.created_at || ''}</td></tr>`).join('');

  return htmlPage('Streaming Network', `
    <main id="main-content" class="portal-main premium-main accessible-main">
      <section><h1>Streaming Network</h1><p>${message || 'Streaming networks and event visibility.'}</p></section>
      <section><table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Delivery</th><th>Latency</th><th>Status</th><th>Created</th></tr></thead><tbody>${networkRows || '<tr><td colspan="7">No networks</td></tr>'}</tbody></table></section>
      <section><table><thead><tr><th>ID</th><th>Event</th><th>Group</th><th>Channel</th><th>Audience</th><th>Status</th><th>Created</th></tr></thead><tbody>${eventRows || '<tr><td colspan="7">No events</td></tr>'}</tbody></table></section>
    </main>
  `, user);
}

const server = http.createServer(async (req, res) => {


  const __origWriteHead = res.writeHead.bind(res);
  const __origEnd = res.end.bind(res);

  res.writeHead = (...args) => {
    if (res.headersSent || res.writableEnded) {
      return res;
    }
    return __origWriteHead(...args);
  };

  res.end = (...args) => {
    if (res.writableEnded) {
      return res;
    }
    return __origEnd(...args);
  };

  try {
    const requestURL = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const pathname = requestURL.pathname;

    if (req.method === 'GET' && pathname === '/sitemap.xml') {
      const rows = dbQuery("SELECT slug FROM blog_posts ORDER BY id DESC");
      const blogUrls = rows.map(r => `<url><loc>http://127.0.0.1:4900/blog/${r.slug}</loc></url>`).join('');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>http://127.0.0.1:4900/</loc></url>
  <url><loc>http://127.0.0.1:4900/branches</loc></url>
  <url><loc>http://127.0.0.1:4900/payments</loc></url>
  <url><loc>http://127.0.0.1:4900/credit-repair</loc></url>
  <url><loc>http://127.0.0.1:4900/search-engine</loc></url>
  <url><loc>http://127.0.0.1:4900/blog</loc></url>
  ${blogUrls}
</urlset>`;
      res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
      return res.end(xml);
    }






    if (req.method === 'GET' && pathname === '/streaming-network') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderStreamingNetworkPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/creator-tv') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCreatorTVPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/neuro-control') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderNeuroControlPage(req, session, requestURL.searchParams.get('msg') || ''));
    }


    if (req.method === 'GET' && pathname === '/holojourney-tv') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHoloJourneyPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/quantum-mail') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderQuantumMailPage(req, session, requestURL.searchParams.get('msg') || ''));
    }


    if (req.method === 'GET' && pathname === '/quantum-mail-admin') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderQuantumMailAdminPage(req, session, requestURL.searchParams.get('msg') || ''));
    }


    if (req.method === 'GET' && pathname === '/holo-search') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderHoloSearchPage(req, session, requestURL.searchParams.get('msg') || ''));
    }


    if (req.method === 'GET' && pathname === '/platform-analytics') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPlatformAnalyticsPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/world3d') {
      try {
        const html = require('fs').readFileSync('public/world3d/index.html', 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('World 3D client not found');
      }
    }

    if (req.method === 'GET' && pathname === '/web3d-client') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWeb3DClientPage(req, session, requestURL.searchParams.get('msg') || ''));
    }



    if (req.method === 'GET' && pathname === '/realworld-cities') {
      const rows = dbQuery(`
        SELECT id, city_name, state_name, region_name, longitude, latitude, height, destination_route, city_status, created_at
        FROM realworld_city_registry
        WHERE city_status='active'
        ORDER BY region_name, state_name, city_name
      `);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(rows));
    }

    if (req.method === 'GET' && pathname === '/realworld-token') {
      const token = readCesiumToken();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ token }));
    }

    if (req.method === 'GET' && pathname === '/realworld') {
      try {
        const html = require('fs').readFileSync('public/realworld/index.html', 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Real world engine not found');
      }
    }



    if (req.method === 'GET' && pathname === '/property-market') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPropertyMarketPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/realworld-city-registry') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRealWorldCityRegistryPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/realworld-client') {
      const session = typeof hardenPublicSession === 'function' ? hardenPublicSession(req) : null;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderRealWorldClientPage(req, session, requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'GET' && pathname === '/') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPortalHomePage(session));
    }

    if (req.method === 'GET' && pathname === '/heirs' ? (res.writeHead(200, {'Content-Type':'text/html'}), res.end(renderHeirsPage(null))) :
        pathname === '/command-core') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCommandCorePage(session));
    }

    if (req.method === 'GET' && pathname === '/world-explorer') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWorldExplorerPage(session));
    }

    if (req.method === 'GET' && pathname === '/storefront-explorer') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderStorefrontExplorerPage(session));
    }

    if (req.method === 'GET' && pathname === '/wallet-center') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderWalletCenterPage(session));
    }

    if (req.method === 'GET' && pathname === '/access-center') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAccessCenterPage(session));
    }

    if (req.method === 'GET' && pathname === '/progress') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderProgressPage(session));
    }

    if (req.method === 'GET' && pathname === '/creator-hub') {
      const session = hardenPublicSession(req);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderCreatorHubPage(session));
    }

    if (req.method === 'GET' && pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, service: 'aam-dashboard', port: PORT }, null, 2));
    }

    
    if (req.method === 'GET' && pathname.startsWith('/credit-case/')) {
      const id = Number(pathname.split('/')[2]);
      res.writeHead(200, {'Content-Type':'text/html'});
      return res.end(renderCreditCaseDetail(id));
    }

    if (req.method === 'POST' && pathname.startsWith('/credit-repair/generate-letter/')) {
      const id = Number(pathname.split('/')[3]);
      generateDisputeLetter(id);
      return redirect(res, `/credit-case/${id}`);
    }

    if (req.method === 'GET' && pathname.startsWith('/branch/')) {
      const id = Number(pathname.split('/')[2]);
      res.writeHead(200, {'Content-Type':'text/html'});
      return res.end(renderBranchDashboard(id));
    }

if (req.method === 'GET' && pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderDashboard());
    }

    if (req.method === 'GET' && pathname === '/university') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderUniversity());
    }

    if (req.method === 'GET' && pathname === '/marketplace') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderMarketplace());
    }

    if (req.method === 'GET' && pathname === '/archive') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderArchive(requestURL.searchParams.get('q') || ''));
    }

    if (req.method === 'POST' && pathname === '/archive/add') {
      const body = await parseBody(req);
      const title = (body.title || '').trim();
      const content = (body.content || '').trim();
      if (!title || !content) return redirect(res, '/archive');
      dbRun(`INSERT INTO archive_notes (title, content) VALUES ('${q(title)}', '${q(content)}')`);
      return redirect(res, '/archive');
    }

    if (req.method === 'GET' && pathname.startsWith('/payments/')) {
      const paymentId = Number(pathname.split('/')[2]);
      if (!paymentId) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not found');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPaymentDetail(paymentId));
    }

    if (req.method === 'POST' && pathname === '/payments/mark-paid') {
      const body = await parseBody(req);
      const paymentId = Number(body.paymentId);
      if (paymentId) {
        dbRun(`UPDATE payments SET status='paid', paid_at=datetime('now') WHERE id=${paymentId}`);
      }
      return redirect(res, '/payments');
    }

    if (req.method === 'GET' && pathname === '/payments') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPaymentsPage());
    }

    if (req.method === 'GET' && pathname === '/business-manager') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderBusinessManager(requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/business-manager/add') {
      const body = await parseBody(req);
      const personId = Number(body.personId);
      const businessName = (body.businessName || '').trim();
      const rules = getRules();
      const freeLimit = Number(rules.free_business_limit || 2);

      if (!personId || !businessName) return redirect(res, '/business-manager?msg=Invalid%20input');

      const rows = dbQuery(`SELECT name FROM businesses WHERE person_id = ${personId}`);
      const currentCount = rows.filter(r => r.name !== 'Free Business Slot 1' && r.name !== 'Free Business Slot 2').length;

      dbRun(`INSERT INTO businesses (person_id, name) VALUES (${personId}, '${q(businessName)}')`);

      if (currentCount >= freeLimit) {
        dbRun(`INSERT INTO payments (person_id, business_name, amount_cents, status, note)
               VALUES (${personId}, '${q(businessName)}', ${EXTRA_BUSINESS_PRICE_CENTS}, 'pending', 'Additional business beyond free limit')`);
        return redirect(res, `/payments?msg=${encodeURIComponent('Payment record created for ' + businessName)}`);
      }

      return redirect(res, `/business-manager?msg=${encodeURIComponent(businessName + ' added under free business allowance. Count=' + currentCount + ' Limit=' + freeLimit)}`);
    }

    if (req.method === 'POST' && pathname === '/business/delete') {
      const body = await parseBody(req);
      const businessId = Number(body.businessId);
      const personId = Number(body.personId);
      if (businessId) dbRun(`DELETE FROM businesses WHERE id = ${businessId}`);
      return redirect(res, `/people/${personId}`);
    }

    if (req.method === 'GET' && pathname === '/people/add') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderAddPersonPage(requestURL.searchParams.get('msg') || ''));
    }

    if (req.method === 'POST' && pathname === '/people/add') {
      const body = await parseBody(req);
      const name = (body.name || '').trim();
      const role = (body.role || '').trim();
      if (!name || !role) return redirect(res, '/people/add?msg=Invalid%20input');
      dbRun(`INSERT INTO people (name, role) VALUES ('${q(name)}', '${q(role)}')`);
      return redirect(res, '/people/add?msg=Person%20added');
    }

    if (req.method === 'GET' && pathname.startsWith('/people/')) {
      const personId = Number(pathname.split('/')[2]);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderPersonDetail(personId));
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Server error: ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`Dashboard running on ${PORT}`);
});
