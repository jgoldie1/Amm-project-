import fs from 'node:fs'
import assert from 'node:assert/strict'
const manifest=JSON.parse(fs.readFileSync('dist/.vite/manifest.json','utf8'))
const seen=new Set()
function visit(key){if(seen.has(key))return;seen.add(key);const item=manifest[key];assert.ok(item,'Missing bundle '+key);for(const next of [...(item.imports||[]),...(item.dynamicImports||[])])visit(next)}
visit('business-app.html')
for(const key of seen)assert.doesNotMatch(manifest[key].file,/three|rapier|streetverse|maplibre|livekit|vendor-media/i)
const html=fs.readFileSync('dist/business-app.html','utf8')
assert.ok(html.includes('business-root'))
assert.doesNotMatch(html,/streetverse|bootstrap\.ts|startup-guard|serviceWorker/i)
console.log('Business entry isolated from game, physics, maps and media bundles:',seen.size,'chunks')
