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
