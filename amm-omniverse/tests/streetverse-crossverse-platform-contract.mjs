import fs from 'node:fs'
import assert from 'node:assert/strict'
const source=fs.readFileSync(new URL('../src/runtime/StreetVerseCrossVersePlatformRuntime.ts',import.meta.url),'utf8')
for(const id of ['streetverse','campusverse','faithverse','chronoverse'])assert.ok(source.includes("'"+id+"'"),'Missing world '+id)
assert.match(source,/if\(!approved\|\|world\.kind!=='partner'\)/,'Partner registration must require approval')
assert.match(source,/passport\?\.permissions\.includes\('travel'\)/,'Portal travel must require permission')
assert.match(source,/world\?\.enabled/,'Disabled worlds must not be accessible')
assert.match(source,/CrossVerse travel denied/,'Unauthorized portal travel must fail closed')
console.log('CrossVerse platform source contract PASS')
