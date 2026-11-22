import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const shell=read('../src/components/TryammHoloVerseHome.tsx')
const main=read('../src/main.tsx')
const world=read('../src/components/StreetVerseMobileWorld.tsx')
const bridge=read('../src/components/StreetVerseWorldControllerBridge.tsx')
test('redesigned ONE WORLD shell provides PLAY CREATE LIVE EARN LEARN DISCOVER and MY WORLD',()=>{
 for(const t of ["'PLAY'","'CREATE'","'LIVE'","'EARN'","'LEARN'","'DISCOVER'","'MY WORLD'"])assert.ok(shell.includes(t))
 assert.match(shell,/ONE WORLD/)
 assert.match(shell,/STREETVERSE • PLAY WITHOUT THE CLUTTER/)
})
test('home shell launches distinct 3D world, mission arcade and integration tools without loading world on home',()=>{
 assert.match(shell,/href="\/streetverse\?core=1&bj=v15"/)
 assert.match(shell,/href="\/streetverse-missions"/)
 assert.match(shell,/href="\/streetverse-integration"/)
 assert.match(main,/!isStreetVerseMissionArcade&&!isStreetVerseIntegrationCenter/)
 assert.match(main,/StreetVerseMobileWorldCore/)
})
test('in-game quick menu navigates to shell modules without losing joystick',()=>{
 assert.match(world,/\['arcade','🎮 MISSION ARCADE'\]/)
 assert.match(world,/\['integration','🧪 TEST & REPORT'\]/)
 assert.match(world,/\['live-center','📡 TRYAMM LIVE'\]/)
 assert.match(world,/\['business-shell','🏬 BUSINESS OS'\]/)
 assert.match(world,/window\.location\.href='\/streetverse-missions'/)
 assert.match(world,/window\.location\.href='\/live'/)
 assert.match(world,/data-streetverse-world-root/)
 assert.match(world,/StreetVerse analog joystick/)
 assert.match(world,/<StreetVerseWorldControllerBridge\/>/)
 assert.match(bridge,/aria-expanded=\{help\}/)
})
