import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const src=readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
test('mobile city remains playable when localStorage save throws',()=>{
 const save=src.indexOf('localStorage.setItem(SAVE_KEY')
 const guard=src.lastIndexOf('try {',save)
 const recovery=src.indexOf('} catch {',save)
 const telemetry=src.indexOf("window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position'",save)
 assert.ok(save>0&&guard>0&&guard<save&&recovery>save&&telemetry>recovery,'storage must be caught before telemetry and next animation frame')
 assert.ok(src.includes('raf=requestAnimationFrame(tick)'))
})
