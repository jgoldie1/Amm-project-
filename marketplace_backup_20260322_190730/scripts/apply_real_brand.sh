#!/data/data/com.termux/files/usr/bin/bash
set -u
cd ~/marketplace || exit 1

echo "=== CHECK REAL IMAGE FILES ==="
for f in \
  static/brand/stubbs_crest_real.png \
  static/brand/saturn_real.png \
  static/brand/american_flag_real.png \
  static/brand/lion_real.png
do
  if [ -f "$f" ]; then
    echo "FOUND $f"
  else
    echo "MISSING $f"
  fi
done

echo
echo "=== UPDATE APP TO PREFER REAL PNG FILES ==="
python - <<'PY'
from pathlib import Path
p = Path("app.py")
text = p.read_text()

# helper for real brand file lookup
helper = r'''
def _real_brand_png(name):
    import os
    path = f"/static/brand/{name}.png"
    if os.path.exists(f"static/brand/{name}.png"):
        return path
    path = f"/static/brand/{name}.svg"
    if os.path.exists(f"static/brand/{name}.svg"):
        return path
    return ""
'''
marker = '\nif __name__ == "__main__":'
if helper not in text and marker in text:
    text = text.replace(marker, "\n" + helper + "\n" + marker)

# brand-test route replacement
import re
pattern = re.compile(r'@app\.route\("/brand-test"\)\ndef brand_test\(\):.*?return """(.*?)"""', re.S)
if '@app.route("/brand-test")' in text:
    start = text.find('@app.route("/brand-test")')
    end = text.find('\n@app.route("', start + 1)
    if end == -1:
        end = text.find('\nif __name__ == "__main__":', start + 1)
    replacement = r'''
@app.route("/brand-test")
def brand_test():
    crest = _real_brand_png("stubbs_crest_real")
    saturn = _real_brand_png("saturn_real")
    flag = _real_brand_png("american_flag_real")
    lion = _real_brand_png("lion_real")
    return f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Brand Test</title>
      <link rel="stylesheet" href="/static/css/holo_real.css">
    </head>
    <body>
      <div class="wrap">
        <div class="hero">
          <h1>Real Brand Test</h1>
          <p>This page uses your real PNG files from static/brand.</p>
        </div>
        <div class="grid">
          <div class="card"><h2>Stubbs Crest</h2><img src="{crest}" alt="Stubbs Crest"></div>
          <div class="card"><h2>Saturn</h2><img src="{saturn}" alt="Saturn"></div>
          <div class="card"><h2>American Flag</h2><img src="{flag}" alt="American Flag"></div>
          <div class="card"><h2>Holographic Lion</h2><img src="{lion}" alt="Lion"></div>
        </div>
      </div>
    </body>
    </html>
    """
'''
    text = text[:start] + replacement + text[end:]

# full-app-showcase real png preference
text = text.replace('_brand_asset_url_show("stubbs_crest_real") or _brand_asset_url_show("crest")', '_real_brand_png("stubbs_crest_real") or _brand_asset_url_show("crest")')
text = text.replace('_brand_asset_url_show("american_flag_real") or _brand_asset_url_show("flag")', '_real_brand_png("american_flag_real") or _brand_asset_url_show("flag")')
text = text.replace('_brand_asset_url_show("saturn_real") or _brand_asset_url_show("saturn")', '_real_brand_png("saturn_real") or _brand_asset_url_show("saturn")')
text = text.replace('_brand_asset_url_show("lion_real") or _brand_asset_url_show("lion")', '_real_brand_png("lion_real") or _brand_asset_url_show("lion")')

p.write_text(text)
print("App updated to prefer real PNG brand files.")
PY

echo
echo "=== WRITE REAL BRAND CSS ==="
cat > static/css/holo_real.css <<'CSS'
body{
  margin:0;
  font-family:Arial,sans-serif;
  color:white;
  background:
    radial-gradient(circle at 10% 10%, rgba(125,211,252,.12), transparent 22%),
    radial-gradient(circle at 90% 14%, rgba(167,139,250,.12), transparent 24%),
    linear-gradient(180deg,#04070c 0%, #0f172a 100%);
}
.wrap{max-width:1200px;margin:0 auto;padding:24px}
.hero{
  border:1px solid rgba(255,255,255,.08);
  border-radius:28px;
  padding:28px;
  background:rgba(255,255,255,.04);
}
.grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:18px;
  margin-top:20px;
}
.card{
  border:1px solid rgba(255,255,255,.08);
  border-radius:24px;
  padding:18px;
  background:rgba(255,255,255,.05);
}
.card img{
  width:100%;
  height:260px;
  object-fit:contain;
  background:rgba(255,255,255,.04);
  border-radius:18px;
  padding:10px;
  box-shadow:0 0 14px rgba(125,211,252,.35), 0 0 26px rgba(167,139,250,.18);
}
body::before, body::after{
  content:"";
  position:fixed;
  top:50%;
  transform:translateY(-50%);
  width:220px;
  height:320px;
  opacity:.22;
  pointer-events:none;
  background-image:url('/static/brand/lion_real.png');
  background-repeat:no-repeat;
  background-size:contain;
  background-position:center;
  filter:drop-shadow(0 0 20px rgba(125,211,252,.45)) drop-shadow(0 0 30px rgba(167,139,250,.35));
}
body::before{left:0}
body::after{right:0;transform:translateY(-50%) scaleX(-1)}
CSS

echo
echo "=== COMPILE + RESTART ==="
python -m py_compile app.py || exit 1
pkill -f "flask --app app run" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
sleep 2
nohup env PYTHONUNBUFFERED=1 flask --app app run --host 0.0.0.0 --port 8080 > logs/app.log 2>&1 &
sleep 5

echo
echo "=== OPEN THESE IN YOUR BROWSER ==="
echo "http://127.0.0.1:8080/brand-test"
echo "http://127.0.0.1:8080/full-app-showcase"
echo "http://127.0.0.1:8080/holo-commerce-home"
