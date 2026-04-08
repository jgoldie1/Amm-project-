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

const server = http.createServer(async (req, res) => {
  try {
    const requestURL = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const pathname = requestURL.pathname;

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
