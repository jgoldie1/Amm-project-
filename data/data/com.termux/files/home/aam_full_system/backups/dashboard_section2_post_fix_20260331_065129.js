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
      <a href="/