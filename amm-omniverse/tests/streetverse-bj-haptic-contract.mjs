import fs from 'node:fs'
import assert from 'node:assert/strict'
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseBJHapticRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
for(const cue of ['minor-hit','major-hit','heartbeat','medical-scan','recovery'])assert.ok(runtime.includes("'"+cue+"'"),'Missing safe haptic cue: '+cue)
assert.match(runtime,/let enabled=false/,'Vibration must be off by default')
assert.match(runtime,/now\(\)-lastPulse<800/,'Vibration must be rate limited')
assert.match(runtime,/device\.vibrate\?\.\(0\)/,'Vibration must stop on disable/dispose')
assert.match(world,/aria-pressed=\{hapticsEnabled\}/,'HUD must have accessible opt-in toggle')
assert.match(world,/tryamm:streetverse-bj-haptic-cue/,'Gameplay must subscribe to haptic cues')
assert.match(world,/haptics\.dispose\(\)/,'Unmount must stop vibration')
console.log('BJ haptic accessibility and cooldown contract PASS')
