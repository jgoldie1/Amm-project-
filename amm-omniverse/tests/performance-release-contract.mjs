import fs from 'node:fs'
import assert from 'node:assert/strict'

const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const vite=fs.readFileSync(new URL('../vite.config.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const live=fs.readFileSync(new URL('../src/services/live.ts',import.meta.url),'utf8')

assert.equal(pkg.engines?.node,'>=24 <25','Vercel and package.json must agree on Node 24')
assert.equal(pkg.allowScripts?.['esbuild@0.28.2'],true,'Reviewed esbuild install script must be explicitly pinned and approved')
assert.match(vite,/manualChunks/,'Vite must define vendor chunk splitting')
assert.match(vite,/chunkSizeWarningLimit:\s*600/,'Chunk warning budget must remain explicit and reviewed')
for(const chunk of ['app-runtime','app-data','vendor-react','vendor-three','vendor-supabase','vendor-livekit','vendor-media','vendor-ai']){
  assert.ok(vite.includes(chunk),`Vite bundle strategy missing ${chunk}`)
}
assert.match(main,/lazy\(\(\)=>import\('\.\/components\/StreetVerseLivingWorld'\)\)/,'StreetVerseLivingWorld must be route-lazy')
assert.match(main,/lazy\(\(\)=>import\('\.\/components\/MeetTheStubbsWorldDistrict'\)\)/,'MeetTheStubbs district must be route-lazy')
assert.ok(!live.startsWith("import { Room, RoomEvent, Track } from 'livekit-client'"),'LiveKit must not be eagerly imported into startup bundle')
assert.match(live,/import\('livekit-client'\)/,'LiveKit must load only when a room connection is requested')

console.log('Performance release contract OK: Node 24, reviewed scripts, canonical Living World route lazy-loading and bundle budgets are locked.')
