import fs from 'node:fs'
import assert from 'node:assert/strict'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

assert.match(world,/data-streetverse-world-root="true"/,'Mobile world root must remain present')
assert.match(world,/aria-label="StreetVerse analog joystick"/,'Mobile analog joystick must remain visible')
assert.match(world,/touchAction:'none'/,'Joystick must suppress browser touch scrolling')
assert.match(world,/setPointerCapture/,'Joystick must capture the active pointer')
assert.match(world,/onLostPointerCapture=\{stopJoystick\}/,'Joystick must reset if pointer capture is lost')
assert.match(world,/visibilitychange/,'Movement must reset when the app becomes hidden')
assert.match(world,/onWindowBlur/,'Movement must reset when the browser loses focus')
assert.match(world,/joystickKnobRef/,'Joystick thumb position must have visible feedback')
assert.match(world,/collisionGuard:true/,'World-ready contract must expose collision protection')
assert.match(world,/spawnCollisionRecovery:true/,'Invalid saved positions must recover to a safe spawn')
assert.match(world,/savedSpawnValid/,'Saved spawn coordinates must be validated before use')
assert.match(world,/joystickPointerCapture:true/,'World-ready contract must certify pointer capture')
assert.match(world,/joystickBlurFailsafe:true/,'World-ready contract must certify input fail-safe')
assert.match(world,/const canTraverse=/,'Walking and vehicle movement must use the traversal guard')
assert.match(world,/buildingColliders/,'Buildings must contribute collision footprints')
assert.match(world,/const onBridge=Math\.abs\(x\)<=5\.2/,'River crossing must remain constrained to the bridge')
assert.match(world,/qsePerformanceGovernor:true/,'Quantum Speed performance governor must remain active')
assert.match(world,/renderer\.shadowMap\.enabled=false/,'Phone shadow maps must remain disabled by default')

console.log('StreetVerse mobile control reliability contract: PASS')
