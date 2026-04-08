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
    a.danger, button.danger { background:#b91c1c; }
    ul { padding-left:18px; }
    .muted { color:#94a3b8; }
    input,select,textarea { width:100%; box-sizing:border-box; padding:10px; margin:8px 0 12px 0; border-radius:10px; border:1px solid #334155; background:#020617; color:#e2e8f0; }
    .ok { color:#86efac; }
    .warn { color:#fbbf24; }
    .danger-text { color:#fca5a5; }
    table { width:100%; border-collapse:collapse; }
    th,td { border-bottom:1px solid #334155; text-align:left; padding:10px; vertical-align:top; }
    form.inline { display:inline; }
  </style>
</head>
<body>
  <div class="topbar">
    <h1>All American Marketplace OS</h1>
    <p class="muted">Marketplace • University • Archive • Business Manager • FinBank • Jarvis</p>
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


const server = http.createServer(async (req, res) => {
  try {
    const requestURL = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const pathname = requestURL.pathname;

    if (req.method === 'GET' && pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, service: 'aam-dashboard', port: PORT }, null, 2));
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

      return redirect(res, `/business-manager?msg=${encodeURIComponent(businessName + ' added under free business allowance.')}`);
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
