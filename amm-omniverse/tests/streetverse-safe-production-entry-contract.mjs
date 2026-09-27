import fs from 'node:fs'
import assert from 'node:assert/strict'

const vite = fs.readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

assert.match(vite, /streetverseSafe:\s*fileURLToPath\(new URL\('\.\/streetverse-safe\.html'/, 'Vite must retain the StreetVerse safe HTML entry for explicit recovery use')
assert.match(vite, /main:\s*fileURLToPath\(new URL\('\.\/index\.html'/, 'Vite must retain the normal application HTML entry')

const streetverseRoutes = vercel.routes.filter(route => route.src === '/streetverse' || route.src === '/streetverse/')
assert.equal(streetverseRoutes.length, 0, 'Canonical StreetVerse must not be rewritten to the legacy safe HTML entry')
assert.ok(vercel.routes.some(route => route.src === '/.*' && route.dest === '/index.html'), 'Canonical StreetVerse must fall through to the playable application entry')

console.log('PASS streetverse-safe-production-entry-contract: safe HTML remains available, while canonical StreetVerse boots the playable app')
