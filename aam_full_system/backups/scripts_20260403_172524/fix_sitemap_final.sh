#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system

python << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

route = """    if (req.method === 'GET' && pathname === '/sitemap.xml') {
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
"""

if "pathname === '/sitemap.xml'" in text:
    print("Sitemap route already exists in file.")
else:
    marker = "    if (req.method === 'GET' && pathname === '/health') {"
    if marker in text:
        text = text.replace(marker, route + "\n" + marker, 1)
        p.write_text(text)
        print("Sitemap route inserted before /health.")
    else:
        raise SystemExit("Could not find /health route marker.")

PYEOF

bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh

STAMP="$(date +%Y%m%d_%H%M%S)"
cp apps/dashboard.js "backups/dashboard_sitemap_final_${STAMP}.js"
cp db/aam.db "backups/aam_sitemap_final_${STAMP}.db"

echo "SITEMAP FINAL FIX COMPLETE: $STAMP"
