import fs from 'node:fs'
import assert from 'node:assert/strict'

const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const vite=fs.readFileSync(new URL('../vite.config.ts',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const live=fs.readFileSync(new URL('../src/services/live.ts',import.meta.url),'utf8')

assert.equal(pkg.engines?.node,'>=24 <25','Vercel and package.json must agree on Node 24')
assert.match(vite,/manualChunks/,'Vite must define vendor chunk splitting')
for(const chunk of ['vendor-react','vendor-three','vendor-supabase','vendor-media','vendor-ai']){
  assert.ok(vite.includes(chunk),`Vite bundle strategy missing ${chunk}`)
}
assert.match(main,/lazy\(\(\)=>import\('\.\/components\/StreetVerse3D'\)\)/,'StreetVerse3D must be route-lazy')
assert.match(main,/lazy\(\(\)=>import\('\.\/components\/MeetTheStubbsWorldDistrict'\)\)/,'MeetTheStubbs district must be route-lazy')
assert.ok(!live.startsWith("import { Room, RoomEvent, Track } from 'livekit-client'"),'LiveKit must not be eagerly imported into startup bundle')
assert.match(live,/await import\('livekit-client'\)/,'LiveKit must load only when a room is connected')

console.log('Performance release contract OK: Node runtime aligned and heavyweight world/live modules are split from startup.')
