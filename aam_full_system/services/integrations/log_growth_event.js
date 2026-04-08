const fs = require('fs');
const path = require('path');

const file = path.join('data', 'integrations', 'growth_events.json');
let data = { events: [] };

try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch {}

const event = {
  type: process.argv[2] || 'test_event',
  detail: process.argv.slice(3).join(' ') || 'no detail',
  at: new Date().toISOString()
};

data.events.push(event);
fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(JSON.stringify({ ok: true, logged: event }, null, 2));
