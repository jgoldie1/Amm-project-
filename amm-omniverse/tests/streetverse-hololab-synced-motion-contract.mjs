import fs from 'node:fs'
import assert from 'node:assert/strict'
const hud=fs.readFileSync(new URL('../src/components/StreetVerseHoloLabDemoHUD.tsx',import.meta.url),'utf8')
const preview=fs.readFileSync(new URL('../src/components/StreetVerseHoloLab3DPreview.tsx',import.meta.url),'utf8')
const confirmation=hud.indexOf('journey.confirmSceneLoaded(destination)')
const sceneEvent=hud.indexOf("new CustomEvent('tryamm:hololab-demo-scene-request'")
assert.ok(confirmation>=0&&sceneEvent>confirmation,'Scene event must follow confirmed journey')
assert.match(preview,/detail\?\.confirmed===true/,'3D scene must ignore unconfirmed travel')
assert.match(hud,/tryamm:hololab-motion/,'HUD must publish motion stages')
assert.match(preview,/addEventListener\('tryamm:hololab-motion'/,'3D proxy must consume motion stages')
assert.match(preview,/proxyTargetX-proxy\.position\.x/,'3D proxy must walk toward chamber')
assert.doesNotMatch(preview,/now%9000/,'No independent looping walk')
console.log('HoloLab synchronized 3D motion contract PASS')
