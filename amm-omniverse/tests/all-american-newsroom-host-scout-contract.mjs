import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/AllAmericanNewsroomRuntime.ts',import.meta.url),'utf8')
const ui=fs.readFileSync(new URL('../src/components/AllAmericanNewsroomCenter.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const hub=fs.readFileSync(new URL('../src/components/AllAmericanNetworkHub.tsx',import.meta.url),'utf8')
const studio=fs.readFileSync(new URL('../src/components/AllAmericanNetworkControlRoom.tsx',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))

const must=(ok,msg)=>{if(!ok)throw new Error('ALL AMERICAN NEWSROOM CONTRACT FAIL: '+msg)}

for(const token of [
  'ALL_AMERICAN_NEWS_DESKS',
  'NEWSROOM_TEAM',
  'CRYPTO_EDUCATION_RULES',
  'DEFAULT_NEWSROOM_SCHEDULE',
  'HOST_SCOUT_THRESHOLDS',
  'BOOTSTRAP',
  'SCOUT',
  'AUDITION',
  'ROSTER',
  'tryamm:network-audience-metrics',
  'tryamm:streetverse-multiplayer-presence',
  'tryamm:network-host-invite',
  'tryamm:all-american-newsroom-state',
]) must(runtime.includes(token),'runtime missing '+token)

for(const token of [
  'News Team + Host Scout',
  'FULL NEWS TEAM',
  '24-HOUR PROGRAMMING BLUEPRINT',
  'REAL HOST SCOUT',
  'CRYPTO EDUCATION + BROADCAST DESK',
  'Teach first. No hype.',
]) must(ui.includes(token),'newsroom UI missing '+token)

must(main.includes("AllAmericanNewsroomCenter"),'newsroom route component missing')
must(main.includes("'/network/newsroom'"),'newsroom route missing')
must(main.includes("AllAmericanNewsroomRuntime"),'newsroom runtime not installed')
must(hub.includes('/network/newsroom'),'network hub does not expose newsroom')
must(studio.includes('/network/newsroom'),'studio does not link newsroom')
must(String(pkg.scripts?.build||'').includes('all-american-newsroom-host-scout-contract.mjs'),'production build does not run newsroom contract')

console.log('ALL AMERICAN NEWSROOM + HOST SCOUT + CRYPTO EDUCATION CONTRACT PASS')
