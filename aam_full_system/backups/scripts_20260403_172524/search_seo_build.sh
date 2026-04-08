#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

echo "=== SEARCH + SEO BUILD START ==="

########################################
# 1) BLOG TABLE
########################################
python << 'PYEOF'
import sqlite3
from pathlib import Path

db_path = Path.home() / "aam_full_system" / "db" / "aam.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

seed_posts = [
    (
        "How to Start Building Credit the Right Way",
        "how-to-start-building-credit-the-right-way",
        "This guide explains how to organize your credit recovery process, track disputes, gather documents, and build a stronger financial foundation."
    ),
    (
        "How Family Branches Can Grow Businesses Together",
        "how-family-branches-can-grow-businesses-together",
        "This article explains how the branch system helps families organize people, businesses, payments, and education inside one operating platform."
    ),
    (
        "How AI Workflow Helps Credit Repair Operations",
        "how-ai-workflow-helps-credit-repair-operations",
        "AI can help with intake, task tracking, document review preparation, dispute letter drafting, and compliance logging when used correctly."
    )
]

for title, slug, content in seed_posts:
    cur.execute("SELECT 1 FROM blog_posts WHERE slug = ?", (slug,))
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO blog_posts (title, slug, content) VALUES (?, ?, ?)",
            (title, slug, content)
        )

conn.commit()
conn.close()
print("[OK] blog_posts ready")
PYEOF

########################################
# 2) PATCH DASHBOARD
########################################
python << 'PYEOF'
from pathlib import Path
import re

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

def insert_before(marker: str, block: str):
    global text
    if block.strip() not in text and marker in text:
        text = text.replace(marker, block + "\n" + marker)

# --------------------------------------
# stronger meta tags in htmlPage
# --------------------------------------
if '<meta name="description"' not in text:
    text = text.replace(
        '<meta name="viewport" content="width=device-width,initial-scale=1" />',
        '<meta name="viewport" content="width=device-width,initial-scale=1" />\n'
        '  <meta name="description" content="AI-powered marketplace, credit repair, branch growth, and business operating system" />\n'
        '  <meta property="og:title" content="${title}" />\n'
        '  <meta property="og:description" content="Powered by All American Marketplace AI" />\n'
        '  <meta property="og:type" content="website" />'
    )

# --------------------------------------
# nav links
# --------------------------------------
if '<a href="/search-engine">Search</a>' not in text and '<a href="/compliance">Compliance</a>' in text:
    text = text.replace(
        '<a href="/compliance">Compliance</a>',
        '<a href="/compliance">Compliance</a>\n      <a href="/search-engine">Search</a>\n      <a href="/blog">Blog</a>'
    )

# --------------------------------------
# helpers
# --------------------------------------
helpers = r'''
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
'''
insert_before("const server = http.createServer(async (req, res) => {", helpers)

# --------------------------------------
# routes
# --------------------------------------
route_anchor = "    if (req.method === 'GET' && pathname === '/search') {"
if "pathname === '/search-engine'" not in text and route_anchor in text:
    routes = """    if (req.method === 'GET' && pathname === '/search-engine') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderSearchEnginePage(authUser, requestURL.searchParams.get('q') || ''));
    }

    if (req.method === 'GET' && pathname === '/blog') {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderBlogPage(authUser));
    }

    if (req.method === 'GET' && pathname.startsWith('/blog/')) {
      const authUser = requireAuth(req, res, ['root', 'admin']);
      if (!authUser) return;
      const slug = pathname.split('/')[2];
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(renderBlogDetail(slug, authUser));
    }

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

    if (req.method === 'GET' && pathname === '/search') {"""
    text = text.replace(route_anchor, routes)

p.write_text(text)
print("[OK] search + seo patch applied")
PYEOF

########################################
# 3) RESTART / VERIFY
########################################
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

########################################
# 4) CHECKPOINT
########################################
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots

cp apps/dashboard.js "backups/dashboard_search_seo_stable_${STAMP}.js"
cp db/aam.db "backups/aam_search_seo_stable_${STAMP}.db"

sqlite3 -json db/aam.db "select count(*) as blog_posts from blog_posts;" > "snapshots/blog_posts_${STAMP}.json"

echo "SEARCH + SEO STABLE CHECKPOINT COMPLETE: $STAMP"
echo "Test:"
echo "  termux-open-url http://127.0.0.1:4900/search-engine"
echo "  termux-open-url http://127.0.0.1:4900/blog"
echo "  curl -s http://127.0.0.1:4900/sitemap.xml | head -n 20"
