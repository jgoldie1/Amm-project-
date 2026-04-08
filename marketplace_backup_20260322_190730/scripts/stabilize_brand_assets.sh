#!/data/data/com.termux/files/usr/bin/bash
set -u
cd ~/marketplace || exit 1

mkdir -p static/brand snapshots backups

python - <<'PY'
from pathlib import Path
import shutil
import re

ROOT = Path("/data/data/com.termux/files/home")
MARKET = ROOT / "marketplace"
BRAND = MARKET / "static" / "brand"
BRAND.mkdir(parents=True, exist_ok=True)

SEARCH_DIRS = [
    MARKET / "static" / "uploads",
    MARKET / "static" / "img",
    MARKET / "static" / "brand",
    ROOT / "Pictures",
    ROOT / "Download",
    ROOT / "Downloads",
    ROOT / "my_images",
]

ASSETS = {
    "stubbs_crest_real": [
        "stubbs crest", "stubbs_crest", "crest", "stubbs"
    ],
    "american_flag_real": [
        "american flag", "usa flag", "us flag", "flag", "american_flag"
    ],
    "saturn_real": [
        "saturn", "planet saturn"
    ],
    "lion_real": [
        "lion", "holographic lion", "lion saturn", "holographic_lion"
    ],
}

EXTS = {".png", ".jpg", ".jpeg", ".webp", ".svg"}

def score(name: str, keys):
    n = name.lower()
    s = 0
    for k in keys:
        if k in n:
            s += 10
    if "real" in n:
        s += 3
    if "final" in n:
        s += 3
    if "master" in n:
        s += 3
    if "holo" in n:
        s += 2
    return s

def pick_best(keys):
    candidates = []
    for base in SEARCH_DIRS:
        if not base.exists():
            continue
        try:
            for p in base.rglob("*"):
                if p.is_file() and p.suffix.lower() in EXTS:
                    sc = score(p.name, keys)
                    if sc > 0:
                        candidates.append((sc, p.stat().st_mtime, p))
        except Exception:
            pass
    if not candidates:
        return None
    candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return candidates[0][2]

picked = {}
for out_name, keys in ASSETS.items():
    picked[out_name] = pick_best(keys)

for out_name, src in picked.items():
    if src:
        target = BRAND / f"{out_name}{src.suffix.lower()}"
        shutil.copy2(src, target)
        print(f"COPIED {src} -> {target}")

# Create safe SVG fallbacks if missing
fallbacks = {
    "stubbs_crest_real.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700">
<rect width="100%" height="100%" fill="#0f172a"/>
<path d="M300 40 L520 120 L480 420 Q430 560 300 650 Q170 560 120 420 L80 120 Z" fill="#111827" stroke="#7dd3fc" stroke-width="12"/>
<text x="300" y="235" text-anchor="middle" fill="#f8fafc" font-size="54" font-family="Arial">STUBBS</text>
<text x="300" y="305" text-anchor="middle" fill="#a78bfa" font-size="30" font-family="Arial">CREST PLACEHOLDER</text>
<circle cx="300" cy="410" r="80" fill="none" stroke="#f59e0b" stroke-width="10"/>
<path d="M250 430 Q300 350 350 430" fill="none" stroke="#f8fafc" stroke-width="8"/>
</svg>""",
    "american_flag_real.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 100">
<rect width="190" height="100" fill="#fff"/>
<g fill="#B22234">
<rect y="0" width="190" height="7.69"/><rect y="15.38" width="190" height="7.69"/>
<rect y="30.76" width="190" height="7.69"/><rect y="46.14" width="190" height="7.69"/>
<rect y="61.52" width="190" height="7.69"/><rect y="76.9" width="190" height="7.69"/>
<rect y="92.28" width="190" height="7.72"/></g>
<rect width="76" height="53.85" fill="#3C3B6E"/>
<text x="38" y="30" text-anchor="middle" fill="#fff" font-size="20" font-family="Arial">★ ★ ★</text>
</svg>""",
    "saturn_real.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
<rect width="100%" height="100%" fill="#000"/>
<ellipse cx="400" cy="250" rx="260" ry="65" fill="none" stroke="#c7b27a" stroke-width="22"/>
<circle cx="400" cy="250" r="120" fill="#d9c18b"/>
<ellipse cx="400" cy="250" rx="260" ry="65" fill="none" stroke="#8a7a55" stroke-width="6"/>
</svg>""",
    "lion_real.svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700">
<rect width="100%" height="100%" fill="#0b1020"/>
<circle cx="350" cy="350" r="210" fill="#7c4a1d"/>
<circle cx="350" cy="360" r="130" fill="#c98b42"/>
<circle cx="300" cy="330" r="12" fill="#111"/><circle cx="400" cy="330" r="12" fill="#111"/>
<path d="M310 400 Q350 430 390 400" fill="none" stroke="#111" stroke-width="10"/>
<path d="M350 355 L335 390 L365 390 Z" fill="#5a3414"/>
</svg>"""
}

for fname, svg in fallbacks.items():
    target = BRAND / fname
    if not target.exists():
        target.write_text(svg)
        print(f"FALLBACK {target}")

manifest = []
for p in sorted(BRAND.iterdir()):
    if p.is_file():
        manifest.append(str(p))
(MARKET / "snapshots" / "brand_asset_manifest.txt").write_text("\n".join(manifest) + "\n")
print("MANIFEST WRITTEN")
PY
