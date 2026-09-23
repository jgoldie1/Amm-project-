import fs from 'node:fs'
import assert from 'node:assert/strict'

const vite = fs.readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

assert.match(vite, /streetverseSafe:\s*fileURLToPath\(new URL\('\.\/streetverse-safe\.html'/, 'Vite must emit the StreetVerse safe HTML entry into dist')
assert.match(vite, /main:\s*fileURLToPath\(new URL\('\.\/index\.html'/, 'Vite must retain the normal application HTML entry')

const streetverseRoutes = vercel.routes.filter(route => route.src === '/streetverse' || route.src === '/streetverse/')
assert.equal(streetverseRoutes.length, 2, 'Both StreetVerse canonical route forms must be explicit')
assert.ok(streetverseRoutes.every(route => route.dest === '/streetverse-safe.html'), 'StreetVerse production routes must resolve to the emitted safe HTML entry')

console.log('PASS streetverse-safe-production-entry-contract: Vite emits the HTML entry Vercel serves for Release-1 StreetVerse certification')
