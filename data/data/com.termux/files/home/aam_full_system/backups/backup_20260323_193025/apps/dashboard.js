const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 4900;
const DATA_FILE = path.join(__dirname, '..', 'data', 'family.json');
const PAY_RULE_FILE = path.join(__dirname, '..', 'data', 'rules.json');

function ensureRules() {
  if (!fs.existsSync(PAY_RULE_FILE)) {
    fs.writeFileSync(PAY_RULE_FILE, JSON.stringify({
      free_business_limit: 2,
      paid_message: "Free limit reached. Payment required for additional businesses."
    }, null, 2));
  }
}

function loadData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function loadRules() {
  ensureRules();
  return JSON.parse(fs.readFileSync(PAY_RULE_FILE, 'utf-8'));
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
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; background:#0f172a; color:#e2e8f0; margin:0; padding:20px; }
    .topbar,.card { background:#111827; border:1px solid #334155; border-radius:16px; padding:16px; }
    .topbar { margin-bottom:20px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; }
    .section { margin-top:24px; }
    .pill { display:inline-block; padding:6px 10px; background:#1d4ed8; border-radius:999px; margin-right:6px; margin-top:6px; font-size:13px; }
    a,button { color:white; background:#2563eb; border:none; border-radius:10px; padding:10px 14px; text-decoration:none; display:inline-block; margin-right:8px; cursor:pointer; }
    a.secondary { background:#475569; }
    ul { padding-left:18px; }
    .muted { color:#94a3b8; }
    input,select,textarea { width:100%; box-sizing:border-box; padding:10px; margin:8px 0 12px 0; border-radius:10px; border:1px solid #334155; background:#020617; color:#e2e8f0; }
    .ok { color:#86efac; }
    .warn { color:#fbbf24; }
    .danger { color:#fca5a5; }
    .nav { margin-top:14px; }
    table { width:100%; border-collapse:collapse; }
    th,td { border-bottom:1px solid #334155; text-align:left; padding:10px; vertical-align:top; }
    code { background:#1e293b; padding:2px 6px; border-radius:6px; }
  </style>
</head>
<body>
  <div class="topbar">
    <h1>All American Marketplace OS</h1>
    <p class="muted">Marketplace • University • Archive • Family Builder Network • Jarvis</p>
    <div>
      <span class="pill">Live</span>
      <span class="pill">Port 4900</span>
    </div>
    <div class="nav">
      <a href="/">Dashboard</a>
      <a href="/university">University</a>
      <a href="/marketplace">Marketplace</a>
      <a href="/archive">Archive</a>
      <a href="/business-manager">Business Manager</a>
      <a href="http://127.0.0.1:5000/">Jarvis</a>
      <a class="secondary" href="/api/family">Family JSON</a>
      <a class="secondary" href="/health">Health</a>
    </div>
  </div>
  ${content}
</body>
</html>`;
}

function renderDashboard(data) {
  const peopleCards = data.people.map(person => {
    const businesses = (person.businesses || []).map(b => `<li>${b}</li>`).join('');
    return `
      <div class="card">
        <h2>${person.name}</h2>
        <p><strong>Role:</strong> ${person.role}</p>
        <p><strong>Businesses:</strong></p>
        <ul>${businesses}</ul>
      </div>
    `;
  }).join('');

  return htmlPage('AAM Dashboard', `
    <div class="section">
      <h2>Core Overview</h2>
      <div class="grid">
        <div class="card">
          <h3>Marketplace</h3>
          <p>Commerce, services, logistics, insurance, media, creator economy, and fintech lanes.</p>
        </div>
        <div class="card">
          <h3>All American University</h3>
          <p>Free education tracks for approved members and builders.</p>
        </div>
        <div class="card">
          <h3>Archive + Memory</h3>
          <p>Permanent memory layer for people, ideas, business logic, and future system builds.</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Family + Platform Network</h2>
      <div class="grid">${peopleCards}</div>
    </div>
  `);
}

function renderUniversity(data) {
  const tracks = [
    ["Logistics + Freight", "Nekira Frances, dispatch, freight broker, operations"],
    ["Staffing + Wellness", "Tasha Ash, March & Lewis, Sculptify Ltd"],
    ["Insurance + Banking", "Raymond Jarreau, OmniCare 360, infinite banking"],
    ["Security + Compliance", "Alton Security, conceal carry, compliance, cyber security"],
    ["Music + Streaming", "BJ, Isaiah, label systems, AI TV, creator promotion"],
    ["Game Development", "Game studio build path and publishing support"],
    ["Fintech", "Aniyah cross-border app, youth finance, crypto/forex/stock learning"],
    ["Creator Tools", "Vocal training, AI mixing, mastering, easy DAW flows"]
  ];

  const rows = tracks.map(t => `<tr><td>${t[0]}</td><td>${t[1]}</td><td>Free for approved members</td></tr>`).join('');

  return htmlPage('All American University', `
    <div class="section">
      <div class="card">
        <h2>All American University</h2>
        <p>Education pipeline for family, community, and approved builders. Learn → build → earn.</p>
        <p class="ok"><strong>Access rule:</strong> approved members get free education.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Training Tracks</h3>
        <table>
          <thead><tr><th>Track</th><th>Focus</th><th>Access</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `);
}

function renderMarketplace(data) {
  const allBusinesses = data.people.flatMap(p => (p.businesses || []).map(b => ({
    owner: p.name,
    role: p.role,
    business: b
  })));

  const cards = allBusinesses.map(item => `
    <div class="card">
      <h3>${item.business}</h3>
      <p><strong>Owner:</strong> ${item.owner}</p>
      <p><strong>Role:</strong> ${item.role}</p>
    </div>
  `).join('');

  return htmlPage('Marketplace', `
    <div class="section">
      <div class="card">
        <h2>Marketplace Directory</h2>
        <p>Unified family and ecosystem business listing.</p>
      </div>
    </div>
    <div class="section">
      <div class="grid">${cards}</div>
    </div>
  `);
}

function renderArchive(data) {
  const archiveEntries = [
    "Family Constitution Contract",
    "Heir Registry",
    "Sidechain Factory",
    "Legacy Archive Vault",
    "Wallet + Identity System",
    "Jarvis Core System",
    "All American Marketplace",
    "All American University",
    "Streaming + Media Network",
    "Security + Compliance Network",
    "Insurance + Infinite Banking",
    "Aniyah Cross-Border App",
    "Creator Tools + AI Audio Workstation"
  ];

  const items = archiveEntries.map(x => `<li>${x}</li>`).join('');
  const people = data.people.map(p => `<li>${p.name} — ${p.role}</li>`).join('');

  return htmlPage('Archive', `
    <div class="section">
      <div class="card">
        <h2>Archive / Memory System</h2>
        <p>This page represents the permanent memory layer for your system design, people, roles, and businesses.</p>
        <p class="warn"><strong>Current mode:</strong> prototype archive shell using local JSON. Next upgrade is full memory ingestion and searchable records.</p>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>System Memory</h3>
          <ul>${items}</ul>
        </div>
        <div class="card">
          <h3>People + Roles</h3>
          <ul>${people}</ul>
        </div>
      </div>
    </div>
  `);
}

function countPaidEligibleBusinesses(person) {
  const businesses = person.businesses || [];
  const freebies = businesses.filter(b =>
    b !== 'Free Business Slot 1' &&
    b !== 'Free Business Slot 2'
  );
  return freebies.length;
}

function renderBusinessManager(data, message = '') {
  const rules = loadRules();

  const options = data.people.map((p, idx) =>
    `<option value="${idx}">${p.name} (${p.role})</option>`
  ).join('');

  const tableRows = data.people.map((p, idx) => {
    const used = countPaidEligibleBusinesses(p);
    const remainingFree = Math.max(0, rules.free_business_limit - used);
    const status = remainingFree > 0
      ? `<span class="ok">${remainingFree} free left</span>`
      : `<span class="warn">payment required</span>`;

    return `
      <tr>
        <td>${p.name}</td>
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
        <p>Add businesses to members. Rule: first <strong>${rules.free_business_limit}</strong> businesses are free, then additional businesses require payment.</p>
        ${message ? `<p class="ok"><strong>${message}</strong></p>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div class="card">
          <h3>Add Business</h3>
          <form method="POST" action="/business-manager/add">
            <label>Person</label>
            <select name="personIndex">${options}</select>

            <label>Business Name</label>
            <input type="text" name="businessName" placeholder="Enter business name" required />

            <button type="submit">Add Business</button>
          </form>
        </div>

        <div class="card">
          <h3>Rule</h3>
          <p>Two free businesses per approved member, then paid expansion for the rest.</p>
          <p><strong>Paid message:</strong> ${rules.paid_message}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <h3>Business Access Status</h3>
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Count</th><th>Status</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  `);
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const data = loadData();

  if (req.method === 'GET' && parsed.pathname === '/api/family') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(data, null, 2));
  }

  if (req.method === 'GET' && parsed.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'aam-dashboard', port: PORT }, null, 2));
  }

  if (req.method === 'GET' && parsed.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderDashboard(data));
  }

  if (req.method === 'GET' && parsed.pathname === '/university') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderUniversity(data));
  }

  if (req.method === 'GET' && parsed.pathname === '/marketplace') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderMarketplace(data));
  }

  if (req.method === 'GET' && parsed.pathname === '/archive') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderArchive(data));
  }

  if (req.method === 'GET' && parsed.pathname === '/business-manager') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderBusinessManager(data, parsed.query.msg || ''));
  }

  if (req.method === 'POST' && parsed.pathname === '/business-manager/add') {
    try {
      const body = await parseBody(req);
      const personIndex = Number(body.personIndex);
      const businessName = (body.businessName || '').trim();
      const rules = loadRules();

      if (!Number.isInteger(personIndex) || !data.people[personIndex] || !businessName) {
        res.writeHead(302, { Location: '/business-manager?msg=Invalid%20input' });
        return res.end();
      }

      const person = data.people[personIndex];
      const currentCount = countPaidEligibleBusinesses(person);

      if (!Array.isArray(person.businesses)) person.businesses = [];
      person.businesses.push(businessName);
      saveData(data);

      const msg = currentCount >= rules.free_business_limit
        ? encodeURIComponent(`${businessName} added. ${rules.paid_message}`)
        : encodeURIComponent(`${businessName} added under free business allowance.`);

      res.writeHead(302, { Location: `/business-manager?msg=${msg}` });
      return res.end();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Server error while adding business');
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Dashboard running on ${PORT}`);
});
