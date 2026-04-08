#!/usr/bin/env bash
set -e

echo "=== ALL 5 MASTER PASS ==="

echo
echo "[1] STABILIZE CORE"
bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[2] UI / APP POLISH FILES"
mkdir -p data/themes data/product

cat > data/themes/parent_theme.json <<'EOF'
{
  "name": "all_american_parent_theme",
  "style": "holographic_patriotic_cosmic",
  "colors": ["#020617", "#1d4ed8", "#b91c1c", "#facc15"],
  "symbols": ["lion", "american_flag", "saturn", "eagle"],
  "status": "active"
}
EOF

cat > data/themes/child_themes.json <<'EOF'
{
  "themes": [
    { "name": "creator_child_theme", "inherits": "all_american_parent_theme", "focus": "creator tools + music" },
    { "name": "world_child_theme", "inherits": "all_american_parent_theme", "focus": "life world + scenes + transport + housing" },
    { "name": "stream_child_theme", "inherits": "all_american_parent_theme", "focus": "live + gifts + discovery" },
    { "name": "marketplace_child_theme", "inherits": "all_american_parent_theme", "focus": "commerce + assets + payouts" },
    { "name": "family_child_theme", "inherits": "all_american_parent_theme", "focus": "parent/child safe accounts + learning mode" }
  ]
}
EOF

cat > data/product/app_modes.json <<'EOF'
{
  "modes": [
    "public_home",
    "creator_mode",
    "world_mode",
    "stream_mode",
    "marketplace_mode",
    "family_safe_mode"
  ]
}
EOF

echo
echo "[3] ASSET PIPELINE"
mkdir -p assets_pack/{characters,houses,vehicles,time_machine,worlds,branding,gifts,ui,uploads,reviews,published}

cat > data/product/asset_pipeline.json <<'EOF'
{
  "pipeline": [
    { "step": "ai_draft", "status": "enabled" },
    { "step": "human_review", "status": "enabled" },
    { "step": "publish_to_world", "status": "enabled" },
    { "step": "sell_in_marketplace", "status": "enabled" }
  ],
  "family_rules": {
    "minor_uploads_require_guardian_review": true,
    "public_publish_requires_moderation": true,
    "payouts_require_verified_account": true
  }
}
EOF

cat > assets_pack/UPLOAD_RULES.txt <<'EOF'
1. AI draft assets can be used as starter placeholders.
2. Human-created assets can replace AI drafts after review.
3. Public assets require moderation before publishing.
4. Family-safe / minor accounts require guardian review.
5. Published assets can later be listed in the marketplace.
EOF

echo
echo "[4] WORLD / MUSIC / GIFTS"
mkdir -p public/audio data/world

touch public/audio/genesis_soundtrack.mp3
touch public/audio/creator_intro.mp3

cat > data/world/ecosystem_registry.json <<'EOF'
{
  "mammals": [
    {"name":"Lion","role":"brand_guardian","status":"active_build"},
    {"name":"Wolf","role":"community_pack","status":"planned"},
    {"name":"Bull","role":"market_growth","status":"planned"},
    {"name":"Horse","role":"transport_mount","status":"planned"},
    {"name":"Deer","role":"nature_zone","status":"planned"}
  ],
  "birds": [
    {"name":"Eagle","role":"freedom_navigation","status":"planned"},
    {"name":"Hawk","role":"scout_watch","status":"planned"},
    {"name":"Owl","role":"wisdom_guide","status":"planned"}
  ],
  "insects": [
    {"name":"Butterfly","role":"transformation_visual","status":"planned"},
    {"name":"Bee","role":"ecosystem_productivity","status":"planned"},
    {"name":"Firefly","role":"ambient_light","status":"planned"}
  ],
  "transport": [
    {"name":"Creator Shuttle","type":"hover_transport","status":"planned"},
    {"name":"Lion Gate Portal","type":"fast_travel","status":"planned"},
    {"name":"Marketplace Cruiser","type":"city_transport","status":"planned"},
    {"name":"Time Machine","type":"timeline_transport","status":"planned"}
  ],
  "housing": [
    {"name":"Creator Pod","type":"starter_home","status":"planned"},
    {"name":"Saturn Loft","type":"premium_home","status":"planned"},
    {"name":"Marketplace Villa","type":"luxury_home","status":"planned"}
  ],
  "worlds": [
    {"name":"Bethlehem","status":"playable_foundation"},
    {"name":"Nazareth","status":"playable_foundation"},
    {"name":"Galilee","status":"playable_foundation"},
    {"name":"Creator Hall","status":"playable_foundation"},
    {"name":"Cosmic Sky / Saturn","status":"visual_foundation"}
  ]
}
EOF

cat > data/world/holographic_gifts.json <<'EOF'
{
  "gifts": [
    {"name":"Holographic Rose","tier":"common","value":100,"status":"active_build"},
    {"name":"American Star","tier":"rare","value":500,"status":"active_build"},
    {"name":"Lion Crown","tier":"epic","value":1000,"status":"active_build"},
    {"name":"Saturn Ring","tier":"legendary","value":2500,"status":"active_build"},
    {"name":"Freedom Eagle","tier":"legendary","value":5000,"status":"planned"}
  ]
}
EOF

cat > apps/world_renderer.js <<'JS'
const fs = require('fs');

function loadJSON(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (e) {
    return null;
  }
}

function safeItems(arr, mapper) {
  if (!Array.isArray(arr) || arr.length === 0) return '<li>None yet</li>';
  return arr.map(mapper).join('');
}

function renderWorld() {
  const ecosystem = loadJSON('data/world/ecosystem_registry.json') || {};
  const gifts = loadJSON('data/world/holographic_gifts.json') || { gifts: [] };

  return `
    <div class="section">
      <div class="card">
        <h2>Live World Entities</h2>

        <h3>Animals</h3>
        <ul>
          ${safeItems(ecosystem.mammals, a => `<li>${a.name} (${a.role})</li>`)}
          ${safeItems(ecosystem.birds, a => `<li>${a.name} (${a.role})</li>`)}
          ${safeItems(ecosystem.insects, a => `<li>${a.name} (${a.role})</li>`)}
        </ul>

        <h3>Transport</h3>
        <ul>
          ${safeItems(ecosystem.transport, a => `<li>${a.name} (${a.type})</li>`)}
        </ul>

        <h3>Housing</h3>
        <ul>
          ${safeItems(ecosystem.housing, a => `<li>${a.name} (${a.type})</li>`)}
        </ul>

        <h3>Holographic Gifts</h3>
        <ul>
          ${safeItems(gifts.gifts, g => `<li>${g.name} (${g.tier}) - ${g.value}</li>`)}
        </ul>
      </div>
    </div>
  `;
}

function renderAudioAndGifts() {
  return `
    <div class="section">
      <div class="card">
        <h2>Music + Gifts</h2>
        <audio controls preload="none" style="width:100%;max-width:560px;">
          <source src="/audio/genesis_soundtrack.mp3" type="audio/mpeg">
        </audio>
        <p class="muted">Starter world music player.</p>
        <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;">
          <button onclick="sendGift('Holographic Rose')">Send Holographic Rose</button>
          <button onclick="sendGift('American Star')">Send American Star</button>
          <button onclick="sendGift('Lion Crown')">Send Lion Crown</button>
          <button onclick="sendGift('Saturn Ring')">Send Saturn Ring</button>
        </div>
      </div>
    </div>
    <script>
      function sendGift(name) {
        alert("Gift sent: " + name);
      }
    </script>
  `;
}

module.exports = { renderWorld, renderAudioAndGifts };
JS

python <<'PY'
from pathlib import Path
p = Path.home() / "aam_full_system" / "apps" / "life_world.js"
text = p.read_text()

if "renderWorld, renderAudioAndGifts" not in text:
    text = text.replace(
        "const PORT = 4902;",
        "const PORT = 4902;\nconst { renderWorld, renderAudioAndGifts } = require('./world_renderer');",
        1
    )

if "renderAudioAndGifts()" not in text:
    text = text.replace("</body>", "${renderWorld()}\n${renderAudioAndGifts()}\n</body>", 1)

p.write_text(text)
print("life_world.js patched")
PY

echo
echo "[5] GO-LIVE READY CHECKS"
node -c apps/world_renderer.js
node -c apps/life_world.js
python -m json.tool data/themes/parent_theme.json >/dev/null
python -m json.tool data/themes/child_themes.json >/dev/null
python -m json.tool data/product/app_modes.json >/dev/null
python -m json.tool data/product/asset_pipeline.json >/dev/null
python -m json.tool data/world/ecosystem_registry.json >/dev/null
python -m json.tool data/world/holographic_gifts.json >/dev/null

bash scripts/safe_restart.sh
bash scripts/check_js.sh
bash scripts/status.sh
bash scripts/smoke_test.sh

echo
echo "[6] VERIFY LIFE WORLD"
curl -s http://127.0.0.1:4902/health ; echo
curl -s http://127.0.0.1:4902/ | head -n 80 ; echo

echo
echo "[7] VERIFY API"
cd "$HOME/aam_super_app"
bash scripts/wait_for_health.sh
curl -s http://127.0.0.1:4000/health ; echo
curl -s http://127.0.0.1:4000/health/detail ; echo

echo
echo "ALL 5 COMPLETE"
echo "- stabilize core"
echo "- polish app themes"
echo "- asset pipeline"
echo "- render world/music/gifts"
echo "- go-live ready checks"
