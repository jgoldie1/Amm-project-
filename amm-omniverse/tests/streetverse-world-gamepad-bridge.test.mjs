import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const world=read('../src/components/StreetVerseMobileWorld.tsx')
const bridge=read('../src/components/StreetVerseWorldControllerBridge.tsx')
test('gamepad bridge is mounted inside StreetVerse 3D world without reimplementing the renderer',()=>{
 assert.match(world,/import StreetVerseWorldControllerBridge/)
 assert.match(world,/<StreetVerseWorldControllerBridge\/>/)
 assert.doesNotMatch(bridge,/WebGLRenderer/)
})
test('actual StreetVerse event contracts are reused for gamepad movement, interaction and driving',()=>{
 for(const event of ['tryamm:streetverse-world-input','tryamm:streetverse-vehicle-input','tryamm:streetverse-vehicle-interact','tryamm:streetverse-parkour-action','tryamm:streetverse-toggle-player-camera'])assert.ok(bridge.includes(event))
 assert.match(bridge,/normalizeStick/)
 assert.match(bridge,/requestAnimationFrame/)
 assert.match(bridge,/cancelAnimationFrame/)
})
test('small collapsible help avoids covering one-handed joystick',()=>{
 assert.match(bridge,/CONTROLLER HELP/)
 assert.match(bridge,/aria-expanded/)
 assert.match(bridge,/top:'calc\(env\(safe-area-inset-top\) \+ 12px\)'/)
 assert.match(bridge,/pointerEvents:'none'/)
 assert.match(world,/data-streetverse-context/)
})
