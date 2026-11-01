import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const source=readFileSync(new URL('../src/components/CircleParkHolographicWorld.tsx',import.meta.url),'utf8')
assert.ok(source.includes("import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'"))
assert.ok(source.includes("SV_HERO_BJ_STUBBS_V12.glb"))
assert.ok(source.includes('player.add(visual)'))
assert.ok(source.includes('player.material.visible=false'))
assert.ok(source.includes('bjVisualCancelled=true'))
assert.ok(source.includes('using playable capsule fallback'))
console.log('Circle Park BJ visual model fallback contract PASS')
