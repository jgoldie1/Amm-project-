const fs = require('fs')
const path = require('path')

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8')
}
function check(ok, message) {
  if (!ok) throw new Error(message)
}

const server = read('server.js')
const live = read('routes/live.js')
const moderation = read('routes/moderation.js')

check(server.includes("/api/live"), 'LIVE router mount missing')
check(server.includes("/api/moderation"), 'moderation router mount missing')
check(server.includes("/api/health"), 'health endpoint missing')
check(server.includes("/api/ai"), 'AI router mount missing')
check(server.includes("/api/stripe/webhook"), 'Stripe webhook endpoint missing')

for (const value of ['/status', '/token', '/pause', '/resume', '/end']) {
  check(live.includes(value), `LIVE route missing ${value}`)
}
for (const value of ['/report', '/my-reports', '/appeal', '/block/:userId', '/mute/:userId', '/relationships']) {
  check(moderation.includes(value), `moderation route missing ${value}`)
}
check(moderation.includes('evidence_window_seconds:120'), '120-second evidence window missing')

console.log('backend API smoke contracts passed')
