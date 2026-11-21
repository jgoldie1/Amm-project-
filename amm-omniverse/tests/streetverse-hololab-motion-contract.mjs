import fs from 'node:fs'
import assert from 'node:assert/strict'
const motion=fs.readFileSync(new URL('../src/runtime/StreetVerseHoloLabMotionRuntime.ts',import.meta.url),'utf8')
const hud=fs.readFileSync(new URL('../src/components/StreetVerseHoloLabDemoHUD.tsx',import.meta.url),'utf8')
for(const state of ['outside','approaching','inside','charging','warping','arrived'])assert.ok(motion.includes(state),'Missing motion state '+state)
assert.match(motion,/if\(stage!=='warping'\)throw/,'Arrival must require completed warp')
assert.match(hud,/WALK BJ TO CHAMBER/,'Accessible walk control missing')
assert.match(hud,/ENTER HOLOLAB CHAMBER/,'Chamber entry control missing')
assert.match(hud,/START WARP MOTION/,'Warp action missing')
assert.match(hud,/RESTART CHAMBER MOTION/,'Repeat journey missing')
assert.match(hud,/motion\.canConfirmArrival\(\)/,'Arrival must be gated by motion')
assert.match(hud,/not a rigged 3D character/,'Prototype must not claim real 3D rig integration')
console.log('HoloLab chamber motion contract PASS')
