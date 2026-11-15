import fs from 'node:fs'
import assert from 'node:assert/strict'
const src=fs.readFileSync(new URL('../src/runtime/StreetVerseCrossVerseGatewayRuntime.ts',import.meta.url),'utf8')
for(const world of ['streetverse','campusverse','faithverse','chronoverse','beautyverse','businessverse','external'])assert.ok(src.includes("'"+world+"'"),'Missing CrossVerse world '+world)
assert.match(src,/portals\.has\(portal\.id\)/,'Duplicate portal IDs must be rejected')
assert.match(src,/portal\.to==='external'&&!portal\.requiresConsent/,'External world must require consent')
assert.match(src,/portal\.requiresConsent&&!request\.consented/,'Travel must enforce player consent')
assert.match(src,/!portal\|\|!portal\.enabled/,'Disabled portals must block entry')
console.log('CrossVerse gateway source contract PASS')
