import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const scene=read('src/components/StreetVerseGreenvilleFratMansion.tsx')
const dock=read('src/components/StreetVerseGreenvilleFraternityRoomDock.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
for(const token of ['length:12','fraternity-front-door','GREENVILLE_FRAT_INTERACTION_EVENT','toggle-door','visit-room','activeRoom===room.id'])assert.ok(scene.includes(token),token)
for(const token of ['OPEN / CLOSE FRONT DOOR','INSPECT SUITE IN 3D','minHeight:48','No collision'])assert.ok(dock.includes(token),token)
assert.ok(world.includes('<StreetVerseGreenvilleFraternityRoomDock/>'))
console.log('Greenville fraternity room static contract PASS')
